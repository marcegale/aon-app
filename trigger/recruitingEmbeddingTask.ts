import { logger, task } from "@trigger.dev/sdk";
import { generateCandidateEmbedding } from "@/lib/recruiting/embeddings";
import { logOperationalEvent } from "@/lib/recruiting/operationalEvents";

export const recruitingEmbeddingTask = task({
  id: "recruiting-embedding-generate",
  retry: { maxAttempts: 3, minTimeoutInMs: 2_000, maxTimeoutInMs: 30_000, factor: 2 },
  run: async (payload: { tenantId: string; candidateId: string; sourceType: string }) => {
    try {
      const embedding = await generateCandidateEmbedding(payload);
      logger.info("Recruiting embedding generated", { candidateId: payload.candidateId });
      return { embeddingId: embedding.id };
    } catch (error) {
      await logOperationalEvent({
        tenantId: payload.tenantId,
        candidateId: payload.candidateId,
        type: "embedding.failed",
        severity: "warning",
        message: "Embedding generation failed.",
        metadata: { sourceType: payload.sourceType, error: error instanceof Error ? error.message : "unknown" },
      });
      throw error;
    }
  },
});

export async function enqueueRecruitingEmbedding(input: {
  tenantId: string;
  candidateId: string;
  sourceType: string;
}) {
  return recruitingEmbeddingTask.trigger(input, {
    idempotencyKey: `embedding:${input.sourceType}:${input.candidateId}:${Date.now()}`,
  });
}
