import { NextResponse } from "next/server";
import { upsertGoogleEmailAccount } from "@/lib/recruiting/emailAccounts";
import {
  exchangeGoogleCodeForTokens,
  getGoogleUserInfo,
} from "@/lib/recruiting/google/oauth";
import { verifyRecruitingOAuthState } from "@/lib/recruiting/oauthState";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateValue = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  try {
    if (oauthError) {
      return NextResponse.redirect(new URL(`/agents/hr/recruiting?googleError=${encodeURIComponent(oauthError)}`, request.url));
    }

    if (!code || !stateValue) {
      return NextResponse.json(
        { success: false, error: "code and state are required" },
        { status: 400 },
      );
    }

    const state = verifyRecruitingOAuthState(stateValue);
    if (!state.userId) {
      return NextResponse.json(
        { success: false, error: "OAuth state missing userId" },
        { status: 400 },
      );
    }

    const tokens = await exchangeGoogleCodeForTokens(code);
    if (!tokens.access_token) {
      return NextResponse.json(
        { success: false, error: "Google did not return an access token" },
        { status: 400 },
      );
    }

    const userInfo = await getGoogleUserInfo(tokens.access_token);
    await upsertGoogleEmailAccount({
      tenantId: state.tenantId,
      userId: state.userId,
      email: userInfo.email,
      googleAccountId: userInfo.googleAccountId,
      tokens,
    });

    const target = new URL(state.returnTo || "/agents/hr/recruiting", request.url);
    target.searchParams.set("connected", "1");
    return NextResponse.redirect(target);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "unknown_error" },
      { status: 500 },
    );
  }
}
