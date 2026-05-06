import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { prisma } from "@/app/lib/prisma";

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

function statusColor(status: string) {
  if (status === "success") return "text-emerald-300";
  if (status === "error") return "text-red-300";
  return "text-yellow-300";
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
    <div className="min-h-screen bg-[#0B0D12] p-8 text-white">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[#C9A24D]">
          Nexa Core Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Agent Runs</h1>
        <p className="mt-2 text-sm text-white/55">
          Últimas 100 ejecuciones de agentes IA.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111827]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-white/[0.04] text-left text-white/60">
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
                <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                  Sin ejecuciones registradas.
                </td>
              </tr>
            )}
            {runs.map((run) => (
              <tr key={run.id} className="border-t border-white/10 hover:bg-white/[0.02]">
                <td className="px-4 py-3 whitespace-nowrap text-white/70">
                  {formatDate(run.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-white">
                  {run.agentId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-white/50">
                  {run.userId ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-white/50">
                  {run.tenantId ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={statusColor(run.status)}>{run.status}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-white/70">
                  {run.tokens ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-white/70">
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
