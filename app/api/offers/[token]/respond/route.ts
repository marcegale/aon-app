import { prisma } from "@/app/lib/prisma";
import { enqueueRecruitingAutomation } from "@/lib/recruiting/automation";
import {
  createRecruitingCandidateAuditLog,
  moveRecruitingCandidateStage,
} from "@/lib/recruiting/decision";
import { checkRateLimit, getRateLimitKey } from "@/lib/recruiting/rateLimit";
import { markOfferDeclined, markOfferSigned } from "@/lib/recruiting/signatures";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const rate = checkRateLimit({ key: getRateLimitKey({ request, token, action: "offer.respond" }), limit: 10 });
    if (!rate.allowed) {
      return Response.json({ success: false, error: "rate_limited" }, { status: 429 });
    }

    const body = await request.json();
    const response = typeof body.response === "string" ? body.response.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;
    const signatureText = typeof body.signatureText === "string" ? body.signatureText.trim() : null;

    if (!["accepted", "rejected"].includes(response)) {
      return Response.json({ success: false, error: "Invalid response" }, { status: 400 });
    }

    const offer = await prisma.recruitingOffer.findUnique({
      where: { publicToken: token },
    });

    if (!offer) {
      return Response.json({ success: false, error: "Offer not found" }, { status: 404 });
    }

    if (offer.status === "accepted" || offer.status === "rejected") {
      return Response.json({ success: true, status: offer.status, alreadyResponded: true });
    }

    if (offer.expiresAt && offer.expiresAt < new Date()) {
      await prisma.recruitingOffer.update({ where: { id: offer.id }, data: { status: "expired" } });
      await createRecruitingCandidateAuditLog({
        tenantId: offer.tenantId,
        searchId: offer.searchId,
        candidateId: offer.candidateId,
        action: "offer.expired",
        previousValue: offer.status,
        newValue: "expired",
        metadata: { offerId: offer.id },
      });
      return Response.json({ success: false, error: "Offer expired" }, { status: 410 });
    }

    const updated = await prisma.recruitingOffer.update({
      where: { id: offer.id },
      data: {
        status: response,
        respondedAt: new Date(),
        candidateNotes: notes,
      },
    });

    await createRecruitingCandidateAuditLog({
      tenantId: offer.tenantId,
      searchId: offer.searchId,
      candidateId: offer.candidateId,
      action: `offer.${response}`,
      previousValue: offer.status,
      newValue: response,
      metadata: { offerId: offer.id, notes },
    });

    if (response === "accepted") {
      const candidate = await prisma.recruitingCandidate.findUnique({
        where: { id: offer.candidateId },
        select: { email: true, fullName: true },
      });
      await markOfferSigned({
        tenantId: offer.tenantId,
        offerId: offer.id,
        candidateId: offer.candidateId,
        signerEmail: candidate?.email ?? "unknown",
        signerName: candidate?.fullName,
        signatureText,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgent: request.headers.get("user-agent"),
        metadata: { notes },
      });
      await moveRecruitingCandidateStage({
        tenantId: offer.tenantId,
        candidateId: offer.candidateId,
        stage: "hired",
        metadata: { source: "offer.responded", offerId: offer.id },
      });
    } else {
      const candidate = await prisma.recruitingCandidate.findUnique({
        where: { id: offer.candidateId },
        select: { email: true, fullName: true },
      });
      await markOfferDeclined({
        tenantId: offer.tenantId,
        offerId: offer.id,
        candidateId: offer.candidateId,
        signerEmail: candidate?.email ?? "unknown",
        signerName: candidate?.fullName,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
        userAgent: request.headers.get("user-agent"),
        metadata: { notes },
      });
    }

    await enqueueRecruitingAutomation({
      tenantId: offer.tenantId,
      searchId: offer.searchId,
      candidateId: offer.candidateId,
      triggerType: response === "accepted" ? "offer.accepted" : "offer.rejected",
    });

    console.info("offer.responded", { offerId: offer.id, response });
    return Response.json({ success: true, status: updated.status });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "unknown_error" },
      { status: 500 },
    );
  }
}
