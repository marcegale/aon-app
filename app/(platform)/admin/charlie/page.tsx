import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { prisma } from "@/app/lib/prisma";
import { theme } from "@/app/styles/theme";
import { DeviceForm } from "./DeviceForm";

function formatDate(d: Date) {
  return d.toLocaleString("es-PY", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export default async function CharlieAdminPage() {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();

  if (user?.app_metadata?.role !== "admin") redirect("/agents/accounting/invoice-processor");

  const devices = await prisma.charlieDevice.findMany({
    orderBy: { createdAt: "desc" },
  });

  const t = theme.admin;

  const thStyle: React.CSSProperties = {
    padding: "10px 14px",
    textAlign: "left",
    color: t.textMuted,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    borderBottom: `1px solid ${t.border}`,
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: 13,
    color: t.text,
    borderBottom: `1px solid ${t.border}`,
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, padding: "32px 24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Charlie — Gestión de dispositivos</h1>
      <p style={{ color: t.textMuted, fontSize: 13, margin: "0 0 32px" }}>
        Crea un paquete de descarga por usuario. El .exe es el mismo para todos; solo cambia el .env.local.
      </p>

      {/* ── Create form ─────────────────────────────────────────── */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: t.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 16px" }}>
          Nuevo dispositivo
        </h2>
        <DeviceForm />
      </section>

      {/* ── Device table ─────────────────────────────────────────── */}
      <section>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: t.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 16px" }}>
          Dispositivos registrados ({devices.length})
        </h2>

        {devices.length === 0 ? (
          <p style={{ color: t.textMuted, fontSize: 13 }}>Ningún dispositivo aún.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: t.surface, borderRadius: 8, overflow: "hidden" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Usuario</th>
                  <th style={thStyle}>Device key</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Creado</th>
                  <th style={thStyle}>Revocado</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.id}>
                    <td style={tdStyle}>{d.userName}</td>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12, color: t.textMuted }}>
                      {d.deviceKey.slice(0, 14)}…
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background: d.status === "active" ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
                        color: d.status === "active" ? "#34d399" : "#f87171",
                      }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: t.textMuted }}>{formatDate(d.createdAt)}</td>
                    <td style={{ ...tdStyle, color: t.textMuted }}>
                      {d.revokedAt ? formatDate(d.revokedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
