import { getRecruitingSettings, upsertRecruitingSettings } from "@/lib/recruiting/settings";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";
import { getRecruitingRequestContext } from "@/lib/recruiting/authContext";

export async function GET(request: Request) {
  const { tenantId, userId } = await getRecruitingRequestContext(request);
  if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
  await requireRecruitingRole({ tenantId, userId, permission: "manage_searches" });
  return Response.json({ success: true, settings: await getRecruitingSettings(tenantId) });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, userId } = await getRecruitingRequestContext(request, body);
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_searches" });
    const settings = await upsertRecruitingSettings({ tenantId, data: body });
    return Response.json({ success: true, settings });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
