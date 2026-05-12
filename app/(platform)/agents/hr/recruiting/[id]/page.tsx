import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import {
  computeInterviewSuccessRate,
  computeOfferAcceptanceRate,
  computePipelineConversionRates,
  computeTimeToHire,
  computeTopRecruiterMetrics,
} from "@/lib/recruiting/analytics";
import { getHeuristicHiringSignal } from "@/lib/recruiting/copilot";
import { computeCandidateSimilarity } from "@/lib/recruiting/embeddings";
import { getRecruitingEnvironmentStatus } from "@/lib/recruiting/envCheck";
import { aggregateCandidateSignals } from "@/lib/recruiting/hiringSignals";
import { getOperationalHealth } from "@/lib/recruiting/operationalEvents";
import { getRateLimitBackend } from "@/lib/recruiting/rateLimit";
import { getRecruitingSettings } from "@/lib/recruiting/settings";
import { runRecruitingSecurityAudit } from "@/lib/recruiting/securityAudit";
import { ensureVectorSearchReady } from "@/lib/recruiting/vectorSearch";
import {
  getFitClass,
  getFitLabel,
  getProcessingStatusClass,
  processingOrder,
  recruitingPipelineStages,
} from "@/lib/recruiting/types";
import { CandidatePipelineActions } from "./CandidatePipelineActions";
import { AutomationControlActions } from "./AutomationControlActions";
import { RecruitingInboxActions } from "./RecruitingInboxActions";

function JsonBlock({ data }: { data: unknown }) {
  if (!data) {
    return (
      <p className="text-sm leading-6 text-white/50">
        Sin informacion generada todavia.
      </p>
    );
  }

  if (typeof data === "string") {
    return <p className="text-sm leading-6 text-white/70">{data}</p>;
  }

  return (
    <pre className="max-h-96 overflow-auto rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/70">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function formatDate(value: Date | string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-PY", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: number | null | undefined, currency = "USD") {
  if (typeof value !== "number") {
    return "--";
  }

  return `${currency} ${value.toLocaleString("en-US")}`;
}

function readReportNumber(source: unknown, key: string) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return null;
  }

  const value = (source as Record<string, unknown>)[key];
  return typeof value === "number" ? value : null;
}

function readCompensation(source: unknown) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return null;
  }

  const value = (source as Record<string, unknown>).compensation;
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asNumberArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item))
    : [];
}

export default async function RecruitingSearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const search = await prisma.recruitingSearch.findUnique({
    where: { id },
    include: {
      companyProfile: true,
      attachments: true,
      candidates: {
        include: {
          interviewSessions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              answers: {
                include: { question: true },
                orderBy: { createdAt: "desc" },
              },
            },
          },
          memories: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
          offers: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              versions: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
          embeddings: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      processingJobs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      automationExecutions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      automationRules: {
        orderBy: { createdAt: "asc" },
        take: 20,
      },
      notificationDeliveries: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      operationalEvents: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!search) {
    notFound();
  }

  const candidates = [...search.candidates].sort((a, b) => {
    const statusDiff =
      (processingOrder[a.processingStatus] ?? 1) -
      (processingOrder[b.processingStatus] ?? 1);

    if (statusDiff !== 0) {
      return statusDiff;
    }

    if (a.processingStatus === "completed" && b.processingStatus === "completed") {
      return (b.cvScore ?? -1) - (a.cvScore ?? -1);
    }

    return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
  });

  const completedCount = search.candidates.filter(
    (candidate) => candidate.processingStatus === "completed",
  ).length;
  const activeCount = search.candidates.filter((candidate) =>
    ["queued", "processing", "retrying", "pending"].includes(candidate.processingStatus),
  ).length;
  const screeningCount = search.candidates.filter(
    (candidate) => candidate.pipelineStage === "screening",
  ).length;
  const shortlistedCount = search.candidates.filter(
    (candidate) => candidate.pipelineStage === "shortlisted",
  ).length;
  const interviewingCount = search.candidates.filter((candidate) =>
    ["interview", "technical", "offer"].includes(candidate.pipelineStage),
  ).length;
  const rejectedCount = search.candidates.filter(
    (candidate) => candidate.pipelineStage === "rejected",
  ).length;
  const hiredCount = search.candidates.filter(
    (candidate) => candidate.pipelineStage === "hired",
  ).length;
  const scoredCandidates = search.candidates.filter(
    (candidate) => typeof candidate.cvScore === "number",
  );
  const averageScore =
    scoredCandidates.length > 0
      ? Math.round(
          scoredCandidates.reduce((sum, candidate) => sum + (candidate.cvScore ?? 0), 0) /
            scoredCandidates.length,
        )
      : null;
  const interviews = search.candidates
    .map((candidate) => candidate.interviewSessions[0])
    .filter((session) => session && typeof session.interviewScore === "number");
  const averageInterviewScore =
    interviews.length > 0
      ? Math.round(
          interviews.reduce((sum, session) => sum + (session?.interviewScore ?? 0), 0) /
            interviews.length,
        )
      : null;
  const topCandidates = [...search.candidates]
    .sort((a, b) => {
      const bScore = Math.max(b.cvScore ?? 0, b.interviewSessions[0]?.interviewScore ?? 0);
      const aScore = Math.max(a.cvScore ?? 0, a.interviewSessions[0]?.interviewScore ?? 0);
      return bScore - aScore;
    })
    .slice(0, 5);
  const activeOffers = search.candidates
    .flatMap((candidate) => candidate.offers)
    .filter((offer) => !["rejected", "expired"].includes(offer.status));
  const highPotentialCandidates = search.candidates
    .filter((candidate) => {
      const interview = candidate.interviewSessions[0];
      return aggregateCandidateSignals({
        cvScore: candidate.cvScore,
        interviewScore: interview?.interviewScore,
        behavioralSignals: interview?.interviewReport,
      }).highPotential;
    })
    .slice(0, 5);
  const strongestCommunicationProfiles = [...search.candidates]
    .sort(
      (a, b) =>
        (readReportNumber(b.interviewSessions[0]?.interviewReport, "communicationScore") ?? 0) -
        (readReportNumber(a.interviewSessions[0]?.interviewReport, "communicationScore") ?? 0),
    )
    .filter(
      (candidate) =>
        readReportNumber(candidate.interviewSessions[0]?.interviewReport, "communicationScore") !==
        null,
    )
    .slice(0, 5);
  const strongestLeadershipProfiles = [...search.candidates]
    .sort(
      (a, b) =>
        (readReportNumber(b.interviewSessions[0]?.interviewReport, "leadershipScore") ?? 0) -
        (readReportNumber(a.interviewSessions[0]?.interviewReport, "leadershipScore") ?? 0),
    )
    .filter(
      (candidate) =>
        readReportNumber(candidate.interviewSessions[0]?.interviewReport, "leadershipScore") !==
        null,
    )
    .slice(0, 5);
  const similarCandidateMap = new Map<string, Array<{ label: string; similarity: number }>>();
  for (const candidate of search.candidates) {
    const sourceEmbedding = asNumberArray(candidate.embeddings[0]?.embeddingJson);
    if (sourceEmbedding.length === 0) {
      continue;
    }

    const similar = search.candidates
      .filter((other) => other.id !== candidate.id)
      .map((other) => ({
        label: other.fullName ?? other.email ?? other.candidateCode ?? "Sin identificar",
        similarity: computeCandidateSimilarity(
          sourceEmbedding,
          asNumberArray(other.embeddings[0]?.embeddingJson),
        ),
      }))
      .filter((item) => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 2);

    if (similar.length > 0) {
      similarCandidateMap.set(candidate.id, similar);
    }
  }
  const analyticsCandidates = search.candidates.map((candidate) => ({
    createdAt: candidate.receivedAt,
    pipelineStage: candidate.pipelineStage,
    pipelineUpdatedAt: candidate.pipelineUpdatedAt,
    interviewSessions: candidate.interviewSessions,
    offers: candidate.offers,
  }));
  const timeToHireDays = computeTimeToHire(analyticsCandidates);
  const offerAcceptanceRate = computeOfferAcceptanceRate(analyticsCandidates);
  const interviewSuccessRate = computeInterviewSuccessRate(analyticsCandidates);
  const conversionRates = computePipelineConversionRates(analyticsCandidates);
  const recruiterMetrics = computeTopRecruiterMetrics({
    automationExecutionCount: search.automationExecutions.length,
    notificationCount: search.notificationDeliveries.length,
    candidates: analyticsCandidates,
  });
  const health = await getOperationalHealth({ tenantId: search.tenantId, searchId: search.id });
  const [
    settings,
    vectorStatus,
    securityAudit,
    calendarConnections,
    templateCount,
    signatureCount,
    expiringOffers,
    environmentStatus,
    agentRuns,
    agentTasks,
    agentApprovals,
    agentMemories,
  ] =
    await Promise.all([
      getRecruitingSettings(search.tenantId),
      ensureVectorSearchReady(),
      runRecruitingSecurityAudit(search.tenantId),
      prisma.recruitingCalendarConnection.count({ where: { tenantId: search.tenantId, isActive: true } }),
      prisma.recruitingNotificationTemplate.count({ where: { tenantId: search.tenantId, enabled: true } }),
      prisma.recruitingOfferSignature.count({ where: { tenantId: search.tenantId } }),
      prisma.recruitingOffer.count({
        where: {
          tenantId: search.tenantId,
          status: { in: ["draft", "sent", "viewed"] },
          expiresAt: { lt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        },
      }),
      Promise.resolve(getRecruitingEnvironmentStatus()),
      prisma.recruitingAgentRun.findMany({
        where: { tenantId: search.tenantId, searchId: search.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { approvals: true },
      }),
      prisma.recruitingAgentTask.findMany({
        where: { tenantId: search.tenantId, payload: { path: ["searchId"], equals: search.id } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.recruitingAgentApproval.findMany({
        where: { tenantId: search.tenantId, agentRun: { searchId: search.id } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.recruitingAgentMemory.findMany({
        where: { tenantId: search.tenantId, entityType: "search", entityId: search.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);
  const optionalIntegrationCount =
    10 - environmentStatus.optionalMissing.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#C96F3B]">
            Recruiting Agent / {search.refCode}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            {search.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Panel operativo de monitoreo de CVs, ranking de candidatos, jobs de
            procesamiento y outputs generados por IA.
          </p>
        </div>

        <Link
          href="/agents/hr/recruiting"
          className="w-fit rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10"
        >
          Volver al agente
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">REF</p>
          <p className="mt-2 text-2xl font-semibold text-white">{search.refCode}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Estado</p>
          <p className="mt-2 text-2xl font-semibold text-white">{search.status}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            En proceso
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{activeCount}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Completados
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{completedCount}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["Total candidatos", search.candidates.length, "text-white"],
          ["Screening", screeningCount, "text-white"],
          ["Shortlisted", shortlistedCount, "text-emerald-300"],
          ["Interviewing", interviewingCount, "text-amber-200"],
          ["Rejected", rejectedCount, "text-red-300"],
          ["Hired", hiredCount, "text-[#F4EBD0]"],
        ].map(([label, value, className]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-4 backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
              {label}
            </p>
            <p className={`mt-2 text-2xl font-semibold ${className}`}>
              {value}
            </p>
          </div>
        ))}
        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-4 backdrop-blur-sm md:col-span-2 xl:col-span-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Promedio score
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {averageScore ?? "--"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-4 backdrop-blur-sm md:col-span-2 xl:col-span-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Promedio entrevista
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {averageInterviewScore ?? "--"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-4 backdrop-blur-sm md:col-span-2 xl:col-span-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Ofertas activas
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-200">
            {activeOffers.length}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["System readiness", environmentStatus.ready ? "ready" : "blocked"],
          ["Core env missing", environmentStatus.coreMissing.length],
          ["Optional integrations", `${optionalIntegrationCount}/10`],
          ["Settings", settings.id ? "configured" : "defaults"],
          ["Calendar", calendarConnections > 0 ? "connected" : "not connected"],
          ["Email provider", process.env.RESEND_API_KEY ? "resend" : "stub"],
          ["Redis", getRateLimitBackend()],
          ["Vector search", vectorStatus.ready ? "pgvector" : "json fallback"],
          ["Security audit", securityAudit.status],
          ["Offer signatures", signatureCount],
          ["Expiring offers", expiringOffers],
          ["Templates", `${templateCount}/7`],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5 backdrop-blur-sm">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#C96F3B]">
              AI Recruiting Agents
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Command Center
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            {[
              ["Runs", agentRuns.length],
              ["Tasks", agentTasks.length],
              ["Approvals", agentApprovals.filter((approval) => approval.status === "pending").length],
              ["Memories", agentMemories.length],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">{label}</p>
                <p className="mt-1 font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Workflows recientes</h3>
            {agentRuns.length === 0 ? (
              <p className="text-sm text-white/50">Sin ejecuciones multi-agent todavia.</p>
            ) : (
              agentRuns.map((run) => (
                <div key={run.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{run.agentType}</p>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">{run.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-white/50">
                    {run.completedAt ? run.completedAt.toLocaleString() : run.createdAt.toLocaleString()}
                  </p>
                  {run.errorMessage ? <p className="mt-2 text-xs text-red-300">{run.errorMessage}</p> : null}
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Tasks y retries</h3>
            {agentTasks.length === 0 ? (
              <p className="text-sm text-white/50">No hay tasks de agentes en cola.</p>
            ) : (
              agentTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{task.agentType}</p>
                    <span className="text-xs text-white/55">attempts {task.attempts}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/60">{task.taskType}</p>
                  <p className="mt-2 text-xs text-white/50">{task.status}</p>
                  {task.errorMessage ? <p className="mt-2 text-xs text-red-300">{task.errorMessage}</p> : null}
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">HITL safeguards</h3>
            {agentApprovals.length === 0 ? (
              <p className="text-sm text-white/50">
                Sin acciones autonomas pendientes de aprobacion.
              </p>
            ) : (
              agentApprovals.map((approval) => (
                <div key={approval.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{approval.actionType}</p>
                    <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs text-amber-100">
                      {approval.status}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/55">
                    {JSON.stringify(approval.proposedAction)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Time to hire", timeToHireDays === null ? "--" : `${timeToHireDays}d`],
          ["Offer acceptance", offerAcceptanceRate === null ? "--" : `${offerAcceptanceRate}%`],
          ["Interview completion", interviewSuccessRate === null ? "--" : `${interviewSuccessRate}%`],
          ["Automation runs", recruiterMetrics.automationExecutionCount],
          ["Notifications", recruiterMetrics.notificationCount],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-4 backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["Health", health.status],
          ["Failed jobs 24h", health.failedJobs],
          ["Failed notifications", health.failedNotifications],
          ["Failed automations", health.failedAutomations],
          ["Pending transcriptions", health.pendingTranscriptions],
          ["Stale processing", health.staleCandidates],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-4 backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p
              className={`mt-2 text-xl font-semibold ${
                value === "critical"
                  ? "text-red-300"
                  : value === "degraded"
                    ? "text-amber-200"
                    : "text-emerald-300"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
                  Automation Control Center
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Reglas, ejecuciones y retries
                </h2>
              </div>
              <AutomationControlActions
                tenantId={search.tenantId}
                searchId={search.id}
                candidateId={candidates[0]?.id ?? null}
              />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                {search.automationRules.length === 0 ? (
                  <p className="text-sm text-white/45">Sin reglas configuradas.</p>
                ) : (
                  search.automationRules.map((rule) => (
                    <div key={rule.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white/75">{rule.name}</p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
                          {rule.enabled ? "enabled" : "disabled"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-white/45">{rule.triggerType}</p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-white/50">JSON</summary>
                        <JsonBlock data={{ conditions: rule.conditions, actions: rule.actions }} />
                      </details>
                      <AutomationControlActions
                        tenantId={search.tenantId}
                        searchId={search.id}
                        ruleId={rule.id}
                        enabled={rule.enabled}
                        candidateId={candidates[0]?.id ?? null}
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                {search.automationExecutions.length === 0 ? (
                  <p className="text-sm text-white/45">Sin ejecuciones recientes.</p>
                ) : (
                  search.automationExecutions.map((execution) => (
                    <div key={execution.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white/75">{execution.action}</p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
                          {execution.status}
                        </span>
                      </div>
                      {execution.errorMessage ? (
                        <p className="mt-2 text-xs leading-5 text-red-300">{execution.errorMessage}</p>
                      ) : null}
                      {execution.status === "failed" ? (
                        <AutomationControlActions
                          tenantId={search.tenantId}
                          searchId={search.id}
                          executionId={execution.id}
                        />
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
                  Hiring intelligence
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Top candidates y senales IA
                </h2>
              </div>
              <p className="text-sm text-white/50">
                Actividad automation: {search.automationExecutions.length}
              </p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/75">Top candidates</h3>
                {topCandidates.length === 0 ? (
                  <p className="text-sm text-white/45">Sin candidatos puntuados.</p>
                ) : (
                  topCandidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-white/80">
                          {index + 1}. {candidate.fullName ?? candidate.email ?? candidate.candidateCode}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                          {Math.max(
                            candidate.cvScore ?? 0,
                            candidate.interviewSessions[0]?.interviewScore ?? 0,
                          ) || "--"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {getHeuristicHiringSignal({
                          id: candidate.id,
                          cvScore: candidate.cvScore,
                          interviewScore: candidate.interviewSessions[0]?.interviewScore,
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/75">
                  Automation activity
                </h3>
                {search.automationExecutions.length === 0 ? (
                  <p className="text-sm text-white/45">Sin ejecuciones aun.</p>
                ) : (
                  search.automationExecutions.map((execution) => (
                    <div
                      key={execution.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white/75">
                          {execution.action}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
                          {execution.status}
                        </span>
                      </div>
                      {execution.errorMessage ? (
                        <p className="mt-2 text-xs leading-5 text-red-300">
                          {execution.errorMessage}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/15 p-4">
                <h3 className="text-sm font-semibold text-white/75">
                  High potential pool
                </h3>
                <div className="mt-3 space-y-2">
                  {highPotentialCandidates.length === 0 ? (
                    <p className="text-sm text-white/40">Sin perfiles destacados.</p>
                  ) : (
                    highPotentialCandidates.map((candidate) => (
                      <p key={candidate.id} className="truncate text-sm text-white/60">
                        {candidate.fullName ?? candidate.email ?? candidate.candidateCode}
                      </p>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/15 p-4">
                <h3 className="text-sm font-semibold text-white/75">
                  Strongest communication
                </h3>
                <div className="mt-3 space-y-2">
                  {strongestCommunicationProfiles.length === 0 ? (
                    <p className="text-sm text-white/40">Sin entrevistas evaluadas.</p>
                  ) : (
                    strongestCommunicationProfiles.map((candidate) => (
                      <p key={candidate.id} className="truncate text-sm text-white/60">
                        {candidate.fullName ?? candidate.email ?? candidate.candidateCode} -{" "}
                        {readReportNumber(
                          candidate.interviewSessions[0]?.interviewReport,
                          "communicationScore",
                        )}
                      </p>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/15 p-4">
                <h3 className="text-sm font-semibold text-white/75">
                  Strongest leadership
                </h3>
                <div className="mt-3 space-y-2">
                  {strongestLeadershipProfiles.length === 0 ? (
                    <p className="text-sm text-white/40">Sin entrevistas evaluadas.</p>
                  ) : (
                    strongestLeadershipProfiles.map((candidate) => (
                      <p key={candidate.id} className="truncate text-sm text-white/60">
                        {candidate.fullName ?? candidate.email ?? candidate.candidateCode} -{" "}
                        {readReportNumber(
                          candidate.interviewSessions[0]?.interviewReport,
                          "leadershipScore",
                        )}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/15 p-4">
              <h3 className="text-sm font-semibold text-white/75">
                Pipeline conversion
              </h3>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {Object.entries(conversionRates).map(([stage, rate]) => (
                  <div
                    key={stage}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                  >
                    <p className="text-xs text-white/40">{stage}</p>
                    <p className="mt-1 text-sm font-semibold text-white/75">{rate}%</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
                  Pipeline
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Kanban de candidatos
                </h2>
              </div>
              <p className="text-sm text-white/50">Sin drag-and-drop</p>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-4 2xl:grid-cols-8">
              {recruitingPipelineStages.map((stage) => {
                const stageCandidates = candidates.filter(
                  (candidate) => candidate.pipelineStage === stage.value,
                );

                return (
                  <div
                    key={stage.value}
                    className="min-h-40 rounded-xl border border-white/10 bg-black/15 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white/80">
                        {stage.label}
                      </h3>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/55">
                        {stageCandidates.length}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {stageCandidates.length === 0 ? (
                        <p className="text-xs leading-5 text-white/35">Sin candidatos</p>
                      ) : (
                        stageCandidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                          >
                            <p className="truncate text-xs font-semibold text-white/80">
                              {candidate.candidateCode ?? "Sin codigo"}
                            </p>
                            <p className="mt-1 truncate text-xs text-white/50">
                              {candidate.fullName ?? candidate.email ?? "Sin identificar"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/55">
                                {candidate.cvScore ?? "--"}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[11px] ${getFitClass(
                                  candidate.cvScore,
                                  candidate.processingStatus,
                                )}`}
                              >
                                {getFitLabel(candidate.cvScore, candidate.processingStatus)}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[11px] ${getProcessingStatusClass(
                                  candidate.processingStatus,
                                )}`}
                              >
                                {candidate.processingStatus}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
                  Candidatos
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Ranking operativo
                </h2>
              </div>
              <p className="text-sm text-white/50">{candidates.length} perfiles</p>
            </div>

            <div className="mt-6 space-y-4">
              {candidates.length === 0 ? (
                <p className="text-sm leading-6 text-white/50">
                  Todavia no hay CVs asociados a esta REF.
                </p>
              ) : (
                candidates.map((candidate) => {
                  const fitLabel = getFitLabel(candidate.cvScore, candidate.processingStatus);
                  const fitClass = getFitClass(candidate.cvScore, candidate.processingStatus);
                  const latestOffer = candidate.offers[0];
                  const latestOfferVersion = latestOffer?.versions[0];
                  const compensation = readCompensation(latestOfferVersion?.benefits);

                  return (
                    <article
                      key={candidate.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-3 py-1 text-xs font-semibold text-[#F4EBD0]">
                              {candidate.candidateCode ?? "Sin codigo"}
                            </span>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${getProcessingStatusClass(
                                candidate.processingStatus,
                              )}`}
                            >
                              {candidate.processingStatus}
                            </span>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${fitClass}`}
                            >
                              {fitLabel}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                              {candidate.pipelineStage}
                            </span>
                          </div>

                          <h3 className="mt-3 text-lg font-semibold text-white">
                            {candidate.fullName ?? candidate.email ?? "Candidato sin identificar"}
                          </h3>
                          <div className="mt-2 grid gap-2 text-sm text-white/55 md:grid-cols-2">
                            <p>Email: {candidate.email ?? "No detectado"}</p>
                            <p>Recibido: {formatDate(candidate.receivedAt)}</p>
                            <p>Archivo: {candidate.cvFileName ?? "Sin archivo"}</p>
                            <p className="truncate">
                              Asunto: {candidate.sourceSubject ?? "Sin asunto"}
                            </p>
                          </div>
                          {candidate.interviewSessions[0] ? (
                            <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-white/60">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                                  Entrevista: {candidate.interviewSessions[0].status}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                                  Score: {candidate.interviewSessions[0].interviewScore ?? "--"}
                                </span>
                              </div>
                              {candidate.interviewSessions[0].interviewSummary ? (
                                <p className="mt-2 leading-6">
                                  {candidate.interviewSessions[0].interviewSummary}
                                </p>
                              ) : null}
                              {candidate.interviewSessions[0].interviewReport &&
                              typeof candidate.interviewSessions[0].interviewReport === "object" ? (
                                <div className="mt-3 grid gap-2 md:grid-cols-3">
                                  {[
                                    ["Communication", "communicationScore"],
                                    ["Leadership", "leadershipScore"],
                                    ["Confidence", "confidenceScore"],
                                  ].map(([label, key]) => (
                                    <div
                                      key={key}
                                      className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                                    >
                                      <p className="text-xs text-white/40">{label}</p>
                                      <p className="mt-1 text-lg font-semibold text-white">
                                        {String(
                                          (
                                            candidate.interviewSessions[0]
                                              .interviewReport as Record<string, unknown>
                                          )[key] ?? "--",
                                        )}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              {candidate.interviewSessions[0].answers.some((answer) => answer.audioUrl) ? (
                                <div className="mt-3 space-y-2">
                                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                                    Audio answers
                                  </p>
                                  {candidate.interviewSessions[0].answers
                                    .filter((answer) => answer.audioUrl)
                                    .slice(0, 3)
                                    .map((answer) => (
                                      <div
                                        key={answer.id}
                                        className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                                      >
                                        <p className="truncate text-xs text-white/50">
                                          {answer.question.question}
                                        </p>
                                        <p className="mt-1 text-xs text-white/40">
                                          Transcripcion: {answer.transcriptionStatus ?? "pending"}
                                        </p>
                                      </div>
                                    ))}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-white/35">
                              Entrevista IA no generada.
                            </p>
                          )}
                          <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/60">
                            {
                              aggregateCandidateSignals({
                                cvScore: candidate.cvScore,
                                interviewScore: candidate.interviewSessions[0]?.interviewScore,
                                behavioralSignals:
                                  candidate.interviewSessions[0]?.interviewReport ?? null,
                              }).finalSignal
                            }{" "}
                            -{" "}
                            {getHeuristicHiringSignal({
                              id: candidate.id,
                              cvScore: candidate.cvScore,
                              interviewScore: candidate.interviewSessions[0]?.interviewScore,
                            })}
                          </p>

                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-white/60">
                              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                                Compensation intelligence
                              </p>
                              {latestOfferVersion ? (
                                <div className="mt-2 space-y-1">
                                  <p>
                                    Recomendado:{" "}
                                    {formatMoney(
                                      latestOfferVersion.baseSalary,
                                      latestOfferVersion.currency,
                                    )}
                                  </p>
                                  <p>
                                    Nivel:{" "}
                                    {typeof compensation?.level === "string"
                                      ? compensation.level
                                      : "estimado"}
                                  </p>
                                  <p>
                                    Mercado:{" "}
                                    {typeof compensation?.marketPosition === "string"
                                      ? compensation.marketPosition
                                      : "pendiente"}
                                  </p>
                                </div>
                              ) : (
                                <p className="mt-2 text-white/40">
                                  Sin estimacion persistida. Genera una oferta para calcular rango.
                                </p>
                              )}
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-white/60">
                              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                                Offer engine
                              </p>
                              {latestOffer ? (
                                <div className="mt-2 space-y-1">
                                  <p>Status: {latestOffer.status}</p>
                                  <p>Version: {latestOffer.currentVersionId ?? "sin version"}</p>
                                  <p>Creada: {formatDate(latestOffer.createdAt)}</p>
                                </div>
                              ) : (
                                <p className="mt-2 text-white/40">Sin oferta activa.</p>
                              )}
                            </div>
                          </div>

                          {candidate.memories.length > 0 ? (
                            <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-white/60">
                              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                                Candidate memory
                              </p>
                              <div className="mt-2 space-y-2">
                                {candidate.memories.map((memory) => (
                                  <p key={memory.id} className="leading-5">
                                    <span className="text-white/40">{memory.memoryType}:</span>{" "}
                                    {memory.content}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {similarCandidateMap.get(candidate.id) ? (
                            <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-3 text-sm text-white/60">
                              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                                Similares a este candidato
                              </p>
                              <div className="mt-2 space-y-1">
                                {similarCandidateMap.get(candidate.id)?.map((item) => (
                                  <p key={item.label} className="truncate">
                                    {item.label} - {Math.round(item.similarity * 100)}%
                                  </p>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-col gap-3 lg:items-end">
                          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                              Score
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-white">
                              {candidate.cvScore ?? "--"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            {candidate.cvFileUrl ? (
                              <a
                                href={candidate.cvFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/75 transition hover:bg-white/10"
                              >
                                Abrir CV
                              </a>
                            ) : null}
                            {candidate.cvReport ? (
                              <a
                                href={`#report-${candidate.id}`}
                                className="rounded-lg border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-3 py-2 text-xs font-medium text-[#F4EBD0] transition hover:bg-[#C96F3B]/15"
                              >
                                Ver reporte IA
                              </a>
                            ) : null}
                            {candidate.interviewSessions[0] ? (
                              <a
                                href={`/interview/${candidate.interviewSessions[0].publicToken}`}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-500/15"
                              >
                                Link entrevista
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {candidate.processingError ? (
                        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm leading-6 text-red-200">
                          {candidate.processingError}
                        </p>
                      ) : null}

                      {candidate.cvSummary ? (
                        <p className="mt-4 text-sm leading-6 text-white/65">
                          {candidate.cvSummary}
                        </p>
                      ) : (
                        <p className="mt-4 text-sm leading-6 text-white/40">
                          Resumen pendiente.
                        </p>
                      )}

                      {candidate.cvReport ? (
                        <details id={`report-${candidate.id}`} className="mt-4">
                          <summary className="cursor-pointer text-sm font-medium text-[#F4EBD0]">
                            Reporte IA
                          </summary>
                          <div className="mt-3">
                            <JsonBlock data={candidate.cvReport} />
                          </div>
                        </details>
                      ) : null}

                      <CandidatePipelineActions
                        candidateId={candidate.id}
                        tenantId={search.tenantId}
                        latestOfferId={latestOffer?.id ?? null}
                      />
                    </article>
                  );
                })
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Jobs de procesamiento
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Ultimos 10 jobs
            </h2>
            <div className="mt-6 space-y-3">
              {search.processingJobs.length === 0 ? (
                <p className="text-sm leading-6 text-white/50">
                  No hay jobs de procesamiento para esta busqueda.
                </p>
              ) : (
                search.processingJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${getProcessingStatusClass(
                          job.processingStatus,
                        )}`}
                      >
                        {job.processingStatus}
                      </span>
                      <span className="text-xs text-white/45">
                        Intentos: {job.attempts}/{job.maxAttempts}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-white/55 md:grid-cols-2">
                      <p>Creado: {formatDate(job.createdAt)}</p>
                      <p>Completado: {formatDate(job.completedAt)}</p>
                      <p className="truncate md:col-span-2">
                        Archivo: {job.attachmentFileName}
                      </p>
                    </div>
                    {job.errorMessage ? (
                      <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-200">
                        {job.errorMessage}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Pedido original
            </p>
            <p className="mt-4 text-sm leading-6 text-white/70">{search.requestText}</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Perfil del puesto
            </p>
            <div className="mt-4">
              <JsonBlock data={search.jobProfileOutput} />
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Candidato ideal
            </p>
            <div className="mt-4">
              <JsonBlock data={search.idealCandidateOutput} />
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Criterios de scoring
            </p>
            <div className="mt-4">
              <JsonBlock data={search.scoringCriteriaOutput} />
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <RecruitingInboxActions
            searchId={search.id}
            tenantId={search.tenantId}
            refCode={search.refCode}
          />

          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Datos de busqueda
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/70">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                Empresa: {search.companyProfile?.razonSocial ?? "No asignada"}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                Area: {search.area ?? "No definida"}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                Seniority: {search.seniority ?? "No definido"}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                Modalidad: {search.modality ?? "No definida"}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                Ubicacion: {search.location ?? "No definida"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Resumen
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/70">
              <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Total candidatos</span>
                <span>{search.candidates.length}</span>
              </div>
              <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Completados</span>
                <span className="text-emerald-300">{completedCount}</span>
              </div>
              <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>En proceso</span>
                <span className="text-amber-200">{activeCount}</span>
              </div>
              <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Avg entrevista</span>
                <span>{averageInterviewScore ?? "--"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Notification statuses
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/70">
              {search.notificationDeliveries.length === 0 ? (
                <p className="text-white/45">Sin notificaciones registradas.</p>
              ) : (
                search.notificationDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{delivery.type}</span>
                      <span className="text-white/45">{delivery.status}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-white/40">
                      {delivery.toEmail}
                    </p>
                    {delivery.errorMessage ? (
                      <p className="mt-2 text-xs text-red-300">{delivery.errorMessage}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
