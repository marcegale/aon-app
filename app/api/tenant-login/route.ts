import { NextResponse } from "next/server";
import {
  verifyTenantCredentials,
  createTenantSessionToken,
  tenantSessionCookieName,
} from "@/app/lib/tenant-auth";

const SESSION_SECONDS = 8 * 60 * 60;

export async function POST(req: Request) {
  let tenantSlug: string;
  let username: string;
  let password: string;

  try {
    ({ tenantSlug, username, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!tenantSlug || !username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let isValid: boolean;
  try {
    isValid = verifyTenantCredentials(tenantSlug, username, password);
  } catch (e) {
    console.error("Tenant auth config error:", e);
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  if (!isValid) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  let token: string;
  try {
    token = createTenantSessionToken(tenantSlug, username);
  } catch (e) {
    console.error("Tenant session creation error:", e);
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: tenantSessionCookieName(tenantSlug),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });

  return response;
}
