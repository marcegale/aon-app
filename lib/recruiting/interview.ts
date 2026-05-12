import { openai } from "@/lib/openai";
import { prisma } from "@/app/lib/prisma";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { randomBytes } from "crypto";
import { aggregateCandidateSignals } from "@/lib/recruiting/hiringSignals";
import { validateCandidateReadyForInterview } from "@/lib/recruiting/qualityGates";

export type InterviewQuestionInput = {
  jobProfileOutput?: unknown;
  idealCandidateOutput?: unknown;
  scoringCriteriaOutput?: unknown;
  candidateCvSummary?: string | null;
  candidateCvReport?: unknown;
};

export type GeneratedInterviewQuestion = {
  order: number;
  question: string;
  category: string;
};

export type InterviewAnswerForEvaluation = {
  question: string;
  category: string;
  answerText: string | null;
};

export type InterviewEvaluationResult = {
  interviewScore: number;
  interviewSummary: string;
  interviewReport: Record<string, unknown>;
  hiringSignal: string;
  answerScores: Array<{
    question: string;
    score: number;
    feedback: string;
  }>;
};

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return {};
    }

    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}

function coerceScore(value: unknown) {
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(score)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

async function jsonResponse(prompt: Record<string, unknown>) {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Actua como entrevistador senior de seleccion. Devuelve solo JSON valido, sin markdown.",
      },
      {
        role: "user",
        content: JSON.stringify(prompt),
      },
    ],
  });

  const message = response.output.find((item) => item.type === "message");
  const textBlock =
    message?.type === "message" ? message.content?.find((content) => content.type === "output_text") : null;
  return parseJsonObject(textBlock?.type === "output_text" ? textBlock.text : "{}");
}

export async function generateInterviewQuestions(input: InterviewQuestionInput) {
  const parsed = await jsonResponse({
    task:
      "Genera 7 preguntas de entrevista contextualizadas para este candidato y esta busqueda.",
    dimensions: [
      "claridad",
      "experiencia",
      "comunicacion",
      "seniority",
      "problem solving",
      "cultural fit",
    ],
    outputShape: {
      questions: [
        {
          order: "number",
          category: "string",
          question: "string",
        },
      ],
    },
    context: {
      jobProfile: input.jobProfileOutput ?? null,
      idealCandidate: input.idealCandidateOutput ?? null,
      scoringCriteria: input.scoringCriteriaOutput ?? null,
      candidateCvSummary: input.candidateCvSummary ?? null,
      candidateCvReport: input.candidateCvReport ?? null,
    },
  });

  const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
  const normalized = questions
    .map((question, index) => {
      if (!question || typeof question !== "object") {
        return null;
      }

      const value = question as Record<string, unknown>;
      const text = typeof value.question === "string" ? value.question.trim() : "";
      if (!text) {
        return null;
      }

      return {
        order: coerceScore(value.order) || index + 1,
        category:
          typeof value.category === "string" && value.category.trim()
            ? value.category.trim()
            : "general",
        question: text,
      } satisfies GeneratedInterviewQuestion;
    })
    .filter((question): question is GeneratedInterviewQuestion => Boolean(question))
    .slice(0, 10);

  if (normalized.length > 0) {
    return normalized.map((question, index) => ({ ...question, order: index + 1 }));
  }

  return [
    {
      order: 1,
      category: "experiencia",
      question: "Contanos brevemente tu experiencia mas relevante para este rol.",
    },
    {
      order: 2,
      category: "problem solving",
      question: "Describi un problema complejo que resolviste y como tomaste decisiones.",
    },
    {
      order: 3,
      category: "cultural fit",
      question: "Que tipo de equipo y estilo de trabajo te permite rendir mejor?",
    },
  ];
}

export async function evaluateInterviewAnswers(input: {
  jobProfileOutput?: unknown;
  idealCandidateOutput?: unknown;
  scoringCriteriaOutput?: unknown;
  candidateCvSummary?: string | null;
  answers: InterviewAnswerForEvaluation[];
}): Promise<InterviewEvaluationResult> {
  const parsed = await jsonResponse({
    task:
      "Evalua respuestas de entrevista. Score global 0-100 y dimensiones: claridad, experiencia, comunicacion, seniority, problemSolving, culturalFit.",
    outputShape: {
      overallScore: "number",
      interviewScore: "number",
      interviewSummary: "string",
      interviewReport: {
        overallScore: "number",
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
      answerScores: [{ question: "string", score: "number", feedback: "string" }],
    },
    context: {
      jobProfile: input.jobProfileOutput ?? null,
      idealCandidate: input.idealCandidateOutput ?? null,
      scoringCriteria: input.scoringCriteriaOutput ?? null,
      candidateCvSummary: input.candidateCvSummary ?? null,
      answers: input.answers,
    },
  });

  const report =
    parsed.interviewReport && typeof parsed.interviewReport === "object"
      ? (parsed.interviewReport as Record<string, unknown>)
      : {};
  const overallScore = coerceScore(parsed.overallScore || parsed.interviewScore);
  const normalizedReport = {
    overallScore,
    communicationScore: coerceScore(report.communicationScore ?? report.clarity),
    leadershipScore: coerceScore(report.leadershipScore),
    confidenceScore: coerceScore(report.confidenceScore),
    problemSolvingScore: coerceScore(report.problemSolvingScore),
    cultureFitScore: coerceScore(report.cultureFitScore ?? report.culturalFit),
    strengths: Array.isArray(report.strengths) ? report.strengths : [],
    risks: Array.isArray(report.risks) ? report.risks : [],
    behavioralSignals: Array.isArray(report.behavioralSignals) ? report.behavioralSignals : [],
    recommendation:
      typeof report.recommendation === "string" ? report.recommendation : "Revisar entrevista.",
    executiveSummary:
      typeof report.executiveSummary === "string"
        ? report.executiveSummary
        : typeof parsed.interviewSummary === "string"
          ? parsed.interviewSummary
          : "Resumen ejecutivo no disponible.",
  };
  const hiringSignal = aggregateCandidateSignals({
    interviewScore: overallScore,
    behavioralSignals: normalizedReport,
  }).finalSignal;

  const answerScores = Array.isArray(parsed.answerScores)
    ? parsed.answerScores
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const value = item as Record<string, unknown>;
          return {
            question: typeof value.question === "string" ? value.question : "",
            score: coerceScore(value.score),
            feedback: typeof value.feedback === "string" ? value.feedback : "",
          };
        })
        .filter((item): item is { question: string; score: number; feedback: string } =>
          Boolean(item),
        )
    : [];

  return {
    interviewScore: overallScore,
    interviewSummary:
      typeof parsed.interviewSummary === "string" && parsed.interviewSummary.trim()
        ? parsed.interviewSummary.trim()
        : normalizedReport.executiveSummary,
    interviewReport: {
      ...normalizedReport,
      hiringSignal,
    },
    hiringSignal,
    answerScores,
  };
}

export async function generateInterviewSummary(input: {
  evaluation: InterviewEvaluationResult;
}) {
  return input.evaluation.interviewSummary;
}

function createPublicToken() {
  return randomBytes(32).toString("base64url");
}

function getInterviewExpiry() {
  const days = Number(process.env.RECRUITING_INTERVIEW_EXPIRES_DAYS ?? 7);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (Number.isFinite(days) ? days : 7));
  return expiresAt;
}

export async function createInterviewSessionForCandidate(input: {
  tenantId: string;
  candidateId: string;
  actorUserId?: string | null;
  source?: string;
}) {
  await validateCandidateReadyForInterview({ tenantId: input.tenantId, candidateId: input.candidateId });
  const candidate = await prisma.recruitingCandidate.findFirst({
    where: {
      id: input.candidateId,
      search: { tenantId: input.tenantId },
    },
    include: {
      search: true,
      interviewSessions: {
        where: {
          status: { in: ["pending", "in_progress"] },
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!candidate) {
    throw new Error("Candidate not found for tenant");
  }

  const existing = candidate.interviewSessions[0];
  if (existing) {
    return {
      session: existing,
      created: false,
      interviewLink: `/interview/${existing.publicToken}`,
      questionCount: undefined,
    };
  }

  const questions = await generateInterviewQuestions({
    jobProfileOutput: candidate.search.jobProfileOutput,
    idealCandidateOutput: candidate.search.idealCandidateOutput,
    scoringCriteriaOutput: candidate.search.scoringCriteriaOutput,
    candidateCvSummary: candidate.cvSummary,
    candidateCvReport: candidate.cvReport,
  });

  const session = await prisma.recruitingInterviewSession.create({
    data: {
      tenantId: input.tenantId,
      searchId: candidate.searchId,
      candidateId: candidate.id,
      publicToken: createPublicToken(),
      status: "pending",
      expiresAt: getInterviewExpiry(),
      questions: {
        create: questions.map((question) => ({
          order: question.order,
          question: question.question,
          category: question.category,
        })),
      },
    },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });

  await prisma.recruitingCandidate.update({
    where: { id: candidate.id },
    data: {
      pipelineStage: "interview",
      pipelineUpdatedAt: new Date(),
    },
  });

  await createRecruitingCandidateAuditLog({
    tenantId: input.tenantId,
    searchId: candidate.searchId,
    candidateId: candidate.id,
    action: "interview.created",
    previousValue: null,
    newValue: session.id,
    actorUserId: input.actorUserId,
    metadata: {
      source: input.source ?? "manual",
      questionCount: session.questions.length,
      expiresAt: session.expiresAt.toISOString(),
    },
  });

  return {
    session,
    created: true,
    interviewLink: `/interview/${session.publicToken}`,
    questionCount: session.questions.length,
  };
}
