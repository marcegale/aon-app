import { assertSearchTenant } from "@/lib/recruiting/guards";
import { assertRateLimit, getRateLimitKey } from "@/lib/recruiting/rateLimit";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";
import { recruitingBulkEmbeddingsTask } from "@/trigger/recruitingBulkEmbeddings";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;
    if (!tenantId) return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    assertRateLimit({ key: getRateLimitKey({ request, tenantId, action: "embeddings.backfill" }), limit: 5 });
    await requireRecruitingRole({ tenantId, userId, permission: "manage_automation" });
    const search = await assertSearchTenant({ tenantId, searchId: id });
    const handle = await recruitingBulkEmbeddingsTask.trigger({ tenantId, searchId: search.id });
    return Response.json({ success: true, handle });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "unknown_error" }, { status: 500 });
  }
}
