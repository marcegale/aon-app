import { NeuralBrainBackground } from "./neural-brain-background";

type PublicBackgroundProps = {
  variant?: "default" | "hero";
};

export function PublicBackground({
  variant = "default",
}: PublicBackgroundProps) {
  const isHero = variant === "hero";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,162,77,0.16),_transparent_22%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_20%_80%,_rgba(168,85,247,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#020817_45%,_#030712_100%)]" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:60px_60px]" />

      {/* Glow blobs */}
      <div className="absolute left-[-10%] top-[-15%] h-[36rem] w-[36rem] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute right-[-8%] top-[5%] h-[28rem] w-[28rem] rounded-full bg-[#C9A24D]/20 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[35%] h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/15 blur-3xl" />

      {/* Brain */}
      <div
        className={`absolute inset-0 z-[1] transition-opacity ${
          isHero ? "opacity-100" : "opacity-70"
        }`}
      >
        <div
          className={`absolute inset-0 transition-transform ${
            isHero ? "scale-110" : "scale-100"
          }`}
        >
          {!isHero && <NeuralBrainBackground compact />}
        </div>
      </div>

      {/* Rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[52rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[2] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

      {/* Particles */}
      <div className="absolute left-[10%] top-[18%] z-[3] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.9)]" />
      <div className="absolute right-[14%] top-[24%] z-[3] h-2 w-2 rounded-full bg-[#E7C980] shadow-[0_0_20px_rgba(231,201,128,0.9)]" />
      <div className="absolute bottom-[16%] left-[16%] z-[3] h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_20px_rgba(240,171,252,0.9)]" />
      <div className="absolute bottom-[24%] right-[20%] z-[3] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.9)]" />

      {/* Blend overlay */}
      <div
        className={`absolute inset-0 z-[4] ${
          isHero
            ? "bg-[radial-gradient(circle_at_center,transparent_28%,rgba(2,8,23,0.12)_68%,rgba(2,8,23,0.36)_100%)]"
            : "bg-[radial-gradient(circle_at_center,transparent_35%,rgba(2,8,23,0.22)_70%,rgba(2,8,23,0.5)_100%)]"
        }`}
      />
    </div>
  );
}