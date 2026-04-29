"use client";

import { useEffect, useState } from "react";

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

export default function RecentHistoryCard() {
  const [items, setItems] = useState<HistoryBatch[]>([]);

  useEffect(() => {
    function syncHistory() {
      setItems(readHistory().slice(0, 3));
    }

    syncHistory();
    const interval = window.setInterval(syncHistory, 1500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Histórico reciente
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            Últimos lotes
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/45">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-white/45">
          Aún no hay lotes exportados.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-[#0B0D12]/60 p-3"
            >
              <p className="truncate text-sm font-medium text-white">
                {item.client}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {item.total} facturas · {item.validated} validadas
              </p>
              <p className="mt-1 text-xs text-white/30">{item.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
