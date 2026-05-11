/**
 * Phase 4M — Atlas Device Auth Tests
 * Runner: node --experimental-strip-types --test <this-file>
 * INVARIANT: device_key and deviceKeyHash must never appear in logs.
 */

import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  getAtlasAuthMode,
  validateAtlasDeviceKey,
} from "../atlasDeviceAuth.ts";
import type { FindAtlasDeviceResult, AtlasDeviceRecord } from "../atlasDeviceStore.ts";

// ── Env isolation ─────────────────────────────────────────────────────────────

type EnvKey = "ATLAS_DEV_DEVICE_KEY" | "NODE_ENV";
type SavedEnv = Record<EnvKey, string | undefined>;
const ENV_KEYS: EnvKey[] = ["ATLAS_DEV_DEVICE_KEY", "NODE_ENV"];

function saveEnv(): SavedEnv {
  return Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]])) as SavedEnv;
}
function restoreEnv(saved: SavedEnv): void {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
}
function setDevEnv(key: string): void {
  process.env.ATLAS_DEV_DEVICE_KEY = key;
  process.env.NODE_ENV = "development";
}
function setOpenEnv(): void {
  delete process.env.ATLAS_DEV_DEVICE_KEY;
  process.env.NODE_ENV = "development";
}
function setProdEnv(): void {
  delete process.env.ATLAS_DEV_DEVICE_KEY;
  process.env.NODE_ENV = "production";
}

// ── Mock deps helpers ─────────────────────────────────────────────────────────

function makeDevice(overrides: Partial<AtlasDeviceRecord> = {}): AtlasDeviceRecord {
  return { id: "dev-id", supabaseUserId: "user-id", status: "active", lastSeenAt: null, ...overrides };
}

function makeDeps(opts: {
  findResult: FindAtlasDeviceResult;
  touchCalled?: { value: boolean };
  touchThrows?: boolean;
}) {
  return {
    findAtlasDeviceByKeyHash: async (_hash: string): Promise<FindAtlasDeviceResult> => opts.findResult,
    touchAtlasDeviceLastSeen: async (_id: string): Promise<void> => {
      if (opts.touchCalled) opts.touchCalled.value = true;
      if (opts.touchThrows) throw new Error("touch failed");
    },
  };
}

const VALID_KEY = "atl_" + "a".repeat(64); // 68-char valid-looking key

// ── getAtlasAuthMode ──────────────────────────────────────────────────────────

describe("getAtlasAuthMode", () => {
  let saved: SavedEnv;
  beforeEach(() => { saved = saveEnv(); });
  afterEach(() => { restoreEnv(saved); });

  test("returns 'dev' when ATLAS_DEV_DEVICE_KEY is set", () => {
    setDevEnv("any-key");
    assert.strictEqual(getAtlasAuthMode(), "dev");
  });

  test("returns 'open' when ATLAS_DEV_DEVICE_KEY unset + NODE_ENV !== 'production'", () => {
    setOpenEnv();
    assert.strictEqual(getAtlasAuthMode(), "open");
  });

  test("returns 'prod' when ATLAS_DEV_DEVICE_KEY unset + NODE_ENV === 'production'", () => {
    setProdEnv();
    assert.strictEqual(getAtlasAuthMode(), "prod");
  });
});

// ── validateAtlasDeviceKey — dev mode ─────────────────────────────────────────

describe("validateAtlasDeviceKey — dev mode", () => {
  const DEV_KEY = "test-device-key-abc123";
  let saved: SavedEnv;

  beforeEach(() => { saved = saveEnv(); setDevEnv(DEV_KEY); });
  afterEach(() => { restoreEnv(saved); });

  test("correct key returns ok:true, mode:'dev'", async () => {
    const r = await validateAtlasDeviceKey(DEV_KEY);
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.mode, "dev");
  });

  test("incorrect key returns ok:false, 401, INVALID_DEVICE_KEY", async () => {
    const r = await validateAtlasDeviceKey("wrong-key");
    assert.ok(!r.ok);
    if (!r.ok) {
      assert.strictEqual(r.httpStatus, 401);
      assert.strictEqual(r.code, "INVALID_DEVICE_KEY");
    }
  });

  test("missing device_key (undefined) returns ok:false, 401, INVALID_DEVICE_KEY", async () => {
    const r = await validateAtlasDeviceKey(undefined);
    assert.ok(!r.ok);
    if (!r.ok) {
      assert.strictEqual(r.httpStatus, 401);
      assert.strictEqual(r.code, "INVALID_DEVICE_KEY");
    }
  });

  test("empty string returns ok:false, 401, INVALID_DEVICE_KEY", async () => {
    const r = await validateAtlasDeviceKey("");
    assert.ok(!r.ok);
    if (!r.ok) {
      assert.strictEqual(r.httpStatus, 401);
      assert.strictEqual(r.code, "INVALID_DEVICE_KEY");
    }
  });
});

// ── validateAtlasDeviceKey — open mode ───────────────────────────────────────

describe("validateAtlasDeviceKey — open mode", () => {
  let saved: SavedEnv;
  const warnCapture: string[] = [];
  const origWarn = console.warn;

  beforeEach(() => {
    saved = saveEnv();
    setOpenEnv();
    warnCapture.length = 0;
    console.warn = (...args: unknown[]) => { warnCapture.push(args.map(String).join(" ")); };
  });
  afterEach(() => { restoreEnv(saved); console.warn = origWarn; });

  test("returns ok:true, mode:'open' regardless of device_key", async () => {
    const r = await validateAtlasDeviceKey("whatever");
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.mode, "open");
  });

  test("emits a console.warn (not silent about missing key)", async () => {
    await validateAtlasDeviceKey("whatever");
    assert.ok(warnCapture.length > 0, "expected at least one console.warn call");
  });
});

// ── validateAtlasDeviceKey — prod mode ───────────────────────────────────────

describe("validateAtlasDeviceKey — prod mode", () => {
  let saved: SavedEnv;
  beforeEach(() => { saved = saveEnv(); setProdEnv(); });
  afterEach(() => { restoreEnv(saved); });

  test("missing key (undefined) → INVALID_DEVICE_KEY 401", async () => {
    const r = await validateAtlasDeviceKey(undefined, makeDeps({ findResult: { ok: true, device: null } }));
    assert.ok(!r.ok);
    if (!r.ok) { assert.strictEqual(r.httpStatus, 401); assert.strictEqual(r.code, "INVALID_DEVICE_KEY"); }
  });

  test("non-string key (number) → INVALID_DEVICE_KEY 401", async () => {
    const r = await validateAtlasDeviceKey(42, makeDeps({ findResult: { ok: true, device: null } }));
    assert.ok(!r.ok);
    if (!r.ok) { assert.strictEqual(r.httpStatus, 401); assert.strictEqual(r.code, "INVALID_DEVICE_KEY"); }
  });

  test("empty string key → INVALID_DEVICE_KEY 401", async () => {
    const r = await validateAtlasDeviceKey("  ", makeDeps({ findResult: { ok: true, device: null } }));
    assert.ok(!r.ok);
    if (!r.ok) { assert.strictEqual(r.httpStatus, 401); assert.strictEqual(r.code, "INVALID_DEVICE_KEY"); }
  });

  test("device not found (null) → INVALID_DEVICE_KEY 401", async () => {
    const r = await validateAtlasDeviceKey(VALID_KEY, makeDeps({ findResult: { ok: true, device: null } }));
    assert.ok(!r.ok);
    if (!r.ok) { assert.strictEqual(r.httpStatus, 401); assert.strictEqual(r.code, "INVALID_DEVICE_KEY"); }
  });

  test("revoked device (status=revoked) → DEVICE_REVOKED 401", async () => {
    const r = await validateAtlasDeviceKey(VALID_KEY, makeDeps({ findResult: { ok: true, device: makeDevice({ status: "revoked" }) } }));
    assert.ok(!r.ok);
    if (!r.ok) { assert.strictEqual(r.httpStatus, 401); assert.strictEqual(r.code, "DEVICE_REVOKED"); }
  });

  test("suspended device (status=suspended) → DEVICE_REVOKED 401", async () => {
    const r = await validateAtlasDeviceKey(VALID_KEY, makeDeps({ findResult: { ok: true, device: makeDevice({ status: "suspended" }) } }));
    assert.ok(!r.ok);
    if (!r.ok) { assert.strictEqual(r.httpStatus, 401); assert.strictEqual(r.code, "DEVICE_REVOKED"); }
  });

  test("active device → ok:true, mode:'prod'", async () => {
    const r = await validateAtlasDeviceKey(VALID_KEY, makeDeps({ findResult: { ok: true, device: makeDevice() } }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.mode, "prod");
  });

  test("active device result includes deviceId and supabaseUserId", async () => {
    const device = makeDevice({ id: "specific-dev-id", supabaseUserId: "specific-user-id" });
    const r = await validateAtlasDeviceKey(VALID_KEY, makeDeps({ findResult: { ok: true, device } }));
    assert.ok(r.ok);
    if (r.ok) {
      assert.strictEqual(r.deviceId, "specific-dev-id");
      assert.strictEqual(r.supabaseUserId, "specific-user-id");
    }
  });

  test("active device triggers touchAtlasDeviceLastSeen", async () => {
    const touchCalled = { value: false };
    await validateAtlasDeviceKey(VALID_KEY, makeDeps({ findResult: { ok: true, device: makeDevice() }, touchCalled }));
    assert.ok(touchCalled.value, "touchAtlasDeviceLastSeen debe haberse llamado");
  });

  test("lastSeenAt touch failure does not fail auth", async () => {
    const r = await validateAtlasDeviceKey(
      VALID_KEY,
      makeDeps({ findResult: { ok: true, device: makeDevice() }, touchThrows: true }),
    );
    assert.ok(r.ok, `auth debe ser ok incluso con touch failure, got: ${JSON.stringify(r)}`);
    if (r.ok) assert.strictEqual(r.mode, "prod");
  });

  test("DB lookup failure → DEVICE_AUTH_UNAVAILABLE 503", async () => {
    const r = await validateAtlasDeviceKey(VALID_KEY, makeDeps({ findResult: { ok: false, code: "DB_ERROR", message: "fail" } }));
    assert.ok(!r.ok);
    if (!r.ok) { assert.strictEqual(r.httpStatus, 503); assert.strictEqual(r.code, "DEVICE_AUTH_UNAVAILABLE"); }
  });

  test("logs do not include raw device_key", async () => {
    const SENSITIVE = "SENSITIVE-RAW-KEY-MUST-NOT-APPEAR-4M";
    const logCapture: string[] = [];
    const orig = { warn: console.warn, error: console.error, log: console.log };
    console.warn  = (...args: unknown[]) => logCapture.push(args.map(String).join(" "));
    console.error = (...args: unknown[]) => logCapture.push(args.map(String).join(" "));
    console.log   = (...args: unknown[]) => logCapture.push(args.map(String).join(" "));
    try {
      await validateAtlasDeviceKey(SENSITIVE, makeDeps({ findResult: { ok: false, code: "DB_ERROR", message: "fail" } }));
      assert.ok(!logCapture.join(" ").includes(SENSITIVE), `raw device_key leaked in logs`);
    } finally {
      console.warn = orig.warn; console.error = orig.error; console.log = orig.log;
    }
  });

  test("logs do not include deviceKeyHash", async () => {
    let capturedHash = "";
    const deps = {
      findAtlasDeviceByKeyHash: async (hash: string): Promise<FindAtlasDeviceResult> => {
        capturedHash = hash;
        return { ok: true, device: null };
      },
      touchAtlasDeviceLastSeen: async (_id: string): Promise<void> => {},
    };
    const logCapture: string[] = [];
    const orig = { warn: console.warn, error: console.error, log: console.log };
    console.warn  = (...args: unknown[]) => logCapture.push(args.map(String).join(" "));
    console.error = (...args: unknown[]) => logCapture.push(args.map(String).join(" "));
    console.log   = (...args: unknown[]) => logCapture.push(args.map(String).join(" "));
    try {
      await validateAtlasDeviceKey(VALID_KEY, deps);
      const all = logCapture.join(" ");
      assert.ok(capturedHash.length > 0, "hash should have been computed");
      assert.ok(!all.includes(capturedHash), `deviceKeyHash leaked in logs: ${all.slice(0, 80)}`);
    } finally {
      console.warn = orig.warn; console.error = orig.error; console.log = orig.log;
    }
  });
});

// ── Security: device_key never appears in logs ────────────────────────────────

describe("security: device_key not leaked to logs", () => {
  const SENSITIVE = "SENSITIVE-KEY-MUST-NOT-APPEAR-4M";
  let saved: SavedEnv;
  const warnCapture: string[] = [];
  const errorCapture: string[] = [];
  const origWarn  = console.warn;
  const origError = console.error;

  beforeEach(() => {
    saved = saveEnv();
    warnCapture.length = 0;
    errorCapture.length = 0;
    console.warn  = (...args: unknown[]) => { warnCapture.push(args.map(String).join(" ")); };
    console.error = (...args: unknown[]) => { errorCapture.push(args.map(String).join(" ")); };
  });
  afterEach(() => { restoreEnv(saved); console.warn = origWarn; console.error = origError; });

  function allLogs(): string { return [...warnCapture, ...errorCapture].join(" "); }

  test("device_key not logged when wrong key in dev mode", async () => {
    setDevEnv("correct-key");
    await validateAtlasDeviceKey(SENSITIVE);
    assert.ok(!allLogs().includes(SENSITIVE), `device_key leaked in dev mode: ${allLogs()}`);
  });

  test("device_key not logged in open mode", async () => {
    setOpenEnv();
    await validateAtlasDeviceKey(SENSITIVE);
    assert.ok(!allLogs().includes(SENSITIVE), `device_key leaked in open mode: ${allLogs()}`);
  });

  test("device_key not logged in prod mode", async () => {
    setProdEnv();
    const failDeps = {
      findAtlasDeviceByKeyHash: async (_hash: string): Promise<FindAtlasDeviceResult> =>
        ({ ok: false, code: "DB_ERROR", message: "fail" }),
      touchAtlasDeviceLastSeen: async (_id: string): Promise<void> => {},
    };
    await validateAtlasDeviceKey(SENSITIVE, failDeps);
    assert.ok(!allLogs().includes(SENSITIVE), `device_key leaked in prod mode: ${allLogs()}`);
  });
});
