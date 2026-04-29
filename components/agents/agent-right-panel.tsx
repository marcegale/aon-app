type AgentRightPanelProps = {
  clientName?: string;
  batchLabel?: string;
  processedLabel?: string;
  usageLabel?: string;
};

export default function AgentRightPanel({
  clientName = "Sin cliente seleccionado",
  batchLabel = "Sin lote activo",
  processedLabel = "0 procesadas",
  usageLabel = "Uso no disponible",
}: AgentRightPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A24D]">
          Panel operativo
        </p>
        <h2 className="mt-2 text-lg font-semibold text-white">
          Estado del trabajo
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/58">
          Resumen contextual del flujo actual.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Cliente activo
          </p>
          <p className="mt-2 text-sm font-medium text-white">{clientName}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Lote
          </p>
          <p className="mt-2 text-sm font-medium text-white">{batchLabel}</p>
          <p className="mt-1 text-xs text-white/45">{processedLabel}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Capacidad
          </p>
          <p className="mt-2 text-sm font-medium text-white">{usageLabel}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#C9A24D]/20 bg-[#C9A24D]/10 p-4">
        <p className="text-sm font-medium text-[#F4D58A]">
          Siguiente acción sugerida
        </p>
        <p className="mt-2 text-sm leading-6 text-white/62">
          Seleccionar un cliente antes de cargar facturas.
        </p>
      </div>
    </div>
  );
}
