import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { theme } from "@/app/styles/theme";

export default async function AtlasAdminPage() {
  const auth = await createServerSupabaseClient();
  const { data: { user } } = await auth.auth.getUser();

  if (user?.app_metadata?.role !== "admin") redirect("/agents/accounting/invoice-processor");

  return (
    <div className="min-h-screen p-8" style={{ color: theme.admin.text }}>

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.28em]" style={{ color: theme.admin.accent }}>
          ai.gency Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Atlas</h1>
        <p className="mt-2 text-sm" style={{ color: theme.admin.textMuted }}>
          Asistente desktop moderno para Windows. Consultas, visión de pantalla, acciones locales.
        </p>
      </div>

      {/* Phase 0 placeholder */}
      <div
        className="max-w-md rounded-2xl p-6"
        style={{
          background: theme.admin.surface,
          border: `1px solid ${theme.admin.border}`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
            style={{
              background: "rgba(201,111,59,0.12)",
              color: theme.admin.accent,
            }}
          >
            Fase 0 — Skeleton
          </span>
        </div>
        <p className="text-sm" style={{ color: theme.admin.textMuted }}>
          La gestión de dispositivos Atlas estará disponible a partir de Fase 2.
          El runtime de escritorio y las rutas de API están en construcción.
        </p>

        <div className="mt-6 space-y-2">
          {[
            { label: "Desktop runtime",  status: "skeleton" },
            { label: "FSM + Broker",     status: "listo" },
            { label: "Planner",          status: "stub" },
            { label: "Orb UI",          status: "pendiente Fase 1" },
            { label: "API routes",       status: "stub" },
            { label: "Device manager",   status: "pendiente Fase 2" },
          ].map(({ label, status }) => (
            <div key={label} className="flex justify-between text-xs" style={{ color: theme.admin.textMuted }}>
              <span>{label}</span>
              <span style={{ color: theme.admin.text }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
