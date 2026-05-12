import { NextResponse } from "next/server";
import { validateStartBody } from "../_lib/registrationValidation.ts";
import {
  createPendingRegistration,
  type CreateRegistrationInput,
  type StoreResult,
  type RegistrationRecord,
} from "../../../_lib/atlasRegistrationStore.ts";

export const runtime = "nodejs";

type CreatePendingFn = (
  input: CreateRegistrationInput,
) => Promise<StoreResult<RegistrationRecord>>;

type StartDeps = { createPendingRegistration: CreatePendingFn };

export function createStartPostHandler(
  deps: StartDeps = { createPendingRegistration },
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

    const validation = validateStartBody(body);
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: validation.error },
        { status: 400 },
      );
    }

    const b = body as { device_code: string; platform: string; client_version?: string };

    const result = await deps.createPendingRegistration({
      device_code: b.device_code,
      platform: b.platform,
      clientVersion: b.client_version,
    });

    if (!result.ok) {
      if (result.code === "SECRET_NOT_CONFIGURED") {
        return NextResponse.json(
          { ok: false, error: { code: "NOT_CONFIGURED", message: "Device registration is not configured." } },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { ok: false, error: { code: "REGISTRATION_UNAVAILABLE", message: "Device registration is unavailable. Try again." } },
        { status: 503 },
      );
    }

    const appBase = (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.aigency.com").replace(/\/$/, "");
    return NextResponse.json(
      {
        ok: true,
        expires_at: result.data.expiresAt.toISOString(),
        poll_interval_secs: 5,
        registration_url: `${appBase}/atlas/register?code=${encodeURIComponent(b.device_code)}`,
      },
      { status: 200 },
    );
  };
}

export const POST = createStartPostHandler();

export async function GET() {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_METHOD", message: "Method not allowed." } },
    { status: 405 },
  );
}
