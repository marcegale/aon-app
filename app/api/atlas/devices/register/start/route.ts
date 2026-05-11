import { NextResponse } from "next/server";

export const runtime = "nodejs";

const VALID_PLATFORMS = new Set(["windows", "macos", "linux"]);
const DEVICE_CODE_RE  = /^[A-Za-z0-9]{4,16}$/;

function err400(message: string) {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_REQUEST", message } },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err400("Invalid JSON body.");
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return err400("Body must be a JSON object.");
  }

  const { device_code, platform, client_version } = body as Record<string, unknown>;

  if (typeof device_code !== "string" || !DEVICE_CODE_RE.test(device_code)) {
    return err400("device_code must be 4–16 alphanumeric characters.");
  }

  if (typeof platform !== "string" || !VALID_PLATFORMS.has(platform)) {
    return err400("platform must be one of: windows, macos, linux.");
  }

  if (client_version !== undefined && typeof client_version !== "string") {
    return err400("client_version must be a string if provided.");
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
