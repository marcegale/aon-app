"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type IngestState = "idle" | "scanning" | "queued" | "error";

export function RecruitingInboxActions({
  searchId,
  tenantId,
  refCode,
}: {
  searchId: string;
  tenantId: string;
  refCode: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<IngestState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function refreshInbox() {
    setState("scanning");
    setMessage("Escaneando inbox...");

    try {
      const response = await fetch(`/api/recruiting/searches/${searchId}/ingest-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo actualizar el inbox.");
      }

      setState("queued");
      setMessage(
        `Jobs encolados: ${data.counters?.queued ?? 0}. Escaneados: ${
          data.counters?.scanned ?? 0
        }. Omitidos: ${data.counters?.skipped ?? 0}.`,
      );
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Error desconocido");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
        Monitoreo email
      </p>
      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={refreshInbox}
          disabled={state === "scanning"}
          className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "scanning" ? "Escaneando..." : "Actualizar inbox"}
        </button>

        <Link
          href={`/api/recruiting/gmail/connect?tenantId=${encodeURIComponent(
            tenantId,
          )}&searchId=${encodeURIComponent(searchId)}&returnTo=${encodeURIComponent(
            `/agents/hr/recruiting/${searchId}`,
          )}`}
          className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white/75 transition hover:bg-white/10"
        >
          Conectar Gmail
        </Link>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-5 text-white/55">
          Query enfocada: has:attachment newer_than:30d "{refCode}"
        </div>

        {message ? (
          <p
            className={
              state === "error"
                ? "text-sm leading-6 text-red-300"
                : "text-sm leading-6 text-white/60"
            }
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
