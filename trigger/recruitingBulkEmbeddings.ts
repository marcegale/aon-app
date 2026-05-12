import { logger, task } from "@trigger.dev/sdk";
import { prisma } from "@/app/lib/prisma";
import { generateCandidateEmbedding } from "@/lib/recruiting/embeddings";
import { logOperationalEvent } from "@/lib/recruiting/operationalEvents";

export const recruitingBulkEmbeddingsTask = task({
  id: "recruiting-bulk-embeddings",
  retry: { maxAttempts: 3, minTimeoutInMs: 5_000, maxTimeoutInMs: 60_000, factor: 2 },
  run: async (payload: { tenantId: string; searchId: string; limit?: number }) => {
    const candidates = await prisma.recruitingCandidate.findMany({
      where: {
        searchId: payload.searchId,
        search: { tenantId: payload.tenantId },
        embeddings: { none: {} },
      },
      select: { id: true },
      take: Math.min(payload.limit ?? 50, 100),
    });

    let generated = 0;
    for (const candidate of candidates) {
      await generateCandidateEmbedding({
        tenantId: payload.tenantId,
        candidateId: candidate.id,
        sourceType: "bulk_backfill",
      });
      generated += 1;
    }

    await logOperationalEvent({
      tenantId: payload.tenantId,
      searchId: payload.searchId,
      type: "embeddings.backfill.completed",
      message: "Bulk embeddings backfill completed.",
      metadata: { generated },
    });
    logger.info("Bulk embeddings generated", { generated, searchId: payload.searchId });
    return { generated };
  },
});
