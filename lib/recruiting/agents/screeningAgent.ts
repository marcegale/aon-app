import { prisma } from "@/app/lib/prisma";
import { aggregateCandidateSignals, detectHighRiskCandidate } from "@/lib/recruiting/hiringSignals";
import { assertTenant, RecruitingAgent, RecruitingAgentInput, scoreBand } from "./types";

export async function reScoreCandidate(input: RecruitingAgentInput) {
  if (!input.candidateId) throw new Error("candidateId is required");
  const candidate = await prisma.recruitingCandidate.findFirst({
    where: { id: input.candidateId, search: { tenantId: input.tenantId } },
    include: { interviewSessions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!candidate) throw new Error("Candidate not found for tenant");
  const latestInterview = candidate.interviewSessions[0];
  const signal = aggregateCandidateSignals({
    cvScore: candidate.cvScore,
    interviewScore: latestInterview?.interviewScore,
    behavioralSignals: latestInterview?.interviewReport,
  });
  return { candidate, latestInterview, signal };
}

export function detectResumeRisk(input: { cvScore?: number | null; cvSummary?: string | null }) {
  const risks: string[] = [];
  if ((input.cvScore ?? 0) > 0 && (input.cvScore ?? 0) < 40) risks.push("low_cv_score");
  if (!input.cvSummary) risks.push("missing_cv_summary");
  return risks;
}

export function computeScreeningConfidence(input: { cvScore?: number | null; interviewScore?: number | null }) {
  const evidence = [input.cvScore, input.interviewScore].filter((value) => typeof value === "number").length;
  const score = Math.max(input.cvScore ?? 0, input.interviewScore ?? 0);
  return Math.min(95, Math.max(20, evidence * 30 + Math.round(score / 4)));
}

export async function generateShortlistRecommendations(input: RecruitingAgentInput) {
  const { candidate, latestInterview, signal } = await reScoreCandidate(input);
  const confidence = computeScreeningConfidence({
    cvScore: candidate.cvScore,
    interviewScore: latestInterview?.interviewScore,
  });
  return {
    actionType: signal.finalSignal === "strong_hire" || (candidate.cvScore ?? 0) >= 80 ? "move_stage" : "review",
    recommendedStage: (candidate.cvScore ?? 0) >= 80 ? "shortlisted" : candidate.pipelineStage,
    confidence,
    signal: signal.finalSignal,
  };
}

export const screeningAgent: RecruitingAgent = {
  agentType: "screening",
  validateInput(input) {
    assertTenant(input);
    if (!input.candidateId) throw new Error("candidateId is required for screening agent");
  },
  async execute(input) {
    const { candidate, latestInterview, signal } = await reScoreCandidate(input);
    const risks = detectResumeRisk(candidate);
    const recommendation = await generateShortlistRecommendations(input);
    const highRisk = detectHighRiskCandidate({
      cvScore: candidate.cvScore,
      interviewScore: latestInterview?.interviewScore,
      behavioralSignals: latestInterview?.interviewReport,
    });
    return {
      summary: `Screening completed for ${candidate.fullName ?? candidate.email ?? candidate.id}.`,
      recommendations: [
        {
          type: "screening",
          candidateId: candidate.id,
          scoreBand: scoreBand(candidate.cvScore),
          risks,
          highRisk,
          recommendation,
          signal: signal.finalSignal,
        },
      ],
      actions: recommendation.actionType === "move_stage" ? [recommendation] : [],
      requiresApproval: recommendation.actionType === "move_stage",
      metrics: { confidence: recommendation.confidence, riskCount: risks.length },
    };
  },
  generateSummary(result) {
    return result.summary;
  },
  generateOperationalLog(input, result) {
    return { agentType: "screening", candidateId: input.candidateId, metrics: result.metrics };
  },
};
