import { openai } from "@/lib/openai";
import { computeFinalHiringSignal } from "@/lib/recruiting/hiringSignals";

export type CompensationEstimate = {
  estimatedMin: number;
  estimatedMax: number;
  level: string;
  marketPosition: string;
  compensationRisk: string;
  recommendation: string;
};

type CompensationInput = {
  cvSummary?: string | null;
  cvReport?: unknown;
  seniority?: string | null;
  location?: string | null;
  skills?: string[];
  interviewScore?: number | null;
  cvScore?: number | null;
  hiringSignals?: string | null;
  currency?: string;
};

function parseJson(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}

function numberOr(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

function fallbackEstimate(input: CompensationInput): CompensationEstimate {
  const signal =
    input.hiringSignals ??
    computeFinalHiringSignal({
      cvScore: input.cvScore,
      interviewScore: input.interviewScore,
    });
  const seniority = `${input.seniority ?? ""}`.toLowerCase();
  const base =
    seniority.includes("senior") || signal === "strong_hire"
      ? 85000
      : seniority.includes("mid") || signal === "hire"
        ? 55000
        : 35000;
  const interviewLift = Math.max(0, (input.interviewScore ?? 0) - 75) * 450;

  return {
    estimatedMin: Math.round((base + interviewLift) * 0.9),
    estimatedMax: Math.round((base + interviewLift) * 1.2),
    level: seniority.includes("senior")
      ? "senior"
      : seniority.includes("mid")
        ? "mid"
        : "emerging",
    marketPosition: signal === "strong_hire" ? "above_market" : "market",
    compensationRisk:
      signal === "strong_hire"
        ? "high_competition_risk"
        : signal === "reject"
          ? "low_offer_priority"
          : "standard",
    recommendation:
      signal === "strong_hire"
        ? "Preparar oferta competitiva en el tramo alto del rango."
        : "Usar rango de mercado y validar expectativas antes de enviar oferta.",
  };
}

async function compensationJson(task: string, input: CompensationInput) {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Actua como compensation analyst para recruiting. Devuelve solo JSON valido, sin markdown.",
      },
      {
        role: "user",
        content: JSON.stringify({
          task,
          outputShape: {
            estimatedMin: "number",
            estimatedMax: "number",
            level: "string",
            marketPosition: "string",
            compensationRisk: "string",
            recommendation: "string",
          },
          context: input,
        }),
      },
    ],
  });
  const message = response.output.find((item) => item.type === "message");
  const textBlock =
    message?.type === "message" ? message.content?.find((content) => content.type === "output_text") : null;
  return parseJson(textBlock?.type === "output_text" ? textBlock.text : "{}");
}

export async function estimateSalaryRange(input: CompensationInput): Promise<CompensationEstimate> {
  const fallback = fallbackEstimate(input);
  const parsed = await compensationJson("Estima rango salarial para este candidato y rol.", input);

  return {
    estimatedMin: numberOr(parsed.estimatedMin, fallback.estimatedMin),
    estimatedMax: numberOr(parsed.estimatedMax, fallback.estimatedMax),
    level: typeof parsed.level === "string" ? parsed.level : fallback.level,
    marketPosition:
      typeof parsed.marketPosition === "string"
        ? parsed.marketPosition
        : fallback.marketPosition,
    compensationRisk:
      typeof parsed.compensationRisk === "string"
        ? parsed.compensationRisk
        : fallback.compensationRisk,
    recommendation:
      typeof parsed.recommendation === "string"
        ? parsed.recommendation
        : fallback.recommendation,
  };
}

export async function estimateMarketLevel(input: CompensationInput) {
  return (await estimateSalaryRange(input)).level;
}

export async function detectCompensationRisk(input: CompensationInput) {
  return (await estimateSalaryRange(input)).compensationRisk;
}

export async function generateOfferRecommendation(input: CompensationInput) {
  return estimateSalaryRange(input);
}
