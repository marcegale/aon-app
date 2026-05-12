import { prisma } from "@/app/lib/prisma";
import {
  createRecruitingCandidateAuditLog,
  moveRecruitingCandidateStage,
} from "@/lib/recruiting/decision";
import { enqueueRecruitingAutomation } from "@/lib/recruiting/automation";
import {
  recruitingOfferStatuses,
  type RecruitingOfferStatus,
} from "@/lib/recruiting/offers";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

function isOfferStatus(value: string): value is RecruitingOfferStatus {
  return recruitingOfferStatuses.includes(value as RecruitingOfferStatus);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;

    if (!tenantId || !isOfferStatus(status)) {
      return Response.json(
        { success: false, error: "tenantId and valid status are required" },
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
      data: { status },
      include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    const action =
      status === "accepted"
        ? "offer.accepted"
        : status === "rejected"
          ? "offer.rejected"
          : `offer.${status}`;
    await createRecruitingCandidateAuditLog({
      tenantId,
      searchId: offer.searchId,
      candidateId: offer.candidateId,
      action,
      previousValue: offer.status,
      newValue: status,
      metadata: { offerId: offer.id },
    });

    if (status === "accepted") {
      await moveRecruitingCandidateStage({
        tenantId,
        candidateId: offer.candidateId,
        stage: "hired",
        metadata: { source: "offer.accepted", offerId: offer.id },
      });
      await enqueueRecruitingAutomation({
        tenantId,
        searchId: offer.searchId,
        candidateId: offer.candidateId,
        triggerType: "offer.accepted",
      });
    }

    if (status === "rejected") {
      await enqueueRecruitingAutomation({
        tenantId,
        searchId: offer.searchId,
        candidateId: offer.candidateId,
        triggerType: "offer.rejected",
      });
    }

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
