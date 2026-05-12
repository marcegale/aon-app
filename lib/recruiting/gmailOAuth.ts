import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function getGmailRedirectUri(requestUrl?: string) {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }

  if (!requestUrl) {
    throw new Error("GOOGLE_REDIRECT_URI is required");
  }

  return new URL("/api/recruiting/gmail/callback", requestUrl).toString();
}

export function createGoogleOAuthClient(requestUrl?: string) {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getGmailRedirectUri(requestUrl),
  );
}

export function createGmailAuthUrl(input: {
  requestUrl: string;
  state: string;
  loginHint?: string | null;
}) {
  const client = createGoogleOAuthClient(input.requestUrl);

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: SCOPES,
    state: input.state,
    login_hint: input.loginHint ?? undefined,
  });
}
