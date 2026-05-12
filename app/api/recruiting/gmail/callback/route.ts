import { NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/app/lib/prisma";
import { createGoogleOAuthClient } from "@/lib/recruiting/gmailOAuth";
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateValue = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  try {
    if (oauthError) {
      return NextResponse.json(
        { success: false, error: oauthError },
        { status: 400 },
      );
    }

    if (!code || !stateValue) {
      return NextResponse.json(
        { success: false, error: "code and state are required" },
        { status: 400 },
      );
    }

    const state = verifyRecruitingOAuthState(stateValue);
    const tenant = await prisma.tenant.findUnique({
      where: { id: state.tenantId },
      select: { id: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 },
      );
    }

    if (state.searchId) {
      const search = await prisma.recruitingSearch.findFirst({
        where: { id: state.searchId, tenantId: state.tenantId },
        select: { id: true },
      });

      if (!search) {
        return NextResponse.json(
          { success: false, error: "Recruiting search not found for tenant" },
          { status: 404 },
        );
      }
    }

    const auth = createGoogleOAuthClient(req.url);
    const { tokens } = await auth.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.json(
        {
          success: false,
          error: "Google did not return a refresh token. Reconnect with consent.",
        },
        { status: 400 },
      );
    }

    auth.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth });
    const { data: profile } = await oauth2.userinfo.get();
    const emailAddress = profile.email;

    if (!emailAddress) {
      return NextResponse.json(
        { success: false, error: "Google account email was not returned" },
        { status: 400 },
      );
    }

    const connection = await prisma.recruitingEmailConnection.create({
      data: {
        tenantId: state.tenantId,
        searchId: state.searchId,
        provider: "gmail",
        emailAddress,
        googleRefreshToken: encryptRecruitingToken(tokens.refresh_token),
        status: "active",
      },
      select: {
        id: true,
        emailAddress: true,
      },
    });

    if (state.returnTo) {
      return redirectWithStatus(req.url, state.returnTo, {
        gmailConnected: "1",
        connectionId: connection.id,
      });
    }

    return NextResponse.json({
      success: true,
      connection,
    });
  } catch (error) {
    console.error("GET /api/recruiting/gmail/callback error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
