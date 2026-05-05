import Link from "next/link";

const searchBasics = [
  { label: "Título del puesto", placeholder: "Ej. Analista de Marketing" },
  { label: "Empresa / cliente", placeholder: "Seleccionar empresa registrada" },
  { label: "Área", placeholder: "Ej. Comercial, Finanzas, Operaciones" },
  { label: "Seniority", placeholder: "Junior, Semi Senior, Senior, Lead" },
  { label: "Modalidad", placeholder: "Presencial, híbrido o remoto" },
  { label: "Ubicación", placeholder: "Ciudad / país" },
  { label: "Rango salarial", placeholder: "Opcional" },
  { label: "Fecha de corte de CVs", placeholder: "Seleccionar fecha" },
];

const attachments = [
  "Descripción de puesto existente",
  "Perfil de candidato ideal existente",
  "Organigrama relacionado",
  "Beneficios específicos del puesto",
  "Material adicional del cliente",
];

const aiOutputs = [
  "Perfil del puesto",
  "Perfil del candidato ideal",
  "Criterios de scoring",
  "Red flags",
  "Copy LinkedIn",
  "Copy Instagram",
  "Copy Facebook",
  "Copy WhatsApp",
  "Copy Email",
  "Prompt para gráfica laboral",
];

export default function NewRecruitingSearchPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#C96F3B]">
            Recruiting Agent
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Nueva búsqueda laboral
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Carga el pedido inicial para que el agente genere el perfil del
            puesto, el candidato ideal, la referencia de búsqueda, los materiales
            de publicación y el monitoreo de CVs.
          </p>
        </div>

        <Link
          href="/agents/hr/recruiting"
          className="w-fit rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10"
        >
          Volver al agente
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
                Paso 1
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Datos básicos de la búsqueda
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {searchBasics.map((field) => (
                <label key={field.label} className="block">
                  <span className="text-sm font-medium text-white/75">
                    {field.label}
                  </span>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#C96F3B]/40"
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-white/75">
                Pedido de búsqueda
              </span>
              <textarea
                rows={6}
                placeholder="Describe el requerimiento recibido, responsabilidades, habilidades esperadas, condiciones relevantes y cualquier instrucción interna."
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-[#C96F3B]/40"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
                Paso 2
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Documentos adjuntos
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Si el perfil del puesto o del candidato ideal ya existe, el
                agente usará esos documentos como fuente principal. Si no existe,
                los generará con IA.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment}
                  className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4"
                >
                  <p className="text-sm font-medium text-white/75">
                    {attachment}
                  </p>
                  <button className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10">
                    Adjuntar archivo
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
                Paso 3
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Configuración IA y publicación
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-white/75">
                  Email de recepción de CVs
                </span>
                <input
                  type="email"
                  placeholder="rrhh@empresa.com"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#C96F3B]/40"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-white/75">
                  REF sugerida
                </span>
                <input
                  type="text"
                  placeholder="REF-1234"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#C96F3B]/40"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-white/75">
                Prompt configurable para gráfica de búsqueda
              </span>
              <textarea
                rows={5}
                placeholder="Indica tono, estructura visual, elementos obligatorios, restricciones de marca, anonimato y tipo de llamada a la acción."
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-[#C96F3B]/40"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-white/75">
                Prompt base para entrevista IA
              </span>
              <textarea
                rows={5}
                placeholder="Define cómo debe entrevistar el agente, qué competencias evaluar, profundidad esperada, tono y criterios de calificación."
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-[#C96F3B]/40"
              />
            </label>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Salidas esperadas
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Generación inicial
            </h2>
            <div className="mt-5 space-y-3">
              {aiOutputs.map((output) => (
                <div
                  key={output}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70"
                >
                  {output}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
              Estado inicial
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/70">
              <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Monitoreo email</span>
                <span className="text-emerald-300">Pendiente</span>
              </div>
              <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Gráfica</span>
                <span className="text-white/50">No generada</span>
              </div>
              <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Reporte CVs</span>
                <span className="text-white/50">Sin datos</span>
              </div>
            </div>
          </div>

          <button className="w-full rounded-xl border border-[#C96F3B]/25 bg-[#C96F3B]/15 px-5 py-4 text-sm font-semibold text-[#F4EBD0] transition hover:bg-[#C96F3B]/20">
            Crear búsqueda y generar con IA
          </button>
        </aside>
      </div>
    </div>
  );
}
