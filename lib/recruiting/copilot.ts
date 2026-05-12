import { openai } from "@/lib/openai";

export type CopilotCandidate = {
  id: string;
  candidateCode?: string | null;
  fullName?: string | null;
  email?: string | null;
  cvScore?: number | null;
  cvSummary?: string | null;
  cvReport?: unknown;
  interviewScore?: number | null;
  interviewSummary?: string | null;
  interviewReport?: unknown;
  pipelineStage?: string | null;
};

export type RecruiterRecommendation = {
  strengths: string[];
  risks: string[];
  recommendation: string;
  why_this_candidate: string;
  hiring_signal: string;
};

function parseJson(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

async function copilotJson(input: Record<string, unknown>) {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Actua como recruiter copilot senior. Devuelve solo JSON valido, sin markdown.",
      },
      { role: "user", content: JSON.stringify(input) },
    ],
  });
  const message = response.output.find((item) => item.type === "message");
  const textBlock =
    message?.type === "message" ? message.content?.find((content) => content.type === "output_text") : null;
  return parseJson(textBlock?.type === "output_text" ? textBlock.text : "{}");
}

function fallbackRecommendation(candidate: CopilotCandidate): RecruiterRecommendation {
  const score = Math.max(candidate.cvScore ?? 0, candidate.interviewScore ?? 0);

  if (score >= 80) {
    return {
      strengths: ["Score alto", "Buen ajuste inicial"],
      risks: [],
      recommendation: "Avanzar",
      why_this_candidate: "Tiene indicadores fuertes contra la busqueda.",
      hiring_signal: "IA recomienda avanzar",
    };
  }

  if (score < 40 && score > 0) {
    return {
      strengths: [],
      risks: ["Score bajo"],
      recommendation: "Revisar antes de avanzar",
      why_this_candidate: "Los indicadores disponibles son debiles.",
      hiring_signal: "IA detecta riesgo",
    };
  }

  return {
    strengths: [],
    risks: ["Informacion incompleta"],
    recommendation: "Esperar mas datos",
    why_this_candidate: "Falta informacion suficiente para una recomendacion fuerte.",
    hiring_signal: "Pendiente de evidencia",
  };
}

export async function generateRecruiterRecommendation(input: {
  searchContext?: unknown;
  candidate: CopilotCandidate;
}): Promise<RecruiterRecommendation> {
  const parsed = await copilotJson({
    task:
      "Genera recomendacion recruiter sobre este candidato. Evalua strengths, risks, recommendation, why_this_candidate, hiring_signal.",
    outputShape: {
      strengths: ["string"],
      risks: ["string"],
      recommendation: "string",
      why_this_candidate: "string",
      hiring_signal: "string",
    },
    searchContext: input.searchContext ?? null,
    candidate: input.candidate,
  });
  const fallback = fallbackRecommendation(input.candidate);

  return {
    strengths: arrayOfStrings(parsed.strengths),
    risks: arrayOfStrings(parsed.risks),
    recommendation:
      typeof parsed.recommendation === "string" ? parsed.recommendation : fallback.recommendation,
    why_this_candidate:
      typeof parsed.why_this_candidate === "string"
        ? parsed.why_this_candidate
        : fallback.why_this_candidate,
    hiring_signal:
      typeof parsed.hiring_signal === "string" ? parsed.hiring_signal : fallback.hiring_signal,
  };
}

export async function explainCandidateFit(input: {
  searchContext?: unknown;
  candidate: CopilotCandidate;
}) {
  return generateRecruiterRecommendation(input);
}

export async function compareCandidates(input: {
  searchContext?: unknown;
  candidates: CopilotCandidate[];
}) {
  const parsed = await copilotJson({
    task:
      "Compara candidatos para una busqueda y devuelve ranking. Considera CV, entrevista, riesgos y senales de contratacion.",
    outputShape: {
      ranked: [
        {
          candidateId: "string",
          rank: "number",
          strengths: ["string"],
          risks: ["string"],
          recommendation: "string",
          hiring_signal: "string",
        },
      ],
      recommendation: "string",
    },
    searchContext: input.searchContext ?? null,
    candidates: input.candidates,
  });

  const ranked = Array.isArray(parsed.ranked)
    ? parsed.ranked
    : [...input.candidates]
        .sort(
          (a, b) =>
            Math.max(b.cvScore ?? 0, b.interviewScore ?? 0) -
            Math.max(a.cvScore ?? 0, a.interviewScore ?? 0),
        )
        .map((candidate, index) => ({
          candidateId: candidate.id,
          rank: index + 1,
          ...fallbackRecommendation(candidate),
        }));

  return {
    ranked,
    recommendation:
      typeof parsed.recommendation === "string"
        ? parsed.recommendation
        : "Ranking generado con la informacion disponible.",
  };
}

export function getHeuristicHiringSignal(candidate: CopilotCandidate) {
  const score = Math.max(candidate.cvScore ?? 0, candidate.interviewScore ?? 0);

  if (score >= 80) return "IA recomienda avanzar";
  if ((candidate.interviewScore ?? 0) >= 80) return "Alta compatibilidad cultural";
  if (score > 0 && score < 40) return "IA detecta riesgo";
  return "Pendiente de evidencia";
}

export async function explainBehavioralFit(input: {
  searchContext?: unknown;
  candidate: CopilotCandidate;
}) {
  const parsed = await copilotJson({
    task:
      "Explica behavioral fit para recruiter usando entrevista, senales conductuales y riesgos.",
    outputShape: {
      explanation: "string",
      strengths: ["string"],
      risks: ["string"],
    },
    searchContext: input.searchContext ?? null,
    candidate: input.candidate,
  });

  return {
    explanation:
      typeof parsed.explanation === "string"
        ? parsed.explanation
        : "No hay suficiente evidencia conductual.",
    strengths: arrayOfStrings(parsed.strengths),
    risks: arrayOfStrings(parsed.risks),
  };
}

export async function explainHiringSignal(input: {
  searchContext?: unknown;
  candidate: CopilotCandidate;
}) {
  const recommendation = await generateRecruiterRecommendation(input);
  return {
    signal: recommendation.hiring_signal,
    explanation: recommendation.why_this_candidate,
    recommendation: recommendation.recommendation,
  };
}

export async function generateExecutiveHiringSummary(input: {
  searchContext?: unknown;
  candidates: CopilotCandidate[];
}) {
  const comparison = await compareCandidates(input);
  return {
    summary: comparison.recommendation,
    ranked: comparison.ranked,
  };
}

export async function explainCompensationRecommendation(input: {
  searchContext?: unknown;
  candidate: CopilotCandidate;
  compensation?: unknown;
}) {
  const parsed = await copilotJson({
    task:
      "Explica recomendacion de compensacion para recruiter. Se claro sobre rango, posicion de mercado y tradeoffs.",
    outputShape: {
      explanation: "string",
      risks: ["string"],
      recommendation: "string",
    },
    searchContext: input.searchContext ?? null,
    candidate: input.candidate,
    compensation: input.compensation ?? null,
  });

  return {
    explanation:
      typeof parsed.explanation === "string"
        ? parsed.explanation
        : "Usar el rango recomendado y validar expectativas del candidato.",
    risks: arrayOfStrings(parsed.risks),
    recommendation:
      typeof parsed.recommendation === "string"
        ? parsed.recommendation
        : "Preparar oferta con margen de negociacion.",
  };
}

export async function explainOfferRisk(input: {
  searchContext?: unknown;
  candidate: CopilotCandidate;
  offer?: unknown;
}) {
  const parsed = await copilotJson({
    task:
      "Evalua riesgo de oferta: probabilidad de aceptacion, riesgos de compensacion y pasos recomendados.",
    outputShape: {
      riskLevel: "string",
      explanation: "string",
      nextSteps: ["string"],
    },
    searchContext: input.searchContext ?? null,
    candidate: input.candidate,
    offer: input.offer ?? null,
  });

  return {
    riskLevel: typeof parsed.riskLevel === "string" ? parsed.riskLevel : "unknown",
    explanation:
      typeof parsed.explanation === "string"
        ? parsed.explanation
        : "No hay suficiente informacion de negociacion.",
    nextSteps: arrayOfStrings(parsed.nextSteps),
  };
}

export async function summarizeNegotiationRisk(input: {
  searchContext?: unknown;
  candidate: CopilotCandidate;
  offer?: unknown;
  memories?: unknown;
}) {
  const parsed = await copilotJson({
    task:
      "Resume riesgo de negociacion para recruiter, incluyendo senales de compensacion y objeciones probables.",
    outputShape: {
      summary: "string",
      risks: ["string"],
      mitigation: ["string"],
    },
    searchContext: input.searchContext ?? null,
    candidate: input.candidate,
    offer: input.offer ?? null,
    memories: input.memories ?? null,
  });

  return {
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : "Riesgo de negociacion pendiente de evaluar.",
    risks: arrayOfStrings(parsed.risks),
    mitigation: arrayOfStrings(parsed.mitigation),
  };
}

export async function analyzeOfferNegotiationRisk(input: {
  compensationEstimate?: unknown;
  marketLevel?: string | null;
  candidateSignals?: unknown;
  hiringStrength?: string | null;
  seniority?: string | null;
}) {
  const parsed = await copilotJson({
    task:
      "Analiza riesgo de negociacion de oferta y devuelve nivel, razones y mitigaciones.",
    outputShape: {
      riskLevel: "string",
      reasons: ["string"],
      mitigation: ["string"],
    },
    ...input,
  });

  return {
    riskLevel: typeof parsed.riskLevel === "string" ? parsed.riskLevel : "medium",
    reasons: arrayOfStrings(parsed.reasons),
    mitigation: arrayOfStrings(parsed.mitigation),
  };
}

export async function predictOfferAcceptance(input: {
  compensationEstimate?: unknown;
  marketLevel?: string | null;
  candidateSignals?: unknown;
  hiringStrength?: string | null;
  seniority?: string | null;
}) {
  const parsed = await copilotJson({
    task: "Predice probabilidad de aceptacion de oferta de 0 a 100.",
    outputShape: {
      probability: "number",
      explanation: "string",
    },
    ...input,
  });
  const probability = Number(parsed.probability);

  return {
    probability: Number.isFinite(probability) ? Math.max(0, Math.min(100, Math.round(probability))) : 50,
    explanation:
      typeof parsed.explanation === "string"
        ? parsed.explanation
        : "Probabilidad estimada con evidencia incompleta.",
  };
}

export async function explainCompensationGap(input: {
  compensationEstimate?: unknown;
  marketLevel?: string | null;
  candidateSignals?: unknown;
  hiringStrength?: string | null;
  seniority?: string | null;
}) {
  const parsed = await copilotJson({
    task: "Explica brecha entre oferta, mercado y fortaleza del candidato.",
    outputShape: {
      gap: "string",
      explanation: "string",
      recommendation: "string",
    },
    ...input,
  });

  return {
    gap: typeof parsed.gap === "string" ? parsed.gap : "unknown",
    explanation:
      typeof parsed.explanation === "string"
        ? parsed.explanation
        : "No hay suficiente informacion para explicar la brecha.",
    recommendation:
      typeof parsed.recommendation === "string"
        ? parsed.recommendation
        : "Validar expectativas antes de enviar oferta.",
  };
}
