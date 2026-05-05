"use client";

import { useEffect, useState } from "react";

type HistoryBatch = {
  id: string;
  client: string;
  date: string;
  total: number;
  validated: number;
};

export default function RecentHistoryCard() {
  const [items, setItems] = useState<HistoryBatch[]>([]);

  useEffect(() => {
    fetch("/api/history/batches")
      .then((r) => r.json())
      .then((data) => setItems((data.batches ?? []).slice(0, 3)))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Histórico reciente
          </p>
          <p className="mt-1 text-sm font-medium text-white">Últimos lotes</p>
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
              className="rounded-xl border border-white/10 bg-[#0F2422]/60 p-3"
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
