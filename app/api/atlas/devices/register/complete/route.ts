import { NextResponse } from "next/server";
import { validatePollBody } from "../_lib/registrationValidation.ts";
import {
  approveRegistrationByDeviceCode,
  type ApproveRegistrationInput,
  type ApproveResult,
} from "../../../_lib/atlasRegistrationStore.ts";

export const runtime = "nodejs";

// ── Auth helper (dynamic import keeps next/headers out of the test bundle) ────

async function getAuthenticatedUserId(_request: Request): Promise<string | null> {
  try {
    const { createServerSupabaseClient } = await import("../../../../../../lib/supabase/server-auth.ts");
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ── device_name validation ────────────────────────────────────────────────────

function resolveDeviceName(raw: unknown): { ok: true; value: string } | { ok: false } {
  if (raw === undefined || raw === null) return { ok: true, value: "Atlas Desktop" };
  if (typeof raw !== "string") return { ok: false };
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: true, value: "Atlas Desktop" };
  if (trimmed.length > 80) return { ok: false };
  return { ok: true, value: trimmed };
}

// ── DI types ──────────────────────────────────────────────────────────────────

type GetUserIdFn = (request: Request) => Promise<string | null>;
type ApproveFn = (input: ApproveRegistrationInput) => Promise<ApproveResult>;

type CompleteDeps = {
  getAuthenticatedUserId: GetUserIdFn;
  approveRegistrationByDeviceCode: ApproveFn;
};

// ── Factory ───────────────────────────────────────────────────────────────────

export function createCompletePostHandler(
  deps: CompleteDeps = { getAuthenticatedUserId, approveRegistrationByDeviceCode },
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

    const validation = validatePollBody(body);
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: validation.error },
        { status: 400 },
      );
    }

    const b = body as { device_code: string; device_name?: unknown };

    const nameResult = resolveDeviceName(b.device_name);
    if (!nameResult.ok) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_REQUEST", message: "device_name must be a string of 80 characters or fewer." } },
        { status: 400 },
      );
    }

    const userId = await deps.getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Authentication required." } },
        { status: 401 },
      );
    }

    const result = await deps.approveRegistrationByDeviceCode({
      device_code: b.device_code,
      supabaseUserId: userId,
      deviceName: nameResult.value,
    });

    if (result.ok) {
      return NextResponse.json({ ok: true, status: result.status }, { status: 200 });
    }

    const { code } = result;
    if (code === "NOT_FOUND")                  return NextResponse.json({ ok: false, error: { code: "DEVICE_CODE_NOT_FOUND",          message: "Device code not found." } },               { status: 404 });
    if (code === "REGISTRATION_EXPIRED")        return NextResponse.json({ ok: false, error: { code: "REGISTRATION_EXPIRED",           message: "Registration has expired." } },            { status: 409 });
    if (code === "REGISTRATION_ALREADY_APPROVED")   return NextResponse.json({ ok: false, error: { code: "REGISTRATION_ALREADY_APPROVED",   message: "Registration already approved." } },   { status: 409 });
    if (code === "REGISTRATION_ALREADY_COMPLETED")  return NextResponse.json({ ok: false, error: { code: "REGISTRATION_ALREADY_COMPLETED",  message: "Registration already completed." } },  { status: 409 });
    if (code === "REGISTRATION_DENIED")         return NextResponse.json({ ok: false, error: { code: "REGISTRATION_DENIED",            message: "Registration was denied." } },             { status: 409 });
    if (code === "SECRET_NOT_CONFIGURED")       return NextResponse.json({ ok: false, error: { code: "NOT_CONFIGURED",                 message: "Device registration is not configured." } }, { status: 503 });
    return NextResponse.json({ ok: false, error: { code: "REGISTRATION_UNAVAILABLE", message: "Device registration is unavailable. Try again." } }, { status: 503 });
  };
}

export const POST = createCompletePostHandler();

export async function GET() {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_METHOD", message: "Method not allowed." } },
    { status: 405 },
  );
}
