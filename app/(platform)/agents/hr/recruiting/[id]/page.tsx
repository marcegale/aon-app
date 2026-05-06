import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

function JsonBlock({ data }: { data: unknown }) {
  if (!data) {
    return (
      <p className="text-sm leading-6 text-white/50">
        Sin información generada todavía.
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
        orderBy: { receivedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!search) {
    notFound();
  }

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
            Panel de revisión de la búsqueda, outputs generados por IA,
            monitoreo de CVs, candidatos recibidos y próximos pasos del proceso.
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
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            REF
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {search.refCode}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Estado
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {search.status}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Monitoreo
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {search.monitoringStatus}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            CVs recibidos
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {search.candidates.length}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Pedido original
            </p>
            <p className="mt-4 text-sm leading-6 text-white/70">
              {search.requestText}
            </p>
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

          <article className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Copys por plataforma
            </p>
            <div className="mt-4">
              <JsonBlock data={search.publicationCopiesOutput} />
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Datos de búsqueda
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/70">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                Empresa: {search.companyProfile?.razonSocial ?? "No asignada"}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                Área: {search.area ?? "No definida"}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                Seniority: {search.seniority ?? "No definido"}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                Modalidad: {search.modality ?? "No definida"}
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                Ubicación: {search.location ?? "No definida"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Acciones
            </p>
            <div className="mt-5 space-y-3">
              <button className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
                Activar monitoreo
              </button>
              <button className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/75">
                Regenerar IA
              </button>
              <button className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/75">
                Generar gráfica
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Últimos candidatos
            </p>
            <div className="mt-5 space-y-3">
              {search.candidates.length === 0 ? (
                <p className="text-sm leading-6 text-white/50">
                  Todavía no hay CVs asociados a esta REF.
                </p>
              ) : (
                search.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-sm font-medium text-white/80">
                      {candidate.candidateCode}
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      {candidate.fullName ?? candidate.email ?? "Sin identificar"}
                    </p>
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
