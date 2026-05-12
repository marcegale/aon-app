"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AutomationControlActions({
  tenantId,
  searchId,
  ruleId,
  executionId,
  candidateId,
  enabled,
}: {
  tenantId: string;
  searchId: string;
  ruleId?: string;
  executionId?: string;
  candidateId?: string | null;
  enabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post(url: string, body: Record<string, unknown>, label: string, method = "POST") {
    setPending(label);
    setError(null);
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, ...body }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Action failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {ruleId ? (
        <>
          <button
            type="button"
            disabled={pending !== null}
            onClick={() =>
              post(`/api/recruiting/automations/${ruleId}`, { enabled: !enabled }, "toggle", "PATCH")
            }
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 disabled:opacity-50"
          >
            {enabled ? "Desactivar" : "Activar"}
          </button>
          {candidateId ? (
            <button
              type="button"
              disabled={pending !== null}
              onClick={() =>
                post(`/api/recruiting/automations/${ruleId}/run`, { candidateId }, "run")
              }
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 disabled:opacity-50"
            >
              Ejecutar
            </button>
          ) : null}
        </>
      ) : null}
      {executionId ? (
        <button
          type="button"
          disabled={pending !== null}
          onClick={() =>
            post(`/api/recruiting/automation-executions/${executionId}/retry`, {}, "retry")
          }
          className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 disabled:opacity-50"
        >
          Reintentar
        </button>
      ) : null}
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => post(`/api/recruiting/searches/${searchId}/embeddings/backfill`, {}, "backfill")}
        className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs text-sky-200 disabled:opacity-50"
      >
        Backfill embeddings
      </button>
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => post("/api/recruiting/calendar/test", {}, "calendar")}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 disabled:opacity-50"
      >
        Test calendar
      </button>
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => post("/api/recruiting/offers/expire", {}, "expire")}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 disabled:opacity-50"
      >
        Expire offers
      </button>
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => post("/api/recruiting/security-audit", {}, "audit")}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 disabled:opacity-50"
      >
        Security audit
      </button>
      <button
        type="button"
        disabled={pending !== null}
        onClick={() =>
          post(`/api/recruiting/searches/${searchId}/automation-readiness`, {}, "readiness")
        }
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 disabled:opacity-50"
      >
        Validate readiness
      </button>
      {pending ? <span className="text-xs text-white/40">{pending}...</span> : null}
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </div>
  );
}
