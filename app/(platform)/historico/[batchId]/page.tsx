"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type HistoryBatch = {
  id: string;
  client: string;
  date: string;
  total: number;
  validated: number;
};

function readHistory() {
  try {
    const raw = window.localStorage.getItem("invoice_files_history");
    return raw ? (JSON.parse(raw) as HistoryBatch[]) : [];
  } catch {
    return [];
  }
}

function getStatus(item: HistoryBatch) {
  if (item.total > 0 && item.validated >= item.total) return "validado";
  if (item.validated > 0) return "parcial";
  return "pendiente";
}

export default function BatchDetailPage() {
  const params = useParams<{ batchId: string }>();
  const [items, setItems] = useState<HistoryBatch[]>([]);

  useEffect(() => {
    setItems(readHistory());
  }, []);

  const batch = useMemo(() => {
    return items.find((item) => item.id === params.batchId) ?? null;
  }, [items, params.batchId]);

  if (!batch) {
    return (
      <div className="space-y-5">
        <Link href="/historico" className="text-sm text-[#C9A24D] hover:text-[#F4D58A]">
          Volver al histórico
        </Link>
        <div className="rounded-[28px] border border-white/10 bg-[#111620] p-8 text-white/50">
          Lote no encontrado en este navegador.
        </div>
      </div>
    );
  }

  const status = getStatus(batch);

  return (
    <div className="space-y-5">
      <Link href="/historico" className="text-sm text-[#C9A24D] hover:text-[#F4D58A]">
        Volver al histórico
      </Link>

      <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(201,162,77,0.16),transparent_34%),linear-gradient(135deg,rgba(28,34,48,0.98),rgba(13,16,24,0.98))] p-6 shadow-2xl shadow-black/25">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#C9A24D]">
          Detalle del lote
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {batch.client}
        </h1>
        <p className="mt-3 text-sm text-white/60">{batch.date}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#111620] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Facturas</p>
          <p className="mt-2 text-3xl font-semibold text-white">{batch.total}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111620] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Validadas</p>
          <p className="mt-2 text-3xl font-semibold text-white">{batch.validated}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111620] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">Pendientes</p>
          <p className="mt-2 text-3xl font-semibold text-white">{Math.max(batch.total - batch.validated, 0)}</p>
        </div>
        <div className="rounded-2xl border border-[#C9A24D]/20 bg-[#C9A24D]/10 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#F4D58A]/70">Estado</p>
          <p className="mt-2 text-lg font-semibold capitalize text-[#F4D58A]">{status}</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[#111620] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Facturas del lote</h2>
            <p className="mt-1 text-sm text-white/50">
              El detalle por factura se activará cuando el snapshot guarde items individuales.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-[#C9A24D] px-5 py-3 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#D8B45F] active:scale-[0.99]"
          >
            Reexportar lote
          </button>
        </div>
      </div>
    </div>
  );
}
