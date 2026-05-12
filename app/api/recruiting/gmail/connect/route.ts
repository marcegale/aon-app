import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createGmailAuthUrl } from "@/lib/recruiting/gmailOAuth";
import { createRecruitingOAuthState } from "@/lib/recruiting/oauthState";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId")?.trim();
    const searchId = url.searchParams.get("searchId")?.trim() || null;
    const returnTo = url.searchParams.get("returnTo")?.trim() || null;
    const loginHint = url.searchParams.get("loginHint")?.trim() || null;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId is required" },
        { status: 400 },
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 },
      );
    }

    if (searchId) {
      const search = await prisma.recruitingSearch.findFirst({
        where: { id: searchId, tenantId },
        select: { id: true },
      });

      if (!search) {
        return NextResponse.json(
          { success: false, error: "Recruiting search not found for tenant" },
          { status: 404 },
        );
      }
    }

    const state = createRecruitingOAuthState({ tenantId, searchId, returnTo });
    const authUrl = createGmailAuthUrl({
      requestUrl: req.url,
      state,
      loginHint,
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("GET /api/recruiting/gmail/connect error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
