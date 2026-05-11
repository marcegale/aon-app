/**
 * Fase 4E — Registration Route Handler Tests
 *
 * Runner (requires next-server loader for "next/server" resolution):
 *   node --experimental-strip-types \
 *     --import ./app/api/atlas/_lib/next-server-loader-register.mjs \
 *     --test app/api/atlas/devices/register/__tests__/registrationRoutes.test.ts
 *
 * Or via npm: npm run test:registration
 *
 * Tests import real route handlers and the shared validation helper.
 * No logic is re-implemented inline.
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { POST as startPOST, GET as startGET } from "../start/route.ts";
import { POST as pollPOST,  GET as pollGET  } from "../poll/route.ts";
import { POST as completePOST, GET as completeGET } from "../complete/route.ts";
import {
  validateDeviceCode,
  validatePlatform,
  validateClientVersion,
  validateStartBody,
  validatePollBody,
} from "../_lib/registrationValidation.ts";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePost(body: unknown): Request {
  return new Request("http://localhost/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function status(res: Response): Promise<number> { return res.status; }
async function code(res: Response): Promise<string>   { return ((await res.json()) as { error?: { code?: string } }).error?.code ?? ""; }

// ── registrationValidation helper (pure, no next/server) ──────────────────────

describe("registrationValidation — validateDeviceCode", () => {
  test("valid code passes", () => {
    assert.deepEqual(validateDeviceCode("ABC12345"), { ok: true });
  });
  test("4 chars (min) passes", () => {
    assert.deepEqual(validateDeviceCode("AAAA"), { ok: true });
  });
  test("16 chars (max) passes", () => {
    assert.deepEqual(validateDeviceCode("A".repeat(16)), { ok: true });
  });
  test("undefined fails", () => {
    const r = validateDeviceCode(undefined);
    assert.ok(!r.ok);
  });
  test("non-string fails", () => {
    const r = validateDeviceCode(42);
    assert.ok(!r.ok);
  });
  test("special chars fail", () => {
    const r = validateDeviceCode("!@#$%");
    assert.ok(!r.ok);
  });
  test("< 4 chars fails", () => {
    assert.ok(!validateDeviceCode("ABC").ok);
  });
  test("> 16 chars fails", () => {
    assert.ok(!validateDeviceCode("A".repeat(17)).ok);
  });
  test("empty string fails", () => {
    assert.ok(!validateDeviceCode("").ok);
  });
});

describe("registrationValidation — validatePlatform", () => {
  test("windows passes", () => { assert.deepEqual(validatePlatform("windows"), { ok: true }); });
  test("macos passes",   () => { assert.deepEqual(validatePlatform("macos"),   { ok: true }); });
  test("linux passes",   () => { assert.deepEqual(validatePlatform("linux"),   { ok: true }); });
  test("invalid string fails", () => { assert.ok(!validatePlatform("Android").ok); });
  test("undefined fails",      () => { assert.ok(!validatePlatform(undefined).ok); });
});

describe("registrationValidation — validateClientVersion", () => {
  test("undefined passes (optional)", () => { assert.deepEqual(validateClientVersion(undefined), { ok: true }); });
  test("string passes",               () => { assert.deepEqual(validateClientVersion("4E"), { ok: true }); });
  test("number fails",                () => { assert.ok(!validateClientVersion(42).ok); });
});

describe("registrationValidation — validateStartBody", () => {
  test("valid full body passes", () => {
    assert.ok(validateStartBody({ device_code: "ABC12345", platform: "windows", client_version: "4E" }).ok);
  });
  test("valid without client_version passes", () => {
    assert.ok(validateStartBody({ device_code: "ABC12345", platform: "linux" }).ok);
  });
  test("non-object fails", () => { assert.ok(!validateStartBody("string").ok); });
  test("missing device_code fails", () => { assert.ok(!validateStartBody({ platform: "windows" }).ok); });
  test("missing platform fails", () => { assert.ok(!validateStartBody({ device_code: "ABCD1234" }).ok); });
});

describe("registrationValidation — validatePollBody", () => {
  test("valid body passes", () => {
    assert.ok(validatePollBody({ device_code: "ABC12345" }).ok);
  });
  test("missing device_code fails", () => { assert.ok(!validatePollBody({}).ok); });
  test("non-object fails", () => { assert.ok(!validatePollBody(null).ok); });
});

// ── /register/start route handler ─────────────────────────────────────────────

describe("/register/start — POST", () => {
  test("valid body → 501 NOT_CONFIGURED", async () => {
    const res = await startPOST(makePost({ device_code: "ABC12345", platform: "windows" }));
    assert.strictEqual(await status(res), 501);
    assert.strictEqual(await code(res), "NOT_CONFIGURED");
  });

  test("valid body with client_version → 501", async () => {
    const res = await startPOST(makePost({ device_code: "TEST1234", platform: "linux", client_version: "4E" }));
    assert.strictEqual(await status(res), 501);
  });

  test("missing device_code → 400 INVALID_REQUEST", async () => {
    const res = await startPOST(makePost({ platform: "windows" }));
    assert.strictEqual(await status(res), 400);
    assert.strictEqual(await code(res), "INVALID_REQUEST");
  });

  test("device_code not string → 400", async () => {
    const res = await startPOST(makePost({ device_code: 123, platform: "windows" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code invalid chars → 400", async () => {
    const res = await startPOST(makePost({ device_code: "!@#$%", platform: "windows" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code < 4 chars → 400", async () => {
    const res = await startPOST(makePost({ device_code: "ABC", platform: "windows" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code > 16 chars → 400", async () => {
    const res = await startPOST(makePost({ device_code: "A".repeat(17), platform: "windows" }));
    assert.strictEqual(await status(res), 400);
  });

  test("missing platform → 400", async () => {
    const res = await startPOST(makePost({ device_code: "ABC12345" }));
    assert.strictEqual(await status(res), 400);
  });

  test("invalid platform → 400", async () => {
    const res = await startPOST(makePost({ device_code: "ABC12345", platform: "amiga" }));
    assert.strictEqual(await status(res), 400);
  });

  test("client_version not string → 400", async () => {
    const res = await startPOST(makePost({ device_code: "ABC12345", platform: "windows", client_version: 99 }));
    assert.strictEqual(await status(res), 400);
  });
});

describe("/register/start — GET", () => {
  test("GET → 405 INVALID_METHOD", async () => {
    const res = await startGET();
    assert.strictEqual(await status(res), 405);
    assert.strictEqual(await code(res), "INVALID_METHOD");
  });
});

// ── /register/poll route handler ──────────────────────────────────────────────

describe("/register/poll — POST", () => {
  test("valid body → 501 NOT_CONFIGURED", async () => {
    const res = await pollPOST(makePost({ device_code: "POLL1234" }));
    assert.strictEqual(await status(res), 501);
    assert.strictEqual(await code(res), "NOT_CONFIGURED");
  });

  test("missing device_code → 400", async () => {
    const res = await pollPOST(makePost({}));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code not string → 400", async () => {
    const res = await pollPOST(makePost({ device_code: true }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code invalid chars → 400", async () => {
    const res = await pollPOST(makePost({ device_code: "bad-code!" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code < 4 chars → 400", async () => {
    const res = await pollPOST(makePost({ device_code: "AB" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code > 16 chars → 400", async () => {
    const res = await pollPOST(makePost({ device_code: "Z".repeat(17) }));
    assert.strictEqual(await status(res), 400);
  });
});

describe("/register/poll — GET", () => {
  test("GET → 405 INVALID_METHOD", async () => {
    const res = await pollGET();
    assert.strictEqual(await status(res), 405);
    assert.strictEqual(await code(res), "INVALID_METHOD");
  });
});

// ── /register/complete route handler ──────────────────────────────────────────

describe("/register/complete — POST", () => {
  test("valid body → 501 NOT_CONFIGURED", async () => {
    const res = await completePOST(makePost({ device_code: "CMPL1234" }));
    assert.strictEqual(await status(res), 501);
    assert.strictEqual(await code(res), "NOT_CONFIGURED");
  });

  test("missing device_code → 400", async () => {
    const res = await completePOST(makePost({}));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code not string → 400", async () => {
    const res = await completePOST(makePost({ device_code: null }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code invalid chars → 400", async () => {
    const res = await completePOST(makePost({ device_code: "inv@lid" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code < 4 chars → 400", async () => {
    const res = await completePOST(makePost({ device_code: "XY" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code > 16 chars → 400", async () => {
    const res = await completePOST(makePost({ device_code: "C".repeat(17) }));
    assert.strictEqual(await status(res), 400);
  });
});

describe("/register/complete — GET", () => {
  test("GET → 405 INVALID_METHOD", async () => {
    const res = await completeGET();
    assert.strictEqual(await status(res), 405);
    assert.strictEqual(await code(res), "INVALID_METHOD");
  });
});
