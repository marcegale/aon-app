type PublicBackgroundProps = {
  variant?: "default" | "hero";
};

export function PublicBackground({
  variant = "default",
}: PublicBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient - forest with terracotta accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,111,59,0.14),_transparent_24%),radial-gradient(circle_at_80%_15%,_rgba(244,235,208,0.06),_transparent_28%),radial-gradient(circle_at_15%_75%,_rgba(201,111,59,0.08),_transparent_32%),linear-gradient(180deg,_#183A37_0%,_#0F2422_55%,_#183A37_100%)]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(244,235,208,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(244,235,208,0.2)_1px,transparent_1px)] [background-size:60px_60px]" />

      {/* Soft glow blobs - forest/terracotta */}
      <div className="absolute left-[-10%] top-[-15%] h-[36rem] w-[36rem] rounded-full bg-[#C96F3B]/10 blur-3xl" />
      <div className="absolute right-[-8%] top-[5%] h-[28rem] w-[28rem] rounded-full bg-[#F4EBD0]/5 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[35%] h-[30rem] w-[30rem] rounded-full bg-[#183A37]/60 blur-3xl" />

      {/* Soft particles - sand/terracotta only */}
      <div className="absolute right-[14%] top-[24%] z-[3] h-2 w-2 rounded-full bg-[#F4EBD0] shadow-[0_0_20px_rgba(244,235,208,0.6)]" />
      <div className="absolute bottom-[24%] right-[20%] z-[3] h-1.5 w-1.5 rounded-full bg-[#C96F3B] shadow-[0_0_20px_rgba(201,111,59,0.7)]" />

      {/* Blend overlay */}
      <div className="absolute inset-0 z-[4] bg-[radial-gradient(circle_at_center,transparent_35%,rgba(15,36,34,0.15)_70%,rgba(15,36,34,0.4)_100%)]" />
    </div>
  );
}
