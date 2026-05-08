import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Phase 0 stub.
// Phase 2 implementation: validate device_key, issue ephemeral Claude token.
// The desktop never holds API keys — all AI calls are brokered here.
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — Atlas Phase 0 skeleton", phase: 0 },
    { status: 501 }
  );
}
