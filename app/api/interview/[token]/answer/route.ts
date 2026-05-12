import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { assertRateLimit, getRateLimitKey } from "@/lib/recruiting/rateLimit";

export const runtime = "nodejs";

function isClosed(status: string) {
  return ["completed", "expired", "cancelled"].includes(status);
}

export async function POST(
  req: Request,
  context: RouteContext<"/api/interview/[token]/answer">,
) {
  try {
    const { token } = await context.params;
    assertRateLimit({ key: getRateLimitKey({ request: req, token, action: "interview.answer" }), limit: 60 });
    const body = (await req.json()) as {
      questionId?: string;
      answerText?: string;
    };

    if (!body.questionId) {
      return NextResponse.json(
        { success: false, error: "questionId is required" },
        { status: 400 },
      );
    }

    const session = await prisma.recruitingInterviewSession.findUnique({
      where: { publicToken: token },
      include: {
        questions: {
          select: { id: true },
        },
      },
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

    if (!session.questions.some((question) => question.id === body.questionId)) {
      return NextResponse.json(
        { success: false, error: "Question does not belong to session" },
        { status: 400 },
      );
    }

    if (session.status === "pending") {
      await prisma.recruitingInterviewSession.update({
        where: { id: session.id },
        data: {
          status: "in_progress",
          startedAt: new Date(),
        },
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

    await prisma.recruitingInterviewAnswer.upsert({
      where: {
        sessionId_questionId: {
          sessionId: session.id,
          questionId: body.questionId,
        },
      },
      create: {
        sessionId: session.id,
        questionId: body.questionId,
        answerText: body.answerText ?? "",
        transcript: body.answerText ?? "",
      },
      update: {
        answerText: body.answerText ?? "",
        transcript: body.answerText ?? "",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/interview/[token]/answer error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
