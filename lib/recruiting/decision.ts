import { prisma } from "@/app/lib/prisma";
import { Prisma, type RecruitingPipelineStage } from "@/generated/prisma/client";
import type { RecruitingDecision } from "@/lib/recruiting/types";

async function getOwnedCandidate(candidateId: string, tenantId: string) {
  const candidate = await prisma.recruitingCandidate.findFirst({
    where: {
      id: candidateId,
      search: { tenantId },
    },
    include: {
      search: { select: { id: true, tenantId: true } },
    },
  });

  if (!candidate) {
    throw new Error("Candidate not found for tenant");
  }

  return candidate;
}

export async function createRecruitingCandidateAuditLog(input: {
  tenantId: string;
  searchId: string;
  candidateId: string;
  action: string;
  previousValue?: string | null;
  newValue?: string | null;
  actorUserId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.recruitingCandidateAuditLog.create({
    data: {
      tenantId: input.tenantId,
      searchId: input.searchId,
      candidateId: input.candidateId,
      action: input.action,
      previousValue: input.previousValue ?? null,
      newValue: input.newValue ?? null,
      actorUserId: input.actorUserId ?? null,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function moveRecruitingCandidateStage(input: {
  tenantId: string;
  candidateId: string;
  stage: RecruitingPipelineStage;
  actorUserId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const candidate = await getOwnedCandidate(input.candidateId, input.tenantId);
  const previousStage = candidate.pipelineStage;

  const updated = await prisma.recruitingCandidate.update({
    where: { id: candidate.id },
    data: {
      pipelineStage: input.stage,
      pipelineUpdatedAt: new Date(),
    },
  });

  await createRecruitingCandidateAuditLog({
    tenantId: input.tenantId,
    searchId: candidate.searchId,
    candidateId: candidate.id,
    action: "pipeline.move_stage",
    previousValue: previousStage,
    newValue: input.stage,
    actorUserId: input.actorUserId,
    metadata: input.metadata,
  });

  return updated;
}

export async function decideRecruitingCandidate(input: {
  tenantId: string;
  candidateId: string;
  decision: RecruitingDecision;
  reason?: string | null;
  actorUserId?: string | null;
}) {
  const candidate = await getOwnedCandidate(input.candidateId, input.tenantId);
  const previousStage = candidate.pipelineStage;
  const nextStage: RecruitingPipelineStage =
    input.decision === "qualified" ? "shortlisted" : "rejected";

  const updated = await prisma.recruitingCandidate.update({
    where: { id: candidate.id },
    data: {
      pipelineStage: nextStage,
      pipelineUpdatedAt: new Date(),
    },
  });

  await createRecruitingCandidateAuditLog({
    tenantId: input.tenantId,
    searchId: candidate.searchId,
    candidateId: candidate.id,
    action: `decision.${input.decision}`,
    previousValue: previousStage,
    newValue: nextStage,
    actorUserId: input.actorUserId,
    metadata: {
      reason: input.reason ?? null,
    },
  });

  return updated;
}
