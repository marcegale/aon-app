"use client";

import { useEffect, useState } from "react";

type EmailAccount = {
  email: string;
  monitoringEnabled: boolean;
  lastSyncedAt?: string | Date | null;
};

const tenantId = "demo-tenant";
const userId = "demo-user";

export function GmailConnectionCard() {
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  async function loadAccount() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/recruiting/email-account?tenantId=${encodeURIComponent(tenantId)}&userId=${encodeURIComponent(userId)}`,
      );
      const data = (await response.json()) as {
        success?: boolean;
        account?: EmailAccount | null;
        error?: string;
      };
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "No se pudo cargar la cuenta Gmail.");
      }
      setAccount(data.account ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar Gmail.");
    } finally {
      setLoading(false);
    }
  }

  async function setMonitoring(enabled: boolean) {
    setActionLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/recruiting/monitor/${enabled ? "start" : "stop"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, userId }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        account?: EmailAccount;
        error?: string;
      };
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "No se pudo actualizar el monitoreo.");
      }
      await loadAccount();
    } catch (monitorError) {
      setError(monitorError instanceof Error ? monitorError.message : "No se pudo actualizar Gmail.");
    } finally {
      setActionLoading(false);
    }
  }

  async function runInboxScan() {
    setActionLoading(true);
    setError(null);
    setScanResult(null);
    try {
      const response = await fetch("/api/recruiting/monitor/run-once", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, userId }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        processedMessages?: number;
        skippedMessages?: number;
        createdCandidates?: number;
        queuedCandidates?: number;
        processingErrors?: string[];
        errors?: string[];
        error?: string;
      };
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "No se pudo escanear inbox.");
      }
      setScanResult(
        `Procesados ${data.processedMessages ?? 0}, creados ${data.createdCandidates ?? 0}, encolados ${data.queuedCandidates ?? 0}, omitidos ${data.skippedMessages ?? 0}, errores ${(data.errors?.length ?? 0) + (data.processingErrors?.length ?? 0)}.`,
      );
      await loadAccount();
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "No se pudo escanear inbox.");
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    void loadAccount();
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F2422]/70 p-6 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">
        Gmail
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">
        Conexion de CVs
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/60">
        Conecta una cuenta Gmail para preparar la ingestion de CVs por email.
      </p>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
        {loading ? (
          "Cargando cuenta..."
        ) : account ? (
          <div className="space-y-2">
            <p className="font-medium text-white">{account.email}</p>
            <p className={account.monitoringEnabled ? "text-emerald-300" : "text-white/50"}>
              {account.monitoringEnabled ? "Monitoreo activo" : "Monitoreo detenido"}
            </p>
          </div>
        ) : (
          "Gmail no conectado"
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      {scanResult ? <p className="mt-3 text-sm text-emerald-200">{scanResult}</p> : null}

      <div className="mt-4 grid gap-3">
        <a
          href={`/api/recruiting/google/connect?tenantId=${encodeURIComponent(tenantId)}&userId=${encodeURIComponent(userId)}`}
          className="rounded-lg border border-[#C96F3B]/25 bg-[#C96F3B]/15 px-4 py-3 text-center text-sm font-medium text-[#F4EBD0] transition hover:bg-[#C96F3B]/20"
        >
          Connect Gmail
        </a>
        {account && !account.monitoringEnabled ? (
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => setMonitoring(true)}
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 disabled:opacity-50"
          >
            {actionLoading ? "Actualizando..." : "Start monitoring"}
          </button>
        ) : null}
        {account?.monitoringEnabled ? (
          <>
            <button
              type="button"
              disabled={actionLoading}
              onClick={runInboxScan}
              className="rounded-lg border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-4 py-3 text-sm font-medium text-[#F4EBD0] disabled:opacity-50"
            >
              {actionLoading ? "Escaneando..." : "Run inbox scan"}
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setMonitoring(false)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/70 disabled:opacity-50"
            >
              {actionLoading ? "Actualizando..." : "Stop monitoring"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
