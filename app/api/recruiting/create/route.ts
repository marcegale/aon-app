import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getRecruitingRequestContext } from "@/lib/recruiting/authContext";
import { generateRecruitingOutputs } from "@/lib/openai";
import { assertRateLimit, getRateLimitKey } from "@/lib/recruiting/rateLimit";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

function generateRef() {
  return `REF-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { tenantId, userId } = await getRecruitingRequestContext(req, body);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const requestText = typeof body.requestText === "string" ? body.requestText.trim() : "";

    if (!tenantId || !title || !requestText) {
      return NextResponse.json(
        { success: false, error: "tenantId, title and requestText are required" },
        { status: 400 },
      );
    }

    assertRateLimit({
      key: getRateLimitKey({ request: req, tenantId, action: "recruiting.create-search" }),
      limit: 10,
    });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_searches" });

    const refCode = generateRef();

    const search = await prisma.recruitingSearch.create({
      data: {
        tenantId,
        createdById: userId ?? "system",
        refCode,
        title,
        requestText,
        status: "generating",
      },
    });

    const aiRaw = await generateRecruitingOutputs({
      title,
      requestText,
    });

    let parsed;
    try {
      parsed = JSON.parse(aiRaw);
    } catch {
      parsed = { raw: aiRaw };
    }

    await prisma.recruitingSearch.update({
      where: { id: search.id },
      data: {
        jobProfileOutput: parsed.jobProfile || null,
        idealCandidateOutput: parsed.idealCandidate || null,
        scoringCriteriaOutput: parsed.scoringCriteria || null,
        publicationCopiesOutput: parsed.copies || null,
        aiGenerationLog: parsed,
        status: "publishing",
      },
    });

    const { createRecruitingAgentTask } = await import("@/lib/recruiting/agents/orchestrator");
    const { recruitingSourcingAgentTask } = await import("@/trigger/recruitingSourcingAgent");
    const { recruitingAnalyticsAgentTask } = await import("@/trigger/recruitingAnalyticsAgent");
    const sourcingTask = await createRecruitingAgentTask({
      tenantId,
      agentType: "sourcing",
      taskType: "search.created",
      payload: { searchId: search.id },
    });
    const analyticsTask = await createRecruitingAgentTask({
      tenantId,
      agentType: "analytics",
      taskType: "search.created",
      payload: { searchId: search.id },
      priority: 7,
    });
    await recruitingSourcingAgentTask
      .trigger({ tenantId, searchId: search.id, taskId: sourcingTask.id })
      .catch(() => null);
    await recruitingAnalyticsAgentTask
      .trigger({ tenantId, searchId: search.id, taskId: analyticsTask.id })
      .catch(() => null);

    return NextResponse.json({ success: true, id: search.id, refCode });
  } catch (error) {
    console.error("POST /api/recruiting/create error:", {
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
