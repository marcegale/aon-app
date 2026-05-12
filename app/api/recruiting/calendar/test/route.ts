import { validateCalendarConnection } from "@/lib/recruiting/calendar";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_interviews" });
    return Response.json({ success: true, calendar: await validateCalendarConnection({ tenantId, userId }) });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
