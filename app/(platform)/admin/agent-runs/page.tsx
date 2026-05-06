import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { prisma } from "@/app/lib/prisma";
import { theme, status } from "@/app/styles/theme";

function formatDate(date: Date) {
  return date.toLocaleString("es-PY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatCost(cost: number | null) {
  if (cost === null) return "—";
  if (cost === 0) return "$0.000000";
  return `$${cost.toFixed(6)}`;
}

function statusClass(s: string) {
  if (s === "success") return status.success.text;
  if (s === "error")   return status.error.text;
  return status.warning.text;
}

export default async function AgentRunsPage() {
  const authClient = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user?.email) redirect("/login");

  const runs = await prisma.agentRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      agentId: true,
      userId: true,
      tenantId: true,
      status: true,
      tokens: true,
      cost: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen p-8" style={{ background: theme.admin.bg, color: theme.admin.text }}>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em]" style={{ color: theme.admin.accent }}>
          Nexa Core Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Agent Runs</h1>
        <p className="mt-2 text-sm" style={{ color: theme.admin.textMuted }}>
          Últimas 100 ejecuciones de agentes IA.
        </p>
      </div>

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
              <th className="px-4 py-3 whitespace-nowrap">Fecha</th>
              <th className="px-4 py-3 whitespace-nowrap">Agente</th>
              <th className="px-4 py-3 whitespace-nowrap">User ID</th>
              <th className="px-4 py-3 whitespace-nowrap">Tenant ID</th>
              <th className="px-4 py-3 whitespace-nowrap">Estado</th>
              <th className="px-4 py-3 whitespace-nowrap text-right">Tokens</th>
              <th className="px-4 py-3 whitespace-nowrap text-right">Costo</th>
            </tr>
          </thead>
          <tbody>
            {runs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center" style={{ color: theme.admin.textMuted }}>
                  Sin ejecuciones registradas.
                </td>
              </tr>
            )}
            {runs.map((run) => (
              <tr
                key={run.id}
                className="border-t hover:bg-[rgba(244,235,208,0.03)]"
                style={{ borderColor: theme.admin.border }}
              >
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: theme.admin.textMuted }}>
                  {formatDate(run.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium">
                  {run.agentId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs" style={{ color: theme.admin.textMuted }}>
                  {run.userId ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs" style={{ color: theme.admin.textMuted }}>
                  {run.tenantId ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={statusClass(run.status)}>{run.status}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right" style={{ color: theme.admin.textMuted }}>
                  {run.tokens ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right" style={{ color: theme.admin.textMuted }}>
                  {formatCost(run.cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
