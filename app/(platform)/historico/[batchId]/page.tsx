"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type HistoryBatchItem = {
  status?: string;
  isValidated?: boolean;
  parsed?: {
    proveedor?: string;
    razonSocialEmisor?: string;
    ruc?: string;
    rucEmisor?: string;
    fecha?: string;
    fechaEmision?: string;
    total?: number | string;
    montoTotal?: number | string;
    numeroFactura?: {
      establecimiento?: string;
      puntoExpedicion?: string;
      numero?: string;
    };
  } | null;
};

type HistoryBatch = {
  id: string;
  client: string;
  date: string;
  total: number;
  validated: number;
  items?: HistoryBatchItem[];
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

function getItemStatus(item: HistoryBatchItem) {
  if (item.status === "error") return "error";
  if (item.isValidated) return "validado";
  if (item.status === "done") return "procesado";
  return item.status || "pendiente";
}

function formatInvoiceNumber(item: HistoryBatchItem) {
  const number = item.parsed?.numeroFactura;
  if (!number) return "—";

  return [number.establecimiento, number.puntoExpedicion, number.numero]
    .filter(Boolean)
    .join("-") || "—";
}

function formatAmount(value: number | string | undefined) {
  if (value === undefined || value === null || value === "") return "—";

  const numberValue = typeof value === "number" ? value : Number(String(value).replace(/\./g, "").replace(",", "."));

  if (Number.isNaN(numberValue)) return String(value);

  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
  }).format(numberValue);
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
  const batchItems = batch.items || [];

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

      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111620]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Facturas del lote</h2>
            <p className="mt-1 text-sm text-white/50">
              {batchItems.length > 0
                ? `${batchItems.length} facturas guardadas en este snapshot.`
                : "Este lote no tiene detalle disponible todavía."}
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-[#C9A24D] px-5 py-3 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#D8B45F] active:scale-[0.99]"
          >
            Reexportar lote
          </button>
        </div>

        {batchItems.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="grid min-w-[920px] grid-cols-[1.7fr_120px_130px_140px_140px_120px] border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs uppercase tracking-[0.16em] text-white/40">
              <span>Proveedor</span>
              <span>RUC</span>
              <span>Fecha</span>
              <span>Factura</span>
              <span>Total</span>
              <span>Estado</span>
            </div>

            {batchItems.map((item, index) => {
              const parsed = item.parsed;
              const provider = parsed?.proveedor || parsed?.razonSocialEmisor || "Proveedor no identificado";
              const ruc = parsed?.ruc || parsed?.rucEmisor || "—";
              const date = parsed?.fecha || parsed?.fechaEmision || "—";
              const amount = parsed?.total ?? parsed?.montoTotal;
              const itemStatus = getItemStatus(item);

              return (
                <div
                  key={`${provider}-${index}`}
                  className="grid min-w-[920px] grid-cols-[1.7fr_120px_130px_140px_140px_120px] border-b border-white/6 px-4 py-4 text-sm text-white/75 last:border-b-0"
                >
                  <span className="font-medium text-white">{provider}</span>
                  <span>{ruc}</span>
                  <span>{date}</span>
                  <span>{formatInvoiceNumber(item)}</span>
                  <span>{formatAmount(amount)}</span>
                  <span className="capitalize">{itemStatus}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-sm leading-6 text-white/45">
            Los lotes antiguos pueden no tener detalle por factura. Procesá y exportá un lote nuevo para ver la tabla completa.
          </div>
        )}
      </div>
    </div>
  );
}
