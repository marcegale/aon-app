import { prisma } from "@/app/lib/prisma";

function fail(message: string): never {
  throw new Error(message);
}

export async function validateCandidateReadyForInterview(input: { tenantId: string; candidateId: string }) {
  const candidate = await prisma.recruitingCandidate.findFirst({
    where: { id: input.candidateId, search: { tenantId: input.tenantId } },
    select: { email: true },
  });
  if (!candidate) fail("Candidate not found for tenant");
  if (!candidate.email) fail("Interview requires candidate email");
  return true;
}

export async function validateCandidateReadyForOffer(input: { tenantId: string; candidateId: string }) {
  const candidate = await prisma.recruitingCandidate.findFirst({
    where: { id: input.candidateId, search: { tenantId: input.tenantId } },
    include: { interviewSessions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!candidate) fail("Candidate not found for tenant");
  if (!candidate.email) fail("Offer requires candidate email");
  if (candidate.cvScore === null && candidate.interviewSessions[0]?.interviewScore === null) {
    fail("Offer requires CV score or interview score");
  }
  return true;
}

export async function validateOfferReadyForDelivery(input: { tenantId: string; offerId: string }) {
  const offer = await prisma.recruitingOffer.findFirst({
    where: { id: input.offerId, tenantId: input.tenantId },
    include: { candidate: true, versions: { take: 1 } },
  });
  if (!offer) fail("Offer not found for tenant");
  if (!offer.candidate.email) fail("Offer delivery requires candidate email");
  if (offer.versions.length === 0) fail("Offer delivery requires an offer version");
  return true;
}

export async function validateSearchReadyForAutomation(input: { tenantId: string; searchId: string }) {
  const search = await prisma.recruitingSearch.findFirst({
    where: { id: input.searchId, tenantId: input.tenantId },
    select: { status: true },
  });
  if (!search) fail("Search not found for tenant");
  if (search.status === "archived" || search.status === "cancelled") fail("Search is not active for automation");
  return true;
}
