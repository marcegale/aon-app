import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_PROMPT = 8000;

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

  const trimmed = prompt.trim();
  const preview = trimmed.length > 80 ? trimmed.slice(0, 80) + "…" : trimmed;
  const mockResponse = `[MOCK] Recibí: "${preview}". Fase 2A activa — respuesta simulada. Fase 2B conectará el modelo IA desde el backend.`;

  return NextResponse.json({ ok: true, response: mockResponse, mode: "mock" });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_METHOD", message: "Method not allowed." } },
    { status: 405 }
  );
}
