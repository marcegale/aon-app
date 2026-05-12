import { NextResponse } from "next/server";
import {
  listAtlasDevicesForUser,
  type AtlasDeviceListItem,
  type ListAtlasDevicesResult,
} from "../_lib/atlasDeviceStore.ts";

export const runtime = "nodejs";

// ── Auth helper (dynamic import keeps next/headers out of test bundle) ────────

async function getAuthenticatedUserId(_request: Request): Promise<string | null> {
  try {
    const { createServerSupabaseClient } = await import("../../../../lib/supabase/server-auth.ts");
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ── Response mapper ───────────────────────────────────────────────────────────

function toApiDevice(d: AtlasDeviceListItem): Record<string, unknown> {
  return {
    id: d.id,
    device_name: d.deviceName,
    status: d.status,
    platform: d.platform,
    client_version: d.clientVersion,
    created_at: d.createdAt,
    last_seen_at: d.lastSeenAt,
    revoked_at: d.revokedAt,
  };
}

// ── DI types ──────────────────────────────────────────────────────────────────

type GetUserIdFn = (request: Request) => Promise<string | null>;
type ListFn = (supabaseUserId: string) => Promise<ListAtlasDevicesResult>;

type DevicesDeps = {
  getAuthenticatedUserId: GetUserIdFn;
  listAtlasDevicesForUser: ListFn;
};

// ── Factory ───────────────────────────────────────────────────────────────────

export function createDevicesGetHandler(
  deps: DevicesDeps = { getAuthenticatedUserId, listAtlasDevicesForUser },
) {
  return async function GET(request: Request): Promise<Response> {
    const userId = await deps.getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Authentication required." } },
        { status: 401 },
      );
    }

    const result = await deps.listAtlasDevicesForUser(userId);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: { code: "DEVICE_STORE_UNAVAILABLE", message: "Device store unavailable." } },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { ok: true, devices: result.devices.map(toApiDevice) },
      { status: 200 },
    );
  };
}

export const GET = createDevicesGetHandler();

export async function POST() {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_METHOD", message: "Method not allowed." } },
    { status: 405 },
  );
}
