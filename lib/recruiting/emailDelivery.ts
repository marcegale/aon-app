import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getNotificationTemplate, renderTemplateWithVariables } from "@/lib/recruiting/notificationTemplates";
import { logOperationalEvent } from "@/lib/recruiting/operationalEvents";
import { getRecruitingSettings } from "@/lib/recruiting/settings";
import { Resend } from "resend";

export type RecruitingEmailTemplate =
  | "offer"
  | "interview_invite"
  | "rejection"
  | "shortlist"
  | "reminder";

export type RecruitingEmailInput = {
  tenantId: string;
  searchId?: string | null;
  candidateId?: string | null;
  offerId?: string | null;
  interviewSessionId?: string | null;
  toEmail?: string | null;
  subject: string;
  html?: string;
  text?: string;
  type: RecruitingEmailTemplate | string;
  metadata?: Record<string, unknown>;
};

async function getFromEmail(tenantId: string) {
  const settings = await getRecruitingSettings(tenantId);
  const address = settings.emailFromAddress || process.env.RECRUITING_FROM_EMAIL || "recruiting@example.com";
  const name = settings.emailFromName || "Recruiting Agent";
  return address.includes("<") ? address : `${name} <${address}>`;
}

function getProvider() {
  return process.env.RESEND_API_KEY ? "resend" : "stub";
}

export function renderRecruitingEmailTemplate(input: {
  type: RecruitingEmailTemplate;
  candidateName?: string | null;
  body?: string | null;
  actionUrl?: string | null;
  scheduledAt?: Date | string | null;
  timezone?: string | null;
  meetingUrl?: string | null;
}) {
  const candidateName = input.candidateName || "candidato";
  const scheduledText = input.scheduledAt
    ? new Intl.DateTimeFormat("es-PY", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: input.timezone || "UTC",
      }).format(new Date(input.scheduledAt))
    : null;

  const title =
    input.type === "offer"
      ? "Propuesta laboral"
      : input.type === "interview_invite"
        ? "Invitacion a entrevista"
        : input.type === "rejection"
          ? "Actualizacion de proceso"
          : input.type === "shortlist"
            ? "Avance en el proceso"
            : "Recordatorio de entrevista";

  const paragraphs = [
    `Hola ${candidateName},`,
    input.body,
    scheduledText ? `Fecha: ${scheduledText} (${input.timezone ?? "UTC"}).` : null,
    input.meetingUrl ? `Link de reunion: ${input.meetingUrl}` : null,
    input.actionUrl ? `Link: ${input.actionUrl}` : null,
    "Saludos.",
  ].filter(Boolean);

  const text = paragraphs.join("\n\n");
  const html = [
    `<h2>${title}</h2>`,
    ...paragraphs.map((paragraph) => `<p>${String(paragraph)}</p>`),
  ].join("");

  return { title, text, html };
}

export async function sendRecruitingEmail(input: RecruitingEmailInput) {
  const provider = getProvider();
  const customTemplate = await getNotificationTemplate({ tenantId: input.tenantId, type: input.type });
  const variables = { subject: input.subject, body: input.text ?? "", tenantId: input.tenantId };
  const subject =
    customTemplate?.enabled ? renderTemplateWithVariables(customTemplate.subject, variables) : input.subject;
  const text = customTemplate?.enabled ? renderTemplateWithVariables(customTemplate.body, variables) : input.text;
  const html = customTemplate?.enabled ? `<p>${text}</p>` : input.html;
  const toEmail = input.toEmail?.trim();
  const delivery = await prisma.recruitingNotificationDelivery.create({
    data: {
      tenantId: input.tenantId,
      candidateId: input.candidateId ?? null,
      searchId: input.searchId ?? null,
      offerId: input.offerId ?? null,
      interviewSessionId: input.interviewSessionId ?? null,
      type: input.type,
      toEmail: toEmail || "missing",
      subject,
      status: "pending",
      provider,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });

  if (!toEmail) {
    const skipped = await prisma.recruitingNotificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "skipped",
        errorMessage: "missing_to_email",
      },
    });
    console.warn("notification.skipped", { deliveryId: delivery.id, reason: "missing_to_email" });
    await logOperationalEvent({
      tenantId: input.tenantId,
      searchId: input.searchId,
      candidateId: input.candidateId,
      type: "notification.skipped",
      severity: "warning",
      message: "Recruiting notification skipped.",
      metadata: { deliveryId: delivery.id, reason: "missing_to_email" },
    });
    return { sent: false, provider, status: skipped.status, deliveryId: skipped.id };
  }

  if (provider === "stub") {
    const skipped = await prisma.recruitingNotificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "skipped",
        errorMessage: "RESEND_API_KEY not configured",
      },
    });
    console.info("notification.skipped", { deliveryId: delivery.id, provider });
    await logOperationalEvent({
      tenantId: input.tenantId,
      searchId: input.searchId,
      candidateId: input.candidateId,
      type: "notification.skipped",
      severity: "warning",
      message: "Recruiting notification provider not configured.",
      metadata: { deliveryId: delivery.id, provider },
    });
    return { sent: false, provider, status: skipped.status, deliveryId: skipped.id };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: await getFromEmail(input.tenantId),
      to: toEmail,
      subject,
      html: html ?? `<p>${text ?? ""}</p>`,
      text,
    });
    const providerMessageId = result.data?.id ?? null;
    const sent = await prisma.recruitingNotificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "sent",
        providerMessageId,
      },
    });
    console.info("notification.sent", { deliveryId: sent.id, providerMessageId });
    await logOperationalEvent({
      tenantId: input.tenantId,
      searchId: input.searchId,
      candidateId: input.candidateId,
      type: "notification.sent",
      message: "Recruiting notification sent.",
      metadata: { deliveryId: sent.id, providerMessageId },
    });
    return { sent: true, provider, status: sent.status, deliveryId: sent.id, providerMessageId };
  } catch (error) {
    const failed = await prisma.recruitingNotificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "unknown_error",
      },
    });
    console.error("notification.failed", {
      deliveryId: failed.id,
      error: failed.errorMessage,
    });
    await logOperationalEvent({
      tenantId: input.tenantId,
      searchId: input.searchId,
      candidateId: input.candidateId,
      type: "notification.failed",
      severity: "error",
      message: "Recruiting notification failed.",
      metadata: { deliveryId: failed.id },
    });
    return { sent: false, provider, status: failed.status, deliveryId: failed.id, error: failed.errorMessage };
  }
}

export async function sendOfferEmail(input: Omit<RecruitingEmailInput, "type">) {
  return sendRecruitingEmail({ ...input, type: "offer" });
}

export async function sendInterviewInviteEmail(input: Omit<RecruitingEmailInput, "type">) {
  return sendRecruitingEmail({ ...input, type: "interview_invite" });
}

export async function sendRejectionEmail(input: Omit<RecruitingEmailInput, "type">) {
  return sendRecruitingEmail({ ...input, type: "rejection" });
}

export async function sendShortlistEmail(input: Omit<RecruitingEmailInput, "type">) {
  return sendRecruitingEmail({ ...input, type: "shortlist" });
}
