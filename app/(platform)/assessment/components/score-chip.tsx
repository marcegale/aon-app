type Props = {
  score: number;
  max: number;
};

export function ScoreChip({ score, max }: Props) {
  const ratio = max > 0 ? score / max : 0;

  const label =
    ratio >= 0.8 ? "Sólido" : ratio >= 0.6 ? "Intermedio" : ratio >= 0.4 ? "Frágil" : "Crítico";

  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
      <div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/40">Score</div>
        <div className="text-sm font-semibold text-white">
          {score} / {max}
        </div>
      </div>
      <div className="h-8 w-px bg-white/10" />
      <div className="text-sm text-[#C9A24D]">{label}</div>
    </div>
  );
}