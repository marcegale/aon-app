"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nexa_active_client";

type ClientSelectionGateProps = {
  children: React.ReactNode;
};

export default function ClientSelectionGate({ children }: ClientSelectionGateProps) {
  const [clientName, setClientName] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDocument, setDraftDocument] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setClientName(saved);
  }, []);

  function handleContinue() {
    if (!canContinue) return;

    const label = `${draftName.trim()} · ${draftDocument.trim()}`;
    window.localStorage.setItem(STORAGE_KEY, label);
    setClientName(label);
  }

  function handleChangeClient() {
    window.localStorage.removeItem(STORAGE_KEY);
    setClientName(null);
  }

  const canContinue = draftName.trim().length > 1 && draftDocument.trim().length > 0;

  return (
    <>
      {clientName ? (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#C9A24D]/20 bg-[#C9A24D]/10 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C9A24D]">Cliente activo</p>
            <p className="mt-1 text-sm font-medium text-white">{clientName}</p>
          </div>
          <button
            type="button"
            onClick={handleChangeClient}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white active:scale-[0.99]"
          >
            Cambiar
          </button>
        </div>
      ) : null}

      {children}

      {!clientName ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070B]/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#111620] p-6 shadow-2xl shadow-black/40">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A24D]">Contexto obligatorio</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">¿Para qué cliente estás trabajando?</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">Cargá un cliente antes de procesar facturas.</p>

            <div className="mt-6 space-y-4">
              <input
                value={draftDocument}
                onChange={(event) => setDraftDocument(event.target.value)}
                placeholder="RUC o CI"
                className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C9A24D]/50"
              />
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Razón social o nombre"
                className="w-full rounded-xl border border-white/10 bg-[#0B0D12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C9A24D]/50"
              />
            </div>

            <button
              type="button"
              disabled={!canContinue}
              onClick={handleContinue}
              className="mt-6 w-full rounded-xl bg-[#C9A24D] px-5 py-3 text-sm font-semibold text-[#0B0D12] transition hover:bg-[#D8B45F] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
            >
              Continuar
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
