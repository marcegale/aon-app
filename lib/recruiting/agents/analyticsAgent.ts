import { prisma } from "@/app/lib/prisma";
import {
  computeInterviewSuccessRate,
  computeOfferAcceptanceRate,
  computePipelineConversionRates,
  computeTimeToHire,
  computeTopRecruiterMetrics,
} from "@/lib/recruiting/analytics";
import { computeAutomationSavings } from "@/lib/recruiting/costs";
import { assertTenant, RecruitingAgent, RecruitingAgentInput } from "./types";

async function loadSearchMetrics(input: RecruitingAgentInput) {
  const candidates = await prisma.recruitingCandidate.findMany({
    where: { search: { tenantId: input.tenantId, ...(input.searchId ? { id: input.searchId } : {}) } },
    include: { interviewSessions: true, offers: true },
  });
  const automations = await prisma.recruitingAutomationExecution.count({
    where: { tenantId: input.tenantId, ...(input.searchId ? { searchId: input.searchId } : {}) },
  });
  const notifications = await prisma.recruitingNotificationDelivery.count({
    where: { tenantId: input.tenantId, ...(input.searchId ? { searchId: input.searchId } : {}) },
  });
  return {
    candidates: candidates.map((candidate) => ({
      createdAt: candidate.receivedAt,
      pipelineStage: candidate.pipelineStage,
      pipelineUpdatedAt: candidate.pipelineUpdatedAt,
      interviewSessions: candidate.interviewSessions,
      offers: candidate.offers,
    })),
    automations,
    notifications,
  };
}

export async function detectPipelineBottlenecks(input: RecruitingAgentInput) {
  const { candidates } = await loadSearchMetrics(input);
  const rates = computePipelineConversionRates(candidates);
  return Object.entries(rates)
    .filter(([, value]) => value >= 50)
    .map(([stage, value]) => ({ stage, concentration: value }));
}

export async function computeRecruiterEfficiency(input: RecruitingAgentInput) {
  const { candidates, automations, notifications } = await loadSearchMetrics(input);
  return computeTopRecruiterMetrics({
    automationExecutionCount: automations,
    notificationCount: notifications,
    candidates,
  });
}

export async function detectAutomationAnomalies(input: RecruitingAgentInput) {
  const failed = await prisma.recruitingAutomationExecution.count({
    where: { tenantId: input.tenantId, ...(input.searchId ? { searchId: input.searchId } : {}), status: "failed" },
  });
  return failed > 0 ? [{ type: "failed_automations", count: failed }] : [];
}

export async function generateExecutiveInsights(input: RecruitingAgentInput) {
  const { candidates, automations } = await loadSearchMetrics(input);
  return {
    hiringVelocity: computeTimeToHire(candidates),
    offerAcceptance: computeOfferAcceptanceRate(candidates),
    interviewQuality: computeInterviewSuccessRate(candidates),
    automationSavings: computeAutomationSavings({ automatedActions: automations }),
  };
}

export const analyticsAgent: RecruitingAgent = {
  agentType: "analytics",
  validateInput(input) {
    assertTenant(input);
  },
  async execute(input) {
    const [bottlenecks, efficiency, anomalies, executiveInsights] = await Promise.all([
      detectPipelineBottlenecks(input),
      computeRecruiterEfficiency(input),
      detectAutomationAnomalies(input),
      generateExecutiveInsights(input),
    ]);
    return {
      summary: `Analytics generated with ${bottlenecks.length} bottleneck signals.`,
      recommendations: [
        { type: "pipeline_bottlenecks", bottlenecks },
        { type: "automation_anomalies", anomalies },
        { type: "executive_insights", executiveInsights },
      ],
      metrics: { ...efficiency, anomalyCount: anomalies.length },
    };
  },
  generateSummary(result) {
    return result.summary;
  },
  generateOperationalLog(input, result) {
    return { agentType: "analytics", searchId: input.searchId, metrics: result.metrics };
  },
};
