type Props = {
  current: number;
  total: number;
  title: string;
  subtitle?: string;
};

export function BlockProgress({ current, total, title, subtitle }: Props) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#C9A24D]">
            Diagnóstico empresarial
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-white/55">{subtitle}</p> : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-right">
          <div className="text-xs uppercase tracking-[0.16em] text-white/40">Progreso</div>
          <div className="text-sm font-semibold text-white">
            {current} / {total}
          </div>
        </div>
      </div>

      <div className="h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-[#C9A24D] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}