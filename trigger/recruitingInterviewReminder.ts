import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/app/lib/prisma";
import {
  renderRecruitingEmailTemplate,
  sendRecruitingEmail,
} from "@/lib/recruiting/emailDelivery";

export const recruitingInterviewReminderTask = task({
  id: "recruiting-interview-reminder",
  retry: { maxAttempts: 3 },
  run: async (payload: { sessionId: string; reminderType: "24h" | "1h" }) => {
    const session = await prisma.recruitingInterviewSession.findUnique({
      where: { id: payload.sessionId },
      include: { candidate: true },
    });

    if (!session || !session.scheduledAt || session.status === "cancelled") {
      return { sent: false, reason: "session_not_schedulable" };
    }

    const template = renderRecruitingEmailTemplate({
      type: "reminder",
      candidateName: session.candidate.fullName,
      body: `Recordatorio de entrevista (${payload.reminderType}).`,
      scheduledAt: session.scheduledAt,
      timezone: session.timezone,
      meetingUrl: session.meetingUrl,
    });

    const result = await sendRecruitingEmail({
      tenantId: session.tenantId,
      searchId: session.searchId,
      candidateId: session.candidateId,
      interviewSessionId: session.id,
      toEmail: session.candidate.email,
      subject: template.title,
      html: template.html,
      text: template.text,
      type: "interview_reminder",
      metadata: { reminderType: payload.reminderType },
    });

    return { sent: result.sent, deliveryId: result.deliveryId };
  },
});

export async function enqueueInterviewReminders(input: {
  sessionId: string;
  scheduledAt: Date;
}) {
  const now = Date.now();
  const twentyFourHours = input.scheduledAt.getTime() - 24 * 60 * 60 * 1000;
  const oneHour = input.scheduledAt.getTime() - 60 * 60 * 1000;
  const handles = [];

  if (twentyFourHours > now) {
    handles.push(
      await recruitingInterviewReminderTask.trigger(
        { sessionId: input.sessionId, reminderType: "24h" },
        { delay: new Date(twentyFourHours) },
      ),
    );
  }

  if (oneHour > now) {
    handles.push(
      await recruitingInterviewReminderTask.trigger(
        { sessionId: input.sessionId, reminderType: "1h" },
        { delay: new Date(oneHour) },
      ),
    );
  }

  return handles;
}
