import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const MAX_PROMPT = 8000;
const AI_TIMEOUT_MS = 25_000;

const SYSTEM_PROMPT =
  "Eres Atlas, un asistente inteligente de escritorio. " +
  "Responde de forma clara, directa y concisa. " +
  "No uses markdown innecesario. No inventes datos.";

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

  const expectedKey = process.env.ATLAS_DEV_DEVICE_KEY;
  if (expectedKey) {
    if (device_key !== expectedKey) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_DEVICE_KEY", message: "Invalid device key." } },
        { status: 401 }
      );
    }
  } else {
    console.warn("[atlas/plan] ATLAS_DEV_DEVICE_KEY not set — accepting without key validation");
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
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!response) {
      return NextResponse.json(
        { ok: false, error: { code: "AI_UNAVAILABLE", message: "No response from AI." } },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true, response, mode: "ai" });
  } catch (err: unknown) {
    const isRateLimit =
      err instanceof OpenAI.APIError && (err.status === 429 || err.status === 503);
    const isTimeout =
      err instanceof OpenAI.APIConnectionTimeoutError ||
      (err instanceof Error && err.name === "APIConnectionTimeoutError");

    const logLabel = isTimeout ? "timeout" : isRateLimit ? "rate_limit" : "error";
    console.error(`[atlas/plan] AI ${logLabel}`);

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
