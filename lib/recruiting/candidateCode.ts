import type { PrismaClient } from "@/generated/prisma/client";

type RecruitingPrisma = Pick<PrismaClient, "recruitingCandidate">;

export async function nextCandidateCode(prisma: RecruitingPrisma, searchId: string) {
  const count = await prisma.recruitingCandidate.count({
    where: { searchId },
  });

  return `CAND-${String(count + 1).padStart(3, "0")}`;
}
