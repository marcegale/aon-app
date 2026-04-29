"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function HistoryWorkspace() {
  const [items, setItems] = useState<HistoryBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [clientQuery, setClientQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("todos");
  const [minTotal, setMinTotal] = useState("");
  const router = useRouter();

  useEffect(() => {
    setItems(readHistory());
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedClient = clientQuery.trim().toLowerCase();
    const normalizedDate = dateQuery.trim().toLowerCase();
    const minTotalNumber = Number(minTotal || 0);

    return items.filter((item) => {
      const status = getStatus(item);
      const matchesClient = !normalizedClient || item.client.toLowerCase().includes(normalizedClient);
      const matchesDate = !normalizedDate || item.date.toLowerCase().includes(normalizedDate);
      const matchesStatus = statusQuery === "todos" || status === statusQuery;
      const matchesTotal = !minTotal || item.total >= minTotalNumber;

      return matchesClient && matchesDate && matchesStatus && matchesTotal;
    });
  }, [items, clientQuery, dateQuery, statusQuery, minTotal]);

  const selectedBatch = useMemo(() => {
    return items.find((item) => item.id === selectedBatchId) ?? filteredItems[0] ?? null;
  }, [items, selectedBatchId, filteredItems]);

  const activeFilterCount = [clientQuery, dateQuery, statusQuery !== "todos" ? statusQuery : "", minTotal].filter(Boolean).length;

  function clearFilters() {
    setClientQuery("");
    setDateQuery("");
    setStatusQuery("todos");
    setMinTotal("");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(201,162,77,0.16),transparent_34%),linear-gradient(135deg,rgba(28,34,48,0.98),rgba(13,16,24,0.98))] p-6 shadow-2xl shadow-black/25">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#C9A24D]">
          Histórico
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Facturas procesadas
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
          Consulta lotes por cliente, fecha, estado y volumen antes de reexportar.
        </p>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[#111620] p-5">
        <div className="grid gap-3 lg:grid-cols-5">
          <input
            value={clientQuery}
            onChange={(event) => setClientQuery(event.target.value)}
            placeholder="Cliente, RUC o razón social"
            className="rounded-xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C9A24D]/50"
          />
          <input
            value={dateQuery}
            onChange={(event) => setDateQuery(event.target.value)}
            placeholder="Fecha o periodo"
            className="rounded-xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C9A24D]/50"
          />
          <select
            value={statusQuery}
            onChange={(event) => setStatusQuery(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white outline-none transition focus:border-[#C9A24D]/50"
          >
            <option value="todos">Todos los estados</option>
            <option value="validado">Validado</option>
            <option value="parcial">Parcial</option>
            <option value="pendiente">Pendiente</option>
          </select>
          <input
            value={minTotal}
            onChange={(event) => setMinTotal(event.target.value)}
            placeholder="Mín. facturas"
            inputMode="numeric"
            className="rounded-xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C9A24D]/50"
          />
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white active:scale-[0.99]"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45">
          <span className="rounded-full border border-white/10 px-3 py-1">
            {filteredItems.length} resultados
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1">
            {activeFilterCount} filtros activos
          </span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111620]">
          <div className="grid grid-cols-5 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-xs uppercase tracking-[0.16em] text-white/40">
            <span className="col-span-2">Cliente</span>
            <span>Fecha</span>
            <span>Total</span>
            <span>Estado</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-sm leading-6 text-white/45">
              No hay lotes que coincidan con los filtros actuales.
            </div>
          ) : (
            filteredItems.map((item) => {
              const status = getStatus(item);
              const isSelected = selectedBatch?.id === item.id;
            
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(`/historico/${item.id}`)}
                  className={`grid w-full grid-cols-5 border-b border-white/6 px-4 py-4 text-left text-sm transition last:border-b-0 ${
                    isSelected
                      ? "bg-[#C9A24D]/10 text-white"
                      : "text-white/75 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="col-span-2 font-medium text-white">{item.client}</span>
                  <span>{item.date}</span>
                  <span>{item.total}</span>
                  <span className="capitalize">{status}</span>
                </button>
              );
            })
          )}
        </div>

        <aside className="rounded-[24px] border border-[#C9A24D]/20 bg-[#111620] p-5 shadow-xl shadow-black/20">
          {selectedBatch ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A24D]">
                  Detalle del lote
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  {selectedBatch.client}
                </h2>
                <p className="mt-1 text-sm text-white/45">{selectedBatch.date}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">Facturas</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{selectedBatch.total}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/40">Validadas</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{selectedBatch.validated}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Estado</p>
                <p className="mt-2 text-sm font-medium capitalize text-white">
                  {getStatus(selectedBatch)}
                </p>
              </div>

              <button
                type="button"
                className="w-full rounded-xl bg-[#C9A24D] px-4 py-3 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#D8B45F] active:scale-[0.99]"
              >
                Reexportar lote
              </button>

              <p className="text-xs leading-5 text-white/42">
                El detalle por factura se conectará cuando el lote guarde items individuales.
              </p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-white/45">
              Seleccioná un lote para ver el detalle.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
