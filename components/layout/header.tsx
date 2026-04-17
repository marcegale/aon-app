export default function Header({
  onToggle,
}: {
  onToggle: () => void;
}) {
  return (
    <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">
      
      {/* Left */}
        <div className="flex items-center gap-3">
        <button
            onClick={onToggle}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
        >
            ☰
        </button>

        <p className="text-sm text-white/50">
            Nexa Core / Platform
        </p>
        </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="text-sm text-white/70">
          Tenant: Demo
        </div>

        <div className="w-8 h-8 rounded-full bg-[#1C2230] flex items-center justify-center text-xs text-white/70">
          DG
        </div>
      </div>

    </div>
  );
}