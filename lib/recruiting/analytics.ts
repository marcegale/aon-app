type CandidateMetric = {
  createdAt: Date;
  pipelineStage: string;
  pipelineUpdatedAt?: Date | null;
  interviewSessions?: Array<{ status: string; interviewScore?: number | null; completedAt?: Date | null }>;
  offers?: Array<{ status: string; createdAt: Date; respondedAt?: Date | null }>;
};

export function computeTimeToHire(candidates: CandidateMetric[]) {
  const hired = candidates.filter((candidate) => candidate.pipelineStage === "hired");
  if (hired.length === 0) return null;

  const total = hired.reduce((sum, candidate) => {
    const end = candidate.pipelineUpdatedAt ?? new Date();
    return sum + (end.getTime() - candidate.createdAt.getTime());
  }, 0);

  return Math.round(total / hired.length / (1000 * 60 * 60 * 24));
}

export function computePipelineConversionRates(candidates: CandidateMetric[]) {
  const total = candidates.length || 1;
  const stages = ["applied", "screening", "shortlisted", "interview", "technical", "offer", "hired", "rejected"];
  return Object.fromEntries(
    stages.map((stage) => [
      stage,
      Math.round(
        (candidates.filter((candidate) => candidate.pipelineStage === stage).length / total) * 100,
      ),
    ]),
  );
}

export function computeOfferAcceptanceRate(candidates: CandidateMetric[]) {
  const offers = candidates.flatMap((candidate) => candidate.offers ?? []);
  const responded = offers.filter((offer) => ["accepted", "rejected"].includes(offer.status));
  if (responded.length === 0) return null;
  return Math.round((responded.filter((offer) => offer.status === "accepted").length / responded.length) * 100);
}

export function computeInterviewSuccessRate(candidates: CandidateMetric[]) {
  const interviews = candidates.flatMap((candidate) => candidate.interviewSessions ?? []);
  const completed = interviews.filter((interview) => interview.status === "completed");
  if (interviews.length === 0) return null;
  return Math.round((completed.length / interviews.length) * 100);
}

export function computeTopRecruiterMetrics(input: {
  automationExecutionCount: number;
  notificationCount: number;
  candidates: CandidateMetric[];
}) {
  return {
    candidatesReviewed: input.candidates.length,
    automationExecutionCount: input.automationExecutionCount,
    notificationCount: input.notificationCount,
    offerAcceptanceRate: computeOfferAcceptanceRate(input.candidates),
    interviewSuccessRate: computeInterviewSuccessRate(input.candidates),
    timeToHireDays: computeTimeToHire(input.candidates),
  };
}
