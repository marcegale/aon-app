import { executeAutomationActions } from "@/lib/recruiting/automation";
import { assertAutomationRuleTenant, assertCandidateTenant } from "@/lib/recruiting/guards";
import { assertRateLimit, getRateLimitKey } from "@/lib/recruiting/rateLimit";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const candidateId = typeof body.candidateId === "string" ? body.candidateId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId || !candidateId) return Response.json({ success: false, error: "tenantId and candidateId are required" }, { status: 400 });
    assertRateLimit({ key: getRateLimitKey({ request, tenantId, action: "automation.run" }), limit: 10 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_automation" });
    const [rule, candidate] = await Promise.all([
      assertAutomationRuleTenant({ tenantId, ruleId: id }),
      assertCandidateTenant({ tenantId, candidateId }),
    ]);
    const result = await executeAutomationActions({
      ruleId: rule.id,
      tenantId,
      searchId: candidate.searchId,
      candidateId: candidate.id,
      actions: rule.actions,
    });
    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
