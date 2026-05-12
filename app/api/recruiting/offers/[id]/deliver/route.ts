import { prisma } from "@/app/lib/prisma";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import {
  renderRecruitingEmailTemplate,
  sendOfferEmail,
} from "@/lib/recruiting/emailDelivery";
import { generateOfferPdf } from "@/lib/recruiting/offerPdf";
import { createOfferPublicToken } from "@/lib/recruiting/offers";
import { validateOfferReadyForDelivery } from "@/lib/recruiting/qualityGates";
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
      return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    }

    await requireRecruitingRole({ tenantId, userId, permission: "manage_offers" });
    await validateOfferReadyForDelivery({ tenantId, offerId: id });

    const offer = await prisma.recruitingOffer.findFirst({
      where: { id, tenantId },
      include: {
        candidate: true,
        search: true,
        versions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!offer) {
      return Response.json({ success: false, error: "Offer not found for tenant" }, { status: 404 });
    }

    const version = offer.versions[0];
    if (!version) {
      return Response.json({ success: false, error: "Offer has no version" }, { status: 400 });
    }

    const publicToken = offer.publicToken ?? createOfferPublicToken();
    if (!offer.publicToken) {
      await prisma.recruitingOffer.update({
        where: { id: offer.id },
        data: { publicToken },
      });
    }

    const pdf = await generateOfferPdf({
      tenantId,
      searchId: offer.searchId,
      candidateId: offer.candidateId,
      offerId: offer.id,
      generatedContent: version.generatedContent,
      aiSummary: version.aiSummary,
    });
    const publicUrl = new URL(`/offers/${publicToken}`, request.url).toString();
    const template = renderRecruitingEmailTemplate({
      type: "offer",
      candidateName: offer.candidate.fullName,
      body: "Te compartimos la propuesta formal. El PDF firmado temporalmente esta disponible en el link de oferta.",
      actionUrl: publicUrl,
    });

    const delivery = await sendOfferEmail({
      tenantId,
      searchId: offer.searchId,
      candidateId: offer.candidateId,
      offerId: offer.id,
      toEmail: offer.candidate.email,
      subject: template.title,
      html: `${template.html}<p><a href="${pdf.signedUrl}">Descargar PDF de oferta</a></p>`,
      text: `${template.text}\n\nPDF: ${pdf.signedUrl}`,
      metadata: { pdfStoragePath: pdf.storagePath },
    });

    const updated = await prisma.recruitingOffer.update({
      where: { id: offer.id },
      data: {
        status: "sent",
        pdfStoragePath: pdf.storagePath,
        pdfGeneratedAt: new Date(),
        deliveredAt: new Date(),
      },
    });

    await createRecruitingCandidateAuditLog({
      tenantId,
      searchId: offer.searchId,
      candidateId: offer.candidateId,
      action: "offer.delivered",
      previousValue: offer.status,
      newValue: "sent",
      metadata: { offerId: offer.id, delivery, pdfStoragePath: pdf.storagePath },
    });

    console.info("offer.delivered", { offerId: offer.id, delivery });
    const { pdfSignedUrl: _pdfSignedUrl, ...safeOffer } = updated;
    return Response.json({
      success: true,
      offer: safeOffer,
      delivery,
      pdf: { storagePath: pdf.storagePath },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "unknown_error" },
      { status: 500 },
    );
  }
}
