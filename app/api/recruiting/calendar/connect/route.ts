import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createCalendarAuthUrl } from "@/lib/recruiting/calendar";
import { createRecruitingOAuthState } from "@/lib/recruiting/oauthState";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenantId")?.trim() ?? "";
    const userId = url.searchParams.get("userId")?.trim() ?? "system";
    const returnTo = url.searchParams.get("returnTo")?.trim() || null;
    const loginHint = url.searchParams.get("loginHint")?.trim() || null;

    if (!tenantId) {
      return NextResponse.json({ success: false, error: "tenantId is required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
    if (!tenant) {
      return NextResponse.json({ success: false, error: "Tenant not found" }, { status: 404 });
    }

    const state = createRecruitingOAuthState({ tenantId, userId, returnTo });
    return NextResponse.redirect(createCalendarAuthUrl({ requestUrl: request.url, state, loginHint }));
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "unknown_error" },
      { status: 500 },
    );
  }
}
