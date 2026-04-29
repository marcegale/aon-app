"use client";

import { useEffect, useMemo, useState } from "react";
import RecentHistoryCard from "@/components/history/recent-history-card";

type StoredInvoiceFile = {
  status?: "pending" | "processing" | "done" | "error";
  isValidated?: boolean;
};

function readStoredFiles() {
  try {
    const raw = window.localStorage.getItem("invoice_files");
    return raw ? (JSON.parse(raw) as StoredInvoiceFile[]) : [];
  } catch {
    return [];
  }
}

function readStoredClient() {
  return window.localStorage.getItem("nexa_active_client") || "Sin cliente seleccionado";
}

export default function AgentRightPanel() {
  const [clientName, setClientName] = useState("Sin cliente seleccionado");
  const [files, setFiles] = useState<StoredInvoiceFile[]>([]);

  useEffect(() => {
    function syncPanelState() {
      setClientName(readStoredClient());
      setFiles(readStoredFiles());
    }

    syncPanelState();
    const interval = window.setInterval(syncPanelState, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const summary = useMemo(() => {
    const total = files.length;
    const processed = files.filter((item) => item.status === "done").length;
    const processing = files.filter((item) => item.status === "processing").length;
    const errors = files.filter((item) => item.status === "error").length;
    const validated = files.filter((item) => item.isValidated).length;

    return { total, processed, processing, errors, validated };
  }, [files]);

  const batchLabel = summary.total === 0 ? "Sin lote activo" : `${summary.total} facturas cargadas`;
  const processedLabel = `${summary.processed} procesadas · ${summary.validated} validadas`;

  const nextAction = (() => {
    if (clientName === "Sin cliente seleccionado") return "Seleccionar un cliente antes de cargar facturas.";
    if (summary.total === 0) return "Cargar facturas para iniciar el lote.";
    if (summary.processing > 0) return "Esperar a que finalice el procesamiento.";
    if (summary.errors > 0) return "Revisar facturas con error antes de exportar.";
    if (summary.processed < summary.total) return "Procesar las facturas pendientes.";
    if (summary.validated < summary.processed) return "Validar las facturas procesadas.";
    return "El lote está listo para exportación.";
  })();

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

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Cargadas</p>
          <p className="mt-2 text-2xl font-semibold text-white">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Validadas</p>
          <p className="mt-2 text-2xl font-semibold text-white">{summary.validated}</p>
        </div>
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
          <p className="mt-2 text-sm font-medium text-white">Mover uso aquí</p>
          <p className="mt-1 text-xs text-white/45">Pendiente de conectar al contador real.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#C9A24D]/20 bg-[#C9A24D]/10 p-4">
        <p className="text-sm font-medium text-[#F4D58A]">
          Siguiente acción sugerida
        </p>
        <p className="mt-2 text-sm leading-6 text-white/62">
          {nextAction}
        </p>
      </div>
    <RecentHistoryCard />
    </div>
  );
}
