import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function startAgentRun(input: {
  tenantId: string;
  searchId?: string | null;
  candidateId?: string | null;
  agentType: string;
  input?: Record<string, unknown>;
}) {
  return prisma.recruitingAgentRun.create({
    data: {
      tenantId: input.tenantId,
      searchId: input.searchId ?? null,
      candidateId: input.candidateId ?? null,
      agentType: input.agentType,
      status: "running",
      input: input.input as Prisma.InputJsonValue | undefined,
      startedAt: new Date(),
    },
  });
}

export async function completeAgentRun(input: { id: string; output?: Record<string, unknown> }) {
  return prisma.recruitingAgentRun.update({
    where: { id: input.id },
    data: {
      status: "completed",
      output: input.output as Prisma.InputJsonValue | undefined,
      completedAt: new Date(),
    },
  });
}

export async function failAgentRun(input: { id: string; errorMessage: string }) {
  return prisma.recruitingAgentRun.update({
    where: { id: input.id },
    data: { status: "failed", errorMessage: input.errorMessage, completedAt: new Date() },
  });
}
