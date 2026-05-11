/**
 * Fase 4I — Registration Route Handler Tests
 *
 * Runner:
 *   node --experimental-strip-types \
 *     --import ./app/api/atlas/_lib/next-server-loader-register.mjs \
 *     --test app/api/atlas/devices/register/__tests__/registrationRoutes.test.ts
 *
 * Or via npm: npm run test:registration
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { createStartPostHandler, GET as startGET } from "../start/route.ts";
import { createPollPostHandler, GET as pollGET  } from "../poll/route.ts";
import { createCompletePostHandler, GET as completeGET } from "../complete/route.ts";
import {
  validateDeviceCode,
  validatePlatform,
  validateClientVersion,
  validateStartBody,
  validatePollBody,
} from "../_lib/registrationValidation.ts";
import type {
  StoreResult,
  RegistrationRecord,
  PickupStatusResult,
  ApproveResult,
} from "../../../_lib/atlasRegistrationStore.ts";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makePost(body: unknown): Request {
  return new Request("http://localhost/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function status(res: Response): Promise<number> { return res.status; }
async function json(res: Response): Promise<unknown>  { return res.json(); }
async function code(res: Response): Promise<string>   {
  return ((await res.json()) as { error?: { code?: string } }).error?.code ?? "";
}

// ── Mock factories for /start ─────────────────────────────────────────────────

function makeSuccessRecord(deviceCode: string): RegistrationRecord {
  return {
    id: "reg-id",
    status: "pending",
    platform: "windows",
    clientVersion: null,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    createdAt: new Date(),
    approvedAt: null,
    completedAt: null,
    deniedAt: null,
    pickedUpAt: null,
    atlasDeviceId: null,
  };
}

type MockResult = StoreResult<RegistrationRecord>;

function makeStartHandler(mockResult: MockResult) {
  return createStartPostHandler({
    createPendingRegistration: async (input) => {
      if (mockResult.ok) {
        return { ok: true, data: makeSuccessRecord(input.device_code) };
      }
      return mockResult;
    },
  });
}

const startPOST_success      = makeStartHandler({ ok: true, data: makeSuccessRecord("PLACEHOLDER") });
const startPOST_secretMissing = makeStartHandler({ ok: false, code: "SECRET_NOT_CONFIGURED", message: "not set" });
const startPOST_dbError       = makeStartHandler({ ok: false, code: "DB_ERROR", message: "db fail" });

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

// ── /register/start — POST ────────────────────────────────────────────────────

describe("/register/start — POST success path", () => {
  test("valid body → 200 ok:true", async () => {
    const res = await startPOST_success(makePost({ device_code: "ABC12345", platform: "windows" }));
    assert.strictEqual(await status(res), 200);
    const body = await json(res) as { ok: boolean };
    assert.strictEqual(body.ok, true);
  });

  test("response includes expires_at as ISO string", async () => {
    const res = await startPOST_success(makePost({ device_code: "ABC12345", platform: "windows" }));
    const body = await json(res) as { expires_at: string };
    assert.ok(typeof body.expires_at === "string", "expires_at must be a string");
    assert.ok(!isNaN(Date.parse(body.expires_at)), "expires_at must be a valid ISO date");
  });

  test("response includes poll_interval_secs: 5", async () => {
    const res = await startPOST_success(makePost({ device_code: "ABC12345", platform: "linux" }));
    const body = await json(res) as { poll_interval_secs: number };
    assert.strictEqual(body.poll_interval_secs, 5);
  });

  test("response includes registration_url with encoded device_code", async () => {
    const res = await startPOST_success(makePost({ device_code: "ABC12345", platform: "windows" }));
    const body = await json(res) as { registration_url: string };
    assert.ok(typeof body.registration_url === "string", "registration_url must be a string");
    assert.ok(body.registration_url.includes("ABC12345"), "registration_url must contain device_code");
    assert.ok(body.registration_url.startsWith("https://app.aigency.com/atlas/register"), "must be aigency URL");
  });

  test("valid body with client_version → 200", async () => {
    const res = await startPOST_success(makePost({ device_code: "TEST1234", platform: "linux", client_version: "4I" }));
    assert.strictEqual(await status(res), 200);
  });
});

describe("/register/start — POST store errors", () => {
  test("SECRET_NOT_CONFIGURED → 503 NOT_CONFIGURED", async () => {
    const res = await startPOST_secretMissing(makePost({ device_code: "ABC12345", platform: "windows" }));
    assert.strictEqual(await status(res), 503);
    assert.strictEqual(await code(res), "NOT_CONFIGURED");
  });

  test("DB_ERROR → 503 REGISTRATION_UNAVAILABLE", async () => {
    const res = await startPOST_dbError(makePost({ device_code: "ABC12345", platform: "windows" }));
    assert.strictEqual(await status(res), 503);
    assert.strictEqual(await code(res), "REGISTRATION_UNAVAILABLE");
  });
});

describe("/register/start — POST input validation (400)", () => {
  test("missing device_code → 400 INVALID_REQUEST", async () => {
    const res = await startPOST_success(makePost({ platform: "windows" }));
    assert.strictEqual(await status(res), 400);
    assert.strictEqual(await code(res), "INVALID_REQUEST");
  });

  test("device_code not string → 400", async () => {
    const res = await startPOST_success(makePost({ device_code: 123, platform: "windows" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code invalid chars → 400", async () => {
    const res = await startPOST_success(makePost({ device_code: "!@#$%", platform: "windows" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code < 4 chars → 400", async () => {
    const res = await startPOST_success(makePost({ device_code: "ABC", platform: "windows" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code > 16 chars → 400", async () => {
    const res = await startPOST_success(makePost({ device_code: "A".repeat(17), platform: "windows" }));
    assert.strictEqual(await status(res), 400);
  });

  test("missing platform → 400", async () => {
    const res = await startPOST_success(makePost({ device_code: "ABC12345" }));
    assert.strictEqual(await status(res), 400);
  });

  test("invalid platform → 400", async () => {
    const res = await startPOST_success(makePost({ device_code: "ABC12345", platform: "amiga" }));
    assert.strictEqual(await status(res), 400);
  });

  test("client_version not string → 400", async () => {
    const res = await startPOST_success(makePost({ device_code: "ABC12345", platform: "windows", client_version: 99 }));
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

// ── /register/poll — mock factories ──────────────────────────────────────────

function makePollHandler(mockResult: PickupStatusResult) {
  return createPollPostHandler({
    pickupApprovedRegistrationByDeviceCode: async () => mockResult,
  });
}

const pollPOST_pending       = makePollHandler({ ok: true, status: "pending" });
const pollPOST_expired       = makePollHandler({ ok: true, status: "expired" });
const pollPOST_denied        = makePollHandler({ ok: true, status: "denied" });
const pollPOST_completed     = makePollHandler({ ok: true, status: "completed" });
const pollPOST_approved      = makePollHandler({ ok: true, status: "approved", device_key: "atl_" + "a".repeat(64), deviceId: "dev-test-id" });
const pollPOST_notFound      = makePollHandler({ ok: false, code: "NOT_FOUND", message: "not found" });
const pollPOST_secretMissing = makePollHandler({ ok: false, code: "SECRET_NOT_CONFIGURED", message: "no secret" });
const pollPOST_dbError       = makePollHandler({ ok: false, code: "DB_ERROR", message: "db fail" });

// For input-validation tests (400s): store is never reached, mock doesn't matter
const pollPOST_any = pollPOST_pending;

// ── /register/poll — POST status responses ────────────────────────────────────

describe("/register/poll — POST status responses", () => {
  test("pending → 200 ok:true status:pending", async () => {
    const res = await pollPOST_pending(makePost({ device_code: "POLL1234" }));
    assert.strictEqual(await status(res), 200);
    const body = await json(res) as { ok: boolean; status: string };
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.status, "pending");
  });

  test("expired → 200 status:expired", async () => {
    const res = await pollPOST_expired(makePost({ device_code: "POLL1234" }));
    assert.strictEqual(await status(res), 200);
    const body = await json(res) as { status: string };
    assert.strictEqual(body.status, "expired");
  });

  test("denied → 200 status:denied", async () => {
    const res = await pollPOST_denied(makePost({ device_code: "POLL1234" }));
    assert.strictEqual(await status(res), 200);
    const body = await json(res) as { status: string };
    assert.strictEqual(body.status, "denied");
  });

  test("completed → 200 status:completed", async () => {
    const res = await pollPOST_completed(makePost({ device_code: "POLL1234" }));
    assert.strictEqual(await status(res), 200);
    const body = await json(res) as { status: string };
    assert.strictEqual(body.status, "completed");
  });

  test("approved → 200 status:approved con device_key", async () => {
    const res = await pollPOST_approved(makePost({ device_code: "POLL1234" }));
    assert.strictEqual(await status(res), 200);
    const body = await json(res) as { ok: boolean; status: string; device_key?: string };
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.status, "approved");
    assert.ok(typeof body.device_key === "string", "device_key debe ser string");
    assert.ok(body.device_key!.startsWith("atl_"), "device_key debe empezar con atl_");
  });

  test("NOT_FOUND → 404 DEVICE_CODE_NOT_FOUND", async () => {
    const res = await pollPOST_notFound(makePost({ device_code: "POLL1234" }));
    assert.strictEqual(await status(res), 404);
    assert.strictEqual(await code(res), "DEVICE_CODE_NOT_FOUND");
  });

  test("SECRET_NOT_CONFIGURED → 503 NOT_CONFIGURED", async () => {
    const res = await pollPOST_secretMissing(makePost({ device_code: "POLL1234" }));
    assert.strictEqual(await status(res), 503);
    assert.strictEqual(await code(res), "NOT_CONFIGURED");
  });

  test("DB_ERROR → 503 REGISTRATION_UNAVAILABLE", async () => {
    const res = await pollPOST_dbError(makePost({ device_code: "POLL1234" }));
    assert.strictEqual(await status(res), 503);
    assert.strictEqual(await code(res), "REGISTRATION_UNAVAILABLE");
  });
});

describe("/register/poll — POST input validation (400)", () => {
  test("missing device_code → 400", async () => {
    const res = await pollPOST_any(makePost({}));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code not string → 400", async () => {
    const res = await pollPOST_any(makePost({ device_code: true }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code invalid chars → 400", async () => {
    const res = await pollPOST_any(makePost({ device_code: "bad-code!" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code < 4 chars → 400", async () => {
    const res = await pollPOST_any(makePost({ device_code: "AB" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code > 16 chars → 400", async () => {
    const res = await pollPOST_any(makePost({ device_code: "Z".repeat(17) }));
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

// ── /register/complete — mock factories ──────────────────────────────────────

const AUTH_USER = "user-123";

function makeCompleteHandler(opts: {
  userId?: string | null;
  approveResult: ApproveResult;
}) {
  return createCompletePostHandler({
    getAuthenticatedUserId: async () => opts.userId ?? null,
    approveRegistrationByDeviceCode: async () => opts.approveResult,
  });
}

const completeOk        = makeCompleteHandler({ userId: AUTH_USER, approveResult: { ok: true, status: "approved" } });
const completeUnauth    = makeCompleteHandler({ userId: null,      approveResult: { ok: true, status: "approved" } });
const completeNotFound  = makeCompleteHandler({ userId: AUTH_USER, approveResult: { ok: false, code: "NOT_FOUND",                    message: "nf" } });
const completeExpired   = makeCompleteHandler({ userId: AUTH_USER, approveResult: { ok: false, code: "REGISTRATION_EXPIRED",          message: "ex" } });
const completeAlreadyApproved  = makeCompleteHandler({ userId: AUTH_USER, approveResult: { ok: false, code: "REGISTRATION_ALREADY_APPROVED",   message: "aa" } });
const completeAlreadyCompleted = makeCompleteHandler({ userId: AUTH_USER, approveResult: { ok: false, code: "REGISTRATION_ALREADY_COMPLETED",  message: "ac" } });
const completeDenied    = makeCompleteHandler({ userId: AUTH_USER, approveResult: { ok: false, code: "REGISTRATION_DENIED",           message: "dn" } });
const completeSecret    = makeCompleteHandler({ userId: AUTH_USER, approveResult: { ok: false, code: "SECRET_NOT_CONFIGURED",         message: "sc" } });
const completeDbError   = makeCompleteHandler({ userId: AUTH_USER, approveResult: { ok: false, code: "DB_ERROR",                     message: "db" } });

// For input-validation tests: auth/approve never reached
const completeAny = completeOk;

// ── /register/complete — POST ─────────────────────────────────────────────────

describe("/register/complete — POST success", () => {
  test("authenticated + valid → 200 ok:true status:approved", async () => {
    const res = await completeOk(makePost({ device_code: "CMPL1234" }));
    assert.strictEqual(await status(res), 200);
    const body = await json(res) as { ok: boolean; status: string; device_key?: unknown };
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.status, "approved");
    assert.ok(!("device_key" in body), "device_key must not be present");
  });
});

describe("/register/complete — POST auth errors", () => {
  test("unauthenticated → 401 UNAUTHENTICATED", async () => {
    const res = await completeUnauth(makePost({ device_code: "CMPL1234" }));
    assert.strictEqual(await status(res), 401);
    assert.strictEqual(await code(res), "UNAUTHENTICATED");
  });
});

describe("/register/complete — POST input validation (400)", () => {
  test("missing device_code → 400", async () => {
    const res = await completeAny(makePost({}));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code not string → 400", async () => {
    const res = await completeAny(makePost({ device_code: null }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code invalid chars → 400", async () => {
    const res = await completeAny(makePost({ device_code: "inv@lid" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code < 4 chars → 400", async () => {
    const res = await completeAny(makePost({ device_code: "XY" }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_code > 16 chars → 400", async () => {
    const res = await completeAny(makePost({ device_code: "C".repeat(17) }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_name non-string → 400", async () => {
    const res = await completeAny(makePost({ device_code: "CMPL1234", device_name: 42 }));
    assert.strictEqual(await status(res), 400);
  });

  test("device_name >80 chars → 400", async () => {
    const res = await completeAny(makePost({ device_code: "CMPL1234", device_name: "A".repeat(81) }));
    assert.strictEqual(await status(res), 400);
  });
});

describe("/register/complete — POST store errors", () => {
  test("NOT_FOUND → 404 DEVICE_CODE_NOT_FOUND", async () => {
    const res = await completeNotFound(makePost({ device_code: "CMPL1234" }));
    assert.strictEqual(await status(res), 404);
    assert.strictEqual(await code(res), "DEVICE_CODE_NOT_FOUND");
  });

  test("REGISTRATION_EXPIRED → 409", async () => {
    const res = await completeExpired(makePost({ device_code: "CMPL1234" }));
    assert.strictEqual(await status(res), 409);
    assert.strictEqual(await code(res), "REGISTRATION_EXPIRED");
  });

  test("REGISTRATION_ALREADY_APPROVED → 409", async () => {
    const res = await completeAlreadyApproved(makePost({ device_code: "CMPL1234" }));
    assert.strictEqual(await status(res), 409);
    assert.strictEqual(await code(res), "REGISTRATION_ALREADY_APPROVED");
  });

  test("REGISTRATION_ALREADY_COMPLETED → 409", async () => {
    const res = await completeAlreadyCompleted(makePost({ device_code: "CMPL1234" }));
    assert.strictEqual(await status(res), 409);
    assert.strictEqual(await code(res), "REGISTRATION_ALREADY_COMPLETED");
  });

  test("REGISTRATION_DENIED → 409", async () => {
    const res = await completeDenied(makePost({ device_code: "CMPL1234" }));
    assert.strictEqual(await status(res), 409);
    assert.strictEqual(await code(res), "REGISTRATION_DENIED");
  });

  test("SECRET_NOT_CONFIGURED → 503 NOT_CONFIGURED", async () => {
    const res = await completeSecret(makePost({ device_code: "CMPL1234" }));
    assert.strictEqual(await status(res), 503);
    assert.strictEqual(await code(res), "NOT_CONFIGURED");
  });

  test("DB_ERROR → 503 REGISTRATION_UNAVAILABLE", async () => {
    const res = await completeDbError(makePost({ device_code: "CMPL1234" }));
    assert.strictEqual(await status(res), 503);
    assert.strictEqual(await code(res), "REGISTRATION_UNAVAILABLE");
  });
});

describe("/register/complete — GET", () => {
  test("GET → 405 INVALID_METHOD", async () => {
    const res = await completeGET();
    assert.strictEqual(await status(res), 405);
    assert.strictEqual(await code(res), "INVALID_METHOD");
  });
});
