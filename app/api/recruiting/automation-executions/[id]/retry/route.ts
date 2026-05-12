import { prisma } from "@/app/lib/prisma";
import { executeAutomationActions } from "@/lib/recruiting/automation";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

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
    const execution = await prisma.recruitingAutomationExecution.findFirst({
      where: { id, tenantId },
      include: { rule: true },
    });
    if (!execution?.rule) return Response.json({ success: false, error: "Execution or rule not found" }, { status: 404 });
    const result = await executeAutomationActions({
      ruleId: execution.rule.id,
      tenantId,
      searchId: execution.searchId,
      candidateId: execution.candidateId,
      actions: execution.rule.actions,
    });
    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
