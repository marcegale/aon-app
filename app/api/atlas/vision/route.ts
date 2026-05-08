import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Phase 0 stub.
// Phase 3 implementation: receive { screenshot_b64, question }, call Claude
// Vision API, return structured visual description. Separate from /plan so
// it can be called independently when context capture is needed.
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — Atlas Phase 0 skeleton", phase: 0 },
    { status: 501 }
  );
}
