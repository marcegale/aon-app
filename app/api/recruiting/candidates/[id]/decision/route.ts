import { NextResponse } from "next/server";
import { enqueueRecruitingAutomation } from "@/lib/recruiting/automation";
import { decideRecruitingCandidate } from "@/lib/recruiting/decision";
import { assertCandidateTenant } from "@/lib/recruiting/guards";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";
import { isRecruitingDecision } from "@/lib/recruiting/types";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: RouteContext<"/api/recruiting/candidates/[id]/decision">,
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      tenantId?: string;
      decision?: unknown;
      reason?: string;
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

    if (!isRecruitingDecision(body.decision)) {
      return NextResponse.json(
        { success: false, error: "Invalid recruiting decision" },
        { status: 400 },
      );
    }
    await requireRecruitingRole({ tenantId, userId: body.userId ?? body.actorUserId, permission: "manage_candidates" });
    await assertCandidateTenant({ tenantId, candidateId: id });

    const candidate = await decideRecruitingCandidate({
      tenantId,
      candidateId: id,
      decision: body.decision,
      reason: body.reason,
      actorUserId: body.actorUserId,
    });
    await enqueueRecruitingAutomation({
      tenantId,
      searchId: candidate.searchId,
      candidateId: candidate.id,
      triggerType: body.decision === "qualified" ? "candidate.shortlisted" : "candidate.rejected",
    });

    return NextResponse.json({ success: true, candidate });
  } catch (error) {
    console.error("POST /api/recruiting/candidates/[id]/decision error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes("not found") ? 404 : 500 },
    );
  }
}
