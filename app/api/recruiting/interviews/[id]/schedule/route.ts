import { prisma } from "@/app/lib/prisma";
import { createInterviewCalendarEvent } from "@/lib/recruiting/calendar";
import { enqueueRecruitingAutomation } from "@/lib/recruiting/automation";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { sendInterviewInvite } from "@/lib/recruiting/notifications";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";
import { getRecruitingSettings } from "@/lib/recruiting/settings";
import { enqueueInterviewReminders } from "@/trigger/recruitingInterviewReminder";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    const settings = tenantId ? await getRecruitingSettings(tenantId) : null;
    const timezone =
      typeof body.timezone === "string" && body.timezone.trim()
        ? body.timezone.trim()
        : settings?.defaultTimezone ?? "UTC";
    const interviewerEmail =
      typeof body.interviewerEmail === "string" ? body.interviewerEmail.trim() : null;
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;

    if (!tenantId || !scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      return Response.json(
        { success: false, error: "tenantId and valid scheduledAt are required" },
        { status: 400 },
      );
    }

    await requireRecruitingRole({ tenantId, userId, permission: "manage_interviews" });

    const session = await prisma.recruitingInterviewSession.findFirst({
      where: { id, tenantId },
      include: {
        candidate: true,
        search: { select: { title: true } },
      },
    });

    if (!session) {
      return Response.json(
        { success: false, error: "Interview session not found for tenant" },
        { status: 404 },
      );
    }

    const event = await createInterviewCalendarEvent({
      tenantId,
      userId,
      candidateName: session.candidate.fullName,
      candidateEmail: session.candidate.email,
      interviewerEmail,
      scheduledAt,
      timezone,
      title: `Entrevista - ${session.search.title}`,
      description: `Recruiting Agent interview session ${session.id}`,
    });

    const updated = await prisma.recruitingInterviewSession.update({
      where: { id: session.id },
      data: {
        scheduledAt,
        timezone,
        interviewerEmail,
        calendarEventId: event.eventId,
        meetingUrl: event.meetingUrl,
        status: session.status === "pending" ? "in_progress" : session.status,
      },
    });

    await createRecruitingCandidateAuditLog({
      tenantId,
      searchId: session.searchId,
      candidateId: session.candidateId,
      action: "interview.scheduled",
      newValue: scheduledAt.toISOString(),
      metadata: {
        sessionId: session.id,
        calendarEventId: event.eventId,
        meetingUrl: event.meetingUrl,
        timezone,
      },
    });

    await sendInterviewInvite({
      tenantId,
      searchId: session.searchId,
      candidateId: session.candidateId,
      interviewSessionId: session.id,
      toEmail: session.candidate.email,
      candidateName: session.candidate.fullName,
      scheduledAt,
      timezone,
      meetingUrl: event.meetingUrl,
    });
    await enqueueInterviewReminders({ sessionId: session.id, scheduledAt });
    await enqueueRecruitingAutomation({
      tenantId,
      searchId: session.searchId,
      candidateId: session.candidateId,
      triggerType: "interview.scheduled",
    });

    console.info("interview.scheduled", { sessionId: session.id, scheduledAt });
    return Response.json({ success: true, session: updated });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "unknown_error" },
      { status: 500 },
    );
  }
}
