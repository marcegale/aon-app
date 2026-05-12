/**
 * Phase 5F — Atlas Device Auth Check Route Tests
 *
 * Runner:
 *   node --experimental-strip-types \
 *     --import ./app/api/atlas/_lib/next-server-loader-register.mjs \
 *     --test app/api/atlas/devices/auth/__tests__/atlasDeviceAuthCheckRoute.test.ts
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { createAuthCheckPostHandler, GET } from "../check/route.ts";
import type { AtlasDeviceAuthResult } from "../../../_lib/atlasDeviceAuth.ts";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePost(body: unknown): Request {
  return new Request("http://localhost/api/atlas/devices/auth/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeMockHandler(mockResult: AtlasDeviceAuthResult) {
  return createAuthCheckPostHandler({
    validateAtlasDeviceKey: async (_key: unknown) => mockResult,
  });
}

// ── POST cases ────────────────────────────────────────────────────────────────

describe("POST /api/atlas/devices/auth/check", () => {
  test("active device → 200 ok:true status:active", async () => {
    const handler = makeMockHandler({ ok: true, mode: "prod", deviceId: "dev-id", supabaseUserId: "user-id" });
    const res = await handler(makePost({ device_key: "atl_valid" }));
    const body = await res.json() as { ok: boolean; status?: string };
    assert.strictEqual(res.status, 200);
    assert.ok(body.ok);
    assert.strictEqual(body.status, "active");
  });

  test("INVALID_DEVICE_KEY → 401 with code", async () => {
    const handler = makeMockHandler({ ok: false, httpStatus: 401, code: "INVALID_DEVICE_KEY", message: "Invalid device key." });
    const res = await handler(makePost({ device_key: "atl_bad" }));
    const body = await res.json() as { ok: boolean; error?: { code: string } };
    assert.strictEqual(res.status, 401);
    assert.ok(!body.ok);
    assert.strictEqual(body.error?.code, "INVALID_DEVICE_KEY");
  });

  test("DEVICE_REVOKED → 401 with code", async () => {
    const handler = makeMockHandler({ ok: false, httpStatus: 401, code: "DEVICE_REVOKED", message: "Device has been revoked." });
    const res = await handler(makePost({ device_key: "atl_revoked" }));
    const body = await res.json() as { ok: boolean; error?: { code: string } };
    assert.strictEqual(res.status, 401);
    assert.ok(!body.ok);
    assert.strictEqual(body.error?.code, "DEVICE_REVOKED");
  });

  test("DEVICE_AUTH_UNAVAILABLE → 503 with code", async () => {
    const handler = makeMockHandler({ ok: false, httpStatus: 503, code: "DEVICE_AUTH_UNAVAILABLE", message: "Service unavailable." });
    const res = await handler(makePost({ device_key: "atl_any" }));
    const body = await res.json() as { ok: boolean; error?: { code: string } };
    assert.strictEqual(res.status, 503);
    assert.ok(!body.ok);
    assert.strictEqual(body.error?.code, "DEVICE_AUTH_UNAVAILABLE");
  });

  test("invalid JSON body → 400 INVALID_REQUEST", async () => {
    const handler = createAuthCheckPostHandler();
    const req = new Request("http://localhost/api/atlas/devices/auth/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-valid-json{{{",
    });
    const res = await handler(req);
    const body = await res.json() as { ok: boolean; error?: { code: string } };
    assert.strictEqual(res.status, 400);
    assert.ok(!body.ok);
    assert.strictEqual(body.error?.code, "INVALID_REQUEST");
  });

  test("response does not expose deviceId, supabaseUserId, or deviceKeyHash", async () => {
    const handler = makeMockHandler({ ok: true, mode: "prod", deviceId: "dev-secret-id", supabaseUserId: "user-secret-id" });
    const res = await handler(makePost({ device_key: "atl_valid" }));
    const body = await res.json() as Record<string, unknown>;
    assert.ok(!("deviceId" in body), "deviceId must not appear in response");
    assert.ok(!("supabaseUserId" in body), "supabaseUserId must not appear in response");
    assert.ok(!("deviceKeyHash" in body), "deviceKeyHash must not appear in response");
  });

  test("raw device_key not logged on any response path", async () => {
    const SENSITIVE = "atl_SENSITIVE_KEY_5F_MUST_NOT_APPEAR";
    const captured: string[] = [];
    const orig = { log: console.log, warn: console.warn, error: console.error };
    console.log   = (...args: unknown[]) => captured.push(args.map(String).join(" "));
    console.warn  = (...args: unknown[]) => captured.push(args.map(String).join(" "));
    console.error = (...args: unknown[]) => captured.push(args.map(String).join(" "));
    try {
      const handler = makeMockHandler({ ok: false, httpStatus: 401, code: "INVALID_DEVICE_KEY", message: "invalid" });
      await handler(makePost({ device_key: SENSITIVE }));
      assert.ok(!captured.join(" ").includes(SENSITIVE), `device_key leaked: ${captured.slice(0, 3).join(" ")}`);
    } finally {
      console.log = orig.log; console.warn = orig.warn; console.error = orig.error;
    }
  });
});

// ── GET → 405 ─────────────────────────────────────────────────────────────────

describe("GET /api/atlas/devices/auth/check → 405", () => {
  test("GET returns 405 INVALID_METHOD", async () => {
    const res = await GET();
    const body = await res.json() as { ok: boolean; error?: { code: string } };
    assert.strictEqual(res.status, 405);
    assert.ok(!body.ok);
    assert.strictEqual(body.error?.code, "INVALID_METHOD");
  });
});
