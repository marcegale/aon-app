import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { assertCandidateTenant } from "@/lib/recruiting/guards";
import { requireRecruitingAdmin } from "@/lib/recruiting/rbac";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingAdmin({ tenantId, userId });
    const candidate = await assertCandidateTenant({ tenantId, candidateId: id });
    const anon = `anon-${candidate.id.slice(0, 8)}`;
    const updated = await prisma.recruitingCandidate.update({
      where: { id: candidate.id },
      data: {
        fullName: `Anon ${candidate.id.slice(0, 8)}`,
        email: `${anon}@anonymous.local`,
        cvFileUrl: null,
        cvFileName: null,
        sourceSubject: null,
        cvSummary: "Anonymized candidate record.",
        cvReport: Prisma.JsonNull,
        consentStatus: "anonymized",
        anonymizedAt: new Date(),
      },
    });
    await createRecruitingCandidateAuditLog({
      tenantId,
      searchId: candidate.searchId,
      candidateId: candidate.id,
      action: "privacy.anonymized",
      newValue: "anonymized",
    });
    return Response.json({ success: true, candidate: updated });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
