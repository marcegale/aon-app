import type React from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { prisma } from "@/app/lib/prisma";
import { theme, status as statusTokens } from "@/app/styles/theme";

function formatDate(date: Date) {
  return date.toLocaleString("es-PY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatCost(cost: number | null) {
  if (cost == null) return "—";
  return `$${cost.toFixed(6)}`;
}

function statusClass(s: string) {
  if (s === "success") return statusTokens.success.text;
  if (s === "error") return statusTokens.error.text;
  return statusTokens.warning.text;
}

export default async function AdminUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user?.email) redirect("/login");

  const params = await searchParams;
  const from       = typeof params.from     === "string" && params.from     ? params.from     : undefined;
  const to         = typeof params.to       === "string" && params.to       ? params.to       : undefined;
  const agentId    = typeof params.agentId  === "string" && params.agentId  ? params.agentId  : undefined;
  const userId     = typeof params.userId   === "string" && params.userId   ? params.userId   : undefined;
  const tenantId   = typeof params.tenantId === "string" && params.tenantId ? params.tenantId : undefined;
  const statusFilter = typeof params.status === "string" && params.status   ? params.status   : undefined;

  const where: {
    createdAt?: { gte?: Date; lte?: Date };
    agentId?: string;
    userId?: string;
    tenantId?: string;
    status?: string;
  } = {};
  if (from)         where.createdAt = { ...where.createdAt, gte: new Date(from) };
  if (to)           where.createdAt = { ...where.createdAt, lte: new Date(to) };
  if (agentId)      where.agentId   = agentId;
  if (userId)       where.userId    = userId;
  if (tenantId)     where.tenantId  = tenantId;
  if (statusFilter) where.status    = statusFilter;

  const [summary, successCount, errorCount, byAgent, byUser, byTenant, latest] =
    await Promise.all([
      prisma.agentRun.aggregate({
        where,
        _count: { id: true },
        _sum:   { tokens: true, cost: true },
      }),
      prisma.agentRun.count({ where: { ...where, status: "success" } }),
      prisma.agentRun.count({ where: { ...where, status: "error" } }),
      prisma.agentRun.groupBy({
        by: ["agentId"],
        where,
        _count: { id: true },
        _sum:   { tokens: true, cost: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.agentRun.groupBy({
        by: ["userId"],
        where,
        _count: { id: true },
        _sum:   { tokens: true, cost: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }),
      prisma.agentRun.groupBy({
        by: ["tenantId"],
        where,
        _count: { id: true },
        _sum:   { tokens: true, cost: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }),
      prisma.agentRun.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          createdAt: true,
          agentId: true,
          userId: true,
          status: true,
          tokens: true,
          cost: true,
        },
      }),
    ]);

  const totalRuns   = summary._count.id;
  const totalTokens = summary._sum.tokens ?? 0;
  const totalCost   = summary._sum.cost   ?? 0;

  const cards = [
    { label: "Total runs",    value: totalRuns },
    { label: "Exitosas",      value: successCount },
    { label: "Fallidas",      value: errorCount },
    { label: "Tokens",        value: totalTokens.toLocaleString("es-PY") },
    { label: "Costo total",   value: `$${totalCost.toFixed(4)}` },
  ];

  return (
    <div className="min-h-screen p-8" style={{ background: theme.admin.bg, color: theme.admin.text }}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em]" style={{ color: theme.admin.accent }}>
          Nexa Core Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Usage Analytics</h1>
        <p className="mt-2 text-sm" style={{ color: theme.admin.textMuted }}>
          Resumen de ejecuciones de agentes IA por período.
        </p>
      </div>

      {/* Filter form */}
      <form
        method="GET"
        className="mb-8 flex flex-wrap items-end gap-3"
      >
        {(
          [
            { name: "from",     label: "Desde",     type: "date",   value: from,     placeholder: undefined, mono: false },
            { name: "to",       label: "Hasta",     type: "date",   value: to,       placeholder: undefined, mono: false },
            { name: "agentId",  label: "Agente",    type: "text",   value: agentId,  placeholder: "invoice-processor", mono: false },
            { name: "userId",   label: "User ID",   type: "text",   value: userId,   placeholder: undefined, mono: true },
            { name: "tenantId", label: "Tenant ID", type: "text",   value: tenantId, placeholder: undefined, mono: true },
          ] as const
        ).map(({ name, label, type, value, placeholder, mono }) => (
          <div key={name} className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: theme.admin.textMuted }}>{label}</label>
            <input
              name={name}
              type={type}
              defaultValue={value ?? ""}
              placeholder={placeholder}
              className={`rounded-lg px-3 py-2 text-sm outline-none w-40 ${mono ? "font-mono" : ""}`}
              style={{
                background: theme.admin.surface,
                border: `1px solid ${theme.admin.border}`,
                color: theme.admin.text,
              }}
            />
          </div>
        ))}

        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: theme.admin.textMuted }}>Estado</label>
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              background: theme.admin.surface,
              border: `1px solid ${theme.admin.border}`,
              color: theme.admin.text,
            }}
          >
            <option value="">Todos</option>
            <option value="success">success</option>
            <option value="error">error</option>
            <option value="started">started</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg px-4 py-2 text-sm font-medium"
          style={{ background: theme.admin.accent, color: theme.admin.text }}
        >
          Filtrar
        </button>
        <a
          href="/admin/usage"
          className="rounded-lg px-4 py-2 text-sm"
          style={{ border: `1px solid ${theme.admin.border}`, color: theme.admin.textMuted }}
        >
          Limpiar
        </a>
      </form>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl p-4"
            style={{ border: `1px solid ${theme.admin.border}`, background: theme.admin.surface }}
          >
            <p className="text-xs" style={{ color: theme.admin.textMuted }}>{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* Aggregation tables */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <AggTable
          title="Por agente"
          keyLabel="Agente"
          rows={byAgent.map((r) => ({
            key:    r.agentId,
            runs:   r._count.id,
            tokens: r._sum.tokens,
            cost:   r._sum.cost,
          }))}
        />
        <AggTable
          title="Por usuario"
          keyLabel="User ID"
          mono
          rows={byUser.map((r) => ({
            key:    r.userId ?? "—",
            runs:   r._count.id,
            tokens: r._sum.tokens,
            cost:   r._sum.cost,
          }))}
        />
        <AggTable
          title="Por tenant"
          keyLabel="Tenant ID"
          mono
          rows={byTenant.map((r) => ({
            key:    r.tenantId ?? "—",
            runs:   r._count.id,
            tokens: r._sum.tokens,
            cost:   r._sum.cost,
          }))}
        />
      </div>

      {/* Latest runs */}
      <div>
        <h2 className="mb-3 text-sm font-medium" style={{ color: theme.admin.textMuted }}>
          Últimas 20 ejecuciones
        </h2>
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
                <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Tokens</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Costo</th>
              </tr>
            </thead>
            <tbody style={{ "--row-hover": theme.admin.surfaceMuted } as React.CSSProperties}>
              {latest.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center" style={{ color: theme.admin.textMuted }}>
                    Sin resultados para los filtros aplicados.
                  </td>
                </tr>
              )}
              {latest.map((run) => (
                <tr
                  key={run.id}
                  className="border-t hover:bg-[var(--row-hover)]"
                  style={{ borderColor: theme.admin.border }}
                >
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: theme.admin.textMuted }}>
                    {formatDate(run.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{run.agentId}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs" style={{ color: theme.admin.textMuted }}>
                    {run.userId ?? "—"}
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
    </div>
  );
}

function AggTable({
  title,
  keyLabel,
  rows,
  mono = false,
}: {
  title: string;
  keyLabel: string;
  rows: { key: string; runs: number; tokens: number | null; cost: number | null }[];
  mono?: boolean;
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium" style={{ color: theme.admin.textMuted }}>
        {title}
      </h2>
      <div
        className="overflow-hidden rounded-2xl"
        style={{ border: `1px solid ${theme.admin.border}`, background: theme.admin.surface }}
      >
        <table className="w-full border-collapse text-sm">
          <thead
            className="text-left"
            style={{ background: theme.admin.surfaceMuted, color: theme.admin.textMuted }}
          >
            <tr>
              <th className="px-4 py-2 whitespace-nowrap">{keyLabel}</th>
              <th className="px-4 py-2 whitespace-nowrap text-right">Runs</th>
              <th className="px-4 py-2 whitespace-nowrap text-right">Tokens</th>
              <th className="px-4 py-2 whitespace-nowrap text-right">Costo</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-xs" style={{ color: theme.admin.textMuted }}>
                  Sin datos
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.key} className="border-t" style={{ borderColor: theme.admin.border }}>
                <td
                  className={`px-4 py-2 ${mono ? "font-mono text-xs" : "font-medium"}`}
                  style={{ color: mono ? theme.admin.textMuted : undefined }}
                >
                  {row.key}
                </td>
                <td className="px-4 py-2 text-right" style={{ color: theme.admin.textMuted }}>
                  {row.runs}
                </td>
                <td className="px-4 py-2 text-right" style={{ color: theme.admin.textMuted }}>
                  {row.tokens ?? "—"}
                </td>
                <td className="px-4 py-2 text-right" style={{ color: theme.admin.textMuted }}>
                  {row.cost != null ? `$${row.cost.toFixed(4)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
