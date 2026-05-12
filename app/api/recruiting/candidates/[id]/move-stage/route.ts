import { NextResponse } from "next/server";
import { moveRecruitingCandidateStage } from "@/lib/recruiting/decision";
import { assertCandidateTenant } from "@/lib/recruiting/guards";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";
import { isRecruitingPipelineStage } from "@/lib/recruiting/types";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: RouteContext<"/api/recruiting/candidates/[id]/move-stage">,
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      tenantId?: string;
      stage?: unknown;
      actorUserId?: string;
      userId?: string;
    };
    const tenantId = body.tenantId?.trim();

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId is required" },
        { status: 400 },
      );
    }

    if (!isRecruitingPipelineStage(body.stage)) {
      return NextResponse.json(
        { success: false, error: "Invalid pipeline stage" },
        { status: 400 },
      );
    }
    await requireRecruitingRole({ tenantId, userId: body.userId ?? body.actorUserId, permission: "manage_candidates" });
    await assertCandidateTenant({ tenantId, candidateId: id });

    const candidate = await moveRecruitingCandidateStage({
      tenantId,
      candidateId: id,
      stage: body.stage,
      actorUserId: body.actorUserId,
      metadata: { source: "recruiting_dashboard" },
    });

    return NextResponse.json({ success: true, candidate });
  } catch (error) {
    console.error("POST /api/recruiting/candidates/[id]/move-stage error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes("not found") ? 404 : 500 },
    );
  }
}
