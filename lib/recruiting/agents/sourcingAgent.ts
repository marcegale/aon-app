import { prisma } from "@/app/lib/prisma";
import { searchSimilarCandidates } from "@/lib/recruiting/embeddings";
import { assertTenant, RecruitingAgent, RecruitingAgentInput } from "./types";

export async function generateIdealProfiles(input: RecruitingAgentInput) {
  const search = input.searchId
    ? await prisma.recruitingSearch.findFirst({
        where: { id: input.searchId, tenantId: input.tenantId },
        select: { title: true, jobProfileOutput: true, idealCandidateOutput: true },
      })
    : null;

  return [
    {
      profile: search?.title ?? "Target role",
      priority: "high",
      evidence: search?.idealCandidateOutput ?? search?.jobProfileOutput ?? "Use current search profile.",
    },
  ];
}

export async function searchInternalTalentPool(input: RecruitingAgentInput) {
  if (!input.searchId) return [];
  const search = await prisma.recruitingSearch.findFirst({
    where: { id: input.searchId, tenantId: input.tenantId },
    select: { title: true, idealCandidateOutput: true, jobProfileOutput: true },
  });
  if (!search) return [];

  const query = [
    search.title,
    JSON.stringify(search.idealCandidateOutput ?? {}),
    JSON.stringify(search.jobProfileOutput ?? {}),
  ].join("\n");

  try {
    return await searchSimilarCandidates({ tenantId: input.tenantId, query, limit: 5 });
  } catch {
    return [];
  }
}

export async function generateOutreachRecommendations(input: RecruitingAgentInput) {
  const profiles = await generateIdealProfiles(input);
  return profiles.map((profile) => ({
    channel: "internal_pool",
    message: "Priorizar candidatos internos similares antes de sourcing externo.",
    profile,
  }));
}

export const sourcingAgent: RecruitingAgent = {
  agentType: "sourcing",
  validateInput(input) {
    assertTenant(input);
    if (!input.searchId) throw new Error("searchId is required for sourcing agent");
  },
  async execute(input) {
    const [profiles, similarCandidates, outreach] = await Promise.all([
      generateIdealProfiles(input),
      searchInternalTalentPool(input),
      generateOutreachRecommendations(input),
    ]);
    return {
      summary: `Sourcing analyzed ${similarCandidates.length} internal matches.`,
      recommendations: [
        { type: "ideal_profiles", profiles },
        { type: "similar_candidates", candidates: similarCandidates },
        { type: "outreach", outreach },
      ],
      metrics: { similarCandidateCount: similarCandidates.length },
    };
  },
  generateSummary(result) {
    return result.summary;
  },
  generateOperationalLog(input, result) {
    return { agentType: "sourcing", searchId: input.searchId, metrics: result.metrics };
  },
};
