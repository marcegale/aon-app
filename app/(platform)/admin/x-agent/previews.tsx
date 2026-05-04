export type OverlayData = {
  headline: string;
  subheadline: string;
  competition: string | null;
  status: string | null;
  matches: { home: string; away: string; score: string }[];
  quote: string | null;
  person: string | null;
  teams: string[];
  credits?: string | null;
};

type Props = { imageUrl: string; overlay: OverlayData };

function statusBadgeClass(s: string) {
  const u = s.toUpperCase().trim();
  if (u === "EN VIVO") return "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.55)]";
  if (u === "ENTRETIEMPO" || u === "HT" || u === "DESCANSO") return "bg-amber-400 text-[#0B0D12]";
  return "bg-white/15 text-white backdrop-blur-sm";
}

// ─── Scoreboard ──────────────────────────────────────────────────────────────

export function ScoreboardPreview({ imageUrl, overlay }: Props) {
  const visibleMatches = overlay.matches.filter((m) => m.home || m.away || m.score);
  const hasContent = overlay.competition || overlay.status || visibleMatches.length > 0;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-[#0F2422]">
      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      {/* Subtle edge vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.35)_100%)]" />
      {overlay.credits && (
        <div className="absolute right-2 top-2">
          <span className="text-[9px] text-white/40 [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">📷 {overlay.credits}</span>
        </div>
      )}
      {hasContent && (
        <>
          {/* Soft bottom gradient — covers ~35% */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-2">
            {/* Match rows — score is the dominant element */}
            {visibleMatches.map((m, i) => (
              <div
                key={i}
                className={`flex items-center py-3 ${i > 0 ? "border-t border-white/[0.07]" : ""}`}
              >
                <span className="flex-1 text-right text-[0.9rem] font-semibold tracking-wide text-white/75 [text-shadow:0_1px_5px_rgba(0,0,0,0.7)]">
                  {m.home}
                </span>
                <div className="w-24 shrink-0 text-center">
                  <span className="text-[1.65rem] font-black tabular-nums tracking-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.7)]">
                    {m.score || "–"}
                  </span>
                </div>
                <span className="flex-1 text-left text-[0.9rem] font-semibold tracking-wide text-white/75 [text-shadow:0_1px_5px_rgba(0,0,0,0.7)]">
                  {m.away}
                </span>
              </div>
            ))}
            {/* Competition + status — secondary, below scores */}
            {(overlay.competition || overlay.status) && (
              <div className={`flex items-center justify-between ${visibleMatches.length > 0 ? "mt-1 border-t border-white/[0.07] pt-2.5" : ""}`}>
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/38">
                  {overlay.competition}
                </span>
                {overlay.status && (
                  <span className={`rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${statusBadgeClass(overlay.status)}`}>
                    {overlay.status}
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Quote card ──────────────────────────────────────────────────────────────
// Image hero. Quote sits in the lower third with only a gradient for contrast.
// Gold left bar + quote mark as editorial accents. No opaque containers.

export function QuotePreview({ imageUrl, overlay }: Props) {
  const text = overlay.quote || overlay.headline;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-[#0F2422]">
      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-transparent" />
      {overlay.credits && (
        <div className="absolute right-2 top-2">
          <span className="text-[9px] text-white/40 [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">📷 {overlay.credits}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        <div className="border-l-2 border-[#C96F3B]/70 pl-4">
          <span className="block font-serif text-3xl leading-none text-[#C96F3B] [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">"</span>
          <p className="mt-1 text-[1.05rem] font-bold leading-snug text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.95)]">
            {text}
          </p>
          {overlay.person && (
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
              — {overlay.person}
            </p>
          )}
          {overlay.competition && (
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#C96F3B]/80">
              {overlay.competition}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Player news ─────────────────────────────────────────────────────────────
// Lower-third gradient, image dominant in upper two-thirds.

export function PlayerNewsPreview({ imageUrl, overlay }: Props) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-[#0F2422]">
      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      {overlay.credits && (
        <div className="absolute right-2 top-2">
          <span className="text-[9px] text-white/40 [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">📷 {overlay.credits}</span>
        </div>
      )}
      {overlay.competition && (
        <div className="absolute left-4 top-4">
          <span className="rounded bg-black/45 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm">
            {overlay.competition}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        <p className="text-[1.3rem] font-black leading-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
          {overlay.headline}
        </p>
        {overlay.subheadline && (
          <p className="mt-1.5 text-sm leading-snug text-white/70 [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">
            {overlay.subheadline}
          </p>
        )}
        {overlay.teams.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {overlay.teams.map((t, i) => (
              <span key={i} className="rounded bg-black/40 px-2.5 py-1 text-xs font-semibold text-white/85 backdrop-blur-sm">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
// Full image. Stat in lower third with gold accent bar. No dark overlay on image.

export function StatCardPreview({ imageUrl, overlay }: Props) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-[#0F2422]">
      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      {overlay.credits && (
        <div className="absolute right-2 top-2">
          <span className="text-[9px] text-white/40 [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">📷 {overlay.credits}</span>
        </div>
      )}
      {overlay.competition && (
        <div className="absolute left-5 top-5">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C96F3B] [text-shadow:0_1px_8px_rgba(0,0,0,1)]">
            {overlay.competition}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
        <div className="mb-3 h-0.5 w-8 bg-[#C96F3B]" />
        <p className="text-3xl font-black leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
          {overlay.headline}
        </p>
        {overlay.subheadline && (
          <p className="mt-2.5 text-sm leading-snug text-white/75 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
            {overlay.subheadline}
          </p>
        )}
        {overlay.person && (
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-white/55 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
            {overlay.person}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Breaking news ───────────────────────────────────────────────────────────
// Full image. Thin red banner at top (~8% height). Text in lower third.

export function BreakingNewsPreview({ imageUrl, overlay }: Props) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-[#0F2422]">
      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/80" />
      {overlay.credits && (
        <div className="absolute right-2 top-10">
          <span className="text-[9px] text-white/40 [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">📷 {overlay.credits}</span>
        </div>
      )}
      <div className="absolute left-0 right-0 top-0 bg-red-600/90 px-5 py-2.5">
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">
          Último momento
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        <p className="text-2xl font-black leading-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.75)]">
          {overlay.headline}
        </p>
        {overlay.subheadline && (
          <p className="mt-2 text-sm leading-snug text-white/75 [text-shadow:0_1px_6px_rgba(0,0,0,0.75)]">
            {overlay.subheadline}
          </p>
        )}
        {overlay.competition && (
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
            {overlay.competition}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Background only ─────────────────────────────────────────────────────────

export function BackgroundOnlyPreview({ imageUrl, overlay }: Props) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-[#0F2422]">
      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      {overlay.credits && (
        <div className="absolute right-2 top-2">
          <span className="text-[9px] text-white/40 [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">📷 {overlay.credits}</span>
        </div>
      )}
      {overlay.headline && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent px-6 pb-6 pt-20">
          <p className="text-base font-semibold leading-snug text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
            {overlay.headline}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export function GraphicPreview({
  imageUrl,
  visualType,
  overlay,
}: {
  imageUrl: string;
  visualType: string;
  overlay: OverlayData;
}) {
  switch (visualType) {
    case "quote_card":
      return <QuotePreview imageUrl={imageUrl} overlay={overlay} />;
    case "player_news":
    case "collage":
      return <PlayerNewsPreview imageUrl={imageUrl} overlay={overlay} />;
    case "stat_card":
      return <StatCardPreview imageUrl={imageUrl} overlay={overlay} />;
    case "breaking_card":
      return <BreakingNewsPreview imageUrl={imageUrl} overlay={overlay} />;
    case "background_only":
      return <BackgroundOnlyPreview imageUrl={imageUrl} overlay={overlay} />;
    case "scoreboard":
    default:
      return <ScoreboardPreview imageUrl={imageUrl} overlay={overlay} />;
  }
}
