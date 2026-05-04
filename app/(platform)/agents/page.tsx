import Link from "next/link";

const agentAreas = [
  {
    id: "accounting",
    name: "Contabilidad",
    description: "Automatización contable, lectura de facturas y preparación de cargas para ERP.",
    agentsCount: 1,
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "hr",
    name: "RRHH",
    description: "Gestión de talento, documentación laboral, reclutamiento y soporte interno.",
    agentsCount: 0,
    status: "Empty",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "finance",
    name: "Finanzas",
    description: "Análisis financiero, tesorería, control de flujo y soporte de decisiones.",
    agentsCount: 0,
    status: "Empty",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "logistics",
    name: "Logística",
    description: "Inventario, movimientos, abastecimiento y seguimiento operativo.",
    agentsCount: 0,
    status: "Empty",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sales",
    name: "Comercial",
    description: "Prospección, seguimiento comercial, gestión de leads y soporte de ventas.",
    agentsCount: 0,
    status: "Empty",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "operations",
    name: "Operaciones",
    description: "Control de procesos, ejecución diaria y monitoreo operativo transversal.",
    agentsCount: 0,
    status: "Empty",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  },
];

function getStatusClasses(status: string) {
  switch (status) {
    case "Active":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "Partial":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    default:
      return "border-white/10 bg-white/5 text-white/70";
  }
}

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#C96F3B]">
          ai.gency
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
          Áreas de Agentes
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-white/65">
          Explora los dominios operativos donde puedes desplegar agentes
          especializados para cada función del negocio.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {agentAreas.map((area) => (
          <Link
            key={area.id}
            href={`/agents/${area.id}`}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F2422]/70 backdrop-blur-sm transition hover:border-[#C96F3B]/30 hover:bg-[#183A37]"
          >
            <div className="h-44 w-full overflow-hidden border-b border-white/10">
              <img
                src={area.image}
                alt={area.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {area.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {area.description}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                    area.status
                  )}`}
                >
                  {area.status}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                    Agentes
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {area.agentsCount}
                  </p>
                </div>

                <span className="rounded-lg border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-4 py-2 text-sm font-medium text-[#F4EBD0] transition hover:bg-[#C96F3B]/15">
                  Explorar
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}