import { NextResponse } from "next/server";
import { getRecruitingRequestContext } from "@/lib/recruiting/authContext";
import { ingestRecruitingEmailsForConnectedUser } from "@/lib/recruiting/emailIngestion";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { tenantId, userId } = await getRecruitingRequestContext(request, body);

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, error: "tenantId and userId are required" },
        { status: 400 },
      );
    }

    await requireRecruitingRole({ tenantId, userId, permission: "manage_candidates" });
    const result = await ingestRecruitingEmailsForConnectedUser({ tenantId, userId });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "unknown_error" },
      { status: 500 },
    );
  }
}
