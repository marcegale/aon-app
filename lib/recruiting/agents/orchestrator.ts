import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { completeAgentRun, failAgentRun, startAgentRun } from "@/lib/recruiting/agentRuns";
import { requiresHumanApproval } from "@/lib/recruiting/agentSafety";
import { logOperationalEvent } from "@/lib/recruiting/operationalEvents";
import { analyticsAgent } from "./analyticsAgent";
import { interviewAgent } from "./interviewAgent";
import { offerAgent } from "./offerAgent";
import { onboardingAgent } from "./onboardingAgent";
import { screeningAgent } from "./screeningAgent";
import { sourcingAgent } from "./sourcingAgent";
import { RecruitingAgent, RecruitingAgentInput, RecruitingAgentResult, RecruitingAgentType } from "./types";

const agents: Record<RecruitingAgentType, RecruitingAgent> = {
  sourcing: sourcingAgent,
  screening: screeningAgent,
  interview: interviewAgent,
  offer: offerAgent,
  onboarding: onboardingAgent,
  analytics: analyticsAgent,
};

function asAgentType(value: string): RecruitingAgentType {
  if (value in agents) return value as RecruitingAgentType;
  throw new Error(`Unsupported recruiting agent: ${value}`);
}

export function routeAgentTask(input: { agentType: string }) {
  return agents[asAgentType(input.agentType)];
}

async function persistAgentMemory(input: {
  tenantId: string;
  agentType: string;
  entityType: string;
  entityId: string;
  memoryKey: string;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.recruitingAgentMemory.upsert({
    where: {
      tenantId_agentType_entityType_entityId_memoryKey: {
        tenantId: input.tenantId,
        agentType: input.agentType,
        entityType: input.entityType,
        entityId: input.entityId,
        memoryKey: input.memoryKey,
      },
    },
    create: {
      tenantId: input.tenantId,
      agentType: input.agentType,
      entityType: input.entityType,
      entityId: input.entityId,
      memoryKey: input.memoryKey,
      content: input.content,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
    update: {
      content: input.content,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

async function createApprovals(input: {
  tenantId: string;
  agentRunId: string;
  result: RecruitingAgentResult;
}) {
  const actions = input.result.actions ?? [];
  const approvalActions = actions.filter((action) =>
    requiresHumanApproval(String(action.actionType ?? action.type ?? "unknown")),
  );

  if (approvalActions.length === 0) return [];

  return prisma.$transaction(
    approvalActions.map((action) =>
      prisma.recruitingAgentApproval.create({
        data: {
          tenantId: input.tenantId,
          agentRunId: input.agentRunId,
          actionType: String(action.actionType ?? action.type ?? "unknown"),
          proposedAction: action as Prisma.InputJsonValue,
          status: "pending",
        },
      }),
    ),
  );
}

export async function runRecruitingAgent(input: RecruitingAgentInput & { agentType: string }) {
  const agent = routeAgentTask({ agentType: input.agentType });
  await agent.validateInput(input);
  const startedAt = Date.now();
  const run = await startAgentRun({
    tenantId: input.tenantId,
    searchId: input.searchId ?? null,
    candidateId: input.candidateId ?? null,
    agentType: agent.agentType,
    input: { taskType: input.taskType ?? "manual", payload: input.payload ?? {} },
  });

  try {
    const result = await agent.execute(input);
    const summary = agent.generateSummary(result);
    const completed = await completeAgentRun({ id: run.id, output: { ...result, summary } });
    const approvals = await createApprovals({ tenantId: input.tenantId, agentRunId: run.id, result });

    await persistAgentMemory({
      tenantId: input.tenantId,
      agentType: agent.agentType,
      entityType: input.candidateId ? "candidate" : "search",
      entityId: input.candidateId ?? input.searchId ?? input.tenantId,
      memoryKey: `${input.taskType ?? "run"}:${run.id}`,
      content: summary,
      metadata: { recommendations: result.recommendations, metrics: result.metrics },
    });

    await logOperationalEvent({
      tenantId: input.tenantId,
      searchId: input.searchId,
      candidateId: input.candidateId,
      type: "agent.run.completed",
      severity: "info",
      message: `${agent.agentType} agent completed.`,
      metadata: {
        agentRunId: run.id,
        agentType: agent.agentType,
        latencyMs: Date.now() - startedAt,
        approvalCount: approvals.length,
        operationalLog: agent.generateOperationalLog(input, result),
      },
    });

    return { run: completed, result, approvals };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    await failAgentRun({ id: run.id, errorMessage: message });
    await logOperationalEvent({
      tenantId: input.tenantId,
      searchId: input.searchId,
      candidateId: input.candidateId,
      type: "agent.run.failed",
      severity: "error",
      message: `${agent.agentType} agent failed.`,
      metadata: { agentRunId: run.id, agentType: agent.agentType, error: message },
    });
    throw error;
  }
}

export async function executeAgentWorkflow(input: {
  tenantId: string;
  searchId?: string | null;
  candidateId?: string | null;
  workflow: Array<{ agentType: RecruitingAgentType; taskType?: string; condition?: boolean }>;
}) {
  const results = [];
  for (const step of input.workflow) {
    if (step.condition === false) continue;
    results.push(
      await runRecruitingAgent({
        tenantId: input.tenantId,
        searchId: input.searchId,
        candidateId: input.candidateId,
        agentType: step.agentType,
        taskType: step.taskType ?? "workflow",
      }),
    );
  }
  return results;
}

export async function orchestrateSearchLifecycle(input: { tenantId: string; searchId: string }) {
  return executeAgentWorkflow({
    ...input,
    workflow: [
      { agentType: "sourcing", taskType: "search.sourcing" },
      { agentType: "analytics", taskType: "search.analytics" },
    ],
  });
}

export async function orchestrateCandidateLifecycle(input: {
  tenantId: string;
  searchId: string;
  candidateId: string;
}) {
  return executeAgentWorkflow({
    ...input,
    workflow: [
      { agentType: "screening", taskType: "candidate.screening" },
      { agentType: "interview", taskType: "candidate.interview" },
      { agentType: "offer", taskType: "candidate.offer" },
      { agentType: "onboarding", taskType: "candidate.onboarding" },
    ],
  });
}

export async function createRecruitingAgentTask(input: {
  tenantId: string;
  agentType: RecruitingAgentType;
  taskType: string;
  priority?: number;
  payload: Record<string, unknown>;
}) {
  return prisma.recruitingAgentTask.create({
    data: {
      tenantId: input.tenantId,
      agentType: input.agentType,
      taskType: input.taskType,
      priority: input.priority ?? 5,
      payload: input.payload as Prisma.InputJsonValue,
      status: "queued",
    },
  });
}
