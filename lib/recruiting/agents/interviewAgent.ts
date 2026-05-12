import { prisma } from "@/app/lib/prisma";
import { assertTenant, RecruitingAgent, RecruitingAgentInput } from "./types";

export async function generateDynamicFollowups(input: RecruitingAgentInput) {
  if (!input.candidateId) throw new Error("candidateId is required");
  const session = await prisma.recruitingInterviewSession.findFirst({
    where: { tenantId: input.tenantId, candidateId: input.candidateId },
    orderBy: { createdAt: "desc" },
    include: { answers: true },
  });
  if (!session) return [];
  const weakAnswers = session.answers.filter((answer) => (answer.score ?? 100) < 60).slice(0, 3);
  return weakAnswers.map((answer) => ({
    questionId: answer.questionId,
    followup: "Profundizar con un ejemplo concreto, metricas y tradeoffs de la decision.",
  }));
}

export async function evaluateBehaviorConsistency(input: RecruitingAgentInput) {
  const sessions = await prisma.recruitingInterviewSession.findMany({
    where: {
      tenantId: input.tenantId,
      ...(input.candidateId ? { candidateId: input.candidateId } : {}),
      ...(input.searchId ? { searchId: input.searchId } : {}),
    },
    select: { interviewScore: true, interviewReport: true, status: true },
    take: 20,
  });
  const completed = sessions.filter((session) => session.status === "completed");
  const average =
    completed.length === 0
      ? null
      : Math.round(
          completed.reduce((sum, session) => sum + (session.interviewScore ?? 0), 0) / completed.length,
        );
  return { completed: completed.length, averageInterviewScore: average };
}

export async function detectCommunicationRisk(input: RecruitingAgentInput) {
  const sessions = await prisma.recruitingInterviewSession.findMany({
    where: { tenantId: input.tenantId, ...(input.candidateId ? { candidateId: input.candidateId } : {}) },
    include: { answers: true },
    take: 5,
  });
  const lowConfidence = sessions.flatMap((session) =>
    session.answers.filter((answer) => (answer.transcriptionConfidence ?? 1) < 0.55),
  );
  return lowConfidence.length > 0 ? ["low_transcription_confidence"] : [];
}

export async function summarizeInterviewTrajectory(input: RecruitingAgentInput) {
  const consistency = await evaluateBehaviorConsistency(input);
  return {
    trajectory:
      consistency.averageInterviewScore && consistency.averageInterviewScore >= 80
        ? "strong"
        : consistency.completed > 0
          ? "needs_review"
          : "pending",
    ...consistency,
  };
}

export const interviewAgent: RecruitingAgent = {
  agentType: "interview",
  validateInput(input) {
    assertTenant(input);
    if (!input.searchId && !input.candidateId) throw new Error("searchId or candidateId is required");
  },
  async execute(input) {
    const [followups, communicationRisks, trajectory] = await Promise.all([
      generateDynamicFollowups(input),
      detectCommunicationRisk(input),
      summarizeInterviewTrajectory(input),
    ]);
    return {
      summary: `Interview intelligence generated with ${followups.length} follow-ups.`,
      recommendations: [{ type: "interview_followups", followups }, { type: "trajectory", trajectory }],
      metrics: { followupCount: followups.length, communicationRiskCount: communicationRisks.length },
    };
  },
  generateSummary(result) {
    return result.summary;
  },
  generateOperationalLog(input, result) {
    return { agentType: "interview", candidateId: input.candidateId, searchId: input.searchId, metrics: result.metrics };
  },
};
