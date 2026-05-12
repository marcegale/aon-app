import { NextResponse } from "next/server";
import { getRecruitingRequestContext } from "@/lib/recruiting/authContext";
import { buildGoogleAuthUrl } from "@/lib/recruiting/google/oauth";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { tenantId, userId } = await getRecruitingRequestContext(request);

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, error: "tenantId and userId are required" },
        { status: 400 },
      );
    }

    await requireRecruitingRole({ tenantId, userId, permission: "manage_candidates" });

    return NextResponse.redirect(buildGoogleAuthUrl({ tenantId, userId }));
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "unknown_error" },
      { status: 500 },
    );
  }
}
