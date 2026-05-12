import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import {
  ALLOWED_INTERVIEW_AUDIO_TYPES,
  uploadInterviewAudio,
} from "@/lib/recruiting/interviewAudio";
import { assertRateLimit, getRateLimitKey } from "@/lib/recruiting/rateLimit";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

function isClosed(status: string) {
  return ["completed", "expired", "cancelled"].includes(status);
}

export async function POST(
  req: Request,
  context: RouteContext<"/api/interview/[token]/upload-audio">,
) {
  try {
    const { token } = await context.params;
    assertRateLimit({ key: getRateLimitKey({ request: req, token, action: "interview.upload-audio" }), limit: 20 });
    const formData = await req.formData();
    const questionId = String(formData.get("questionId") || "");
    const durationSecondsValue = formData.get("durationSeconds");
    const file = formData.get("audio") as File | null;

    if (!questionId || !file) {
      return NextResponse.json(
        { success: false, error: "questionId and audio are required" },
        { status: 400 },
      );
    }

    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { success: false, error: "Audio file too large" },
        { status: 413 },
      );
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_INTERVIEW_AUDIO_TYPES.has(mimeType)) {
      return NextResponse.json(
        { success: false, error: "Unsupported audio type" },
        { status: 400 },
      );
    }

    const session = await prisma.recruitingInterviewSession.findUnique({
      where: { publicToken: token },
      include: { questions: { select: { id: true } } },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Interview session not found" },
        { status: 404 },
      );
    }

    if (session.expiresAt <= new Date()) {
      await prisma.recruitingInterviewSession.update({
        where: { id: session.id },
        data: { status: "expired" },
      });
      await createRecruitingCandidateAuditLog({
        tenantId: session.tenantId,
        searchId: session.searchId,
        candidateId: session.candidateId,
        action: "interview.expired",
        previousValue: session.status,
        newValue: "expired",
      });
      return NextResponse.json(
        { success: false, error: "Interview session expired" },
        { status: 410 },
      );
    }

    if (isClosed(session.status)) {
      return NextResponse.json(
        { success: false, error: "Interview session is closed" },
        { status: 409 },
      );
    }

    if (!session.questions.some((question) => question.id === questionId)) {
      return NextResponse.json(
        { success: false, error: "Question does not belong to session" },
        { status: 400 },
      );
    }

    if (session.status === "pending") {
      await prisma.recruitingInterviewSession.update({
        where: { id: session.id },
        data: { status: "in_progress", startedAt: new Date() },
      });
      await createRecruitingCandidateAuditLog({
        tenantId: session.tenantId,
        searchId: session.searchId,
        candidateId: session.candidateId,
        action: "interview.started",
        previousValue: "pending",
        newValue: "in_progress",
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadInterviewAudio({
      tenantId: session.tenantId,
      searchId: session.searchId,
      sessionId: session.id,
      questionId,
      mimeType,
      buffer,
    });

    const answer = await prisma.recruitingInterviewAnswer.upsert({
      where: {
        sessionId_questionId: {
          sessionId: session.id,
          questionId,
        },
      },
      create: {
        sessionId: session.id,
        questionId,
        answerType: "audio",
        audioUrl: uploaded.storagePath,
        durationSeconds:
          typeof durationSecondsValue === "string" ? Number(durationSecondsValue) || null : null,
        transcriptionStatus: "uploaded",
      },
      update: {
        answerType: "audio",
        audioUrl: uploaded.storagePath,
        durationSeconds:
          typeof durationSecondsValue === "string" ? Number(durationSecondsValue) || null : null,
        transcriptionStatus: "uploaded",
      },
    });

    const { recruitingInterviewTranscriptionTask } = await import(
      "@/trigger/recruitingInterviewTranscription"
    );
    await recruitingInterviewTranscriptionTask.trigger(
      { answerId: answer.id, storagePath: uploaded.storagePath },
      { idempotencyKey: `interview-transcription:${answer.id}:${Date.now()}` },
    );

    await createRecruitingCandidateAuditLog({
      tenantId: session.tenantId,
      searchId: session.searchId,
      candidateId: session.candidateId,
      action: "interview.audio_uploaded",
      previousValue: null,
      newValue: answer.id,
      metadata: {
        questionId,
        storagePath: uploaded.storagePath,
        size: file.size,
        mimeType,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/interview/[token]/upload-audio error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
