import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type OperationalSeverity = "info" | "warning" | "error" | "critical";

export async function logOperationalEvent(input: {
  tenantId: string;
  searchId?: string | null;
  candidateId?: string | null;
  jobId?: string | null;
  automationExecutionId?: string | null;
  type: string;
  severity?: OperationalSeverity;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.recruitingOperationalEvent.create({
    data: {
      tenantId: input.tenantId,
      searchId: input.searchId ?? null,
      candidateId: input.candidateId ?? null,
      jobId: input.jobId ?? null,
      automationExecutionId: input.automationExecutionId ?? null,
      type: input.type,
      severity: input.severity ?? "info",
      message: input.message,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function logOperationalError(input: Omit<Parameters<typeof logOperationalEvent>[0], "severity">) {
  return logOperationalEvent({ ...input, severity: "error" });
}

export async function getOperationalHealth(input: { tenantId: string; searchId?: string | null }) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const where = {
    tenantId: input.tenantId,
    ...(input.searchId ? { searchId: input.searchId } : {}),
  };
  const candidateWhere = {
    search: {
      is: {
        tenantId: input.tenantId,
        ...(input.searchId ? { id: input.searchId } : {}),
      },
    },
  };
  const [failedJobs, failedNotifications, failedAutomations, pendingTranscriptions, staleCandidates, criticalEvents] =
    await Promise.all([
      prisma.recruitingCandidateProcessingJob.count({
        where: { ...where, processingStatus: "failed", createdAt: { gte: since } },
      }),
      prisma.recruitingNotificationDelivery.count({
        where: { ...where, status: "failed", createdAt: { gte: since } },
      }),
      prisma.recruitingAutomationExecution.count({
        where: { ...where, status: "failed", createdAt: { gte: since } },
      }),
      prisma.recruitingInterviewAnswer.count({
        where: {
          transcriptionStatus: { in: ["uploaded", "processing"] },
          session: { tenantId: input.tenantId, ...(input.searchId ? { searchId: input.searchId } : {}) },
        },
      }),
      prisma.recruitingCandidate.count({
        where: {
          ...candidateWhere,
          processingStatus: { in: ["queued", "processing", "retrying", "pending"] },
          receivedAt: { lt: new Date(Date.now() - 30 * 60 * 1000) },
        },
      }),
      prisma.recruitingOperationalEvent.findMany({
        where: { ...where, severity: { in: ["critical", "error"] }, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const score = failedJobs + failedNotifications + failedAutomations + staleCandidates;
  return {
    status: criticalEvents.some((event) => event.severity === "critical")
      ? "critical"
      : score > 0
        ? "degraded"
        : "healthy",
    failedJobs,
    failedNotifications,
    failedAutomations,
    pendingTranscriptions,
    staleCandidates,
    criticalEvents,
  };
}
