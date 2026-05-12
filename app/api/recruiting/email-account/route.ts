import { NextResponse } from "next/server";
import { getRecruitingRequestContext } from "@/lib/recruiting/authContext";
import { getRecruitingEmailAccount } from "@/lib/recruiting/emailAccounts";
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
    const account = await getRecruitingEmailAccount({ tenantId, userId });

    return NextResponse.json({
      success: true,
      account: account
        ? {
            id: account.id,
            provider: account.provider,
            email: account.email,
            monitoringEnabled: account.monitoringEnabled,
            lastHistoryId: account.lastHistoryId,
            lastSyncedAt: account.lastSyncedAt,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "unknown_error" },
      { status: 500 },
    );
  }
}
