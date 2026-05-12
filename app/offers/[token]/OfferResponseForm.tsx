"use client";

import { useState } from "react";

export function OfferResponseForm({ token, disabled }: { token: string; disabled: boolean }) {
  const [notes, setNotes] = useState("");
  const [signatureText, setSignatureText] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function respond(response: "accepted" | "rejected") {
    setStatus("Enviando...");
    const result = await fetch(`/api/offers/${token}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response, notes, signatureText }),
    });
    const data = await result.json();
    setStatus(data.success ? `Respuesta registrada: ${data.status}` : data.error ?? "Error");
  }

  return (
    <div className="mt-6 space-y-3">
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Notas para el recruiter"
        className="min-h-24 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white"
        disabled={disabled}
      />
      <input
        value={signatureText}
        onChange={(event) => setSignatureText(event.target.value)}
        placeholder="Firma typed name"
        className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white"
        disabled={disabled}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => respond("accepted")}
          disabled={disabled}
          className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-200 disabled:opacity-50"
        >
          Aceptar
        </button>
        <button
          type="button"
          onClick={() => respond("rejected")}
          disabled={disabled}
          className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
      {status ? <p className="text-sm text-white/60">{status}</p> : null}
    </div>
  );
}
