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

      // Reset for next device
      setUserName("");
      setDeviceKey(generateKey());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: theme.admin.surfaceMuted,
    border: `1px solid ${theme.admin.border}`,
    color: theme.admin.text,
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 13,
    width: "100%",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    color: theme.admin.textMuted,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: theme.admin.surface,
        border: `1px solid ${theme.admin.border}`,
        borderRadius: 8,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 480,
      }}
    >
      <div>
        <label style={labelStyle}>Nombre del usuario</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="Ej: Juan"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>Device key</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }}
            type="text"
            value={deviceKey}
            onChange={(e) => setDeviceKey(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setDeviceKey(generateKey())}
            style={{
              background: theme.admin.surface,
              border: `1px solid ${theme.admin.border}`,
              color: theme.admin.textMuted,
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Regenerar
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !userName}
        style={{
          background: loading ? theme.admin.surface : theme.admin.accent,
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "10px 20px",
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          opacity: loading || !userName ? 0.6 : 1,
        }}
      >
        {loading ? "Generando..." : "Crear dispositivo y descargar .zip"}
      </button>
    </form>
  );
}
