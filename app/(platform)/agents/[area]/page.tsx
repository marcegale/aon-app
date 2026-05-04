import Link from "next/link";

type AreaPageProps = {
  params: {
    area: string;
  };
};

const areaContent: Record<
  string,
  {
    name: string;
    description: string;
    status: string;
    agentsCount: number;
    agents?: {
        id: string;
        name: string;
        description: string;
        image: string;
    }[];
  }
> = {
  accounting: {
    name: "Contabilidad",
    description:
      "Gestiona agentes para lectura de facturas, estructuración contable y preparación de cargas para ERP.",
    status: "Active",
    agentsCount: 1,
    agents: [
      {
        id: "invoice-processor",
        name: "Invoice Processing Agent",
        description:
          "Lee facturas, extrae datos clave y prepara información para carga al ERP.",
        image:
          "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
      },
    ],
  },
  hr: {
    name: "RRHH",
    description:
      "Gestiona agentes para reclutamiento, documentación laboral, onboarding y soporte interno.",
    status: "Empty",
    agentsCount: 0,
  },
  finance: {
    name: "Finanzas",
    description:
      "Gestiona agentes para tesorería, análisis financiero, flujo de caja y soporte de decisiones.",
    status: "Empty",
    agentsCount: 0,
  },
  logistics: {
    name: "Logística",
    description:
      "Gestiona agentes para inventario, abastecimiento, movimientos y seguimiento operativo.",
    status: "Empty",
    agentsCount: 0,
  },
  sales: {
    name: "Comercial",
    description:
      "Gestiona agentes para prospección, seguimiento de leads y soporte comercial.",
    status: "Empty",
    agentsCount: 0,
  },
  operations: {
    name: "Operaciones",
    description:
      "Gestiona agentes para control de procesos, ejecución y monitoreo operativo transversal.",
    status: "Empty",
    agentsCount: 0,
  },
};

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

export default async function AgentAreaPage({ params }: AreaPageProps) {
  const resolvedParams = await params;
  const area = areaContent[resolvedParams.area];

  if (!area) {
    return (
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.28em] text-[#C96F3B]">
          ai.gency
        </p>
        <h1 className="text-3xl font-semibold text-white">Área no encontrada</h1>
        <p className="text-sm text-white/65">
          La categoría solicitada no existe o aún no fue configurada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#C96F3B]">
          ai.gency
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
          {area.name}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-white/65">
          {area.description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Estado
          </p>
          <div className="mt-3">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                area.status
              )}`}
            >
              {area.status}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Agentes
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {area.agentsCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Próximo paso
          </p>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Aquí luego mostraremos el listado de agentes del área y el botón para
            crear uno nuevo.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Agentes del área</h2>
          <p className="mt-2 text-sm text-white/65">
            Aquí se listan los agentes pertenecientes a {area.name}.
          </p>
        </div>

        {area.agents && area.agents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {area.agents.map((agent) => (
            <Link
                key={agent.id}
                href={`/agents/${resolvedParams.area}/${agent.id}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F2422]/70 transition hover:border-[#C96F3B]/30 hover:bg-[#183A37]"
            >   
                <div className="h-44 w-full overflow-hidden border-b border-white/10">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white">
                    {agent.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {agent.description}
                  </p>
                </div>
            </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0F2422]/60 p-6">
            <p className="text-sm text-white/65">
              Esta área aún no tiene agentes configurados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}