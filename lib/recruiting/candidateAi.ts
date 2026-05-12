import { openai } from "@/lib/openai";

export type CandidateAiInput = {
  searchTitle: string;
  requestText: string;
  jobProfileOutput?: unknown;
  idealCandidateOutput?: unknown;
  scoringCriteriaOutput?: unknown;
  cvText: string;
};

export type CandidateAiResult = {
  fullName: string | null;
  email: string | null;
  cvSummary: string;
  cvScore: number;
  cvReport: Record<string, unknown>;
};

function coerceScore(value: unknown) {
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(score)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function analyzeCandidateCv(input: CandidateAiInput): Promise<CandidateAiResult> {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Actua como analista senior de seleccion. Devuelve solo JSON valido, sin markdown.",
      },
      {
        role: "user",
        content: JSON.stringify({
          task:
            "Evalua el CV contra la busqueda. Extrae nombre/email si aparecen. Score 0-100.",
          outputShape: {
            fullName: "string|null",
            email: "string|null",
            cvSummary: "string",
            cvScore: "number",
            cvReport: {
              fit: "string",
              strengths: ["string"],
              gaps: ["string"],
              risks: ["string"],
              recommendation: "string",
            },
          },
          search: {
            title: input.searchTitle,
            requestText: input.requestText,
            jobProfile: input.jobProfileOutput ?? null,
            idealCandidate: input.idealCandidateOutput ?? null,
            scoringCriteria: input.scoringCriteriaOutput ?? null,
          },
          cvText: input.cvText.slice(0, 30000),
        }),
      },
    ],
  });

  const message = response.output.find((item) => item.type === "message");
  const textBlock =
    message?.type === "message" ? message.content?.find((content) => content.type === "output_text") : null;
  const text = textBlock?.type === "output_text" ? textBlock.text : "{}";

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = {};
  }

  const cvReport =
    parsed.cvReport && typeof parsed.cvReport === "object"
      ? (parsed.cvReport as Record<string, unknown>)
      : { raw: text };

  return {
    fullName: typeof parsed.fullName === "string" && parsed.fullName.trim() ? parsed.fullName.trim() : null,
    email: typeof parsed.email === "string" && parsed.email.trim() ? parsed.email.trim() : null,
    cvSummary:
      typeof parsed.cvSummary === "string" && parsed.cvSummary.trim()
        ? parsed.cvSummary.trim()
        : "Resumen no disponible.",
    cvScore: coerceScore(parsed.cvScore),
    cvReport,
  };
}
