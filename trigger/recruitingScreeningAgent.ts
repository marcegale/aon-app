import { logger, task } from "@trigger.dev/sdk";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { runRecruitingAgent } from "@/lib/recruiting/agents/orchestrator";

type AgentPayload = {
  tenantId: string;
  searchId: string;
  candidateId: string;
  taskId?: string;
};

export const recruitingScreeningAgentTask = task({
  id: "recruiting-agent-screening",
  retry: { maxAttempts: 3, minTimeoutInMs: 2_000, maxTimeoutInMs: 30_000, factor: 2 },
  run: async (payload: AgentPayload) => {
    if (payload.taskId) {
      await prisma.recruitingAgentTask.update({
        where: { id: payload.taskId },
        data: { status: "processing", attempts: { increment: 1 }, startedAt: new Date() },
      });
    }
    try {
      const result = await runRecruitingAgent({ ...payload, agentType: "screening", taskType: "trigger.screening" });
      if (payload.taskId) {
        await prisma.recruitingAgentTask.update({
          where: { id: payload.taskId },
          data: { status: "completed", result: result.result as Prisma.InputJsonValue, completedAt: new Date() },
        });
      }
      logger.info("Screening agent completed", { candidateId: payload.candidateId });
      return { agentRunId: result.run.id };
    } catch (error) {
      if (payload.taskId) {
        await prisma.recruitingAgentTask.update({
          where: { id: payload.taskId },
          data: { status: "failed", errorMessage: error instanceof Error ? error.message : "unknown_error", completedAt: new Date() },
        });
      }
      throw error;
    }
  },
});
