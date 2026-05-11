// Atlas device authentication helper.
// Single source of truth for device_key validation across all /api/atlas/* routes.
// INVARIANT: device_key and deviceKeyHash are never logged.

import { hashAtlasDeviceKey } from "./atlasDeviceKey.ts";
import {
  findAtlasDeviceByKeyHash as defaultFind,
  touchAtlasDeviceLastSeen as defaultTouch,
  type FindAtlasDeviceResult,
} from "./atlasDeviceStore.ts";

export type AtlasAuthMode = "dev" | "open" | "prod";

export type AtlasDeviceAuthResult =
  | {
      ok: true;
      mode: AtlasAuthMode;
      deviceId?: string;
      supabaseUserId?: string;
    }
  | {
      ok: false;
      httpStatus: 401 | 503;
      code: "INVALID_DEVICE_KEY" | "DEVICE_REVOKED" | "DEVICE_AUTH_UNAVAILABLE";
      message: string;
    };

// ── DI ────────────────────────────────────────────────────────────────────────

type AuthDeps = {
  findAtlasDeviceByKeyHash: (hash: string) => Promise<FindAtlasDeviceResult>;
  touchAtlasDeviceLastSeen: (deviceId: string) => Promise<void>;
};

const defaultDeps: AuthDeps = {
  findAtlasDeviceByKeyHash: (hash) => defaultFind(hash),
  touchAtlasDeviceLastSeen: (id)   => defaultTouch(id),
};

// ── getAtlasAuthMode ──────────────────────────────────────────────────────────

/**
 * Returns the current auth mode:
 *   "dev"  — ATLAS_DEV_DEVICE_KEY is set; plaintext comparison
 *   "open" — no key configured, non-production env; accept with warning
 *   "prod" — no dev key, production env; validates against AtlasDevice DB
 */
export function getAtlasAuthMode(): AtlasAuthMode {
  if (process.env.ATLAS_DEV_DEVICE_KEY) return "dev";
  if (process.env.NODE_ENV !== "production") return "open";
  return "prod";
}

// ── validateAtlasDeviceKey ────────────────────────────────────────────────────

/**
 * Validates the device_key from a request body.
 * Never logs the raw device_key or deviceKeyHash.
 */
export async function validateAtlasDeviceKey(
  device_key: unknown,
  deps: AuthDeps = defaultDeps,
): Promise<AtlasDeviceAuthResult> {
  const mode = getAtlasAuthMode();

  // ── dev mode ────────────────────────────────────────────────────────────────
  if (mode === "dev") {
    const expected = process.env.ATLAS_DEV_DEVICE_KEY!;
    if (typeof device_key !== "string" || device_key !== expected) {
      return { ok: false, httpStatus: 401, code: "INVALID_DEVICE_KEY", message: "Invalid device key." };
    }
    return { ok: true, mode: "dev" };
  }

  // ── open mode ───────────────────────────────────────────────────────────────
  if (mode === "open") {
    console.warn("[atlas] ATLAS_DEV_DEVICE_KEY not set — accepting without key validation");
    return { ok: true, mode: "open" };
  }

  // ── prod mode ───────────────────────────────────────────────────────────────
  if (typeof device_key !== "string" || device_key.trim().length === 0) {
    return { ok: false, httpStatus: 401, code: "INVALID_DEVICE_KEY", message: "Invalid device key." };
  }

  const deviceKeyHash = hashAtlasDeviceKey(device_key);
  const result = await deps.findAtlasDeviceByKeyHash(deviceKeyHash);

  if (!result.ok) {
    return { ok: false, httpStatus: 503, code: "DEVICE_AUTH_UNAVAILABLE", message: "Device authentication unavailable." };
  }

  if (!result.device) {
    return { ok: false, httpStatus: 401, code: "INVALID_DEVICE_KEY", message: "Invalid device key." };
  }

  if (result.device.status !== "active") {
    return { ok: false, httpStatus: 401, code: "DEVICE_REVOKED", message: "Device has been revoked." };
  }

  // Best-effort lastSeenAt update — await so tests can observe the call; errors are swallowed.
  await deps.touchAtlasDeviceLastSeen(result.device.id).catch(() => { /* best-effort */ });

  return {
    ok: true,
    mode: "prod",
    deviceId: result.device.id,
    supabaseUserId: result.device.supabaseUserId,
  };
}
