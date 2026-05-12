import { prisma } from "@/app/lib/prisma";
import { generateOfferRecommendation } from "@/lib/recruiting/compensation";
import { predictOfferAcceptance as copilotPredictOfferAcceptance } from "@/lib/recruiting/copilot";
import { assertTenant, RecruitingAgent, RecruitingAgentInput } from "./types";

async function loadCandidate(input: RecruitingAgentInput) {
  if (!input.candidateId) throw new Error("candidateId is required");
  const candidate = await prisma.recruitingCandidate.findFirst({
    where: { id: input.candidateId, search: { tenantId: input.tenantId } },
    include: { search: true, interviewSessions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!candidate) throw new Error("Candidate not found for tenant");
  return candidate;
}

export async function predictOfferAcceptance(input: RecruitingAgentInput) {
  const candidate = await loadCandidate(input);
  const latestInterview = candidate.interviewSessions[0];
  return copilotPredictOfferAcceptance({
    candidateSignals: candidate.cvReport,
    hiringStrength: candidate.cvScore && candidate.cvScore >= 80 ? "strong" : "standard",
    seniority: candidate.search.seniority,
    compensationEstimate: { cvScore: candidate.cvScore, interviewScore: latestInterview?.interviewScore },
  });
}

export async function generateNegotiationStrategy(input: RecruitingAgentInput) {
  const candidate = await loadCandidate(input);
  const latestInterview = candidate.interviewSessions[0];
  const compensation = await generateOfferRecommendation({
    cvSummary: candidate.cvSummary,
    cvReport: candidate.cvReport,
    seniority: candidate.search.seniority,
    location: candidate.search.location,
    cvScore: candidate.cvScore,
    interviewScore: latestInterview?.interviewScore,
  });
  return {
    compensation,
    strategy:
      compensation.compensationRisk === "high_competition_risk"
        ? "Validar expectativas antes de enviar y preparar rango alto."
        : "Enviar oferta con explicacion clara de nivel y beneficios.",
  };
}

export async function detectCompensationGap(input: RecruitingAgentInput) {
  const strategy = await generateNegotiationStrategy(input);
  return strategy.compensation.compensationRisk;
}

export async function recommendOfferTiming(input: RecruitingAgentInput) {
  const candidate = await loadCandidate(input);
  const ready = candidate.pipelineStage === "offer" || candidate.pipelineStage === "hired";
  return ready ? "now" : "after_interview_or_recruiter_approval";
}

export const offerAgent: RecruitingAgent = {
  agentType: "offer",
  validateInput(input) {
    assertTenant(input);
    if (!input.candidateId) throw new Error("candidateId is required for offer agent");
  },
  async execute(input) {
    const [acceptance, negotiation, gap, timing] = await Promise.all([
      predictOfferAcceptance(input),
      generateNegotiationStrategy(input),
      detectCompensationGap(input),
      recommendOfferTiming(input),
    ]);
    return {
      summary: `Offer strategy generated with ${acceptance.probability}% acceptance estimate.`,
      recommendations: [{ type: "offer_acceptance", acceptance }, { type: "negotiation", negotiation, gap, timing }],
      actions: [{ actionType: "generate_offer", timing, probability: acceptance.probability }],
      requiresApproval: true,
      metrics: { acceptanceProbability: acceptance.probability },
    };
  },
  generateSummary(result) {
    return result.summary;
  },
  generateOperationalLog(input, result) {
    return { agentType: "offer", candidateId: input.candidateId, metrics: result.metrics };
  },
};
