import type { ReactNode } from "react";

type AgentOperatingLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  rightPanel?: ReactNode;
};

export default function AgentOperatingLayout({
  title,
  description,
  children,
  rightPanel,
}: AgentOperatingLayoutProps) {
  return (
    <section className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 xl:flex-row">
      <div className="min-w-0 flex-1 xl:basis-[70%]">
        <div className="mb-5 rounded-[28px] border border-white/10 bg-[#111620] p-6 shadow-xl shadow-black/20">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#C9A24D]">
            Agent Workspace
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

        <div className="rounded-[28px] border border-white/10 bg-[#111620] p-4 shadow-xl shadow-black/20 md:p-6">
          {children}
        </div>
      </div>

      <aside className="xl:basis-[30%] xl:pl-1">
        <div className="sticky top-20 rounded-[28px] border border-white/10 bg-[#111620] p-5 shadow-xl shadow-black/20">
          {rightPanel ?? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A24D]">
                Panel contextual
              </p>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Cliente activo, lote, uso, acciones e insights del flujo.
              </p>
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}
