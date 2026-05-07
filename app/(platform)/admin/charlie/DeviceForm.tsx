"use client";

import { useState } from "react";
import { theme } from "@/app/styles/theme";

function generateKey() {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `charlie-${hex}`;
}

export function DeviceForm() {
  const [userName, setUserName] = useState("");
  const [deviceKey, setDeviceKey] = useState(generateKey);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/charlie/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, deviceKey }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `charlie-${userName.replace(/[^a-zA-Z0-9_-]/g, "_")}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setUserName("");
      setDeviceKey(generateKey());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md rounded-2xl p-6"
      style={{ background: theme.admin.surface, border: `1px solid ${theme.admin.border}` }}
    >
      {/* User name */}
      <div className="flex flex-col gap-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-[0.06em]"
          style={{ color: theme.admin.textMuted }}
        >
          Nombre del usuario
        </label>
        <input
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{
            background: theme.admin.surfaceMuted,
            border: `1px solid ${theme.admin.border}`,
            color: theme.admin.text,
          }}
          type="text"
          placeholder="Ej: Juan"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
      </div>

      {/* Device key */}
      <div className="flex flex-col gap-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-[0.06em]"
          style={{ color: theme.admin.textMuted }}
        >
          Device key
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md px-3 py-2 font-mono text-xs outline-none"
            style={{
              background: theme.admin.surfaceMuted,
              border: `1px solid ${theme.admin.border}`,
              color: theme.admin.text,
            }}
            type="text"
            value={deviceKey}
            onChange={(e) => setDeviceKey(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setDeviceKey(generateKey())}
            className="rounded-md px-3 py-2 text-xs whitespace-nowrap"
            style={{
              background: theme.admin.surfaceMuted,
              border: `1px solid ${theme.admin.border}`,
              color: theme.admin.textMuted,
              cursor: "pointer",
            }}
          >
            Regenerar
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !userName}
        className="rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: loading || !userName ? theme.admin.surface : theme.admin.accent, cursor: loading ? "default" : "pointer" }}
      >
        {loading ? "Generando..." : "Crear dispositivo y descargar .zip"}
      </button>
    </form>
  );
}
