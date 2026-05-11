// Atlas device authentication helper (Phase 4B)
// Single source of truth for device_key validation across all /api/atlas/* routes.
// INVARIANT: device_key is never logged — do not add logging of the raw value.

export type AtlasAuthMode = "dev" | "open" | "prod";

export type AtlasDeviceAuthResult =
  | {
      ok: true;
      mode: AtlasAuthMode;
      deviceId?: string; // populated in future prod mode
      userId?: string;   // populated in future prod mode
    }
  | {
      ok: false;
      httpStatus: 401 | 503;
      code:
        | "INVALID_DEVICE_KEY"
        | "DEVICE_AUTH_NOT_CONFIGURED"
        | "DEVICE_REVOKED"
        | "DEVICE_PENDING";
      message: string;
    };

/**
 * Returns the current auth mode:
 *   "dev"  — ATLAS_DEV_DEVICE_KEY is set; plaintext comparison
 *   "open" — no key configured, non-production env; accept with warning
 *   "prod" — no dev key, production env; requires DB lookup (stub: 503)
 */
export function getAtlasAuthMode(): AtlasAuthMode {
  if (process.env.ATLAS_DEV_DEVICE_KEY) return "dev";
  if (process.env.NODE_ENV !== "production") return "open";
  return "prod";
}

/**
 * Validates the device_key from a request body.
 * Never logs the raw device_key value.
 */
export function validateAtlasDeviceKey(device_key: unknown): AtlasDeviceAuthResult {
  const mode = getAtlasAuthMode();

  if (mode === "dev") {
    const expected = process.env.ATLAS_DEV_DEVICE_KEY!;
    if (typeof device_key !== "string" || device_key !== expected) {
      return {
        ok: false,
        httpStatus: 401,
        code: "INVALID_DEVICE_KEY",
        message: "Invalid device key.",
      };
    }
    return { ok: true, mode: "dev" };
  }

  if (mode === "open") {
    console.warn("[atlas] ATLAS_DEV_DEVICE_KEY not set — accepting without key validation");
    return { ok: true, mode: "open" };
  }

  // prod mode — AtlasDevice DB lookup not implemented yet (Phase 4C+)
  console.error("[atlas] Device authentication not configured for production");
  return {
    ok: false,
    httpStatus: 503,
    code: "DEVICE_AUTH_NOT_CONFIGURED",
    message: "Device authentication not configured.",
  };
}
