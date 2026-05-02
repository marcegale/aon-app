// Sports context enrichment for X Agent.
// All ESPN calls are fire-and-forget: failures return empty context without breaking the worker.

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContextSignals = {
  competition_weight: number;
  team_strength_hint: string | null;
  standings_context: string | null;
  playoff_relevance: boolean | null;
  rivalry_hint: string | null;
  score_magnitude: string | null;
};

export type SportsContext = {
  context_signals: ContextSignals;
  importance_adjustment: number;
  importance_reason: string[];
};

export type SportEventInput = {
  sport?: string | null;
  league?: string | null;
  event_type?: string | null;
  importance_score?: number | null;
  normalized_payload?: unknown;
};

const EMPTY_SIGNALS: ContextSignals = {
  competition_weight: 5,
  team_strength_hint: null,
  standings_context: null,
  playoff_relevance: null,
  rivalry_hint: null,
  score_magnitude: null,
};

// ── Standings cache ───────────────────────────────────────────────────────────

type TeamStanding = {
  abbr: string;
  name: string;
  wins: number;
  losses: number;
  seed: number | null;
  conference: string;
};

let _nbaStandingsCache: { data: TeamStanding[]; expiresAt: number } | null = null;

async function fetchNbaStandings(): Promise<TeamStanding[]> {
  if (_nbaStandingsCache && _nbaStandingsCache.expiresAt > Date.now()) {
    return _nbaStandingsCache.data;
  }

  const res = await fetch(
    "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings",
    { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`ESPN standings HTTP ${res.status}`);

  const raw = (await res.json()) as {
    children?: Array<{
      name: string;
      standings?: {
        entries?: Array<{
          team: { abbreviation: string; displayName: string };
          stats?: Array<{ name: string; value: number }>;
        }>;
      };
    }>;
  };

  const standings: TeamStanding[] = [];
  for (const conf of raw.children ?? []) {
    (conf.standings?.entries ?? []).forEach((entry, idx) => {
      const stat = (name: string): number | null =>
        entry.stats?.find((s) => s.name === name)?.value ?? null;
      const wins = stat("wins") ?? stat("W") ?? 0;
      const losses = stat("losses") ?? stat("L") ?? 0;
      const seed = stat("playoffSeed") ?? stat("sortOrder") ?? idx + 1;
      standings.push({
        abbr: entry.team.abbreviation.toUpperCase(),
        name: entry.team.displayName,
        wins,
        losses,
        seed,
        conference: conf.name,
      });
    });
  }

  _nbaStandingsCache = { data: standings, expiresAt: Date.now() + CACHE_TTL_MS };
  return standings;
}

// ── Competition weight ────────────────────────────────────────────────────────

function getCompetitionWeight(league: string): number {
  const l = league.toLowerCase();
  if (l.includes("champions") || l.includes("ucl")) return 10;
  if (l.includes("world cup") || l.includes("mundial fifa") || l.includes("copa mundial")) return 10;
  if (l.includes("libertadores")) return 9;
  if (l.includes("olympics") || l.includes("juegos olímpicos")) return 9;
  if (l.includes("eurocopa") || l.includes("copa america") || l.includes("copa del mundo")) return 8;
  if (l.includes("mundial de clubes") || l.includes("club world cup")) return 8;
  if (l === "formula 1" || l === "f1") return 8;
  if (l.includes("grand slam") || l.includes("atp 1000")) return 8;
  if (l.includes("europa league")) return 7;
  if (l.includes("sudamericana")) return 7;
  if (l.includes("eliminatorias") || l.includes("qualif")) return 7;
  if (
    l.includes("premier league") ||
    l.includes("la liga") ||
    l.includes("bundesliga") ||
    l.includes("serie a")
  )
    return 7;
  if (l === "nba") return 6;
  if (l === "formula 2" || l === "f2") return 5;
  return 5;
}

// ── Score magnitude ───────────────────────────────────────────────────────────

type MagResult = { label: string; adjustment: number; reason: string | null };

function computeScoreMagnitude(
  sport: string,
  payload: Record<string, unknown>
): MagResult | null {
  const diff =
    typeof payload.score_diff === "number" && payload.score_diff > 0
      ? (payload.score_diff as number)
      : null;
  if (diff === null) return null;

  const sp = sport.toLowerCase();

  if (sp === "basketball") {
    if (diff >= 50) return { label: `histórico (+${diff} pts)`, adjustment: 3, reason: `Diferencia histórica de ${diff} puntos` };
    if (diff >= 40) return { label: `paliza extrema (+${diff} pts)`, adjustment: 2, reason: `Paliza de ${diff} puntos` };
    if (diff >= 30) return { label: `dominio total (+${diff} pts)`, adjustment: 2, reason: `Dominio total: ${diff} pts de diferencia` };
    if (diff >= 20) return { label: `dominio (+${diff} pts)`, adjustment: 1, reason: `Dominio claro: ${diff} pts` };
    if (diff >= 10) return { label: `control (+${diff} pts)`, adjustment: 0, reason: null };
    return { label: "parejo", adjustment: 0, reason: null };
  }

  if (sp === "soccer" || sp === "football") {
    if (diff >= 4) return { label: `goleada (+${diff} goles)`, adjustment: 2, reason: `Goleada por ${diff} goles` };
    if (diff >= 3) return { label: `dominio (+${diff} goles)`, adjustment: 1, reason: `Dominio claro por ${diff} goles` };
    if (diff >= 2) return { label: `control (+${diff} goles)`, adjustment: 0, reason: null };
    return { label: "parejo", adjustment: 0, reason: null };
  }

  return null;
}

// ── Rivalry detection ─────────────────────────────────────────────────────────

const NBA_RIVALRIES: Array<[string, string, string]> = [
  ["LAL", "BOS", "Rivalidad histórica Lakers-Celtics"],
  ["LAL", "LAC", "Derbi de Los Ángeles"],
  ["MIA", "NYK", "Clásico del Este Miami-NY"],
  ["BOS", "PHI", "Rivalidad del Este"],
  ["BOS", "NYK", "Clásico del Este Celtics-Knicks"],
  ["GSW", "CLE", "Rivalidad de las Finals 2015-2018"],
  ["LAL", "SAC", "Clásico del Pacífico"],
  ["CHI", "DET", "Rivalidad histórica Bulls-Pistons"],
  ["OKC", "GSW", "Rivalidad Duran-Durant"],
];

const SOCCER_RIVALRIES: Array<[string[], string[], string]> = [
  [["boca"], ["river"], "Superclásico argentino"],
  [["real madrid"], ["barcelona"], "El Clásico español"],
  [["olimpia"], ["cerro"], "Clásico paraguayo"],
  [["celtic"], ["rangers"], "Old Firm Derby"],
  [["manchester united"], ["liverpool"], "Clásico inglés United-Liverpool"],
  [["ac milan", "milan"], ["inter"], "Derby della Madonnina"],
  [["flamengo"], ["fluminense"], "Fla-Flu"],
  [["river"], ["racing"], "Clásico del Gran Buenos Aires"],
  [["santos"], ["corinthians"], "Clásico alvinegro"],
];

function detectRivalry(sport: string, payload: Record<string, unknown>): string | null {
  const sp = sport.toLowerCase();
  const homeAbbr = (payload.home_abbr as string | null)?.toUpperCase() ?? "";
  const awayAbbr = (payload.away_abbr as string | null)?.toUpperCase() ?? "";
  const homeName = (payload.home_team as string | null)?.toLowerCase() ?? "";
  const awayName = (payload.away_team as string | null)?.toLowerCase() ?? "";

  if (sp === "basketball" && homeAbbr && awayAbbr) {
    for (const [t1, t2, label] of NBA_RIVALRIES) {
      if (
        (homeAbbr === t1 && awayAbbr === t2) ||
        (homeAbbr === t2 && awayAbbr === t1)
      ) {
        return label;
      }
    }
  }

  if ((sp === "soccer" || sp === "football") && (homeName || awayName)) {
    for (const [t1words, t2words, label] of SOCCER_RIVALRIES) {
      const h1 = t1words.some((w) => homeName.includes(w));
      const h2 = t2words.some((w) => homeName.includes(w));
      const a1 = t1words.some((w) => awayName.includes(w));
      const a2 = t2words.some((w) => awayName.includes(w));
      if ((h1 && a2) || (h2 && a1)) return label;
    }
  }

  return null;
}

// ── NBA-specific API enrichment ───────────────────────────────────────────────

async function enrichNba(
  ctx: SportsContext,
  payload: Record<string, unknown>
): Promise<void> {
  const homeAbbr = (payload.home_abbr as string | null)?.toUpperCase();
  const awayAbbr = (payload.away_abbr as string | null)?.toUpperCase();
  const isPlayoff = payload.is_playoff === true;

  if (!homeAbbr && !awayAbbr) return;

  const standings = await fetchNbaStandings();
  const home = homeAbbr ? standings.find((s) => s.abbr === homeAbbr) ?? null : null;
  const away = awayAbbr ? standings.find((s) => s.abbr === awayAbbr) ?? null : null;

  // Build standings text
  const parts: string[] = [];
  for (const [team, abbr] of [
    [home, homeAbbr],
    [away, awayAbbr],
  ] as [TeamStanding | null, string | undefined][]) {
    if (team) {
      const rec = `${team.wins}-${team.losses}`;
      const pos = team.seed ? ` #${team.seed} ${team.conference}` : "";
      parts.push(`${abbr} ${rec}${pos}`);
    }
  }
  if (parts.length > 0) {
    ctx.context_signals.standings_context = parts.join(" | ");
  }

  // Playoff relevance
  if (isPlayoff) {
    ctx.context_signals.playoff_relevance = true;
    ctx.importance_adjustment += 2;
    ctx.importance_reason.push("Partido de playoff NBA");
  } else {
    const homeInPlayoffs = home?.seed != null && home.seed <= 10;
    const awayInPlayoffs = away?.seed != null && away.seed <= 10;
    const homeTop6 = home?.seed != null && home.seed <= 6;
    const awayTop6 = away?.seed != null && away.seed <= 6;

    if (homeTop6 && awayTop6) {
      ctx.context_signals.playoff_relevance = true;
      ctx.importance_adjustment += 1;
      ctx.importance_reason.push("Duelo directo entre clasificados a playoffs");
    } else if (homeInPlayoffs || awayInPlayoffs) {
      ctx.context_signals.playoff_relevance = true;
    }
  }

  // Team strength
  if (home && away) {
    const avgWins = (home.wins + away.wins) / 2;
    if (avgWins >= 45) {
      ctx.context_signals.team_strength_hint = "Duelo entre equipos de alta tabla";
      ctx.importance_adjustment += 1;
    } else if (avgWins <= 20) {
      ctx.context_signals.team_strength_hint = "Equipos en zona baja";
    }
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function computeSportsContext(
  event: SportEventInput
): Promise<SportsContext> {
  const ctx: SportsContext = {
    context_signals: { ...EMPTY_SIGNALS },
    importance_adjustment: 0,
    importance_reason: [],
  };

  try {
    const sport = (event.sport ?? "").toLowerCase();
    const league = (event.league ?? "").toLowerCase();
    const payload = event.normalized_payload as Record<string, unknown> | null;

    // 1. Competition weight (always — no API)
    const compWeight = getCompetitionWeight(league);
    ctx.context_signals.competition_weight = compWeight;
    if (compWeight >= 9) {
      ctx.importance_adjustment += 2;
      ctx.importance_reason.push(`Competición de máximo nivel (${compWeight}/10)`);
    } else if (compWeight >= 8) {
      ctx.importance_adjustment += 1;
      ctx.importance_reason.push(`Competición de alto nivel (${compWeight}/10)`);
    }

    // 2. Score magnitude from payload (no API)
    if (payload) {
      const mag = computeScoreMagnitude(sport, payload);
      if (mag) {
        ctx.context_signals.score_magnitude = mag.label;
        ctx.importance_adjustment += mag.adjustment;
        if (mag.reason) ctx.importance_reason.push(mag.reason);
      }
    }

    // 3. Rivalry detection (static, no API)
    if (payload) {
      const rivalry = detectRivalry(sport, payload);
      if (rivalry) {
        ctx.context_signals.rivalry_hint = rivalry;
        ctx.importance_adjustment += 1;
        ctx.importance_reason.push(`Rivalidad: ${rivalry}`);
      }
    }

    // 4. Sport-specific API enrichment (NBA only for now)
    if (sport === "basketball" && league === "nba" && payload) {
      await enrichNba(ctx, payload);
    }

    // Clamp to [-3, +3] and ensure integer
    ctx.importance_adjustment = Math.round(
      Math.max(-3, Math.min(3, ctx.importance_adjustment))
    );
  } catch {
    // Never throw — return whatever was built
  }

  return ctx;
}
