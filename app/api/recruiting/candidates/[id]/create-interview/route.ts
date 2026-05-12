import { NextResponse } from "next/server";
import { assertCandidateTenant } from "@/lib/recruiting/guards";
import { createInterviewSessionForCandidate } from "@/lib/recruiting/interview";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: RouteContext<"/api/recruiting/candidates/[id]/create-interview">,
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      tenantId?: string;
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
    await requireRecruitingRole({ tenantId, userId: body.userId ?? body.actorUserId, permission: "manage_interviews" });
    await assertCandidateTenant({ tenantId, candidateId: id });

    const result = await createInterviewSessionForCandidate({
      tenantId,
      candidateId: id,
      actorUserId: body.actorUserId,
      source: "manual",
    });

    return NextResponse.json({
      success: true,
      session: {
        id: result.session.id,
        status: result.session.status,
        expiresAt: result.session.expiresAt,
        questionCount: result.questionCount,
      },
      created: result.created,
      interviewLink: result.interviewLink,
    });
  } catch (error) {
    console.error("POST /api/recruiting/candidates/[id]/create-interview error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
