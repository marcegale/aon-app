"use client";

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

export default function HistoryWorkspace() {
  const [items, setItems] = useState<HistoryBatch[]>([]);
  const [clientQuery, setClientQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [statusQuery, setStatusQuery] = useState("todos");
  const [minTotal, setMinTotal] = useState("");

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

            return (
              <div
                key={item.id}
                className="grid grid-cols-5 border-b border-white/6 px-4 py-4 text-sm text-white/75 last:border-b-0"
              >
                <span className="col-span-2 font-medium text-white">{item.client}</span>
                <span>{item.date}</span>
                <span>{item.total}</span>
                <span className="capitalize">{status}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
