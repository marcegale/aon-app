import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminOrCron } from "@/lib/x-agent/auth";
import { generateOptions, selectBestOption } from "@/lib/x-agent/generate";
import { sendApprovalEmail } from "@/lib/x-agent/email";
import { computeSportsContext } from "@/lib/x-agent/context";
import type { SportsContext } from "@/lib/x-agent/context";
import { getXAgentSettings } from "@/lib/x-agent/settings";

const MAX_EVENTS_PER_RUN = 5;
const MIN_IMPORTANCE = 4;

type WorkerResult = {
  queued: number;
  generated: number;
  skipped: number;
  errors: string[];
};

type SportsEvent = {
  id: string;
  title: string | null;
  sport: string | null;
  league: string | null;
  event_type: string | null;
  importance_score: number | null;
  normalized_payload: unknown;
  raw_payload: unknown;
};

export async function POST(req: Request) {
  const user = await requireAdminOrCron(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createSupabaseAdminClient();
  const result: WorkerResult = { queued: 0, generated: 0, skipped: 0, errors: [] };

  // ── Phase 1: discover new events and add to queue ────────────────────────────

  const { data: newEvents, error: eventsError } = await supabase
    .from("x_sports_events")
    .select("id, title, sport, league, event_type, importance_score, normalized_payload, raw_payload")
    .eq("status", "new")
    .gte("importance_score", MIN_IMPORTANCE)
    .order("importance_score", { ascending: false })
    .limit(MAX_EVENTS_PER_RUN);

  if (eventsError) {
    return NextResponse.json(
      { ...result, errors: [`Failed to read events: ${eventsError.message}`] },
      { status: 500 }
    );
  }

  for (const event of (newEvents ?? []) as SportsEvent[]) {
    // Skip events with no usable content
    if (shouldSkipEvent(event)) {
      result.skipped++;
      continue;
    }

    // Deduplicate: skip if already queued
    const { count } = await supabase
      .from("x_agent_queue")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id);

    if (count && count > 0) {
      result.skipped++;
      continue;
    }

    const { error: insertError } = await supabase
      .from("x_agent_queue")
      .insert({ event_id: event.id, status: "pending_generation" });

    if (insertError) {
      result.errors.push(`Queue insert for event ${event.id}: ${insertError.message}`);
      continue;
    }

    await supabase
      .from("x_sports_events")
      .update({ status: "queued" })
      .eq("id", event.id);

    result.queued++;
  }

  // Read settings once — fallback to safe defaults if table/column not yet present
  const agentSettings = await getXAgentSettings(user.id);

  // ── Phase 2: generate drafts for queued items ────────────────────────────────

  const { data: queueItems, error: queueError } = await supabase
    .from("x_agent_queue")
    .select("id, event_id")
    .eq("status", "pending_generation")
    .order("created_at", { ascending: true })
    .limit(MAX_EVENTS_PER_RUN);

  if (queueError) {
    result.errors.push(`Failed to read queue: ${queueError.message}`);
    return NextResponse.json(result);
  }

  for (const item of queueItems ?? []) {
    try {
      const { data: event } = await supabase
        .from("x_sports_events")
        .select("title, sport, league, event_type, importance_score, normalized_payload, raw_payload")
        .eq("id", item.event_id)
        .single();

      const ev = event as SportsEvent | null;

      // Skip guard in generation phase too (event may have changed)
      if (!ev || shouldSkipEvent(ev)) {
        result.skipped++;
        await supabase
          .from("x_agent_queue")
          .update({ status: "failed", error_message: "Event skipped: insufficient data" })
          .eq("id", item.id);
        continue;
      }

      // Enrich with sports context (fails gracefully — never throws)
      const sportsCtx = await computeSportsContext(ev);
      const baseImportance = ev.importance_score ?? 0;
      const adjustedImportance = Math.min(10, Math.max(0, baseImportance + sportsCtx.importance_adjustment));

      const topic = buildRichPrompt(ev, sportsCtx);
      const options = await generateOptions(topic);

      const selected = selectBestOption(options, {
        contentType: options[0]?.content_type,
        eventType: ev.event_type ?? undefined,
        importanceScore: adjustedImportance,
      });

      const { data: post, error: postError } = await supabase
        .from("x_posts")
        .insert({
          user_id: user.id,
          content: selected.content,
          image_url: null,
          status: "pending_approval",
        })
        .select("id")
        .single();

      if (postError) {
        result.errors.push(`Post insert for queue ${item.id}: ${postError.message}`);
        await supabase
          .from("x_agent_queue")
          .update({ status: "failed", error_message: postError.message })
          .eq("id", item.id);
        continue;
      }

      await supabase
        .from("x_agent_queue")
        .update({
          status: "pending_approval",
          options,
          selected_option: selected,
          post_id: post.id,
        })
        .eq("id", item.id);

      if (agentSettings.emails_enabled) {
        if (shouldSendApprovalEmail(ev, sportsCtx, adjustedImportance)) {
          console.log("WORKER → calling sendApprovalEmail", post.id);
          try {
            await sendApprovalEmail({ id: post.id, content: selected.content }, options);
          } catch (emailErr: unknown) {
            result.errors.push(
              `Email failed for post ${post.id}: ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`
            );
          }
        } else {
          console.log("WORKER → email skipped (not editorially relevant) for post", post.id);
        }
      } else {
        console.log("WORKER → email skipped (disabled in settings) for post", post.id);
      }

      result.generated++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Generation error for queue ${item.id}: ${msg}`);
      await supabase
        .from("x_agent_queue")
        .update({ status: "failed", error_message: msg })
        .eq("id", item.id);
    }
  }

  return NextResponse.json(result);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_TERMS = [
  "boca", "river", "cerro porteño", "olimpia", "selección paraguaya", "paraguay",
  "lakers", "celtics", "heat", "knicks", "mavericks", "spurs",
  "messi", "cristiano", "ronaldo", "lebron", "curry", "doncic", "wembanyama",
  "alcaraz", "sinner", "verstappen", "colapinto", "durksen",
];

const STRONG_MAGNITUDE_KEYWORDS = ["histórico", "paliza", "dominio total", "goleada"];

function shouldSendApprovalEmail(
  event: SportsEvent,
  sportsCtx: SportsContext,
  adjustedImportance: number
): boolean {
  if (adjustedImportance >= 7) return true;

  const cs = sportsCtx.context_signals;

  const titleLower = (event.title ?? "").toLowerCase();
  if (PRIORITY_TERMS.some((t) => titleLower.includes(t)) && adjustedImportance >= 5) return true;

  if (cs.rivalry_hint && adjustedImportance >= 5) return true;

  const mag = cs.score_magnitude ?? "";
  if (STRONG_MAGNITUDE_KEYWORDS.some((kw) => mag.includes(kw))) return true;

  const payload = event.normalized_payload as Record<string, unknown> | null;
  if (payload?.is_penalties === true) return true;
  if (payload?.is_extra_time === true) return true;

  if (cs.competition_weight >= 7 && adjustedImportance >= 6) return true;

  return false;
}

function shouldSkipEvent(event: SportsEvent): boolean {
  if (!event.title?.trim()) return true;
  if ((event.importance_score ?? 0) < MIN_IMPORTANCE) return true;

  // Skip if both payload and title are too vague (title has fewer than 3 words and no payload)
  const hasPayload =
    event.normalized_payload !== null &&
    event.normalized_payload !== undefined &&
    Object.keys(event.normalized_payload as object).length > 0;

  if (!hasPayload && event.title.trim().split(/\s+/).length < 3) return true;

  return false;
}

function buildRichPrompt(event: SportsEvent, ctx?: SportsContext): string {
  const lines: string[] = ["Evento detectado:"];

  if (event.title) lines.push(`Título: ${event.title}`);
  if (event.sport) lines.push(`Deporte: ${event.sport}`);
  if (event.league) lines.push(`Liga/Competición: ${event.league}`);
  if (event.event_type) lines.push(`Tipo de evento: ${event.event_type}`);
  if (event.importance_score != null) lines.push(`Importancia base: ${event.importance_score}/10`);

  const payload = event.normalized_payload as Record<string, unknown> | null;
  if (payload && Object.keys(payload).length > 0) {
    lines.push("Datos normalizados:");
    for (const [key, val] of Object.entries(payload)) {
      if (val !== null && val !== undefined && val !== "") {
        const display = typeof val === "object" ? JSON.stringify(val) : String(val);
        lines.push(`  ${key}: ${display}`);
      }
    }
  }

  // Include raw_payload description if normalized is absent and raw has a description field
  if (!payload || Object.keys(payload).length === 0) {
    const raw = event.raw_payload as Record<string, unknown> | null;
    const desc = raw?.description ?? raw?.summary ?? raw?.headline;
    if (typeof desc === "string" && desc.trim()) {
      lines.push(`Descripción fuente: ${desc.trim()}`);
    }
  }

  // Inject sports context signals when available
  if (ctx) {
    const { context_signals: cs, importance_reason } = ctx;
    const hasContext =
      cs.standings_context ||
      cs.playoff_relevance !== null ||
      cs.team_strength_hint ||
      cs.rivalry_hint ||
      cs.score_magnitude ||
      cs.competition_weight !== 5 ||
      importance_reason.length > 0;

    if (hasContext) {
      lines.push("Contexto editorial:");
      if (cs.competition_weight !== 5) {
        lines.push(`  Peso competición: ${cs.competition_weight}/10`);
      }
      if (cs.standings_context) {
        lines.push(`  Posiciones en tabla: ${cs.standings_context}`);
      }
      if (cs.playoff_relevance !== null) {
        lines.push(`  Relevancia clasificatoria: ${cs.playoff_relevance ? "alta" : "baja"}`);
      }
      if (cs.team_strength_hint) {
        lines.push(`  Nivel equipos: ${cs.team_strength_hint}`);
      }
      if (cs.rivalry_hint) {
        lines.push(`  Contexto de rivalidad: ${cs.rivalry_hint}`);
      }
      if (cs.score_magnitude) {
        lines.push(`  Magnitud del resultado: ${cs.score_magnitude}`);
      }
      if (importance_reason.length > 0) {
        lines.push(`  Señales clave: ${importance_reason.join(" · ")}`);
      }
    }
  }

  lines.push("");
  lines.push("Reglas: no inventar scores, estadísticas, jugadores, citas ni fechas que no estén en los datos.");
  lines.push("Si el evento es vago, generar opciones cortas y conservadoras.");

  return lines.join("\n");
}
