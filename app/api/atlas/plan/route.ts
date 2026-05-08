import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Phase 0 stub.
// Phase 2 implementation: receive { prompt, context? }, call Claude with
// tool-use schema, return structured plan. Never exposes API keys to client.
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — Atlas Phase 0 skeleton", phase: 0 },
    { status: 501 }
  );
}
