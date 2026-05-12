import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { nextCandidateCode } from "@/lib/recruiting/candidateCode";
import { getAuthorizedRecruitingEmailAccount } from "@/lib/recruiting/emailAccounts";
import {
  createAuthenticatedGmailClient,
  downloadAttachment,
  getMessage,
  listRecentMessages,
  type GmailMessageDetails,
} from "@/lib/recruiting/google/gmail";
import { sha256Buffer } from "@/lib/recruiting/hash";
import { uploadRecruitingCv } from "@/lib/recruiting/storage";
import { processRecruitingCandidateJobTask } from "@/trigger/recruitingCandidateProcessing";

type IngestionSummary = {
  processedMessages: number;
  skippedMessages: number;
  createdCandidates: number;
  queuedCandidates: number;
  processingErrors: string[];
  errors: string[];
};

function extractEmailAddress(value: string | null) {
  if (!value) return null;
  const angleMatch = value.match(/<([^>]+)>/);
  const candidate = angleMatch?.[1] ?? value;
  const emailMatch = candidate.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return emailMatch?.[0]?.toLowerCase() ?? null;
}

async function createIngestLog(input: {
  tenantId: string;
  searchId?: string | null;
  candidateId?: string | null;
  accountId: string;
  message?: GmailMessageDetails | null;
  refCode?: string | null;
  cvHash?: string | null;
  status: string;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.recruitingEmailIngestLog.create({
    data: {
      tenantId: input.tenantId,
      searchId: input.searchId ?? null,
      candidateId: input.candidateId ?? null,
      provider: "gmail",
      providerMessageId: input.message?.id ?? null,
      fromEmail: extractEmailAddress(input.message?.from ?? null),
      subject: input.message?.subject ?? null,
      refCode: input.refCode ?? null,
      cvHash: input.cvHash ?? null,
      status: input.status,
      reason: input.reason ?? undefined,
      metadata: {
        emailAccountId: input.accountId,
        threadId: input.message?.threadId ?? null,
        historyId: input.message?.historyId ?? null,
        ...(input.metadata ?? {}),
      } as Prisma.InputJsonValue,
    },
  });
}

async function alreadyProcessed(input: {
  tenantId: string;
  messageId: string;
}) {
  const existingLog = await prisma.recruitingEmailIngestLog.findFirst({
    where: {
      tenantId: input.tenantId,
      provider: "gmail",
      providerMessageId: input.messageId,
      status: { in: ["candidate_created", "completed", "queued", "skipped"] },
    },
    select: { id: true },
  });
  return Boolean(existingLog);
}

async function ensureProcessingConnection(input: {
  tenantId: string;
  searchId: string;
  email: string;
  refreshToken: string | null;
}) {
  if (!input.refreshToken) {
    throw new Error("Connected Gmail account is missing refresh token");
  }

  const existing = await prisma.recruitingEmailConnection.findFirst({
    where: {
      tenantId: input.tenantId,
      provider: "gmail",
      emailAddress: input.email,
      status: "active",
    },
  });

  if (existing) {
    return prisma.recruitingEmailConnection.update({
      where: { id: existing.id },
      data: {
        searchId: input.searchId,
        googleRefreshToken: input.refreshToken,
      },
    });
  }

  return prisma.recruitingEmailConnection.create({
    data: {
      tenantId: input.tenantId,
      searchId: input.searchId,
      provider: "gmail",
      emailAddress: input.email,
      googleRefreshToken: input.refreshToken,
      status: "active",
    },
  });
}

async function enqueueCandidateProcessing(input: {
  tenantId: string;
  searchId: string;
  candidateId: string;
  connectionId: string;
  message: GmailMessageDetails;
  attachment: {
    attachmentId: string;
    fileName: string;
    mimeType: string;
  };
  refCode: string;
  fromEmail: string | null;
  cvHash: string;
}) {
  const job = await prisma.recruitingCandidateProcessingJob.upsert({
    where: {
      searchId_providerMessageId_gmailAttachmentId: {
        searchId: input.searchId,
        providerMessageId: input.message.id,
        gmailAttachmentId: input.attachment.attachmentId,
      },
    },
    create: {
      tenantId: input.tenantId,
      searchId: input.searchId,
      candidateId: input.candidateId,
      connectionId: input.connectionId,
      provider: "gmail",
      providerMessageId: input.message.id,
      gmailAttachmentId: input.attachment.attachmentId,
      attachmentFileName: input.attachment.fileName,
      attachmentMimeType: input.attachment.mimeType,
      fromEmail: input.fromEmail,
      subject: input.message.subject,
      refCode: input.refCode,
      cvHash: input.cvHash,
      processingStatus: "pending",
      logs: [
        {
          ts: new Date().toISOString(),
          level: "info",
          event: "job_created",
          message: "Candidate processing job created from Gmail account ingestion.",
        },
      ] as Prisma.InputJsonValue,
    },
    update: {
      candidateId: input.candidateId,
      connectionId: input.connectionId,
      cvHash: input.cvHash,
      processingStatus: "queued",
      errorMessage: null,
      errorStack: null,
    },
    select: { id: true },
  });

  const handle = await processRecruitingCandidateJobTask.trigger(
    { jobId: job.id },
    { idempotencyKey: `recruiting-candidate-processing:${job.id}` },
  );

  await prisma.recruitingCandidateProcessingJob.update({
    where: { id: job.id },
    data: {
      processingStatus: "queued",
      triggerRunId: handle.id,
      metadata: {
        triggerRunId: handle.id,
        queuedAt: new Date().toISOString(),
        source: "recruiting_email_account",
      },
    },
  });
  await prisma.recruitingCandidate.update({
    where: { id: input.candidateId },
    data: { processingStatus: "queued", processingError: null },
  });

  return { jobId: job.id, triggerRunId: handle.id };
}

export async function ingestRecruitingEmailsForAccount(input: {
  tenantId: string;
  userId: string;
}): Promise<IngestionSummary> {
  const { account, accessToken } = await getAuthorizedRecruitingEmailAccount(input);
  if (!account.monitoringEnabled) {
    return {
      processedMessages: 0,
      skippedMessages: 0,
      createdCandidates: 0,
      queuedCandidates: 0,
      processingErrors: [],
      errors: ["monitoring_disabled"],
    };
  }

  const gmail = createAuthenticatedGmailClient(accessToken);
  const summaries = await listRecentMessages({
    gmail,
    query: "has:attachment newer_than:30d",
    maxResults: 10,
  });
  const summary: IngestionSummary = {
    processedMessages: 0,
    skippedMessages: 0,
    createdCandidates: 0,
    queuedCandidates: 0,
    processingErrors: [],
    errors: [],
  };

  for (const item of summaries) {
    try {
      if (await alreadyProcessed({ tenantId: input.tenantId, messageId: item.id })) {
        summary.skippedMessages += 1;
        continue;
      }

      const message = await getMessage({ gmail, messageId: item.id });
      summary.processedMessages += 1;

      if (!message.refCode) {
        summary.skippedMessages += 1;
        await createIngestLog({
          tenantId: input.tenantId,
          accountId: account.id,
          message,
          status: "skipped",
          reason: "missing_ref",
        });
        continue;
      }

      const search = await prisma.recruitingSearch.findFirst({
        where: { tenantId: input.tenantId, refCode: message.refCode },
        select: { id: true },
      });

      if (!search) {
        summary.skippedMessages += 1;
        await createIngestLog({
          tenantId: input.tenantId,
          accountId: account.id,
          message,
          refCode: message.refCode,
          status: "skipped",
          reason: "search_not_found",
        });
        continue;
      }

      const attachment = message.attachments[0];
      if (!attachment) {
        summary.skippedMessages += 1;
        await createIngestLog({
          tenantId: input.tenantId,
          accountId: account.id,
          searchId: search.id,
          message,
          refCode: message.refCode,
          status: "skipped",
          reason: "missing_supported_cv_attachment",
        });
        continue;
      }

      const buffer = await downloadAttachment({
        gmail,
        messageId: message.id,
        attachmentId: attachment.attachmentId,
      });
      const cvHash = sha256Buffer(buffer);
      const duplicate = await prisma.recruitingCandidate.findFirst({
        where: {
          searchId: search.id,
          OR: [{ sourceEmailId: message.id }, { cvHash }],
        },
        select: { id: true },
      });

      if (duplicate) {
        summary.skippedMessages += 1;
        await createIngestLog({
          tenantId: input.tenantId,
          accountId: account.id,
          searchId: search.id,
          candidateId: duplicate.id,
          message,
          refCode: message.refCode,
          cvHash,
          status: "skipped",
          reason: "duplicate",
        });
        continue;
      }

      const storedCv = await uploadRecruitingCv({
        tenantId: input.tenantId,
        searchId: search.id,
        candidateKey: cvHash,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        buffer,
      });
      const candidate = await prisma.recruitingCandidate.create({
        data: {
          searchId: search.id,
          candidateCode: await nextCandidateCode(prisma, search.id),
          email: extractEmailAddress(message.from),
          receivedAt: message.date ?? new Date(),
          cvFileUrl: storedCv.signedUrl,
          cvFileName: attachment.fileName,
          cvMimeType: attachment.mimeType,
          cvHash,
          sourceEmailId: message.id,
          sourceSubject: message.subject,
          processingStatus: "pending",
        },
        select: { id: true },
      });

      let processingJob:
        | { jobId: string; triggerRunId: string }
        | null = null;
      const processingMetadata: Record<string, unknown> = {};
      try {
        const connection = await ensureProcessingConnection({
          tenantId: input.tenantId,
          searchId: search.id,
          email: account.email,
          refreshToken: account.refreshToken,
        });
        processingJob = await enqueueCandidateProcessing({
          tenantId: input.tenantId,
          searchId: search.id,
          candidateId: candidate.id,
          connectionId: connection.id,
          message,
          attachment,
          refCode: message.refCode,
          fromEmail: extractEmailAddress(message.from),
          cvHash,
        });
        summary.queuedCandidates += 1;
        processingMetadata.processingJobId = processingJob.jobId;
        processingMetadata.triggerRunId = processingJob.triggerRunId;
      } catch (processingError) {
        const messageText =
          processingError instanceof Error ? processingError.message : "unknown_processing_error";
        summary.processingErrors.push(messageText);
        processingMetadata.processingError = messageText;
        await prisma.recruitingCandidate.update({
          where: { id: candidate.id },
          data: {
            processingStatus: "pending",
            processingError: messageText,
          },
        });
      }

      await createIngestLog({
        tenantId: input.tenantId,
        accountId: account.id,
        searchId: search.id,
        candidateId: candidate.id,
        message,
        refCode: message.refCode,
        cvHash,
        status: "candidate_created",
        metadata: {
          attachmentFileName: attachment.fileName,
          attachmentMimeType: attachment.mimeType,
          storageBucket: storedCv.bucket,
          storagePath: storedCv.storagePath,
          ...processingMetadata,
        },
      });
      summary.createdCandidates += 1;
    } catch (error) {
      summary.errors.push(error instanceof Error ? error.message : "unknown_error");
    }
  }

  await prisma.recruitingEmailAccount.update({
    where: { id: account.id },
    data: {
      lastSyncedAt: new Date(),
    },
  });

  return summary;
}

export async function ingestRecruitingEmailsForConnectedUser(input: {
  tenantId: string;
  userId: string;
}) {
  return ingestRecruitingEmailsForAccount(input);
}
