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

export default function HistoryWorkspace() {
  const [items, setItems] = useState<HistoryBatch[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setItems(readHistory());
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return items;

    return items.filter((item) =>
      `${item.client} ${item.date}`.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-white">
        Histórico de facturas
      </h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar cliente o fecha"
        className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white"
      />

      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <p className="text-white/40">No hay histórico aún</p>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 p-4"
            >
              <p className="text-white">{item.client}</p>
              <p className="text-sm text-white/50">
                {item.total} facturas · {item.validated} validadas
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}