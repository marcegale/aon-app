import { prisma } from "@/app/lib/prisma";
import { logOperationalEvent } from "@/lib/recruiting/operationalEvents";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";
import { recruitingInterviewTranscriptionTask } from "@/trigger/recruitingInterviewTranscription";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_interviews" });
    const answer = await prisma.recruitingInterviewAnswer.findFirst({
      where: { id, session: { tenantId } },
      include: { session: true },
    });
    if (!answer?.audioUrl) return Response.json({ success: false, error: "Audio answer not found" }, { status: 404 });
    await prisma.recruitingInterviewAnswer.update({
      where: { id: answer.id },
      data: { transcriptionStatus: "uploaded" },
    });
    const handle = await recruitingInterviewTranscriptionTask.trigger({
      answerId: answer.id,
      storagePath: answer.audioUrl,
    });
    await logOperationalEvent({
      tenantId,
      searchId: answer.session.searchId,
      candidateId: answer.session.candidateId,
      type: "transcription.retry",
      message: "Interview transcription retry enqueued.",
      metadata: { answerId: answer.id, handle },
    });
    return Response.json({ success: true, handle });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
