"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const searchBasics = [
  { name: "title", label: "Titulo del puesto", placeholder: "Ej. Analista de Marketing" },
  { name: "company", label: "Empresa / cliente", placeholder: "Seleccionar empresa registrada" },
  { name: "area", label: "Area", placeholder: "Ej. Comercial, Finanzas, Operaciones" },
  { name: "seniority", label: "Seniority", placeholder: "Junior, Semi Senior, Senior, Lead" },
  { name: "modality", label: "Modalidad", placeholder: "Presencial, hibrido o remoto" },
  { name: "location", label: "Ubicacion", placeholder: "Ciudad / pais" },
  { name: "salaryRange", label: "Rango salarial", placeholder: "Opcional" },
  { name: "cutoffDate", label: "Fecha de corte de CVs", placeholder: "Seleccionar fecha" },
];

const attachments = [
  "Descripcion de puesto existente",
  "Perfil de candidato ideal existente",
  "Organigrama relacionado",
  "Beneficios especificos del puesto",
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
  "Prompt para grafica laboral",
];

export default function NewRecruitingSearchPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [requestText, setRequestText] = useState("");
  const [tenantId] = useState("demo-tenant");
  const [userId] = useState("demo-user");
  const [receivingEmail, setReceivingEmail] = useState("");
  const [suggestedRef, setSuggestedRef] = useState("");
  const [searchGraphicPrompt, setSearchGraphicPrompt] = useState("");
  const [interviewPrompt, setInterviewPrompt] = useState("");
  const [basicValues, setBasicValues] = useState<Record<string, string>>({
    company: "",
    area: "",
    seniority: "",
    modality: "",
    location: "",
    salaryRange: "",
    cutoffDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(title.trim() && requestText.trim()) && !loading;

  function getBasicValue(name: string) {
    return name === "title" ? title : (basicValues[name] ?? "");
  }

  function setBasicValue(name: string, value: string) {
    if (name === "title") {
      setTitle(value);
      return;
    }
    setBasicValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recruiting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          requestText: requestText.trim(),
          tenantId,
          userId,
        }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        id?: string;
        error?: string;
      };

      if (!response.ok || !data.success || !data.id) {
        throw new Error(data.error ?? "No se pudo crear la busqueda.");
      }

      router.push(`/agents/hr/recruiting/${data.id}`);
    } catch (submitError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Recruiting search creation failed:", submitError);
      }
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear la busqueda.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#C96F3B]">
            Recruiting Agent
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
            Nueva busqueda laboral
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Carga el pedido inicial para que el agente genere el perfil del
            puesto, el candidato ideal, la referencia de busqueda, los materiales
            de publicacion y el monitoreo de CVs.
          </p>
        </div>

        <Link
          href="/agents/hr/recruiting"
          className="w-fit rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10"
        >
          Volver al agente
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
                Paso 1
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Datos basicos de la busqueda
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
                    value={getBasicValue(field.name)}
                    onChange={(event) => setBasicValue(field.name, event.target.value)}
                    placeholder={field.placeholder}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#C96F3B]/40"
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-white/75">
                Pedido de busqueda
              </span>
              <textarea
                rows={6}
                value={requestText}
                onChange={(event) => setRequestText(event.target.value)}
                placeholder="Describe el requerimiento recibido, responsabilidades, habilidades esperadas, condiciones relevantes y cualquier instruccion interna."
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
                agente usara esos documentos como fuente principal. Si no existe,
                los generara con IA.
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
                  <button
                    type="button"
                    className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/10"
                  >
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
                Configuracion IA y publicacion
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-white/75">
                  Email de recepcion de CVs
                </span>
                <input
                  type="email"
                  value={receivingEmail}
                  onChange={(event) => setReceivingEmail(event.target.value)}
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
                  value={suggestedRef}
                  onChange={(event) => setSuggestedRef(event.target.value)}
                  placeholder="REF-1234"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#C96F3B]/40"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-white/75">
                Prompt configurable para grafica de busqueda
              </span>
              <textarea
                rows={5}
                value={searchGraphicPrompt}
                onChange={(event) => setSearchGraphicPrompt(event.target.value)}
                placeholder="Indica tono, estructura visual, elementos obligatorios, restricciones de marca, anonimato y tipo de llamada a la accion."
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-[#C96F3B]/40"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-white/75">
                Prompt base para entrevista IA
              </span>
              <textarea
                rows={5}
                value={interviewPrompt}
                onChange={(event) => setInterviewPrompt(event.target.value)}
                placeholder="Define como debe entrevistar el agente, que competencias evaluar, profundidad esperada, tono y criterios de calificacion."
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
              Generacion inicial
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
                <span>Grafica</span>
                <span className="text-white/50">No generada</span>
              </div>
              <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Reporte CVs</span>
                <span className="text-white/50">Sin datos</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-xl border border-[#C96F3B]/25 bg-[#C96F3B]/15 px-5 py-4 text-sm font-semibold text-[#F4EBD0] transition hover:bg-[#C96F3B]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generando..." : "Crear busqueda y generar con IA"}
          </button>
        </aside>
      </div>
    </form>
  );
}
