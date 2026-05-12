import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { InterviewForm } from "./InterviewForm";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-PY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function PublicInterviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await prisma.recruitingInterviewSession.findUnique({
    where: { publicToken: token },
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      search: {
        select: {
          title: true,
        },
      },
      questions: {
        orderBy: { order: "asc" },
        include: {
          answers: true,
        },
      },
    },
  });

  if (!session) {
    notFound();
  }

  const now = new Date();
  const isExpired = session.expiresAt <= now;
  if (isExpired && session.status !== "expired") {
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
      metadata: { publicToken: session.publicToken },
    });
  }

  const closed = isExpired || ["completed", "cancelled", "expired"].includes(session.status);

  return (
    <main className="min-h-screen bg-[#071513] px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-[#C96F3B]">
            Entrevista IA
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            {session.search.title}
          </h1>
          <p className="text-sm leading-6 text-white/60">
            {session.candidate.fullName ?? session.candidate.email ?? "Candidato"}
          </p>
          <p className="text-sm leading-6 text-white/45">
            Disponible hasta {formatDate(session.expiresAt)}
          </p>
        </header>

        {closed ? (
          <section className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6">
            <h2 className="text-xl font-semibold">Entrevista cerrada</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Estado actual: {isExpired ? "expired" : session.status}.
            </p>
            {session.interviewSummary ? (
              <p className="mt-4 text-sm leading-6 text-white/70">
                {session.interviewSummary}
              </p>
            ) : null}
          </section>
        ) : (
          <InterviewForm
            token={token}
            questions={session.questions.map((question) => ({
              id: question.id,
              order: question.order,
              category: question.category,
              question: question.question,
              answerText: question.answers[0]?.answerText ?? "",
            }))}
          />
        )}
      </div>
    </main>
  );
}
