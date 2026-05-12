import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { openai } from "@/lib/openai";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { aggregateCandidateSignals } from "@/lib/recruiting/hiringSignals";

export const RECRUITING_EMBEDDING_MODEL = "text-embedding-3-small";

type CandidateEmbeddingInput = {
  tenantId: string;
  candidateId: string;
  sourceType?: string;
};

type TalentSearchInput = {
  tenantId: string;
  query: string;
  limit?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringifySignal(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function asNumberArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item))
    : [];
}

export function computeCandidateSimilarity(left: number[], right: number[]) {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return 0;
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] * left[index];
    rightMagnitude += right[index] * right[index];
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

async function embedText(text: string) {
  const response = await openai.embeddings.create({
    model: RECRUITING_EMBEDDING_MODEL,
    input: text.slice(0, 24000),
  });

  return response.data[0]?.embedding ?? [];
}

function buildCandidateEmbeddingText(candidate: {
  fullName: string | null;
  email: string | null;
  cvSummary: string | null;
  cvReport: unknown;
  cvScore: number | null;
  pipelineStage: string;
  interviewSessions: Array<{
    interviewScore: number | null;
    interviewSummary: string | null;
    interviewReport: unknown;
  }>;
  memories: Array<{ memoryType: string; content: string }>;
}) {
  const latestInterview = candidate.interviewSessions[0];
  const hiringSignals = aggregateCandidateSignals({
    cvScore: candidate.cvScore,
    interviewScore: latestInterview?.interviewScore,
    behavioralSignals: latestInterview?.interviewReport,
  });

  return [
    `Candidate: ${candidate.fullName ?? candidate.email ?? "unknown"}`,
    `Pipeline stage: ${candidate.pipelineStage}`,
    `CV score: ${candidate.cvScore ?? "pending"}`,
    `CV summary: ${candidate.cvSummary ?? ""}`,
    `CV report: ${stringifySignal(candidate.cvReport)}`,
    `Interview score: ${latestInterview?.interviewScore ?? "pending"}`,
    `Interview summary: ${latestInterview?.interviewSummary ?? ""}`,
    `Interview report: ${stringifySignal(latestInterview?.interviewReport)}`,
    `Hiring signals: ${stringifySignal(hiringSignals)}`,
    `Recruiter notes and memories: ${candidate.memories
      .map((memory) => `${memory.memoryType}: ${memory.content}`)
      .join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function generateCandidateEmbedding(input: CandidateEmbeddingInput) {
  const candidate = await prisma.recruitingCandidate.findFirst({
    where: { id: input.candidateId, search: { tenantId: input.tenantId } },
    include: {
      search: { select: { id: true, tenantId: true } },
      memories: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { memoryType: true, content: true },
      },
      interviewSessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          interviewScore: true,
          interviewSummary: true,
          interviewReport: true,
        },
      },
    },
  });

  if (!candidate) {
    throw new Error("Candidate not found for tenant");
  }

  const embedding = await embedText(buildCandidateEmbeddingText(candidate));
  const record = await prisma.recruitingCandidateEmbedding.create({
    data: {
      tenantId: input.tenantId,
      candidateId: candidate.id,
      searchId: candidate.searchId,
      embeddingJson: embedding as Prisma.InputJsonValue,
      embeddingModel: RECRUITING_EMBEDDING_MODEL,
      sourceType: input.sourceType ?? "candidate_profile",
    },
  });

  await createRecruitingCandidateAuditLog({
    tenantId: input.tenantId,
    searchId: candidate.searchId,
    candidateId: candidate.id,
    action: "embeddings.generated",
    newValue: record.id,
    metadata: {
      model: RECRUITING_EMBEDDING_MODEL,
      sourceType: record.sourceType,
      dimensions: embedding.length,
    },
  });

  return record;
}

export async function searchSimilarCandidates(input: TalentSearchInput) {
  const query = input.query.trim();
  if (!query) {
    throw new Error("Query is required");
  }

  const limit = Math.max(1, Math.min(input.limit ?? 10, 50));
  const queryEmbedding = await embedText(query);
  const embeddings = await prisma.recruitingCandidateEmbedding.findMany({
    where: { tenantId: input.tenantId, embeddingModel: RECRUITING_EMBEDDING_MODEL },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      candidate: {
        include: {
          interviewSessions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              interviewScore: true,
              interviewReport: true,
            },
          },
        },
      },
      search: { select: { id: true, refCode: true, title: true } },
    },
  });

  const seen = new Set<string>();
  return embeddings
    .map((embedding) => ({
      embedding,
      similarity: computeCandidateSimilarity(
        queryEmbedding,
        asNumberArray(embedding.embeddingJson),
      ),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .filter(({ embedding }) => {
      if (seen.has(embedding.candidateId)) {
        return false;
      }
      seen.add(embedding.candidateId);
      return true;
    })
    .slice(0, limit)
    .map(({ embedding, similarity }) => {
      const latestInterview = embedding.candidate.interviewSessions[0];
      const signals = aggregateCandidateSignals({
        cvScore: embedding.candidate.cvScore,
        interviewScore: latestInterview?.interviewScore,
        behavioralSignals: latestInterview?.interviewReport,
      });

      return {
        candidateId: embedding.candidateId,
        candidateCode: embedding.candidate.candidateCode,
        fullName: embedding.candidate.fullName,
        email: embedding.candidate.email,
        searchId: embedding.searchId,
        searchRef: embedding.search.refCode,
        searchTitle: embedding.search.title,
        similarity: Math.round(similarity * 1000) / 1000,
        hiringSignals: signals.finalSignal,
        interviewScore: latestInterview?.interviewScore ?? null,
        cvScore: embedding.candidate.cvScore,
        pipelineStage: embedding.candidate.pipelineStage,
      };
    });
}

export function readJsonNumber(source: unknown, key: string) {
  if (!isRecord(source)) return null;
  const value = source[key];
  return typeof value === "number" ? value : null;
}
