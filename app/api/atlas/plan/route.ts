import { NextResponse } from "next/server";
import OpenAI from "openai";
import { validateAtlasDeviceKey } from "../_lib/atlasDeviceAuth";

export const runtime = "nodejs";

const MAX_PROMPT    = 8000;
const AI_TIMEOUT_MS = 25_000;

// ── Server-side schema guard ─────────────────────────────────────────────────
const KNOWN_TOOLS = new Set(["terminal"]);
const KNOWN_OPERATIONS: Record<string, Set<string>> = {
  terminal: new Set(["run_command"]),
};
const KNOWN_LEVELS = new Set(["PUBLIC", "SENSITIVE", "DESTRUCTIVE"]);

function validateAction(a: unknown): boolean {
  if (typeof a !== "object" || a === null || Array.isArray(a)) return false;
  const o = a as Record<string, unknown>;
  if (typeof o.id !== "string") return false;
  if (typeof o.tool !== "string" || !KNOWN_TOOLS.has(o.tool)) return false;
  if (typeof o.operation !== "string" || !KNOWN_OPERATIONS[o.tool]?.has(o.operation)) return false;
  if (typeof o.permission_level !== "string" || !KNOWN_LEVELS.has(o.permission_level)) return false;
  if (typeof o.params !== "object" || o.params === null) return false;
  const d = o.display as Record<string, unknown> | undefined;
  if (typeof d !== "object" || d === null) return false;
  if (typeof d.title !== "string" || !d.title) return false;
  if (typeof d.description !== "string" || !d.description) return false;
  return true;
}

function validateActionPlan(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const plan = raw as Record<string, unknown>;
  if (!Array.isArray(plan.actions) || plan.actions.length === 0) return null;
  const valid = (plan.actions as unknown[]).filter(validateAction);
  if (valid.length === 0) return null;
  return { ...plan, actions: valid };
}

// ── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Atlas, a smart personal desktop assistant. Always respond with valid JSON.

For general questions, knowledge, calculations, or anything not requiring a local system command:
{"response":"Your answer","action_plan":null}

When the user explicitly asks you to check system information using one of the allowed commands below, use:
{"response":"Brief description of what you will do.","action_plan":{"intent":"Short intent","actions":[{"id":"act-001","tool":"terminal","operation":"run_command","params":{"command":"COMMAND","timeout_secs":10},"permission_level":"SENSITIVE","display":{"title":"Ejecutar comando","description":"COMMAND","warning":null},"requires_result":true}]}}

Allowed commands only (exact, no others):
pwd, whoami, hostname, date, ver, systeminfo, ipconfig, tasklist, "git status", "git --version", "node --version", "python --version", "python3 --version", "npm --version", dir, ls

Strict rules:
- Never suggest cat, type, head, tail, grep, find, wc, du, or any file reading command
- Never use pipes (|), redirections (> or >>), or chaining (&& || ;)
- Never use rm, del, or any destructive command
- permission_level is always "SENSITIVE" for terminal commands
- For all general assistant tasks: action_plan must be null
- Respond in the same language as the user
- Keep response text concise`;

// ── Route ────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_JSON", message: "Invalid JSON body." } },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_JSON", message: "Body must be a JSON object." } },
      { status: 400 }
    );
  }

  const { device_key, prompt } = body as Record<string, unknown>;

  const auth = validateAtlasDeviceKey(device_key);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: { code: auth.code, message: auth.message } },
      { status: auth.httpStatus }
    );
  }

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_PROMPT", message: "Prompt is required." } },
      { status: 400 }
    );
  }

  if (prompt.length > MAX_PROMPT) {
    return NextResponse.json(
      { ok: false, error: { code: "PROMPT_TOO_LONG", message: `Prompt exceeds ${MAX_PROMPT} characters.` } },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("[atlas/plan] OPENAI_API_KEY not set");
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "AI service not configured." } },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: AI_TIMEOUT_MS });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: prompt.trim() },
      ],
      max_tokens: 1024,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      return NextResponse.json(
        { ok: false, error: { code: "AI_UNAVAILABLE", message: "No response from AI." } },
        { status: 503 }
      );
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("[atlas/plan] AI returned non-JSON");
      return NextResponse.json(
        { ok: false, error: { code: "AI_UNAVAILABLE", message: "AI response malformed." } },
        { status: 503 }
      );
    }

    const response    = typeof parsed.response === "string" && parsed.response.trim()
      ? parsed.response.trim()
      : "Listo.";
    const action_plan = parsed.action_plan != null
      ? validateActionPlan(parsed.action_plan)
      : null;

    return NextResponse.json({ ok: true, response, mode: "ai", action_plan });

  } catch (err: unknown) {
    const isRateLimit = err instanceof OpenAI.APIError && (err.status === 429 || err.status === 503);
    const isTimeout   = err instanceof OpenAI.APIConnectionTimeoutError ||
                        (err instanceof Error && err.name === "APIConnectionTimeoutError");
    const label = isTimeout ? "timeout" : isRateLimit ? "rate_limit" : "error";
    console.error(`[atlas/plan] AI ${label}`);
    return NextResponse.json(
      { ok: false, error: { code: "AI_UNAVAILABLE", message: "AI service unavailable. Try again." } },
      { status: 503 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_METHOD", message: "Method not allowed." } },
    { status: 405 }
  );
}
