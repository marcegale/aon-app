import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Phase 0 stub.
// Phase 2 implementation: create AtlasDevice record in DB, return device_key.
// Admin panel calls this when provisioning a new device for a user.
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented — Atlas Phase 0 skeleton", phase: 0 },
    { status: 501 }
  );
}
