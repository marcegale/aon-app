import { prisma } from "@/app/lib/prisma";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
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

    if (!tenantId) {
      return Response.json(
        { success: false, error: "tenantId is required" },
        { status: 400 },
      );
    }

    await requireRecruitingRole({ tenantId, userId, permission: "manage_offers" });

    const offer = await prisma.recruitingOffer.findFirst({
      where: { id, tenantId },
    });

    if (!offer) {
      return Response.json(
        { success: false, error: "Offer not found for tenant" },
        { status: 404 },
      );
    }

    const updated = await prisma.recruitingOffer.update({
      where: { id: offer.id },
      data: { status: "sent" },
      include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    await createRecruitingCandidateAuditLog({
      tenantId,
      searchId: offer.searchId,
      candidateId: offer.candidateId,
      action: "offer.sent",
      previousValue: offer.status,
      newValue: "sent",
      metadata: { offerId: offer.id },
    });

    return Response.json({ success: true, offer: updated });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "unknown_error",
      },
      { status: 500 },
    );
  }
}
