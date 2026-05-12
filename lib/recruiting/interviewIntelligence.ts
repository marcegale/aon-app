import { openai } from "@/lib/openai";

export type InterviewBehaviorSignals = {
  communicationScore: number;
  leadershipScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  cultureFitScore: number;
  strengths: string[];
  risks: string[];
  behavioralSignals: string[];
  recommendation: string;
  executiveSummary: string;
};

function score(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.min(100, Math.round(numeric))) : 0;
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseJson(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function generateInterviewBehaviorSignals(input: {
  transcript: string;
  answerText?: string | null;
  question?: string | null;
}) {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Actua como analista de entrevistas. Devuelve solo JSON valido, sin markdown.",
      },
      {
        role: "user",
        content: JSON.stringify({
          task:
            "Analiza senales conductuales: claridad comunicacional, liderazgo, confianza, ownership, ambiguedad, estabilidad emocional, problem solving y pensamiento estructurado.",
          outputShape: {
            communicationScore: "number",
            leadershipScore: "number",
            confidenceScore: "number",
            problemSolvingScore: "number",
            cultureFitScore: "number",
            strengths: ["string"],
            risks: ["string"],
            behavioralSignals: ["string"],
            recommendation: "string",
            executiveSummary: "string",
          },
          question: input.question ?? null,
          transcript: input.transcript || input.answerText || "",
        }),
      },
    ],
  });
  const message = response.output.find((item) => item.type === "message");
  const textBlock =
    message?.type === "message" ? message.content?.find((content) => content.type === "output_text") : null;
  const parsed = parseJson(textBlock?.type === "output_text" ? textBlock.text : "{}");

  return {
    communicationScore: score(parsed.communicationScore),
    leadershipScore: score(parsed.leadershipScore),
    confidenceScore: score(parsed.confidenceScore),
    problemSolvingScore: score(parsed.problemSolvingScore),
    cultureFitScore: score(parsed.cultureFitScore),
    strengths: strings(parsed.strengths),
    risks: strings(parsed.risks),
    behavioralSignals: strings(parsed.behavioralSignals),
    recommendation:
      typeof parsed.recommendation === "string" ? parsed.recommendation : "Revisar entrevista.",
    executiveSummary:
      typeof parsed.executiveSummary === "string"
        ? parsed.executiveSummary
        : "Resumen conductual no disponible.",
  } satisfies InterviewBehaviorSignals;
}

export async function detectCommunicationStrengths(input: { transcript: string }) {
  const signals = await generateInterviewBehaviorSignals({ transcript: input.transcript });
  return signals.strengths;
}

export async function detectRiskSignals(input: { transcript: string }) {
  const signals = await generateInterviewBehaviorSignals({ transcript: input.transcript });
  return signals.risks;
}

export function computeBehaviorScore(input: Partial<InterviewBehaviorSignals>) {
  const values = [
    input.communicationScore,
    input.leadershipScore,
    input.confidenceScore,
    input.problemSolvingScore,
    input.cultureFitScore,
  ].filter((value): value is number => typeof value === "number");

  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
