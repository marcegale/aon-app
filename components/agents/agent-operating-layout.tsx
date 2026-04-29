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
    <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1 xl:basis-[69%]">
        <div className="mb-5 overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(201,162,77,0.22),transparent_36%),linear-gradient(135deg,rgba(31,38,54,0.98),rgba(12,15,22,0.98))] p-7 shadow-2xl shadow-black/30">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#C9A24D]">
            Agent Workspace
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[#C9A24D]/20 bg-[#C9A24D]/10 px-4 py-3 text-sm text-[#F4D58A]">
              Flujo guiado: cliente → facturas → revisión → exportación
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#F3F1EA]/[0.035] p-3 shadow-2xl shadow-black/25 md:p-4">
          <div className="rounded-[24px] border border-white/8 bg-[#111620] p-4 md:p-5">
            {children}
          </div>
        </div>
      </div>

      <aside className="xl:basis-[31%] xl:pl-1">
        <div className="sticky top-20 rounded-[30px] border border-[#C9A24D]/18 bg-[linear-gradient(180deg,rgba(20,25,36,0.98),rgba(11,13,18,0.98))] p-5 shadow-2xl shadow-black/30">
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
