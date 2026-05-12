import { prisma } from "@/app/lib/prisma";
import { upsertNotificationTemplate } from "@/lib/recruiting/notificationTemplates";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tenantId = url.searchParams.get("tenantId")?.trim() ?? "";
  const userId = url.searchParams.get("userId")?.trim() || null;
  if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
  await requireRecruitingRole({ tenantId, userId, permission: "manage_searches" });
  const templates = await prisma.recruitingNotificationTemplate.findMany({ where: { tenantId }, orderBy: { type: "asc" } });
  return Response.json({ success: true, templates });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId || typeof body.type !== "string" || typeof body.subject !== "string" || typeof body.body !== "string") {
      return Response.json({ success: false, error: "tenantId, type, subject and body are required" }, { status: 400 });
    }
    await requireRecruitingRole({ tenantId, userId, permission: "manage_searches" });
    const template = await upsertNotificationTemplate({
      tenantId,
      type: body.type,
      subject: body.subject,
      body: body.body,
      enabled: body.enabled !== false,
    });
    return Response.json({ success: true, template });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
