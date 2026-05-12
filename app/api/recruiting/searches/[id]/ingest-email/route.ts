import { NextResponse } from "next/server";
import { assertSearchTenant } from "@/lib/recruiting/guards";
import { enqueueGmailCandidateJobs } from "@/lib/recruiting/ingestGmail";
import { assertRateLimit, getRateLimitKey } from "@/lib/recruiting/rateLimit";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: RouteContext<"/api/recruiting/searches/[id]/ingest-email">,
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as {
      tenantId?: string;
      connectionId?: string;
      maxResults?: number;
      userId?: string;
    };
    const tenantId = body.tenantId?.trim();

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId is required" },
        { status: 400 },
      );
    }

    assertRateLimit({ key: getRateLimitKey({ request: req, tenantId, action: "ingest-email" }), limit: 10 });
    await requireRecruitingRole({ tenantId, userId: body.userId, permission: "manage_candidates" });
    const search = await assertSearchTenant({ tenantId, searchId: id });

    const result = await enqueueGmailCandidateJobs({
      tenantId,
      connectionId: body.connectionId,
      maxResults: body.maxResults,
      query: `has:attachment newer_than:30d "${search.refCode}"`,
    });

    return NextResponse.json({ success: true, searchId: search.id, refCode: search.refCode, ...result });
  } catch (error) {
    console.error("POST /api/recruiting/searches/[id]/ingest-email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
