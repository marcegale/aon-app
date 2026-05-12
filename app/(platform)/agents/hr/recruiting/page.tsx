import Link from "next/link";
import { GmailConnectionCard } from "./GmailConnectionCard";

const workflowStages = [
  {
    step: "01",
    title: "Pedido de búsqueda",
    description:
      "Recibe el requerimiento inicial, adjuntos disponibles, datos de la empresa, modalidad, ubicación, seniority y fecha de corte.",
  },
  {
    step: "02",
    title: "Perfil del puesto y candidato ideal",
    description:
      "Genera con IA el perfil del puesto y del candidato ideal, salvo que exista documentación adjunta para usar como fuente principal.",
  },
  {
    step: "03",
    title: "Publicación y materiales",
    description:
      "Genera gráfica de búsqueda, copys por plataforma, REF del puesto y textos listos para publicar o copiar.",
  },
  {
    step: "04",
    title: "Monitoreo de CVs",
    description:
      "Monitorea el email asignado, identifica correos con la REF, extrae CVs, evita duplicados y detiene el seguimiento al llegar la fecha de corte.",
  },
  {
    step: "05",
    title: "Reporte y shortlist",
    description:
      "Resume CVs recibidos, asigna códigos a candidatos, calcula scoring y permite seleccionar los perfiles que avanzan.",
  },
  {
    step: "06",
    title: "Entrevista IA",
    description:
      "Envía links de agenda, guía entrevistas pregunta por pregunta con respuestas por voz o texto, y genera reporte con transcripción.",
  },
];

const platformCopies = ["LinkedIn", "Instagram", "Facebook", "WhatsApp", "Email"];

const reviewActions = [
  "Ver CV",
  "Ver resumen",
  "Ver scoring",
  "Consultar transcripción",
  "Califica",
  "No califica",
];

export default function RecruitingAgentPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0F2422]/70 backdrop-blur-sm">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6 p-8 lg:p-10">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#C96F3B]">
                RRHH / Recruiting Agent
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                Asistente de Contrataciones
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/65">
                Agente para recibir pedidos de búsqueda, crear perfiles de puesto,
                generar materiales de publicación, monitorear CVs por REF, resumir
                candidatos y conducir entrevistas iniciales asistidas por IA.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-300">
                Recruiting
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70">
                CV Monitoring
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70">
                AI Interviews
              </span>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/agents/hr/recruiting/new"
                className="rounded-lg border border-[#C96F3B]/25 bg-[#C96F3B]/15 px-5 py-3 text-sm font-medium text-[#F4EBD0] transition hover:bg-[#C96F3B]/20"
              >
                Nueva búsqueda
              </Link>
              <Link
                href="/agents/hr"
                className="rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10"
              >
                Volver a RRHH
              </Link>
            </div>
          </div>

          <div className="min-h-72 border-t border-white/10 lg:border-l lg:border-t-0">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80"
              alt="Proceso de entrevistas y contratación"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm lg:col-span-2">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Flujo operativo
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Etapas del Recruiting Agent
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {workflowStages.map((stage) => (
              <article
                key={stage.step}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <span className="text-xs font-semibold tracking-[0.24em] text-[#C96F3B]">
                  {stage.step}
                </span>
                <h3 className="mt-3 text-base font-semibold text-white">
                  {stage.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  {stage.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <GmailConnectionCard />

          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              REF activa
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              REF-1234
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Cada búsqueda genera una referencia única para ordenar postulaciones
              recibidas por email y asociarlas al proceso correcto.
            </p>
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
              Envía tu CV al correo asignado con el asunto REF-1234.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Monitoreo
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
                On
              </button>
              <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/70">
                Finish
              </button>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
            Publicación
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Copys por plataforma
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            La IA genera textos adaptados por canal, con botón para copiar y
            opción futura de publicación automática donde la API lo permita.
          </p>

          <div className="mt-6 space-y-3">
            {platformCopies.map((platform) => (
              <div
                key={platform}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-sm font-medium text-white/75">
                  {platform}
                </span>
                <button className="rounded-lg border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-3 py-1.5 text-xs font-medium text-[#F4EBD0]">
                  Copiar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
            Revisión humana
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Panel de candidatos
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Cada candidato mantiene CV, resumen, scoring, transcripción de
            entrevista y acciones de avance o descarte.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {reviewActions.map((action) => (
              <div
                key={action}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70"
              >
                {action}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
          Entrevista IA
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Primera entrevista guiada por el agente
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-white/60">
          El candidato recibe un link de agenda, accede a una pantalla de
          explicación del proceso y responde una pregunta por página. Las
          preguntas se generan considerando el pedido de búsqueda, el perfil del
          candidato ideal, los criterios de evaluación y el prompt de entrevista
          configurado. Las respuestas pueden enviarse por voz o texto.
        </p>
      </section>
    </div>
  );
}
