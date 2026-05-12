import { generateOfferPackage } from "@/lib/recruiting/offers";
import { assertRateLimit, getRateLimitKey } from "@/lib/recruiting/rateLimit";
import { requireRecruitingRole } from "@/lib/recruiting/rbac";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : null;

    if (!tenantId) {
      return Response.json(
        { success: false, error: "tenantId is required" },
        { status: 400 },
      );
    }

    await requireRecruitingRole({ tenantId, userId, permission: "manage_offers" });
    assertRateLimit({ key: getRateLimitKey({ request, tenantId, action: "generate-offer" }), limit: 10 });

    const result = await generateOfferPackage({
      tenantId,
      candidateId: id,
      baseSalary:
        body.baseSalary === undefined || body.baseSalary === null
          ? undefined
          : Number(body.baseSalary),
      variableCompensation:
        body.variableCompensation === undefined || body.variableCompensation === null
          ? null
          : Number(body.variableCompensation),
      equity: typeof body.equity === "string" ? body.equity : null,
      currency: typeof body.currency === "string" ? body.currency : "USD",
      country: typeof body.country === "string" ? body.country : null,
      benefits:
        body.benefits && typeof body.benefits === "object" && !Array.isArray(body.benefits)
          ? body.benefits
          : null,
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "unknown_error",
      },
      { status: 500 },
    );
  }
}
