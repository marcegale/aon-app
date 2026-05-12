import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { analyzeCandidateCv } from "@/lib/recruiting/candidateAi";
import { enqueueRecruitingAutomation } from "@/lib/recruiting/automation";
import { enqueueRecruitingEmbedding } from "@/trigger/recruitingEmbeddingTask";
import { nextCandidateCode } from "@/lib/recruiting/candidateCode";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { extractCvText, isSupportedCvAttachment } from "@/lib/recruiting/cvText";
import {
  createGmailClient,
  downloadGmailAttachment,
  listGmailMessages,
  type GmailAttachment,
  type GmailMessage,
} from "@/lib/recruiting/gmail";
import { sha256Buffer } from "@/lib/recruiting/hash";
import { extractRecruitingRef } from "@/lib/recruiting/ref";
import { uploadRecruitingCv } from "@/lib/recruiting/storage";
import { decryptRecruitingToken } from "@/lib/recruiting/tokenCrypto";

type IngestGmailInput = {
  tenantId: string;
  connectionId?: string;
  maxResults?: number;
  query?: string;
};

type IngestCounters = {
  scanned: number;
  queued: number;
  skipped: number;
  failed: number;
};

export function extractEmailAddress(value: string | null) {
  if (!value) {
    return null;
  }

  const angleMatch = value.match(/<([^>]+)>/);
  const candidate = angleMatch?.[1] ?? value;
  const emailMatch = candidate.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return emailMatch?.[0]?.toLowerCase() ?? null;
}

async function logIngest(input: {
  tenantId: string;
  searchId?: string | null;
  candidateId?: string | null;
  connectionId?: string | null;
  message?: GmailMessage;
  refCode?: string | null;
  cvHash?: string | null;
  status: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.recruitingEmailIngestLog.create({
    data: {
      tenantId: input.tenantId,
      searchId: input.searchId ?? null,
      candidateId: input.candidateId ?? null,
      connectionId: input.connectionId ?? null,
      providerMessageId: input.message?.id ?? null,
      fromEmail: extractEmailAddress(input.message?.from ?? null),
      subject: input.message?.subject ?? null,
      refCode: input.refCode ?? null,
      cvHash: input.cvHash ?? null,
      status: input.status,
      reason: input.reason,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

async function appendJobLog(input: {
  jobId: string;
  level: "info" | "warn" | "error";
  event: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  const job = await prisma.recruitingCandidateProcessingJob.findUnique({
    where: { id: input.jobId },
    select: { logs: true },
  });
  const existingLogs = Array.isArray(job?.logs) ? job.logs : [];

  await prisma.recruitingCandidateProcessingJob.update({
    where: { id: input.jobId },
    data: {
      logs: [
        ...existingLogs,
        {
          ts: new Date().toISOString(),
          level: input.level,
          event: input.event,
          message: input.message,
          data: input.data ?? {},
        },
      ] as Prisma.InputJsonValue,
    },
  });
}

async function resolveConnection(input: IngestGmailInput) {
  const connection = input.connectionId
    ? await prisma.recruitingEmailConnection.findFirst({
        where: {
          id: input.connectionId,
          tenantId: input.tenantId,
          provider: "gmail",
          status: "active",
        },
      })
    : await prisma.recruitingEmailConnection.findFirst({
        where: {
          tenantId: input.tenantId,
          provider: "gmail",
          status: "active",
        },
        orderBy: { updatedAt: "desc" },
      });

  if (connection?.googleRefreshToken) {
    return {
      ...connection,
      googleRefreshToken: decryptRecruitingToken(connection.googleRefreshToken),
    };
  }

  const envRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const envEmail = process.env.GMAIL_EMAIL_ADDRESS ?? "env-gmail-connection";

  if (!envRefreshToken) {
    throw new Error("No active Gmail connection or GMAIL_REFRESH_TOKEN configured");
  }

  return {
    id: null,
    tenantId: input.tenantId,
    searchId: null,
    provider: "gmail",
    emailAddress: envEmail,
    googleRefreshToken: envRefreshToken,
    status: "active",
    lastHistoryId: null,
    lastIngestedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function triggerCandidateProcessingJob(jobId: string) {
  const { processRecruitingCandidateJobTask } = await import("@/trigger/recruitingCandidateProcessing");
  const handle = await processRecruitingCandidateJobTask.trigger(
    { jobId },
    { idempotencyKey: `recruiting-candidate-processing:${jobId}` },
  );

  await prisma.recruitingCandidateProcessingJob.update({
    where: { id: jobId },
    data: {
      processingStatus: "queued",
      triggerRunId: handle.id,
      metadata: {
        triggerRunId: handle.id,
        queuedAt: new Date().toISOString(),
      },
    },
  });

  return handle;
}

async function findDiscoveryDuplicate(input: {
  searchId: string;
  messageId: string;
  fromEmail: string | null;
  subject: string | null;
}) {
  return prisma.recruitingCandidate.findFirst({
    where: {
      searchId: input.searchId,
      OR: [
        { sourceEmailId: input.messageId },
        ...(input.fromEmail ? [{ email: input.fromEmail }] : []),
        ...(input.subject ? [{ sourceSubject: input.subject }] : []),
      ],
    },
    select: { id: true },
  });
}

async function createCandidateJob(input: {
  tenantId: string;
  searchId: string;
  connectionId: string | null;
  message: GmailMessage;
  attachment: GmailAttachment;
  refCode: string;
}) {
  const fromEmail = extractEmailAddress(input.message.from);
  const duplicate = await findDiscoveryDuplicate({
    searchId: input.searchId,
    messageId: input.message.id,
    fromEmail,
    subject: input.message.subject,
  });

  if (duplicate) {
    return { type: "duplicate" as const, candidateId: duplicate.id };
  }

  const candidate = await prisma.recruitingCandidate.create({
    data: {
      searchId: input.searchId,
      candidateCode: await nextCandidateCode(prisma, input.searchId),
      email: fromEmail,
      receivedAt: input.message.internalDate ?? new Date(),
      cvFileName: input.attachment.fileName,
      cvMimeType: input.attachment.mimeType,
      sourceEmailId: input.message.id,
      sourceSubject: input.message.subject,
      processingStatus: "queued",
    },
    select: {
      id: true,
      candidateCode: true,
      searchId: true,
    },
  });

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
      candidateId: candidate.id,
      connectionId: input.connectionId,
      providerMessageId: input.message.id,
      gmailAttachmentId: input.attachment.attachmentId,
      attachmentFileName: input.attachment.fileName,
      attachmentMimeType: input.attachment.mimeType,
      fromEmail,
      subject: input.message.subject,
      refCode: input.refCode,
      processingStatus: "pending",
      logs: [
        {
          ts: new Date().toISOString(),
          level: "info",
          event: "job_created",
          message: "Candidate processing job created from Gmail discovery.",
        },
      ],
    },
    update: {
      candidateId: candidate.id,
      processingStatus: "queued",
      errorMessage: null,
      errorStack: null,
    },
    select: { id: true },
  });

  const handle = await triggerCandidateProcessingJob(job.id);
  return { type: "queued" as const, candidate, jobId: job.id, triggerRunId: handle.id };
}

export async function enqueueGmailCandidateJobs(input: IngestGmailInput) {
  const tenantId = input.tenantId?.trim();
  if (!tenantId) {
    throw new Error("tenantId is required");
  }

  const connection = await resolveConnection({ ...input, tenantId });
  const gmail = createGmailClient({ refreshToken: connection.googleRefreshToken! });
  const messages = await listGmailMessages({
    gmail,
    query: input.query,
    maxResults: input.maxResults,
  });

  const counters: IngestCounters = {
    scanned: messages.length,
    queued: 0,
    skipped: 0,
    failed: 0,
  };
  const jobs: Array<{ jobId: string; candidateId: string; triggerRunId: string }> = [];

  for (const message of messages) {
    const refCode = extractRecruitingRef(message.subject, message.snippet);

    if (!refCode) {
      counters.skipped += 1;
      await logIngest({
        tenantId,
        connectionId: connection.id,
        message,
        status: "skipped",
        reason: "missing_ref",
      });
      continue;
    }

    const search = await prisma.recruitingSearch.findFirst({
      where: { tenantId, refCode },
      select: { id: true },
    });

    if (!search) {
      counters.skipped += 1;
      await logIngest({
        tenantId,
        connectionId: connection.id,
        message,
        refCode,
        status: "skipped",
        reason: "search_not_found",
      });
      continue;
    }

    const cvAttachments = message.attachments.filter((attachment) =>
      isSupportedCvAttachment(attachment.fileName, attachment.mimeType),
    );

    if (cvAttachments.length === 0) {
      counters.skipped += 1;
      await logIngest({
        tenantId,
        searchId: search.id,
        connectionId: connection.id,
        message,
        refCode,
        status: "skipped",
        reason: "missing_supported_cv_attachment",
      });
      continue;
    }

    for (const attachment of cvAttachments) {
      try {
        const created = await createCandidateJob({
          tenantId,
          searchId: search.id,
          connectionId: connection.id,
          message,
          attachment,
          refCode,
        });

        if (created.type === "duplicate") {
          counters.skipped += 1;
          await logIngest({
            tenantId,
            searchId: search.id,
            candidateId: created.candidateId,
            connectionId: connection.id,
            message,
            refCode,
            status: "skipped",
            reason: "duplicate",
          });
          continue;
        }

        counters.queued += 1;
        jobs.push({
          jobId: created.jobId,
          candidateId: created.candidate.id,
          triggerRunId: created.triggerRunId,
        });

        await logIngest({
          tenantId,
          searchId: search.id,
          candidateId: created.candidate.id,
          connectionId: connection.id,
          message,
          refCode,
          status: "queued",
          metadata: {
            jobId: created.jobId,
            triggerRunId: created.triggerRunId,
            attachmentFileName: attachment.fileName,
            attachmentMimeType: attachment.mimeType,
          },
        });
      } catch (error) {
        counters.failed += 1;
        await logIngest({
          tenantId,
          searchId: search.id,
          connectionId: connection.id,
          message,
          refCode,
          status: "failed",
          reason: error instanceof Error ? error.message : "unknown_error",
          metadata: {
            attachmentFileName: attachment.fileName,
            attachmentMimeType: attachment.mimeType,
          },
        });
      }
    }
  }

  if (connection.id) {
    await prisma.recruitingEmailConnection.update({
      where: { id: connection.id },
      data: {
        lastIngestedAt: new Date(),
        lastHistoryId: messages[0]?.historyId ?? connection.lastHistoryId,
      },
    });
  }

  return {
    connection: {
      id: connection.id,
      emailAddress: connection.emailAddress,
    },
    counters,
    jobs,
  };
}

export async function processRecruitingCandidateProcessingJob(jobId: string, triggerRunId?: string) {
  const job = await prisma.recruitingCandidateProcessingJob.findUnique({
    where: { id: jobId },
    include: {
      search: true,
      candidate: true,
      connection: true,
    },
  });

  if (!job) {
    throw new Error(`Recruiting candidate processing job not found: ${jobId}`);
  }

  if (job.processingStatus === "completed" || job.processingStatus === "skipped") {
    return { jobId, status: job.processingStatus };
  }

  const attempts = job.attempts + 1;
  await prisma.recruitingCandidateProcessingJob.update({
    where: { id: job.id },
    data: {
      attempts,
      triggerRunId: triggerRunId ?? job.triggerRunId,
      processingStatus: attempts > 1 ? "retrying" : "processing",
      startedAt: job.startedAt ?? new Date(),
      errorMessage: null,
      errorStack: null,
    },
  });
  await appendJobLog({
    jobId: job.id,
    level: "info",
    event: "processing_started",
    message: "Started candidate CV processing.",
    data: { attempt: attempts, triggerRunId },
  });

  if (job.candidateId) {
    await prisma.recruitingCandidate.update({
      where: { id: job.candidateId },
      data: {
        processingStatus: attempts > 1 ? "retrying" : "processing",
        processingError: null,
      },
    });
  }

  try {
    const refreshToken = job.connection?.googleRefreshToken
      ? decryptRecruitingToken(job.connection.googleRefreshToken)
      : process.env.GMAIL_REFRESH_TOKEN;

    if (!refreshToken) {
      throw new Error("No Gmail refresh token available for processing job");
    }

    const gmail = createGmailClient({ refreshToken });
    const attachment = {
      attachmentId: job.gmailAttachmentId,
      fileName: job.attachmentFileName,
      mimeType: job.attachmentMimeType,
    };
    const buffer = await downloadGmailAttachment({
      gmail,
      messageId: job.providerMessageId,
      attachment,
    });
    const cvHash = sha256Buffer(buffer);

    const duplicate = await prisma.recruitingCandidate.findFirst({
      where: {
        searchId: job.searchId,
        cvHash,
        id: job.candidateId ? { not: job.candidateId } : undefined,
      },
      select: { id: true },
    });

    if (duplicate) {
      await prisma.recruitingCandidateProcessingJob.update({
        where: { id: job.id },
        data: {
          cvHash,
          processingStatus: "skipped",
          completedAt: new Date(),
          errorMessage: "Duplicate CV hash",
        },
      });
      if (job.candidateId) {
        await prisma.recruitingCandidate.update({
          where: { id: job.candidateId },
          data: {
            cvHash,
            processingStatus: "skipped",
            processingError: "Duplicate CV hash",
          },
        });
      }
      await appendJobLog({
        jobId: job.id,
        level: "warn",
        event: "duplicate_cv_hash",
        message: "Skipped processing because another candidate has the same CV hash.",
        data: { duplicateCandidateId: duplicate.id, cvHash },
      });
      return { jobId, status: "skipped", reason: "duplicate_cv_hash" };
    }

    const cvText = await extractCvText({
      buffer,
      fileName: job.attachmentFileName,
      mimeType: job.attachmentMimeType,
    });
    const storedCv = await uploadRecruitingCv({
      tenantId: job.tenantId,
      searchId: job.searchId,
      candidateKey: cvHash,
      fileName: job.attachmentFileName,
      mimeType: job.attachmentMimeType,
      buffer,
    });
    const ai = await analyzeCandidateCv({
      searchTitle: job.search.title,
      requestText: job.search.requestText,
      jobProfileOutput: job.search.jobProfileOutput,
      idealCandidateOutput: job.search.idealCandidateOutput,
      scoringCriteriaOutput: job.search.scoringCriteriaOutput,
      cvText,
    });

    const candidateId =
      job.candidateId ??
      (
        await prisma.recruitingCandidate.create({
          data: {
            searchId: job.searchId,
            candidateCode: await nextCandidateCode(prisma, job.searchId),
            sourceEmailId: job.providerMessageId,
            sourceSubject: job.subject,
            receivedAt: new Date(),
          },
          select: { id: true },
        })
      ).id;

    const candidate = await prisma.recruitingCandidate.update({
      where: { id: candidateId },
      data: {
        fullName: ai.fullName,
        email: ai.email ?? job.fromEmail,
        cvFileUrl: storedCv.signedUrl,
        cvFileName: job.attachmentFileName,
        cvMimeType: job.attachmentMimeType,
        cvHash,
        sourceEmailId: job.providerMessageId,
        sourceSubject: job.subject,
        cvSummary: ai.cvSummary,
        cvScore: ai.cvScore,
        cvReport: ai.cvReport as Prisma.InputJsonValue,
        processingStatus: "completed",
        processingError: null,
      },
      select: { id: true, candidateCode: true, searchId: true },
    });

    await prisma.recruitingCandidateProcessingJob.update({
      where: { id: job.id },
      data: {
        candidateId,
        cvHash,
        processingStatus: "completed",
        completedAt: new Date(),
        metadata: {
          triggerRunId: triggerRunId ?? job.triggerRunId,
          storageBucket: storedCv.bucket,
          storagePath: storedCv.storagePath,
          cvTextLength: cvText.length,
          completedAt: new Date().toISOString(),
        },
      },
    });
    await logIngest({
      tenantId: job.tenantId,
      searchId: job.searchId,
      candidateId,
      connectionId: job.connectionId,
      message: {
        id: job.providerMessageId,
        threadId: null,
        historyId: null,
        subject: job.subject,
        from: job.fromEmail,
        snippet: null,
        internalDate: null,
        attachments: [],
      },
      refCode: job.refCode,
      cvHash,
      status: "completed",
      metadata: {
        jobId: job.id,
        triggerRunId: triggerRunId ?? job.triggerRunId,
        storageBucket: storedCv.bucket,
        storagePath: storedCv.storagePath,
        cvTextLength: cvText.length,
      },
    });
    await createRecruitingCandidateAuditLog({
      tenantId: job.tenantId,
      searchId: job.searchId,
      candidateId,
      action: "ai.processing_completed",
      previousValue: null,
      newValue: "completed",
      metadata: {
        jobId: job.id,
        triggerRunId: triggerRunId ?? job.triggerRunId,
        cvHash,
        cvScore: ai.cvScore,
      },
    });
    await appendJobLog({
      jobId: job.id,
      level: "info",
      event: "processing_completed",
      message: "Candidate CV processing completed.",
      data: { candidateId, cvHash, cvScore: ai.cvScore },
    });
    await enqueueRecruitingAutomation({
      tenantId: job.tenantId,
      searchId: job.searchId,
      candidateId,
      triggerType: "candidate.scored",
    });
    await enqueueRecruitingEmbedding({
      tenantId: job.tenantId,
      candidateId,
      sourceType: "candidate.scored",
    }).catch(() => null);
    const { createRecruitingAgentTask } = await import("@/lib/recruiting/agents/orchestrator");
    const { recruitingScreeningAgentTask } = await import("@/trigger/recruitingScreeningAgent");
    const screeningTask = await createRecruitingAgentTask({
      tenantId: job.tenantId,
      agentType: "screening",
      taskType: "candidate.scored",
      payload: { searchId: job.searchId, candidateId },
      priority: ai.cvScore >= 80 || ai.cvScore < 40 ? 2 : 5,
    });
    await recruitingScreeningAgentTask
      .trigger({ tenantId: job.tenantId, searchId: job.searchId, candidateId, taskId: screeningTask.id })
      .catch(() => null);

    return { jobId, status: "completed", candidate };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const stack = error instanceof Error ? error.stack : undefined;
    const nextStatus = attempts >= job.maxAttempts ? "failed" : "retrying";

    await prisma.recruitingCandidateProcessingJob.update({
      where: { id: job.id },
      data: {
        processingStatus: nextStatus,
        errorMessage: message,
        errorStack: stack,
        completedAt: nextStatus === "failed" ? new Date() : null,
      },
    });
    if (job.candidateId) {
      await prisma.recruitingCandidate.update({
        where: { id: job.candidateId },
        data: {
          processingStatus: nextStatus,
          processingError: message,
        },
      });
    }
    await logIngest({
      tenantId: job.tenantId,
      searchId: job.searchId,
      candidateId: job.candidateId,
      connectionId: job.connectionId,
      message: {
        id: job.providerMessageId,
        threadId: null,
        historyId: null,
        subject: job.subject,
        from: job.fromEmail,
        snippet: null,
        internalDate: null,
        attachments: [],
      },
      refCode: job.refCode,
      cvHash: job.cvHash,
      status: nextStatus,
      reason: message,
      metadata: {
        jobId: job.id,
        triggerRunId: triggerRunId ?? job.triggerRunId,
        attempt: attempts,
      },
    });
    await appendJobLog({
      jobId: job.id,
      level: "error",
      event: "processing_failed",
      message,
      data: { attempt: attempts, nextStatus },
    });

    throw error;
  }
}
