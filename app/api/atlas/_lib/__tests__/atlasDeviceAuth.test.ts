/**
 * Fase 4C — Auth Hardening Tests
 * Runner: node --experimental-strip-types --test <this-file>
 * No external test framework — uses Node's built-in node:test + assert.
 *
 * Invariant under test: device_key is NEVER logged anywhere.
 */

import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  getAtlasAuthMode,
  validateAtlasDeviceKey,
} from "../atlasDeviceAuth.ts";

// ── Env isolation helpers ─────────────────────────────────────────────────────

type EnvKey = "ATLAS_DEV_DEVICE_KEY" | "NODE_ENV";
type SavedEnv = Record<EnvKey, string | undefined>;

const ENV_KEYS: EnvKey[] = ["ATLAS_DEV_DEVICE_KEY", "NODE_ENV"];

function saveEnv(): SavedEnv {
  return Object.fromEntries(
    ENV_KEYS.map((k) => [k, process.env[k]])
  ) as SavedEnv;
}

function restoreEnv(saved: SavedEnv): void {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = saved[key];
    }
  }
}

function setDevEnv(deviceKey: string): void {
  process.env.ATLAS_DEV_DEVICE_KEY = deviceKey;
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

  test("correct key returns ok:true, mode:'dev'", () => {
    const r = validateAtlasDeviceKey(DEV_KEY);
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.mode, "dev");
  });

  test("incorrect key returns ok:false, 401, INVALID_DEVICE_KEY", () => {
    const r = validateAtlasDeviceKey("wrong-key");
    assert.ok(!r.ok);
    if (!r.ok) {
      assert.strictEqual(r.httpStatus, 401);
      assert.strictEqual(r.code, "INVALID_DEVICE_KEY");
    }
  });

  test("missing device_key (undefined) returns ok:false, 401, INVALID_DEVICE_KEY", () => {
    const r = validateAtlasDeviceKey(undefined);
    assert.ok(!r.ok);
    if (!r.ok) {
      assert.strictEqual(r.httpStatus, 401);
      assert.strictEqual(r.code, "INVALID_DEVICE_KEY");
    }
  });

  test("empty string returns ok:false, 401, INVALID_DEVICE_KEY", () => {
    const r = validateAtlasDeviceKey("");
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
    console.warn = (...args: unknown[]) => {
      warnCapture.push(args.map(String).join(" "));
    };
  });
  afterEach(() => {
    restoreEnv(saved);
    console.warn = origWarn;
  });

  test("returns ok:true, mode:'open' regardless of device_key", () => {
    const r = validateAtlasDeviceKey("whatever");
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.mode, "open");
  });

  test("emits a console.warn (not silent about missing key)", () => {
    validateAtlasDeviceKey("whatever");
    assert.ok(warnCapture.length > 0, "expected at least one console.warn call");
  });
});

// ── validateAtlasDeviceKey — prod mode ───────────────────────────────────────

describe("validateAtlasDeviceKey — prod mode", () => {
  let saved: SavedEnv;
  const errorCapture: string[] = [];
  const origError = console.error;

  beforeEach(() => {
    saved = saveEnv();
    setProdEnv();
    errorCapture.length = 0;
    console.error = (...args: unknown[]) => {
      errorCapture.push(args.map(String).join(" "));
    };
  });
  afterEach(() => {
    restoreEnv(saved);
    console.error = origError;
  });

  test("returns ok:false, 503, DEVICE_AUTH_NOT_CONFIGURED", () => {
    const r = validateAtlasDeviceKey("anything");
    assert.ok(!r.ok);
    if (!r.ok) {
      assert.strictEqual(r.httpStatus, 503);
      assert.strictEqual(r.code, "DEVICE_AUTH_NOT_CONFIGURED");
    }
  });

  test("emits a console.error (not silent in prod)", () => {
    validateAtlasDeviceKey("anything");
    assert.ok(errorCapture.length > 0, "expected at least one console.error call");
  });
});

// ── Security: device_key never appears in logs ────────────────────────────────

describe("security: device_key not leaked to logs", () => {
  // Use a distinctive value that would be unmistakable in any log output.
  const SENSITIVE = "SENSITIVE-KEY-MUST-NOT-APPEAR-4C";
  let saved: SavedEnv;
  const warnCapture: string[] = [];
  const errorCapture: string[] = [];
  const origWarn = console.warn;
  const origError = console.error;

  beforeEach(() => {
    saved = saveEnv();
    warnCapture.length = 0;
    errorCapture.length = 0;
    console.warn  = (...args: unknown[]) => { warnCapture.push(args.map(String).join(" ")); };
    console.error = (...args: unknown[]) => { errorCapture.push(args.map(String).join(" ")); };
  });
  afterEach(() => {
    restoreEnv(saved);
    console.warn  = origWarn;
    console.error = origError;
  });

  function allLogs(): string {
    return [...warnCapture, ...errorCapture].join(" ");
  }

  test("device_key not logged when wrong key in dev mode", () => {
    setDevEnv("correct-key");
    validateAtlasDeviceKey(SENSITIVE); // wrong key — no console calls expected
    assert.ok(!allLogs().includes(SENSITIVE), `device_key leaked in dev mode: ${allLogs()}`);
  });

  test("device_key not logged in open mode", () => {
    setOpenEnv();
    validateAtlasDeviceKey(SENSITIVE); // warn fires but must not contain the key
    assert.ok(!allLogs().includes(SENSITIVE), `device_key leaked in open mode: ${allLogs()}`);
  });

  test("device_key not logged in prod mode", () => {
    setProdEnv();
    validateAtlasDeviceKey(SENSITIVE); // error fires but must not contain the key
    assert.ok(!allLogs().includes(SENSITIVE), `device_key leaked in prod mode: ${allLogs()}`);
  });
});
