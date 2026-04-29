import type { ReactNode } from "react";

type AgentMetric = {
  label: string;
  value: string;
  helper?: string;
};

type AgentInsight = {
  label: string;
  tone?: "default" | "warning" | "success";
};

type AgentOperatingLayoutProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  children: ReactNode;
  rightPanel?: ReactNode;
  metrics?: AgentMetric[];
  insights?: AgentInsight[];
};

function getInsightClass(tone: AgentInsight["tone"] = "default") {
  if (tone === "warning") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  }

  if (tone === "success") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
  }

  return "border-white/10 bg-white/[0.04] text-white/72";
}

export default function AgentOperatingLayout({
  eyebrow = "Agent Operating Workspace",
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
  rightPanel,
  metrics = [],
  insights = [],
}: AgentOperatingLayoutProps) {
  return (
    <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 xl:flex-row">
      <div className="min-w-0 flex-1 xl:basis-[70%]">
        <div className="mb-5 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(201,162,77,0.14),transparent_34%),linear-gradient(135deg,rgba(28,34,48,0.96),rgba(15,18,26,0.96))] p-6 shadow-2xl shadow-black/25">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#C9A24D]">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">
                  {description}
                </p>
              ) : null}
            </div>

            {(primaryAction || secondaryAction) ? (
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                {secondaryAction}
                {primaryAction}
              </div>
            ) : null}
          </div>

          {metrics.length > 0 ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/42">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {metric.value}
                  </p>
                  {metric.helper ? (
                    <p className="mt-1 text-xs text-white/45">{metric.helper}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111620]/95 p-4 shadow-xl shadow-black/20 md:p-6">
          {children}
        </div>
      </div>

      <aside className="xl:basis-[30%] xl:pl-1">
        <div className="sticky top-20 space-y-4 rounded-[28px] border border-white/10 bg-[#111620]/95 p-5 shadow-xl shadow-black/20">
          {rightPanel ?? (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A24D]">
                  Panel contextual
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Estado del agente
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  Este panel consolida cliente activo, lote, uso, acciones e insights del flujo.
                </p>
              </div>

              {insights.length > 0 ? (
                <div className="space-y-2">
                  {insights.map((insight) => (
                    <div
                      key={insight.label}
                      className={`rounded-2xl border px-3 py-2 text-sm ${getInsightClass(
                        insight.tone
                      )}`}
                    >
                      {insight.label}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/58">
                  Preparado para conectar datos reales del agente sin tocar procesamiento ni auth.
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </section>
  );
}
