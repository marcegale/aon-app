import { NextResponse } from "next/server";
import {
  validateAtlasDeviceKey,
} from "../../../_lib/atlasDeviceAuth.ts";

export const runtime = "nodejs";

type ValidateAtlasDeviceKeyFn = typeof validateAtlasDeviceKey;
type AuthCheckDeps = { validateAtlasDeviceKey: ValidateAtlasDeviceKeyFn };

// ── DI factory ────────────────────────────────────────────────────────────────

export function createAuthCheckPostHandler(
  deps: AuthCheckDeps = { validateAtlasDeviceKey },
) {
  return async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
        { status: 400 },
      );
    }

    const { device_key } = body as Record<string, unknown>;
    const auth = await deps.validateAtlasDeviceKey(device_key);

    if (auth.ok) {
      // Return only safe fields — never deviceId, supabaseUserId, or deviceKeyHash.
      return NextResponse.json({ ok: true, status: "active" }, { status: 200 });
    }

    return NextResponse.json(
      { ok: false, error: { code: auth.code, message: auth.message } },
      { status: auth.httpStatus },
    );
  };
}

export const POST = createAuthCheckPostHandler();

export async function GET(): Promise<Response> {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_METHOD", message: "Method not allowed." } },
    { status: 405 },
  );
}
