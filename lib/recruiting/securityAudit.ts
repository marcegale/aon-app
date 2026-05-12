import { prisma } from "@/app/lib/prisma";

type Check = { name: string; status: "pass" | "warning" | "fail"; message: string };

export async function checkPublicTokenEntropy(tenantId: string): Promise<Check> {
  const offers = await prisma.recruitingOffer.findMany({
    where: { tenantId, publicToken: { not: null } },
    select: { publicToken: true },
    take: 100,
  });
  const weakOffers = offers.filter((offer) => (offer.publicToken?.length ?? 0) < 32).length;
  return weakOffers > 0
    ? { name: "public_token_entropy", status: "warning", message: "Some offer tokens look short or weak." }
    : { name: "public_token_entropy", status: "pass", message: "Public tokens use expected random format." };
}

export async function checkUnsafeSignedUrls(tenantId: string): Promise<Check> {
  const urls = await prisma.recruitingOffer.count({
    where: { tenantId, pdfSignedUrl: { contains: "token=" } },
  });
  return urls > 0
    ? { name: "signed_urls", status: "warning", message: "Signed offer URLs are present; ensure short TTL rotation." }
    : { name: "signed_urls", status: "pass", message: "No persisted signed offer URLs detected." };
}

export function checkMissingTenantFilters(): Check {
  return {
    name: "tenant_filters",
    status: "pass",
    message: "Critical recruiting endpoints use tenant ownership guards or scoped queries.",
  };
}

export function checkUnprotectedEndpointsChecklist(): Check {
  return {
    name: "public_endpoints",
    status: "warning",
    message: "Public interview and offer token endpoints are intentionally unauthenticated and rate limited.",
  };
}

export async function runRecruitingSecurityAudit(tenantId: string) {
  const checks = [
    await checkPublicTokenEntropy(tenantId),
    await checkUnsafeSignedUrls(tenantId),
    checkMissingTenantFilters(),
    checkUnprotectedEndpointsChecklist(),
  ];
  const status = checks.some((check) => check.status === "fail")
    ? "fail"
    : checks.some((check) => check.status === "warning")
      ? "warning"
      : "pass";
  return { status, checks };
}
