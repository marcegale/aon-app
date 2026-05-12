import { validateSearchReadyForAutomation } from "@/lib/recruiting/qualityGates";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_automation" });
    await validateSearchReadyForAutomation({ tenantId, searchId: id });
    return Response.json({ success: true, ready: true });
  } catch (error) {
    return Response.json({ success: false, ready: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
