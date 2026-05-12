import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { validateAutomationRuleJson } from "@/lib/recruiting/automationValidation";
import { assertAutomationRuleTenant } from "@/lib/recruiting/guards";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export async function PATCH(
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
    const existing = await assertAutomationRuleTenant({ tenantId, ruleId: id });
    const data: Prisma.RecruitingAutomationRuleUpdateInput = {};
    if (typeof body.name === "string") data.name = body.name;
    if (typeof body.enabled === "boolean") data.enabled = body.enabled;
    if (body.triggerType || body.conditions || body.actions) {
      const validated = validateAutomationRuleJson({
        triggerType: body.triggerType ?? existing.triggerType,
        conditions: body.conditions ?? existing.conditions,
        actions: body.actions ?? existing.actions,
      });
      data.triggerType = validated.triggerType;
      data.conditions = validated.conditions as Prisma.InputJsonValue;
      data.actions = validated.actions as Prisma.InputJsonValue;
    }
    const rule = await prisma.recruitingAutomationRule.update({ where: { id: existing.id }, data });
    return Response.json({ success: true, rule });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
