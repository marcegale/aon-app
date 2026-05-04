import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import SectionHeader from "../../../components/ui/section-header";

const DEFAULT_MONTHLY_LIMIT = 20;

async function getDashboardData() {
  try {
    const authClient = await createServerSupabaseClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) return null;

    const supabase = createSupabaseAdminClient();
    const userId = user.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [limitResult, monthlyResult, totalResult, batchesResult] =
      await Promise.all([
        supabase
          .from("usage_limits")
          .select("monthly_limit, is_blocked")
          .eq("user_id", userId)
          .maybeSingle(),

        supabase
          .from("usage_tracking")
          .select("created_at", { count: "exact" })
          .eq("user_id", userId)
          .gte("created_at", startOfMonth.toISOString()),

        supabase
          .from("usage_tracking")
          .select("created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: true }),

        supabase
          .from("invoice_batches")
          .select("id, client, date, total, validated, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

    const monthlyLimit =
      limitResult.data?.monthly_limit ?? DEFAULT_MONTHLY_LIMIT;
    const usedThisMonth = monthlyResult.count ?? 0;
    const remaining = Math.max(monthlyLimit - usedThisMonth, 0);

    // Build 12-month chart from usage_tracking
    const allEvents = totalResult.data ?? [];
    const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const chartData = Array.from({ length: 12 }, (_, i) => {
      const month = (now.getMonth() - 11 + i + 12) % 12;
      const year = now.getFullYear() + Math.floor((now.getMonth() - 11 + i) / 12);
      const count = allEvents.filter((e) => {
        const d = new Date(e.created_at);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length;
      return { label: monthLabels[month], count };
    });

    const recentBatches = batchesResult.data ?? [];

    return {
      usedThisMonth,
      monthlyLimit,
      remaining,
      chartData,
      recentBatches,
    };
  } catch {
    return null;
  }
}

function StatusBadge({ n }: { n: number }) {
  return (
    <span className="rounded-full bg-[#C96F3B]/10 px-3 py-1 text-xs text-[#F4EBD0]">
      {n} este mes
    </span>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const usedThisMonth = data?.usedThisMonth ?? 0;
  const monthlyLimit = data?.monthlyLimit ?? DEFAULT_MONTHLY_LIMIT;
  const remaining = data?.remaining ?? monthlyLimit;
  const chartData = data?.chartData ?? Array.from({ length: 12 }, (_, i) => ({
    label: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][i],
    count: 0,
  }));
  const recentBatches = data?.recentBatches ?? [];

  const tasaValidacion =
    monthlyLimit > 0
      ? Math.round((usedThisMonth / monthlyLimit) * 100)
      : 0;

  const kpis = [
    {
      label: "Facturas procesadas",
      value: String(usedThisMonth),
      delta: `de ${monthlyLimit} este mes`,
    },
    {
      label: "Capacidad restante",
      value: String(remaining),
      delta: `${monthlyLimit - remaining} utilizadas`,
    },
    {
      label: "Lotes exportados",
      value: String(recentBatches.length > 0 ? recentBatches.length : "—"),
      delta: "últimos registros",
    },
    {
      label: "Uso del plan",
      value: `${tasaValidacion}%`,
      delta: tasaValidacion >= 90 ? "Límite próximo" : "En rango normal",
    },
  ];

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="ai.gency"
        title="Dashboard"
        description="Controlá el procesamiento de facturas, capacidad del plan y actividad reciente."
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[20px] border border-white/10 bg-[#0F2422] p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              {kpi.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">{kpi.value}</p>
            <p className="mt-2 text-xs text-white/50">{kpi.delta}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-[#0F2422] p-6 shadow-xl shadow-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-white/35">
                  Rendimiento
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Facturas procesadas por mes
                </h3>
              </div>
              <StatusBadge n={usedThisMonth} />
            </div>

            <div className="flex h-72 items-end gap-3 rounded-3xl bg-[#0A1E1C] p-5">
              {chartData.map((d) => {
                const heightPx = Math.max(
                  Math.round((d.count / maxCount) * 220),
                  d.count > 0 ? 8 : 2
                );
                return (
                  <div
                    key={d.label}
                    className="flex flex-1 flex-col items-center justify-end gap-3"
                    title={`${d.label}: ${d.count}`}
                  >
                    <div
                      className="w-full rounded-t-2xl bg-gradient-to-t from-[#C96F3B]/70 to-[#C96F3B] shadow-lg"
                      style={{ height: `${heightPx}px` }}
                    />
                    <span className="text-xs text-white/35">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0F2422] p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-white/35">
              Plan
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Uso mensual
            </h3>
            <div className="mt-6 space-y-4">
              {[
                ["Facturas usadas", `${usedThisMonth} / ${monthlyLimit}`],
                ["Disponibles", `${remaining}`],
                [
                  "Estado del plan",
                  remaining === 0 ? "Límite alcanzado" : "Activo",
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-white/55">{k}</span>
                  <span className="text-sm text-white">{v}</span>
                </div>
              ))}
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/60">Progreso mensual</span>
                  <span className="text-white">{tasaValidacion}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      tasaValidacion >= 90 ? "bg-red-400" : "bg-[#C96F3B]"
                    }`}
                    style={{ width: `${Math.min(tasaValidacion, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-[#0F2422] p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-white/35">
                  Histórico
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Lotes recientes
                </h3>
              </div>
              <div className="rounded-full bg-[#C96F3B]/10 px-3 py-1 text-xs text-[#F4EBD0]">
                Últimos 4
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {recentBatches.length > 0 ? (
                recentBatches.map((batch) => {
                  const isValidado =
                    batch.total > 0 && batch.validated >= batch.total;
                  const isParcial = batch.validated > 0 && !isValidado;
                  return (
                    <div
                      key={batch.id}
                      className="rounded-2xl border border-white/6 bg-white/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {batch.client}
                          </p>
                          <p className="mt-1 text-xs text-white/35">
                            {batch.date}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] ${
                            isValidado
                              ? "bg-emerald-500/10 text-emerald-300"
                              : isParcial
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-white/10 text-white/75"
                          }`}
                        >
                          {isValidado
                            ? "Validado"
                            : isParcial
                            ? "Parcial"
                            : "Pendiente"}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-white/50">
                        {batch.validated} / {batch.total} facturas
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-white/40">
                  No hay lotes exportados aún.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0F2422] p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-white/35">
              Acciones
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Accesos rápidos
            </h3>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["Procesar facturas", "/agents/accounting/invoice-processor"],
                ["Ver histórico", "/historico"],
                ["Ajustes", "/settings"],
                ["Assessment", "/assessment"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-white/80 transition hover:bg-white/10"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
