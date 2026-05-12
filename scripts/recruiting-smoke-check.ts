import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { getRecruitingEnvironmentStatus } from "../lib/recruiting/envCheck.ts";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const modelChecks = [
  ["RecruitingSearch", () => prisma.recruitingSearch.count()],
  ["RecruitingCandidate", () => prisma.recruitingCandidate.count()],
  ["RecruitingInterviewSession", () => prisma.recruitingInterviewSession.count()],
  ["RecruitingOffer", () => prisma.recruitingOffer.count()],
  ["RecruitingAutomationRule", () => prisma.recruitingAutomationRule.count()],
  ["RecruitingNotificationDelivery", () => prisma.recruitingNotificationDelivery.count()],
] as const;

async function main() {
  const env = getRecruitingEnvironmentStatus();
  console.log("Recruiting readiness:", env.ready ? "ready" : "blocked");
  console.log("Core missing:", env.coreMissing.length ? env.coreMissing.join(", ") : "none");
  console.log("Optional missing:", env.optionalMissing.length);

  if (!env.ready) {
    console.error("Recruiting smoke check failed because core environment is incomplete.");
    process.exit(1);
  }

  await prisma.$connect();
  for (const [name, count] of modelChecks) {
    const value = await count();
    console.log(`${name}: ${value}`);
  }
  await prisma.$disconnect();

}

main().catch(async (error) => {
  console.error("Recruiting smoke check failed:", error instanceof Error ? error.message : error);
  await prisma.$disconnect().catch(() => null);
  process.exit(1);
});
