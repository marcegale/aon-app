import { prisma } from "@/app/lib/prisma";

export async function getRetentionPolicy(tenantId: string) {
  return prisma.recruitingDataRetentionPolicy.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function markExpiredArtifacts(input: { tenantId: string }) {
  const policy = await getRetentionPolicy(input.tenantId);
  if (!policy || !policy.enabled) {
    return { enabled: false, markedCandidates: 0 };
  }

  const cutoff = new Date();
  const result = await prisma.recruitingCandidate.updateMany({
    where: {
      search: { tenantId: input.tenantId },
      dataRetentionUntil: { lt: cutoff },
      anonymizedAt: null,
    },
    data: {
      consentStatus: "retention_expired",
    },
  });

  return { enabled: true, markedCandidates: result.count };
}

export async function applyRetentionPolicy(input: { tenantId: string; candidateId: string }) {
  const policy = await getRetentionPolicy(input.tenantId);
  if (!policy || !policy.enabled) {
    return null;
  }

  return prisma.recruitingCandidate.update({
    where: { id: input.candidateId },
    data: { dataRetentionUntil: addDays(policy.cvRetentionDays) },
  });
}
