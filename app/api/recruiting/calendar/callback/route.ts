import { NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/app/lib/prisma";
import { createGoogleCalendarOAuthClient } from "@/lib/recruiting/calendar";
import { verifyRecruitingOAuthState } from "@/lib/recruiting/oauthState";
import { encryptRecruitingToken } from "@/lib/recruiting/tokenCrypto";

export const runtime = "nodejs";

function redirectWithStatus(requestUrl: string, returnTo: string | undefined, params: Record<string, string>) {
  const target = new URL(returnTo || "/agents/hr/recruiting", requestUrl);
  for (const [key, value] of Object.entries(params)) {
    target.searchParams.set(key, value);
  }
  return NextResponse.redirect(target);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateValue = url.searchParams.get("state");

  try {
    if (!code || !stateValue) {
      return NextResponse.json({ success: false, error: "code and state are required" }, { status: 400 });
    }

    const state = verifyRecruitingOAuthState(stateValue);
    const tenant = await prisma.tenant.findUnique({ where: { id: state.tenantId }, select: { id: true } });
    if (!tenant) {
      return NextResponse.json({ success: false, error: "Tenant not found" }, { status: 404 });
    }

    const auth = createGoogleCalendarOAuthClient(request.url);
    const { tokens } = await auth.getToken(code);
    if (!tokens.refresh_token) {
      return NextResponse.json(
        { success: false, error: "Google did not return a refresh token" },
        { status: 400 },
      );
    }

    auth.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth });
    const { data: profile } = await oauth2.userinfo.get();
    const email = profile.email;
    if (!email) {
      return NextResponse.json({ success: false, error: "Google email missing" }, { status: 400 });
    }

    const connection = await prisma.recruitingCalendarConnection.create({
      data: {
        tenantId: state.tenantId,
        userId: state.userId ?? "system",
        provider: "google",
        email,
        encryptedAccessToken: tokens.access_token ? encryptRecruitingToken(tokens.access_token) : null,
        encryptedRefreshToken: encryptRecruitingToken(tokens.refresh_token),
        tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    console.info("calendar.connected", { tenantId: state.tenantId, connectionId: connection.id });

    if (state.returnTo) {
      return redirectWithStatus(request.url, state.returnTo, {
        calendarConnected: "1",
        connectionId: connection.id,
      });
    }

    return NextResponse.json({ success: true, connection: { id: connection.id, email: connection.email } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "unknown_error" },
      { status: 500 },
    );
  }
}
