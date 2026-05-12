import { logger, task } from "@trigger.dev/sdk";
import { prisma } from "@/app/lib/prisma";
import { logOperationalEvent } from "@/lib/recruiting/operationalEvents";

export async function expireRecruitingOffers(input: { tenantId: string }) {
  const expired = await prisma.recruitingOffer.findMany({
    where: {
      tenantId: input.tenantId,
      status: { in: ["draft", "sent", "viewed"] },
      expiresAt: { lt: new Date() },
    },
    select: { id: true, searchId: true, candidateId: true },
  });
  for (const offer of expired) {
    await prisma.recruitingOffer.update({ where: { id: offer.id }, data: { status: "expired" } });
    await logOperationalEvent({
      tenantId: input.tenantId,
      searchId: offer.searchId,
      candidateId: offer.candidateId,
      type: "offer.expired",
      severity: "warning",
      message: "Offer expired automatically.",
      metadata: { offerId: offer.id },
    });
  }
  return { expired: expired.length };
}

export const recruitingOfferExpirationTask = task({
  id: "recruiting-offer-expiration",
  retry: { maxAttempts: 3 },
  run: async (payload: { tenantId: string }) => {
    const result = await expireRecruitingOffers(payload);
    logger.info("Recruiting offers expired", result);
    return result;
  },
});
