import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";
import { enqueueRecruitingEmbedding } from "@/trigger/recruitingEmbeddingTask";

const memoryTypes = new Set([
  "recruiter_note",
  "ai_observation",
  "interview_signal",
  "hiring_risk",
  "compensation_signal",
]);

async function getOwnedCandidate(candidateId: string, tenantId: string) {
  return prisma.recruitingCandidate.findFirst({
    where: { id: candidateId, search: { tenantId } },
    select: { id: true, searchId: true },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenantId")?.trim() ?? "";

    if (!tenantId) {
      return Response.json(
        { success: false, error: "tenantId is required" },
        { status: 400 },
      );
    }

    const candidate = await getOwnedCandidate(id, tenantId);
    if (!candidate) {
      return Response.json(
        { success: false, error: "Candidate not found for tenant" },
        { status: 404 },
      );
    }

    const notes = await prisma.recruitingCandidateMemory.findMany({
      where: { tenantId, candidateId: candidate.id },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ success: true, notes });
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const memoryType =
      typeof body.memoryType === "string" && memoryTypes.has(body.memoryType)
        ? body.memoryType
        : "recruiter_note";

    if (!tenantId || !content) {
      return Response.json(
        { success: false, error: "tenantId and content are required" },
        { status: 400 },
      );
    }
    await requireRecruitingRole({ tenantId, userId, permission: "manage_candidates" });

    const candidate = await getOwnedCandidate(id, tenantId);
    if (!candidate) {
      return Response.json(
        { success: false, error: "Candidate not found for tenant" },
        { status: 404 },
      );
    }

    const note = await prisma.recruitingCandidateMemory.create({
      data: {
        tenantId,
        candidateId: candidate.id,
        searchId: candidate.searchId,
        memoryType,
        content,
        metadata: (body.metadata ?? null) as Prisma.InputJsonValue,
      },
    });

    await createRecruitingCandidateAuditLog({
      tenantId,
      searchId: candidate.searchId,
      candidateId: candidate.id,
      action: "memory.created",
      newValue: note.id,
      metadata: { memoryType },
    });

    try {
      await enqueueRecruitingEmbedding({
        tenantId,
        candidateId: candidate.id,
        sourceType: "memory.created",
      });
    } catch (error) {
      console.error("recruiting.memory.embedding_failed", {
        candidateId: candidate.id,
        error: error instanceof Error ? error.message : "unknown_error",
      });
    }

    return Response.json({ success: true, note });
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
