import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // ── Kill switch ──────────────────────────────────────────────────────────
    if (process.env.CHARLIE_ENABLED === "false") {
      console.log("[charlie/session] disabled via CHARLIE_ENABLED=false");
      return NextResponse.json(
        { error: "Charlie is currently disabled." },
        { status: 403 }
      );
    }

    // ── Device auth ──────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const { device_key } = body as { device_key?: string };

    if (!device_key) {
      console.warn("[charlie/session] auth failed — device_key missing");
      return NextResponse.json({ error: "Invalid device key." }, { status: 401 });
    }

    // Check CharlieDevice table first; fall back to env var during transition
    const device = await prisma.charlieDevice.findUnique({
      where: { deviceKey: device_key },
    });

    if (device) {
      if (device.status !== "active") {
        console.warn(`[charlie/session] device ${device.id} is ${device.status}`);
        return NextResponse.json({ error: "Invalid device key." }, { status: 401 });
      }
    } else {
      // Env-var fallback (for local dev / pre-migration devices)
      const allowedKey = process.env.CHARLIE_DEVICE_KEY;
      if (!allowedKey || device_key !== allowedKey) {
        const partial = `${device_key.slice(0, 6)}…`;
        console.warn(`[charlie/session] auth failed — unknown device_key: ${partial}`);
        return NextResponse.json({ error: "Invalid device key." }, { status: 401 });
      }
    }

    const userName = device?.userName ?? "Usuario";

    // ── OpenAI Realtime session creation ─────────────────────────────────────
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.error("[charlie/session] OPENAI_API_KEY not set on server");
      return NextResponse.json({ error: "Server misconfigured." }, { status: 500 });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
      }),
    });

    if (!openaiRes.ok) {
      const detail = await openaiRes.text();
      console.error(`[charlie/session] OpenAI session failed: ${openaiRes.status} ${detail}`);
      return NextResponse.json(
        { error: "Failed to create Realtime session." },
        { status: 502 }
      );
    }

    const session = await openaiRes.json() as {
      id: string;
      expires_at?: number | string | null;
      client_secret: { value: string; expires_at: number };
    };

    // ── Persist session record ────────────────────────────────────────────────
    const record = await prisma.charlieSession.create({
      data: {
        deviceKey:       device_key,
        openaiSessionId: session.id,
        status:          "active",
        expiresAt:       new Date(session.client_secret.expires_at * 1000),
      },
    });

    console.log(`[charlie/session] created ${record.id} for user="${userName}" (openai: ${session.id})`);

    // ── Return ephemeral credentials to client ───────────────────────────────
    // client_secret is short-lived (~60s). Never log it.
    return NextResponse.json({
      session_id:    record.id,
      client_secret: session.client_secret.value,
      expires_at:    session.expires_at,
    });
  } catch (error) {
    console.error("[charlie/session] unhandled error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
