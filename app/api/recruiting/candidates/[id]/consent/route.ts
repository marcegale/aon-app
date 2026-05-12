import { prisma } from "@/app/lib/prisma";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { assertCandidateTenant } from "@/lib/recruiting/guards";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    const consentStatus = typeof body.consentStatus === "string" ? body.consentStatus.trim() : "captured";
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_candidates" });
    const candidate = await assertCandidateTenant({ tenantId, candidateId: id });
    const updated = await prisma.recruitingCandidate.update({
      where: { id: candidate.id },
      data: { consentStatus, consentCapturedAt: new Date() },
    });
    await createRecruitingCandidateAuditLog({
      tenantId,
      searchId: candidate.searchId,
      candidateId: candidate.id,
      action: "privacy.consent_updated",
      newValue: consentStatus,
    });
    return Response.json({ success: true, candidate: updated });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
