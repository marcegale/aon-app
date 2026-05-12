type RecruitingNotificationInput = {
  tenantId: string;
  searchId: string;
  candidateId: string;
  toEmail?: string | null;
  candidateName?: string | null;
  offerId?: string | null;
  interviewSessionId?: string | null;
  scheduledAt?: Date | string | null;
  timezone?: string | null;
  meetingUrl?: string | null;
};

import {
  renderRecruitingEmailTemplate,
  sendInterviewInviteEmail,
  sendRejectionEmail as deliverRejectionEmail,
  sendShortlistEmail as deliverShortlistEmail,
} from "@/lib/recruiting/emailDelivery";

export async function sendShortlistEmail(input: RecruitingNotificationInput) {
  const template = renderRecruitingEmailTemplate({
    type: "shortlist",
    candidateName: input.candidateName,
    body: "Tu perfil avanzo a la siguiente etapa del proceso.",
  });

  return deliverShortlistEmail({
    tenantId: input.tenantId,
    searchId: input.searchId,
    candidateId: input.candidateId,
    toEmail: input.toEmail,
    subject: template.title,
    html: template.html,
    text: template.text,
  });
}

export async function sendRejectionEmail(
  input: RecruitingNotificationInput & { reason?: string | null },
) {
  const template = renderRecruitingEmailTemplate({
    type: "rejection",
    candidateName: input.candidateName,
    body:
      input.reason ??
      "Gracias por participar. En esta oportunidad avanzaremos con otros perfiles.",
  });

  return deliverRejectionEmail({
    tenantId: input.tenantId,
    searchId: input.searchId,
    candidateId: input.candidateId,
    toEmail: input.toEmail,
    subject: template.title,
    html: template.html,
    text: template.text,
    metadata: { reason: input.reason ?? null },
  });
}

export async function sendInterviewInvite(input: RecruitingNotificationInput) {
  const template = renderRecruitingEmailTemplate({
    type: "interview_invite",
    candidateName: input.candidateName,
    body: "Te compartimos los detalles de la entrevista.",
    scheduledAt: input.scheduledAt,
    timezone: input.timezone,
    meetingUrl: input.meetingUrl,
  });

  return sendInterviewInviteEmail({
    tenantId: input.tenantId,
    searchId: input.searchId,
    candidateId: input.candidateId,
    interviewSessionId: input.interviewSessionId,
    toEmail: input.toEmail,
    subject: template.title,
    html: template.html,
    text: template.text,
  });
}
