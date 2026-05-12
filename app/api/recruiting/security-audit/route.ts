import { requireRecruitingAdmin } from "@/lib/recruiting/rbac";
import { runRecruitingSecurityAudit } from "@/lib/recruiting/securityAudit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingAdmin({ tenantId, userId });
    return Response.json({ success: true, audit: await runRecruitingSecurityAudit(tenantId) });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
