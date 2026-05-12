export type FinalHiringSignal = "strong_hire" | "hire" | "mixed" | "weak" | "reject";

type SignalInput = {
  cvScore?: number | null;
  interviewScore?: number | null;
  behavioralSignals?: unknown;
  pipelineHistory?: unknown;
  recruiterDecisions?: unknown;
};

function readNumber(source: unknown, key: string) {
  if (!source || typeof source !== "object") return null;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "number" ? value : null;
}

export function detectHighRiskCandidate(input: SignalInput) {
  const confidence = readNumber(input.behavioralSignals, "confidenceScore");
  const communication = readNumber(input.behavioralSignals, "communicationScore");

  return (
    (input.cvScore !== null && input.cvScore !== undefined && input.cvScore < 40) ||
    (input.interviewScore !== null &&
      input.interviewScore !== undefined &&
      input.interviewScore < 45) ||
    (confidence !== null && confidence < 30) ||
    (communication !== null && communication < 35)
  );
}

export function detectHighPotentialCandidate(input: SignalInput) {
  const leadership = readNumber(input.behavioralSignals, "leadershipScore");
  const communication = readNumber(input.behavioralSignals, "communicationScore");

  return (
    (input.cvScore ?? 0) >= 80 ||
    (input.interviewScore ?? 0) >= 85 ||
    (leadership !== null && leadership >= 85) ||
    (communication !== null && communication >= 85)
  );
}

export function computeFinalHiringSignal(input: SignalInput): FinalHiringSignal {
  if (detectHighRiskCandidate(input)) return "reject";

  const cv = input.cvScore ?? 0;
  const interview = input.interviewScore ?? 0;
  const behavior = readNumber(input.behavioralSignals, "communicationScore") ?? 0;
  const combined = Math.round(cv * 0.4 + interview * 0.4 + behavior * 0.2);

  if (combined >= 85 || detectHighPotentialCandidate(input)) return "strong_hire";
  if (combined >= 70) return "hire";
  if (combined >= 50) return "mixed";
  return "weak";
}

export function aggregateCandidateSignals(input: SignalInput) {
  return {
    finalSignal: computeFinalHiringSignal(input),
    highRisk: detectHighRiskCandidate(input),
    highPotential: detectHighPotentialCandidate(input),
    inputs: {
      cvScore: input.cvScore ?? null,
      interviewScore: input.interviewScore ?? null,
      behavioralSignals: input.behavioralSignals ?? null,
      pipelineHistory: input.pipelineHistory ?? null,
      recruiterDecisions: input.recruiterDecisions ?? null,
    },
  };
}
