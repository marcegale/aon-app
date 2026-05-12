import { prisma } from "@/app/lib/prisma";
import { logOperationalEvent } from "@/lib/recruiting/operationalEvents";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";
import { processRecruitingCandidateJobTask } from "@/trigger/recruitingCandidateProcessing";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_candidates" });
    const job = await prisma.recruitingCandidateProcessingJob.findFirst({ where: { id, tenantId } });
    if (!job) return Response.json({ success: false, error: "Job not found for tenant" }, { status: 404 });
    await prisma.recruitingCandidateProcessingJob.update({
      where: { id: job.id },
      data: { processingStatus: "retrying", errorMessage: null },
    });
    const handle = await processRecruitingCandidateJobTask.trigger({ jobId: job.id });
    await logOperationalEvent({
      tenantId,
      searchId: job.searchId,
      candidateId: job.candidateId,
      jobId: job.id,
      type: "job.retry",
      message: "Recruiting processing job retry enqueued.",
      metadata: { handle },
    });
    return Response.json({ success: true, handle });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
