import { prisma } from "@/app/lib/prisma";

export async function assertSearchTenant(input: { tenantId: string; searchId: string }) {
  const search = await prisma.recruitingSearch.findFirst({
    where: { id: input.searchId, tenantId: input.tenantId },
    select: { id: true, tenantId: true, refCode: true },
  });
  if (!search) throw new Error("Recruiting search not found for tenant");
  return search;
}

export async function assertCandidateTenant(input: { tenantId: string; candidateId: string }) {
  const candidate = await prisma.recruitingCandidate.findFirst({
    where: { id: input.candidateId, search: { tenantId: input.tenantId } },
    select: { id: true, searchId: true, email: true, fullName: true },
  });
  if (!candidate) throw new Error("Candidate not found for tenant");
  return candidate;
}

export async function assertInterviewTenant(input: { tenantId: string; interviewId: string }) {
  const interview = await prisma.recruitingInterviewSession.findFirst({
    where: { id: input.interviewId, tenantId: input.tenantId },
    select: { id: true, tenantId: true, searchId: true, candidateId: true },
  });
  if (!interview) throw new Error("Interview not found for tenant");
  return interview;
}

export async function assertOfferTenant(input: { tenantId: string; offerId: string }) {
  const offer = await prisma.recruitingOffer.findFirst({
    where: { id: input.offerId, tenantId: input.tenantId },
    select: { id: true, tenantId: true, searchId: true, candidateId: true, status: true },
  });
  if (!offer) throw new Error("Offer not found for tenant");
  return offer;
}

export async function assertAutomationRuleTenant(input: { tenantId: string; ruleId: string }) {
  const rule = await prisma.recruitingAutomationRule.findFirst({
    where: { id: input.ruleId, tenantId: input.tenantId },
    select: { id: true, tenantId: true, searchId: true, triggerType: true, actions: true, conditions: true },
  });
  if (!rule) throw new Error("Automation rule not found for tenant");
  return rule;
}
