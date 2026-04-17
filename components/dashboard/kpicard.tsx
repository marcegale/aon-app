type KpiCardProps = {
  label: string;
  value: string;
  delta: string;
};

export default function KpiCard({
  label,
  value,
  delta,
}: KpiCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#1C2230] p-5 shadow-xl shadow-black/20">
      <p className="text-sm text-white/55">{label}</p>

      <div className="mt-4 flex items-end justify-between">
        <span className="text-3xl font-semibold tracking-tight text-white">
          {value}
        </span>

        <span className="rounded-full bg-[#C9A24D]/10 px-3 py-1 text-xs text-[#E6C676]">
          {delta}
        </span>
      </div>
    </div>
  );
}