import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports";
const ESPN_HEADERS = { Accept: "application/json", "User-Agent": "Mozilla/5.0" };

async function requireAdmin() {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

// ── ESPN shared types ─────────────────────────────────────────────────────────

type EspnTeam = {
  displayName: string;
  abbreviation: string;
  shortDisplayName?: string;
};

type EspnCompetitor = {
  homeAway: "home" | "away";
  team: EspnTeam;
  score?: string;
  winner?: boolean;
};

type EspnCompetition = {
  competitors: EspnCompetitor[];
  season?: { type: number; slug?: string }; // type 3 = NBA playoff
};

type EspnStatus = {
  period?: number;
  displayClock?: string;
  type: {
    name: string;        // STATUS_FINAL | STATUS_IN_PROGRESS | STATUS_SCHEDULED | …
    state: string;       // "pre" | "in" | "post"
    completed: boolean;
    description: string;
    shortDetail: string; // "Final" | "Q3 5:23" | "90+2'" | "7/15 - 8:00 PM EDT"
  };
};

type EspnEvent = {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: EspnStatus;
  competitions: EspnCompetition[];
};

type EspnScoreboard = { events?: EspnEvent[] };

// ── Parsed event (shared output type) ────────────────────────────────────────

type ParsedEvent = {
  event_type: "live_score" | "result" | "preview";
  title: string;
  importance_score: number;
  normalized: Record<string, unknown>;
};

// ── Result types ──────────────────────────────────────────────────────────────

type SportResult = {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: string[];
};

type ScrapeResult = {
  nba: SportResult;
  soccer: Record<string, SportResult & { league: string }>;
  totals: { inserted: number; skipped: number; errors: number };
};

// ── Soccer league config ──────────────────────────────────────────────────────

type SoccerLeague = {
  slug: string;
  name: string;
  importanceBonus: number; // added on top of base score (3)
};

const SOCCER_LEAGUES: SoccerLeague[] = [
  { slug: "uefa.champions",      name: "UEFA Champions League",      importanceBonus: 4 },
  { slug: "conmebol.libertadores", name: "Copa Libertadores",         importanceBonus: 3 },
  { slug: "conmebol.sudamericana", name: "Copa Sudamericana",         importanceBonus: 2 },
  { slug: "uefa.europa",         name: "UEFA Europa League",          importanceBonus: 2 },
  { slug: "fifa.cwc",            name: "FIFA Club World Cup",         importanceBonus: 3 },
  { slug: "fifa.world",          name: "Copa Mundial FIFA",           importanceBonus: 5 },
  { slug: "uefa.euro",           name: "Eurocopa UEFA",               importanceBonus: 4 },
  { slug: "conmebol.america",    name: "Copa América CONMEBOL",       importanceBonus: 4 },
  { slug: "conmebol.qualifying", name: "Eliminatorias CONMEBOL",      importanceBonus: 2 },
  { slug: "uefa.qualifying",     name: "Eliminatorias UEFA",          importanceBonus: 1 },
  { slug: "concacaf.qualifying", name: "Eliminatorias CONCACAF",      importanceBonus: 1 },
];

// ── Priority team detection ───────────────────────────────────────────────────

const PRIORITY_KEYWORDS = ["boca", "river", "cerro porteño", "olimpia", "paraguay"];

function hasPriorityTeam(home: string, away: string): boolean {
  const both = `${home} ${away}`.toLowerCase();
  return PRIORITY_KEYWORDS.some((k) => both.includes(k));
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createSupabaseAdminClient();

  const result: ScrapeResult = {
    nba: { fetched: 0, inserted: 0, skipped: 0, errors: [] },
    soccer: {},
    totals: { inserted: 0, skipped: 0, errors: 0 },
  };

  // ── NBA ───────────────────────────────────────────────────────────────────

  try {
    const res = await fetch(`${ESPN_BASE}/basketball/nba/scoreboard`, {
      headers: ESPN_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`ESPN NBA responded ${res.status} ${res.statusText}`);

    const espnData = (await res.json()) as EspnScoreboard;
    const events = espnData.events ?? [];
    result.nba.fetched = events.length;

    for (const event of events) {
      try {
        const parsed = parseNbaEvent(event);
        if (!parsed) {
          result.nba.skipped++;
          continue;
        }

        const gameUrl = `https://www.espn.com/nba/game/_/gameId/${event.id}`;
        const { count } = await supabase
          .from("x_sports_events")
          .select("id", { count: "exact", head: true })
          .eq("source", "espn_nba_scoreboard")
          .eq("url", gameUrl);

        if (count && count > 0) {
          result.nba.skipped++;
          continue;
        }

        const { error: insertError } = await supabase.from("x_sports_events").insert({
          source: "espn_nba_scoreboard",
          sport: "basketball",
          league: "NBA",
          event_type: parsed.event_type,
          title: parsed.title,
          url: gameUrl,
          raw_payload: event,
          normalized_payload: parsed.normalized,
          importance_score: parsed.importance_score,
          status: "new",
        });

        if (insertError) {
          result.nba.errors.push(`Insert failed for game ${event.id}: ${insertError.message}`);
          continue;
        }

        result.nba.inserted++;
      } catch (err: unknown) {
        result.nba.errors.push(
          `Error processing game ${event.id}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  } catch (err: unknown) {
    result.nba.errors.push(
      `ESPN NBA fetch failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // ── Soccer ────────────────────────────────────────────────────────────────

  for (const league of SOCCER_LEAGUES) {
    const leagueResult: SportResult & { league: string } = {
      league: league.name,
      fetched: 0,
      inserted: 0,
      skipped: 0,
      errors: [],
    };
    result.soccer[league.slug] = leagueResult;

    const source = `espn_soccer_${league.slug}`;
    const url = `${ESPN_BASE}/soccer/${league.slug}/scoreboard`;

    try {
      const res = await fetch(url, { headers: ESPN_HEADERS, cache: "no-store" });

      if (res.status === 404) {
        // Competition not in season — not an error
        continue;
      }
      if (!res.ok) {
        leagueResult.errors.push(`ESPN responded ${res.status} for ${league.slug}`);
        continue;
      }

      const espnData = (await res.json()) as EspnScoreboard;
      const events = espnData.events ?? [];
      leagueResult.fetched = events.length;

      for (const event of events) {
        try {
          const parsed = parseSoccerEvent(event, league);
          if (!parsed) {
            leagueResult.skipped++;
            continue;
          }

          const gameUrl = `https://www.espn.com/soccer/game/_/gameId/${event.id}`;
          const { count } = await supabase
            .from("x_sports_events")
            .select("id", { count: "exact", head: true })
            .eq("source", source)
            .eq("url", gameUrl);

          if (count && count > 0) {
            leagueResult.skipped++;
            continue;
          }

          const { error: insertError } = await supabase.from("x_sports_events").insert({
            source,
            sport: "soccer",
            league: league.name,
            event_type: parsed.event_type,
            title: parsed.title,
            url: gameUrl,
            raw_payload: event,
            normalized_payload: parsed.normalized,
            importance_score: parsed.importance_score,
            status: "new",
          });

          if (insertError) {
            leagueResult.errors.push(`Insert failed for game ${event.id}: ${insertError.message}`);
            continue;
          }

          leagueResult.inserted++;
        } catch (err: unknown) {
          leagueResult.errors.push(
            `Error processing game ${event.id}: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    } catch (err: unknown) {
      leagueResult.errors.push(
        `Fetch failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // ── Totals ────────────────────────────────────────────────────────────────

  const soccerValues = Object.values(result.soccer);
  result.totals.inserted =
    result.nba.inserted + soccerValues.reduce((s, r) => s + r.inserted, 0);
  result.totals.skipped =
    result.nba.skipped + soccerValues.reduce((s, r) => s + r.skipped, 0);
  result.totals.errors =
    result.nba.errors.length + soccerValues.reduce((s, r) => s + r.errors.length, 0);

  return NextResponse.json(result);
}

// ── NBA parser ────────────────────────────────────────────────────────────────

function parseNbaEvent(event: EspnEvent): ParsedEvent | null {
  const competition = event.competitions[0];
  if (!competition) return null;

  const statusName = event.status.type.name;
  if (
    statusName === "STATUS_CANCELED" ||
    statusName === "STATUS_POSTPONED" ||
    statusName === "STATUS_SUSPENDED" ||
    statusName === "STATUS_DELAYED"
  )
    return null;

  const home = competition.competitors.find((c) => c.homeAway === "home");
  const away = competition.competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const homeName = home.team.displayName;
  const awayName = away.team.displayName;
  const homeAbbr = home.team.abbreviation;
  const awayAbbr = away.team.abbreviation;

  const state = event.status.type.state;
  const isLive = state === "in";
  const isFinal = state === "post" && event.status.type.completed;
  const isScheduled = state === "pre";

  const homeScore = parseScore(home.score);
  const awayScore = parseScore(away.score);
  const hasScore = homeScore !== null && awayScore !== null && isFinal;

  const period = event.status.period ?? null;
  const clock = event.status.displayClock ?? null;
  const statusText = event.status.type.shortDetail;
  const isPlayoff = (competition.season?.type ?? 2) === 3;

  let title: string;
  if (isFinal && homeScore !== null && awayScore !== null) {
    const winner = homeScore > awayScore ? homeName : awayName;
    const diff = Math.abs(homeScore - awayScore);
    title = `${awayAbbr} ${awayScore} - ${homeScore} ${homeAbbr} (Final)`;
    if (diff >= 20) title = `${winner} aplasta en el cierre. ${title}`;
  } else if (isLive && homeScore !== null && awayScore !== null) {
    title = `${awayAbbr} ${awayScore} - ${homeScore} ${homeAbbr} | ${statusText}`;
  } else {
    title = `${awayName} vs ${homeName}`;
  }

  let score = 3;
  if (isLive) score += 2;
  if (isFinal) score += 2;
  if (hasScore) {
    const diff = Math.abs(homeScore! - awayScore!);
    if (diff >= 40) score += 4;
    else if (diff >= 30) score += 3;
    else if (diff >= 20) score += 2;
  }
  if (isPlayoff) score += 1;
  score = Math.min(score, 10);

  const event_type: ParsedEvent["event_type"] = isLive
    ? "live_score"
    : isFinal
    ? "result"
    : "preview";

  const normalized: Record<string, unknown> = {
    game_id: event.id,
    home_team: homeName,
    home_abbr: homeAbbr,
    away_team: awayName,
    away_abbr: awayAbbr,
    status: statusText,
    is_playoff: isPlayoff,
    date: event.date,
  };
  if (homeScore !== null && (isLive || isFinal)) {
    normalized.home_score = homeScore;
    normalized.away_score = awayScore;
    normalized.score_diff = Math.abs(homeScore - (awayScore ?? 0));
  }
  if (isLive) {
    normalized.period = period;
    normalized.clock = clock;
  }
  if (isScheduled) normalized.scheduled_time = statusText;

  return { event_type, title, importance_score: score, normalized };
}

// ── Soccer parser ─────────────────────────────────────────────────────────────

const SKIP_STATUSES = new Set([
  "STATUS_CANCELED",
  "STATUS_POSTPONED",
  "STATUS_SUSPENDED",
  "STATUS_DELAYED",
]);

function parseSoccerEvent(event: EspnEvent, league: SoccerLeague): ParsedEvent | null {
  const competition = event.competitions[0];
  if (!competition) return null;

  const statusName = event.status.type.name;
  if (SKIP_STATUSES.has(statusName)) return null;

  const home = competition.competitors.find((c) => c.homeAway === "home");
  const away = competition.competitors.find((c) => c.homeAway === "away");
  if (!home || !away) return null;

  const homeName = home.team.displayName;
  const awayName = away.team.displayName;
  const homeAbbr = home.team.abbreviation;
  const awayAbbr = away.team.abbreviation;

  const state = event.status.type.state;
  const isLive = state === "in";
  const isFinal = state === "post" && event.status.type.completed;
  const isScheduled = state === "pre";

  const homeScore = parseScore(home.score);
  const awayScore = parseScore(away.score);
  const hasScore = homeScore !== null && awayScore !== null;

  const statusText = event.status.type.shortDetail;
  const period = event.status.period ?? null;
  const clock = event.status.displayClock ?? null;

  // Period 3/4 = extra time, period 5 = penalties
  const isET = statusName === "STATUS_EXTRA_TIME" || (period != null && period >= 3 && period <= 4);
  const isPK = statusName === "STATUS_PENALTY" || period === 5;

  const priority = hasPriorityTeam(homeName, awayName);

  // Build title
  let title: string;
  if (isFinal && hasScore) {
    const hs = homeScore!;
    const as_ = awayScore!;
    const suffix = isPK ? " (P)" : isET ? " (AET)" : "";
    if (hs > as_) {
      title = `${homeName} gana ${hs}-${as_}${suffix}. ${awayAbbr} ${as_}-${hs} ${homeAbbr} (${league.name})`;
    } else if (as_ > hs) {
      title = `${awayName} gana ${as_}-${hs}${suffix}. ${awayAbbr} ${as_}-${hs} ${homeAbbr} (${league.name})`;
    } else {
      title = `Empate ${hs}-${as_}${suffix}. ${awayAbbr} vs ${homeAbbr} (${league.name})`;
    }
  } else if (isLive && hasScore) {
    title = `${awayAbbr} ${awayScore}-${homeScore} ${homeAbbr} | ${statusText} (${league.name})`;
  } else {
    title = `${awayName} vs ${homeName} (${league.name})`;
  }

  // Importance score
  let score = 3 + league.importanceBonus;
  if (isLive) score += 2;
  if (isFinal) score += 1;
  if (hasScore && (isLive || isFinal)) {
    const diff = Math.abs(homeScore! - awayScore!);
    if (diff >= 4) score += 2;
    else if (diff >= 3) score += 1;
  }
  if (isET || isPK) score += 1;
  if (priority) score += 2;
  score = Math.min(score, 10);

  const event_type: ParsedEvent["event_type"] = isLive
    ? "live_score"
    : isFinal
    ? "result"
    : "preview";

  const normalized: Record<string, unknown> = {
    game_id: event.id,
    home_team: homeName,
    home_abbr: homeAbbr,
    away_team: awayName,
    away_abbr: awayAbbr,
    competition: league.name,
    league: league.name,
    status: statusText,
    date: event.date,
  };

  if (hasScore && (isLive || isFinal)) {
    normalized.home_score = homeScore;
    normalized.away_score = awayScore;
    normalized.score_diff = Math.abs(homeScore! - awayScore!);
  }
  if (isLive) {
    normalized.period = period;
    normalized.clock = clock;
    if (isET) normalized.is_extra_time = true;
    if (isPK) normalized.is_penalties = true;
  }
  if (isScheduled) normalized.start_time = statusText;

  return { event_type, title, importance_score: score, normalized };
}

// ── Shared helper ─────────────────────────────────────────────────────────────

function parseScore(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}
