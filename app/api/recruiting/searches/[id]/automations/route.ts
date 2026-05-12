import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ensureDefaultAutomationRules } from "@/lib/recruiting/automation";
import { validateAutomationRuleJson } from "@/lib/recruiting/automationValidation";
import { assertSearchTenant } from "@/lib/recruiting/guards";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenantId")?.trim() ?? "";
    const userId = url.searchParams.get("userId")?.trim() || null;
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_automation" });
    const search = await assertSearchTenant({ tenantId, searchId: id });
    await ensureDefaultAutomationRules(tenantId, search.id);
    const [rules, executions] = await Promise.all([
      prisma.recruitingAutomationRule.findMany({
        where: { tenantId, OR: [{ searchId: search.id }, { searchId: null }] },
        orderBy: { createdAt: "asc" },
      }),
      prisma.recruitingAutomationExecution.findMany({
        where: { tenantId, searchId: search.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);
    return Response.json({ success: true, rules, executions });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_automation" });
    const search = await assertSearchTenant({ tenantId, searchId: id });
    const validated = validateAutomationRuleJson({
      triggerType: body.triggerType,
      conditions: body.conditions,
      actions: body.actions,
    });
    const rule = await prisma.recruitingAutomationRule.create({
      data: {
        tenantId,
        searchId: search.id,
        name: typeof body.name === "string" ? body.name : "Custom automation",
        enabled: body.enabled !== false,
        triggerType: validated.triggerType,
        conditions: validated.conditions as Prisma.InputJsonValue,
        actions: validated.actions as Prisma.InputJsonValue,
      },
    });
    return Response.json({ success: true, rule });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
