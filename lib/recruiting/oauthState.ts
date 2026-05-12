import { createHmac, timingSafeEqual } from "crypto";

type RecruitingOAuthState = {
  tenantId: string;
  searchId?: string;
  userId?: string;
  returnTo?: string;
  exp: number;
};

function getStateSecret() {
  const secret =
    process.env.RECRUITING_OAUTH_STATE_SECRET ||
    process.env.APP_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Missing OAuth state secret");
  }

  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getStateSecret()).update(payload).digest("base64url");
}

export function createRecruitingOAuthState(input: {
  tenantId: string;
  searchId?: string | null;
  userId?: string | null;
  returnTo?: string | null;
}) {
  const state: RecruitingOAuthState = {
    tenantId: input.tenantId,
    searchId: input.searchId ?? undefined,
    userId: input.userId ?? undefined,
    returnTo: input.returnTo ?? undefined,
    exp: Date.now() + 10 * 60 * 1000,
  };
  const payload = Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyRecruitingOAuthState(value: string) {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    throw new Error("Invalid OAuth state");
  }

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new Error("Invalid OAuth state signature");
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as RecruitingOAuthState;
  if (!parsed.tenantId || parsed.exp < Date.now()) {
    throw new Error("Expired OAuth state");
  }

  return parsed;
}
