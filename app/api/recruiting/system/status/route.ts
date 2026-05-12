import { getRecruitingRequestContext } from "@/lib/recruiting/authContext";
import { getRecruitingEnvironmentStatus } from "@/lib/recruiting/envCheck";
import { requireRecruitingAdmin } from "@/lib/recruiting/rbac";
import { getRateLimitBackend } from "@/lib/recruiting/rateLimit";
import { runRecruitingSecurityAudit } from "@/lib/recruiting/securityAudit";
import { checkRecruitingStorageBuckets } from "@/lib/recruiting/storageHealth";
import { ensureVectorSearchReady } from "@/lib/recruiting/vectorSearch";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const context = await getRecruitingRequestContext(request);
    if (!context.tenantId) {
      return Response.json({ success: false, error: "tenantId is required" }, { status: 400 });
    }

    await requireRecruitingAdmin({ tenantId: context.tenantId, userId: context.userId });

    const [environment, storage, vectorSearch, securityAudit] = await Promise.all([
      Promise.resolve(getRecruitingEnvironmentStatus()),
      checkRecruitingStorageBuckets(),
      ensureVectorSearchReady(),
      runRecruitingSecurityAudit(context.tenantId),
    ]);

    return Response.json({
      success: true,
      status: {
        ready: environment.ready && storage.ready,
        environment,
        storage,
        vectorSearch,
        rateLimit: {
          backend: getRateLimitBackend(),
          redisConfigured: Boolean(process.env.REDIS_URL),
        },
        emailProvider: process.env.RESEND_API_KEY ? "resend" : "stub",
        calendarConfigured: Boolean(
          process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        ),
        securityAudit: {
          status: securityAudit.status,
          checks: securityAudit.checks.length,
        },
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "unknown_error" },
      { status: 500 },
    );
  }
}
