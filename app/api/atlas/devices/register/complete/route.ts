import { NextResponse } from "next/server";
import { validatePollBody } from "../_lib/registrationValidation.ts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
      { status: 400 }
    );
  }

  const validation = validatePollBody(body);
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, error: validation.error },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { ok: false, error: { code: "NOT_CONFIGURED", message: "Device registration not available yet." } },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_METHOD", message: "Method not allowed." } },
    { status: 405 }
  );
}
