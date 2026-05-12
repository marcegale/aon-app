import { prisma } from "@/app/lib/prisma";
import { sendRecruitingEmail } from "@/lib/recruiting/emailDelivery";
import { logOperationalEvent } from "@/lib/recruiting/operationalEvents";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_candidates" });
    const delivery = await prisma.recruitingNotificationDelivery.findFirst({ where: { id, tenantId } });
    if (!delivery) return Response.json({ success: false, error: "Notification not found for tenant" }, { status: 404 });
    const result = await sendRecruitingEmail({
      tenantId,
      searchId: delivery.searchId,
      candidateId: delivery.candidateId,
      offerId: delivery.offerId,
      interviewSessionId: delivery.interviewSessionId,
      toEmail: delivery.toEmail,
      subject: delivery.subject,
      text: `Retry notification: ${delivery.subject}`,
      type: delivery.type,
      metadata: { retryOf: delivery.id },
    });
    await logOperationalEvent({
      tenantId,
      searchId: delivery.searchId,
      candidateId: delivery.candidateId,
      type: "notification.retry",
      message: "Notification retry attempted.",
      metadata: { retryOf: delivery.id, result },
    });
    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
