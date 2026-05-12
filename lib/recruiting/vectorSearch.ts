import { prisma } from "@/app/lib/prisma";
import { openai } from "@/lib/openai";
import { RECRUITING_EMBEDDING_MODEL, searchSimilarCandidates } from "@/lib/recruiting/embeddings";

export async function isPgVectorAvailable() {
  try {
    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') AS exists
    `;
    return Boolean(result[0]?.exists);
  } catch {
    return false;
  }
}

export async function ensureVectorSearchReady() {
  const [vectorAvailable, columnResult] = await Promise.all([
    isPgVectorAvailable(),
    prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'recruiting_candidate_embeddings'
          AND column_name = 'embedding'
      ) AS exists
    `.catch(() => [{ exists: false }]),
  ]);
  return { vectorAvailable, vectorColumnAvailable: Boolean(columnResult[0]?.exists), ready: vectorAvailable && Boolean(columnResult[0]?.exists) };
}

async function embedQuery(query: string) {
  const response = await openai.embeddings.create({
    model: RECRUITING_EMBEDDING_MODEL,
    input: query.slice(0, 24000),
  });
  return response.data[0]?.embedding ?? [];
}

function vectorLiteral(values: number[]) {
  return `[${values.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

export async function searchCandidatesWithPgVector(input: {
  tenantId: string;
  query: string;
  limit?: number;
}) {
  const ready = await ensureVectorSearchReady();
  if (!ready.ready) {
    return searchCandidatesWithJsonFallback(input);
  }

  try {
    const embedding = await embedQuery(input.query);
    const limit = Math.max(1, Math.min(input.limit ?? 10, 50));
    const rows = await prisma.$queryRawUnsafe<
      Array<{
        candidateId: string;
        candidateCode: string | null;
        fullName: string | null;
        email: string | null;
        searchId: string;
        searchRef: string;
        searchTitle: string;
        similarity: number;
        cvScore: number | null;
        pipelineStage: string;
      }>
    >(
      `
      SELECT DISTINCT ON (e."candidateId")
        e."candidateId",
        c."candidateCode",
        c."fullName",
        c."email",
        e."searchId",
        s."refCode" AS "searchRef",
        s."title" AS "searchTitle",
        (1 - (e."embedding" <=> $1::vector))::float AS "similarity",
        c."cvScore",
        c."pipelineStage"
      FROM "public"."recruiting_candidate_embeddings" e
      JOIN "public"."recruiting_candidates" c ON c."id" = e."candidateId"
      JOIN "public"."recruiting_searches" s ON s."id" = e."searchId"
      WHERE e."tenantId" = $2 AND e."embedding" IS NOT NULL
      ORDER BY e."candidateId", e."embedding" <=> $1::vector
      LIMIT $3
      `,
      vectorLiteral(embedding),
      input.tenantId,
      limit,
    );
    return rows.map((row) => ({ ...row, hiringSignals: null, interviewScore: null }));
  } catch {
    return searchCandidatesWithJsonFallback(input);
  }
}

export async function searchCandidatesWithJsonFallback(input: {
  tenantId: string;
  query: string;
  limit?: number;
}) {
  return searchSimilarCandidates(input);
}

export async function backfillVectorColumnFromJson(input: { tenantId: string; limit?: number }) {
  const ready = await ensureVectorSearchReady();
  if (!ready.ready) return { updated: 0, ready };
  const rows = await prisma.recruitingCandidateEmbedding.findMany({
    where: { tenantId: input.tenantId },
    select: { id: true, embeddingJson: true },
    take: Math.min(input.limit ?? 100, 500),
  });
  let updated = 0;
  for (const row of rows) {
    if (!Array.isArray(row.embeddingJson)) continue;
    await prisma.$executeRawUnsafe(
      `UPDATE "public"."recruiting_candidate_embeddings" SET "embedding" = $1::vector WHERE "id" = $2 AND "tenantId" = $3`,
      vectorLiteral(row.embeddingJson.map(Number)),
      row.id,
      input.tenantId,
    );
    updated += 1;
  }
  return { updated, ready };
}
