import {
  isPgVectorAvailable,
  searchCandidatesWithJsonFallback,
  searchCandidatesWithPgVector,
} from "@/lib/recruiting/vectorSearch";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = typeof body.tenantId === "string" ? body.tenantId.trim() : "";
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const limit = Number(body.limit ?? 10);

    if (!tenantId || !query) {
      return Response.json(
        { success: false, error: "tenantId and query are required" },
        { status: 400 },
      );
    }

    const vectorAvailable = await isPgVectorAvailable();
    const results = vectorAvailable
      ? await searchCandidatesWithPgVector({
      tenantId,
      query,
      limit: Number.isFinite(limit) ? limit : 10,
        })
      : await searchCandidatesWithJsonFallback({
          tenantId,
          query,
          limit: Number.isFinite(limit) ? limit : 10,
        });

    return Response.json({ success: true, vectorAvailable, results });
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
