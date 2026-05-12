import { google } from "googleapis";
import { createRecruitingOAuthState } from "@/lib/recruiting/oauthState";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export type GoogleTokenSet = {
  access_token?: string | null;
  refresh_token?: string | null;
  token_type?: string | null;
  scope?: string | null;
  expiry_date?: number | null;
};

function getGoogleRedirectUri() {
  if (!process.env.GOOGLE_REDIRECT_URI) {
    throw new Error("GOOGLE_REDIRECT_URI is required");
  }
  return process.env.GOOGLE_REDIRECT_URI;
}

function createGoogleOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getGoogleRedirectUri(),
  );
}

export function buildGoogleAuthUrl(input: { tenantId: string; userId: string }) {
  const client = createGoogleOAuthClient();
  const state = createRecruitingOAuthState({
    tenantId: input.tenantId,
    userId: input.userId,
    returnTo: "/agents/hr/recruiting",
  });

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: GOOGLE_SCOPES,
    state,
  });
}

export async function exchangeGoogleCodeForTokens(code: string) {
  const client = createGoogleOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens as GoogleTokenSet;
}

export async function getGoogleUserInfo(accessToken: string) {
  const client = createGoogleOAuthClient();
  client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const { data } = await oauth2.userinfo.get();

  if (!data.email || !data.id) {
    throw new Error("Google user info did not include email or id");
  }

  return {
    email: data.email,
    googleAccountId: data.id,
  };
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  const client = createGoogleOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials as GoogleTokenSet;
}
