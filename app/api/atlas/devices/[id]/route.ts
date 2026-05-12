import { NextResponse } from "next/server";
import {
  revokeAtlasDeviceForUser,
  type AtlasDeviceListItem,
  type RevokeAtlasDeviceResult,
} from "../../_lib/atlasDeviceStore.ts";

export const runtime = "nodejs";

// ── Auth helper (dynamic import keeps next/headers out of test bundle) ────────

async function getAuthenticatedUserId(_request: Request): Promise<string | null> {
  try {
    const { createServerSupabaseClient } = await import("../../../../../lib/supabase/server-auth.ts");
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
type RevokeFn = (id: string, supabaseUserId: string) => Promise<RevokeAtlasDeviceResult>;

type DeviceIdDeps = {
  getAuthenticatedUserId: GetUserIdFn;
  revokeAtlasDeviceForUser: RevokeFn;
};

type RouteContext = { params: { id: string } | Promise<{ id: string }> };

// ── Factory ───────────────────────────────────────────────────────────────────

export function createDeviceDeleteHandler(
  deps: DeviceIdDeps = { getAuthenticatedUserId, revokeAtlasDeviceForUser },
) {
  return async function DELETE(request: Request, context: RouteContext): Promise<Response> {
    const { id } = await Promise.resolve(context.params);

    if (typeof id !== "string" || id.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_REQUEST", message: "Device ID is required." } },
        { status: 400 },
      );
    }

    const userId = await deps.getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHENTICATED", message: "Authentication required." } },
        { status: 401 },
      );
    }

    const result = await deps.revokeAtlasDeviceForUser(id.trim(), userId);

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return NextResponse.json(
          { ok: false, error: { code: "DEVICE_NOT_FOUND", message: "Device not found." } },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { ok: false, error: { code: "DEVICE_STORE_UNAVAILABLE", message: "Device store unavailable." } },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { ok: true, device: toApiDevice(result.device) },
      { status: 200 },
    );
  };
}

export const DELETE = createDeviceDeleteHandler();

export async function GET() {
  return NextResponse.json(
    { ok: false, error: { code: "INVALID_METHOD", message: "Method not allowed." } },
    { status: 405 },
  );
}
