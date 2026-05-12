"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RecruitingPipelineStage } from "@/generated/prisma/client";

type ActionState = {
  pending: string | null;
  error: string | null;
};

export function CandidatePipelineActions({
  candidateId,
  tenantId,
  latestOfferId,
}: {
  candidateId: string;
  tenantId: string;
  latestOfferId?: string | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>({ pending: null, error: null });
  const [interviewLink, setInterviewLink] = useState<string | null>(null);

  async function postAction(url: string, body: Record<string, unknown>, label: string) {
    setState({ pending: label, error: null });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, ...body }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo completar la accion.");
      }

      setState({ pending: null, error: null });
      router.refresh();
    } catch (error) {
      setState({
        pending: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  function move(stage: RecruitingPipelineStage, label: string) {
    return postAction(
      `/api/recruiting/candidates/${candidateId}/move-stage`,
      { stage },
      label,
    );
  }

  async function createInterview() {
    setState({ pending: "interview", error: null });
    setInterviewLink(null);

    try {
      const response = await fetch(
        `/api/recruiting/candidates/${candidateId}/create-interview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "No se pudo generar la entrevista.");
      }

      setInterviewLink(data.interviewLink);
      setState({ pending: null, error: null });
      router.refresh();
    } catch (error) {
      setState({
        pending: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  async function generateOffer() {
    return postAction(
      `/api/recruiting/candidates/${candidateId}/generate-offer`,
      {},
      "offer",
    );
  }

  async function deliverOffer() {
    if (!latestOfferId) {
      return;
    }

    return postAction(`/api/recruiting/offers/${latestOfferId}/deliver`, {}, "deliver");
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => move("screening", "screening")}
          disabled={state.pending !== null}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Pasar a Screening
        </button>
        <button
          type="button"
          onClick={() =>
            postAction(
              `/api/recruiting/candidates/${candidateId}/decision`,
              { decision: "qualified" },
              "shortlist",
            )
          }
          disabled={state.pending !== null}
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Shortlist
        </button>
        <button
          type="button"
          onClick={() =>
            postAction(
              `/api/recruiting/candidates/${candidateId}/decision`,
              { decision: "rejected", reason: "Marcado desde dashboard" },
              "rejected",
            )
          }
          disabled={state.pending !== null}
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Marcar Rechazado
        </button>
        <button
          type="button"
          onClick={() => move("hired", "hired")}
          disabled={state.pending !== null}
          className="rounded-lg border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-3 py-2 text-xs font-medium text-[#F4EBD0] transition hover:bg-[#C96F3B]/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Marcar Contratado
        </button>
        <button
          type="button"
          onClick={createInterview}
          disabled={state.pending !== null}
          className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Generar entrevista
        </button>
        <button
          type="button"
          onClick={generateOffer}
          disabled={state.pending !== null}
          className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-200 transition hover:bg-sky-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Generar oferta
        </button>
        {latestOfferId ? (
          <button
            type="button"
            onClick={deliverOffer}
            disabled={state.pending !== null}
            className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-200 transition hover:bg-sky-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Enviar oferta
          </button>
        ) : null}
      </div>

      {state.pending ? (
        <p className="text-xs text-white/45">Actualizando {state.pending}...</p>
      ) : null}
      {interviewLink ? (
        <a
          href={interviewLink}
          target="_blank"
          rel="noreferrer"
          className="block text-xs font-medium text-emerald-300"
        >
          Abrir entrevista generada
        </a>
      ) : null}
      {state.error ? <p className="text-xs text-red-300">{state.error}</p> : null}
    </div>
  );
}
