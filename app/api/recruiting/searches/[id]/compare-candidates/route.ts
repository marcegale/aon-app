import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { compareCandidates } from "@/lib/recruiting/copilot";
import { assertSearchTenant } from "@/lib/recruiting/guards";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: RouteContext<"/api/recruiting/searches/[id]/compare-candidates">,
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      tenantId?: string;
      candidateIds?: string[];
      userId?: string;
    };
    const tenantId = body.tenantId?.trim();

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.candidateIds) || body.candidateIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "candidateIds is required" },
        { status: 400 },
      );
    }
    await requireRecruitingRole({ tenantId, userId: body.userId, permission: "manage_candidates" });
    await assertSearchTenant({ tenantId, searchId: id });

    const search = await prisma.recruitingSearch.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        title: true,
        requestText: true,
        jobProfileOutput: true,
        idealCandidateOutput: true,
        scoringCriteriaOutput: true,
      },
    });

    if (!search) {
      return NextResponse.json(
        { success: false, error: "Recruiting search not found for tenant" },
        { status: 404 },
      );
    }

    const candidates = await prisma.recruitingCandidate.findMany({
      where: {
        id: { in: body.candidateIds },
        searchId: search.id,
      },
      include: {
        interviewSessions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (candidates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No candidates found for search" },
        { status: 404 },
      );
    }

    const comparison = await compareCandidates({
      searchContext: {
        title: search.title,
        requestText: search.requestText,
        jobProfile: search.jobProfileOutput,
        idealCandidate: search.idealCandidateOutput,
        scoringCriteria: search.scoringCriteriaOutput,
      },
      candidates: candidates.map((candidate) => ({
        id: candidate.id,
        candidateCode: candidate.candidateCode,
        fullName: candidate.fullName,
        email: candidate.email,
        cvScore: candidate.cvScore,
        cvSummary: candidate.cvSummary,
        cvReport: candidate.cvReport,
        interviewScore: candidate.interviewSessions[0]?.interviewScore,
        interviewSummary: candidate.interviewSessions[0]?.interviewSummary,
        pipelineStage: candidate.pipelineStage,
      })),
    });

    return NextResponse.json({ success: true, comparison });
  } catch (error) {
    console.error("POST /api/recruiting/searches/[id]/compare-candidates error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
