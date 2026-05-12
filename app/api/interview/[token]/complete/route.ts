import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { enqueueRecruitingAutomation } from "@/lib/recruiting/automation";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import {
  evaluateInterviewAnswers,
  generateInterviewSummary,
} from "@/lib/recruiting/interview";
import { Prisma } from "@/generated/prisma/client";
import { assertRateLimit, getRateLimitKey } from "@/lib/recruiting/rateLimit";
import { enqueueRecruitingEmbedding } from "@/trigger/recruitingEmbeddingTask";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: RouteContext<"/api/interview/[token]/complete">,
) {
  try {
    const { token } = await context.params;
    assertRateLimit({ key: getRateLimitKey({ request: req, token, action: "interview.complete" }), limit: 10 });
    const session = await prisma.recruitingInterviewSession.findUnique({
      where: { publicToken: token },
      include: {
        search: true,
        candidate: true,
        questions: {
          orderBy: { order: "asc" },
          include: {
            answers: true,
          },
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

    if (["completed", "cancelled", "expired"].includes(session.status)) {
      return NextResponse.json(
        { success: false, error: "Interview session is closed" },
        { status: 409 },
      );
    }

    const answers = session.questions.map((question) => ({
      question: question.question,
      category: question.category,
      answerText: question.answers[0]?.answerText ?? null,
    }));

    const evaluation = await evaluateInterviewAnswers({
      jobProfileOutput: session.search.jobProfileOutput,
      idealCandidateOutput: session.search.idealCandidateOutput,
      scoringCriteriaOutput: session.search.scoringCriteriaOutput,
      candidateCvSummary: session.candidate.cvSummary,
      answers,
    });
    const summary = await generateInterviewSummary({ evaluation });

    for (const question of session.questions) {
      const answer = question.answers[0];
      if (!answer) {
        continue;
      }

      const answerScore = evaluation.answerScores.find(
        (item) => item.question === question.question,
      );

      if (answerScore) {
        await prisma.recruitingInterviewAnswer.update({
          where: { id: answer.id },
          data: {
            score: answerScore.score,
            feedback: answerScore.feedback,
          },
        });
      }
    }

    const updated = await prisma.recruitingInterviewSession.update({
      where: { id: session.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        interviewScore: evaluation.interviewScore,
        interviewSummary: summary,
        interviewReport: evaluation.interviewReport as Prisma.InputJsonValue,
      },
    });

    await createRecruitingCandidateAuditLog({
      tenantId: session.tenantId,
      searchId: session.searchId,
      candidateId: session.candidateId,
      action: "interview.completed",
      previousValue: session.status,
      newValue: "completed",
      metadata: {
        interviewSessionId: session.id,
        interviewScore: evaluation.interviewScore,
      },
    });
    await enqueueRecruitingAutomation({
      tenantId: session.tenantId,
      searchId: session.searchId,
      candidateId: session.candidateId,
      triggerType: "interview.completed",
    });
    await enqueueRecruitingEmbedding({
      tenantId: session.tenantId,
      candidateId: session.candidateId,
      sourceType: "interview.completed",
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      status: updated.status,
      interviewScore: updated.interviewScore,
      interviewSummary: updated.interviewSummary,
    });
  } catch (error) {
    console.error("POST /api/interview/[token]/complete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
