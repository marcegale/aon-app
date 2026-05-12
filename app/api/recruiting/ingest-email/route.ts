import { NextResponse } from "next/server";
import { getRecruitingRequestContext } from "@/lib/recruiting/authContext";
import { enqueueGmailCandidateJobs } from "@/lib/recruiting/ingestGmail";
import { assertRateLimit, getRateLimitKey } from "@/lib/recruiting/rateLimit";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      tenantId?: string;
      connectionId?: string;
      maxResults?: number;
      query?: string;
    };

    const { tenantId, userId } = await getRecruitingRequestContext(req, body);
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId is required" },
        { status: 400 },
      );
    }
    assertRateLimit({
      key: getRateLimitKey({ request: req, tenantId, action: "recruiting.ingest-email" }),
      limit: 10,
    });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_candidates" });

    const result = await enqueueGmailCandidateJobs({
      tenantId,
      connectionId: body.connectionId,
      maxResults: body.maxResults,
      query: body.query,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("POST /api/recruiting/ingest-email error:", {
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
