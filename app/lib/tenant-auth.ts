import { createHmac, timingSafeEqual } from "crypto";

export type TenantCredentials = {
  username: string;
  password: string;
};

export type TenantSessionPayload = {
  tenantSlug: string;
  username: string;
  issuedAt: number;
  expiresAt: number;
};

export type TenantSessionResult =
  | { ok: true; payload: TenantSessionPayload }
  | { ok: false; reason: string };

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export const tenantSessionCookieName = (slug: string) =>
  `tenant_session_${slug}`;

function getSecret(): string {
  const s = process.env.TENANT_SESSION_SECRET;
  if (!s) throw new Error("TENANT_SESSION_SECRET is not set");
  return s;
}

function getConfig(): Record<string, TenantCredentials> {
  const raw = process.env.TENANT_AUTH_CONFIG;
  if (!raw) throw new Error("TENANT_AUTH_CONFIG is not set");
  try {
    return JSON.parse(raw) as Record<string, TenantCredentials>;
  } catch {
    throw new Error("TENANT_AUTH_CONFIG is not valid JSON");
  }
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.byteLength !== bb.byteLength) return false;
  return timingSafeEqual(ab, bb);
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function verifyTenantCredentials(
  tenantSlug: string,
  username: string,
  password: string,
): boolean {
  const config = getConfig();
  const creds = config[tenantSlug];
  if (!creds) return false;
  return safeEqual(creds.username, username) && safeEqual(creds.password, password);
}

export function createTenantSessionToken(
  tenantSlug: string,
  username: string,
): string {
  const secret = getSecret();
  const now = Date.now();
  const payload: TenantSessionPayload = {
    tenantSlug,
    username,
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(encoded, secret);
  return `${encoded}.${sig}`;
}

export function verifyTenantSessionToken(
  token: string,
  tenantSlug: string,
): TenantSessionResult {
  const secret = getSecret();

  const dot = token.lastIndexOf(".");
  if (dot === -1) return { ok: false, reason: "malformed_token" };

  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  if (!encoded || !sig) return { ok: false, reason: "malformed_token" };

  const expectedSig = sign(encoded, secret);

  try {
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expectedSig, "hex");
    if (
      sigBuf.byteLength !== expBuf.byteLength ||
      !timingSafeEqual(sigBuf, expBuf)
    ) {
      return { ok: false, reason: "invalid_signature" };
    }
  } catch {
    return { ok: false, reason: "invalid_signature" };
  }

  let payload: TenantSessionPayload;
  try {
    payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as TenantSessionPayload;
  } catch {
    return { ok: false, reason: "malformed_payload" };
  }

  if (payload.tenantSlug !== tenantSlug) {
    return { ok: false, reason: "tenant_mismatch" };
  }

  if (typeof payload.expiresAt !== "number" || Date.now() > payload.expiresAt) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload };
}
