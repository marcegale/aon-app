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

  return (
    <div className="min-h-screen p-8" style={{ background: theme.admin.bg, color: theme.admin.text }}>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em]" style={{ color: theme.admin.accent }}>
          Nexa Core Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Charlie — Dispositivos</h1>
        <p className="mt-2 text-sm" style={{ color: theme.admin.textMuted }}>
          Crea un paquete de descarga por usuario. El .exe es el mismo para todos; solo cambia el .env.local.
        </p>
      </div>

      {/* Create form */}
      <section className="mb-12">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: theme.admin.textMuted }}>
          Nuevo dispositivo
        </p>
        <DeviceForm />
      </section>

      {/* Device table */}
      <section>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: theme.admin.textMuted }}>
          Dispositivos registrados ({devices.length})
        </p>

        {devices.length === 0 ? (
          <p className="text-sm" style={{ color: theme.admin.textMuted }}>Ningún dispositivo aún.</p>
        ) : (
          <div
            className="overflow-x-auto rounded-2xl"
            style={{ border: `1px solid ${theme.admin.border}`, background: theme.admin.surface }}
          >
            <table className="w-full border-collapse text-sm">
              <thead
                className="text-left"
                style={{ background: theme.admin.surfaceMuted, color: theme.admin.textMuted }}
              >
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Usuario</th>
                  <th className="px-4 py-3 whitespace-nowrap">Device key</th>
                  <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3 whitespace-nowrap">Creado</th>
                  <th className="px-4 py-3 whitespace-nowrap">Revocado</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t hover:bg-[rgba(244,235,208,0.03)]"
                    style={{ borderColor: theme.admin.border }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{d.userName}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs" style={{ color: theme.admin.textMuted }}>
                      {d.deviceKey.slice(0, 14)}…
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        d.status === "active"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300"
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: theme.admin.textMuted }}>
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: theme.admin.textMuted }}>
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
