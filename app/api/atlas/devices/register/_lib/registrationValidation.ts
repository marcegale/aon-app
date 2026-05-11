// Shared validation for device registration routes (Phase 4E).
// Pure functions — no next/server dependency, directly testable in Node.

export const DEVICE_CODE_RE   = /^[A-Za-z0-9]{4,16}$/;
export const VALID_PLATFORMS  = new Set(["windows", "macos", "linux"]);

export type ValidationError = { code: "INVALID_REQUEST"; message: string };
export type ValidationOk    = { ok: true };
export type ValidationResult = ValidationOk | { ok: false; error: ValidationError };

export function validateDeviceCode(device_code: unknown): ValidationResult {
  if (typeof device_code !== "string" || !DEVICE_CODE_RE.test(device_code)) {
    return {
      ok: false,
      error: { code: "INVALID_REQUEST", message: "device_code must be 4–16 alphanumeric characters." },
    };
  }
  return { ok: true };
}

export function validatePlatform(platform: unknown): ValidationResult {
  if (typeof platform !== "string" || !VALID_PLATFORMS.has(platform)) {
    return {
      ok: false,
      error: { code: "INVALID_REQUEST", message: "platform must be one of: windows, macos, linux." },
    };
  }
  return { ok: true };
}

export function validateClientVersion(client_version: unknown): ValidationResult {
  if (client_version !== undefined && typeof client_version !== "string") {
    return {
      ok: false,
      error: { code: "INVALID_REQUEST", message: "client_version must be a string if provided." },
    };
  }
  return { ok: true };
}

/** Full validation for /register/start body. */
export function validateStartBody(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: { code: "INVALID_REQUEST", message: "Body must be a JSON object." } };
  }
  const { device_code, platform, client_version } = body as Record<string, unknown>;

  const dc = validateDeviceCode(device_code);
  if (!dc.ok) return dc;

  const pl = validatePlatform(platform);
  if (!pl.ok) return pl;

  const cv = validateClientVersion(client_version);
  if (!cv.ok) return cv;

  return { ok: true };
}

/** Full validation for /register/poll and /register/complete body. */
export function validatePollBody(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: { code: "INVALID_REQUEST", message: "Body must be a JSON object." } };
  }
  const { device_code } = body as Record<string, unknown>;
  return validateDeviceCode(device_code);
}
