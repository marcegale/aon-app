/**
 * Phase 5N — Atlas Register Approval Logic Tests
 *
 * Tests submitApprovalRequest() from approveAtlasDevice.ts with mocked fetch.
 * React component rendering requires a React testing framework (not in this repo).
 * All stateful behaviors of ApproveClient are driven by submitApprovalRequest's
 * return value, so these tests cover the full state machine.
 *
 * Runner (from repo root):
 *   node --experimental-strip-types --test \
 *     app/atlas/register/__tests__/atlasRegisterApprove.test.ts
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { submitApprovalRequest } from "../approveAtlasDevice.ts";

// ── Mock fetch helpers ────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown): typeof fetch {
  return async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }) as Response;
}

function throwingFetch(): typeof fetch {
  return async () => { throw new Error("Network failure"); };
}

// ── submitApprovalRequest ────────────────────────────────────────────────────

describe("submitApprovalRequest — success", () => {
  test("200 ok:true → approved", async () => {
    const result = await submitApprovalRequest("ABCD1234", mockFetch(200, { ok: true, status: "approved" }));
    assert.strictEqual(result, "approved");
  });
});

describe("submitApprovalRequest — auth error", () => {
  test("401 UNAUTHENTICATED → sign_in_required", async () => {
    const result = await submitApprovalRequest(
      "ABCD1234",
      mockFetch(401, { ok: false, error: { code: "UNAUTHENTICATED", message: "Authentication required." } }),
    );
    assert.strictEqual(result, "sign_in_required");
  });
});

describe("submitApprovalRequest — not found", () => {
  test("404 DEVICE_CODE_NOT_FOUND → not_found", async () => {
    const result = await submitApprovalRequest(
      "ABCD1234",
      mockFetch(404, { ok: false, error: { code: "DEVICE_CODE_NOT_FOUND", message: "Not found." } }),
    );
    assert.strictEqual(result, "not_found");
  });
});

describe("submitApprovalRequest — 409 conflicts", () => {
  test("409 REGISTRATION_EXPIRED → expired", async () => {
    const result = await submitApprovalRequest(
      "ABCD1234",
      mockFetch(409, { ok: false, error: { code: "REGISTRATION_EXPIRED", message: "Expired." } }),
    );
    assert.strictEqual(result, "expired");
  });

  test("409 REGISTRATION_DENIED → denied", async () => {
    const result = await submitApprovalRequest(
      "ABCD1234",
      mockFetch(409, { ok: false, error: { code: "REGISTRATION_DENIED", message: "Denied." } }),
    );
    assert.strictEqual(result, "denied");
  });

  test("409 REGISTRATION_ALREADY_APPROVED → already_processed", async () => {
    const result = await submitApprovalRequest(
      "ABCD1234",
      mockFetch(409, { ok: false, error: { code: "REGISTRATION_ALREADY_APPROVED", message: "Already approved." } }),
    );
    assert.strictEqual(result, "already_processed");
  });

  test("409 REGISTRATION_ALREADY_COMPLETED → already_processed", async () => {
    const result = await submitApprovalRequest(
      "ABCD1234",
      mockFetch(409, { ok: false, error: { code: "REGISTRATION_ALREADY_COMPLETED", message: "Already completed." } }),
    );
    assert.strictEqual(result, "already_processed");
  });
});

describe("submitApprovalRequest — server errors", () => {
  test("503 NOT_CONFIGURED → unavailable", async () => {
    const result = await submitApprovalRequest(
      "ABCD1234",
      mockFetch(503, { ok: false, error: { code: "NOT_CONFIGURED", message: "Not configured." } }),
    );
    assert.strictEqual(result, "unavailable");
  });

  test("503 REGISTRATION_UNAVAILABLE → unavailable", async () => {
    const result = await submitApprovalRequest(
      "ABCD1234",
      mockFetch(503, { ok: false, error: { code: "REGISTRATION_UNAVAILABLE", message: "Unavailable." } }),
    );
    assert.strictEqual(result, "unavailable");
  });

  test("500 generic error → unavailable", async () => {
    const result = await submitApprovalRequest(
      "ABCD1234",
      mockFetch(500, { ok: false, error: { code: "INTERNAL_ERROR", message: "Unexpected." } }),
    );
    assert.strictEqual(result, "unavailable");
  });
});

describe("submitApprovalRequest — network error", () => {
  test("fetch throws → network_error", async () => {
    const result = await submitApprovalRequest("ABCD1234", throwingFetch());
    assert.strictEqual(result, "network_error");
  });
});

describe("submitApprovalRequest — device_key isolation", () => {
  test("response body is never forwarded — no device_key reachable from return value", async () => {
    // /register/complete does not return device_key; this test verifies
    // submitApprovalRequest returns only its typed ApproveOutcome string.
    const result = await submitApprovalRequest("ABCD1234", mockFetch(200, { ok: true, status: "approved", device_key: "atl_secret" }));
    assert.strictEqual(typeof result, "string");
    assert.strictEqual(result, "approved");
    assert.ok(!String(result).includes("atl_"), "device_key must not appear in return value");
  });
});

describe("submitApprovalRequest — request shape", () => {
  test("sends POST to /api/atlas/devices/register/complete with device_code", async () => {
    let capturedUrl = "";
    let capturedBody: unknown = null;

    const capturingFetch: typeof fetch = async (input, init) => {
      capturedUrl = String(input);
      capturedBody = JSON.parse((init?.body as string) ?? "{}");
      return new Response(JSON.stringify({ ok: true, status: "approved" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }) as Response;
    };

    await submitApprovalRequest("MYCODE01", capturingFetch);

    assert.strictEqual(capturedUrl, "/api/atlas/devices/register/complete");
    assert.deepEqual(capturedBody, { device_code: "MYCODE01" });
  });

  test("Content-Type is application/json", async () => {
    let capturedContentType = "";

    const capturingFetch: typeof fetch = async (_input, init) => {
      capturedContentType = (init?.headers as Record<string, string>)?.["Content-Type"] ?? "";
      return new Response(JSON.stringify({ ok: true, status: "approved" }), { status: 200 }) as Response;
    };

    await submitApprovalRequest("MYCODE01", capturingFetch);
    assert.strictEqual(capturedContentType, "application/json");
  });
});
