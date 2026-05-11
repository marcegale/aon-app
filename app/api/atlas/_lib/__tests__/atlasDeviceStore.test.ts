/**
 * Phase 4M — Atlas Device Store Tests
 * Runner: node --experimental-strip-types --test <this-file>
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  findAtlasDeviceByKeyHash,
  touchAtlasDeviceLastSeen,
  type AtlasDeviceRecord,
  type AtlasDeviceStoreDb,
} from "../atlasDeviceStore.ts";

// ── Mock helpers ──────────────────────────────────────────────────────────────

function makeRecord(overrides: Partial<AtlasDeviceRecord> = {}): AtlasDeviceRecord {
  return {
    id: "dev-test-id",
    supabaseUserId: "user-test-id",
    status: "active",
    lastSeenAt: null,
    ...overrides,
  };
}

function makeDb(overrides: {
  findUnique?: (args: unknown) => Promise<AtlasDeviceRecord | null>;
  update?: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
} = {}): AtlasDeviceStoreDb {
  return {
    atlasDevice: {
      findUnique: overrides.findUnique ?? (async () => null),
      update: overrides.update ?? (async () => ({})),
    },
  };
}

// ── findAtlasDeviceByKeyHash ──────────────────────────────────────────────────

describe("findAtlasDeviceByKeyHash", () => {
  test("returns { ok:true, device } when device found", async () => {
    const record = makeRecord();
    const db = makeDb({ findUnique: async () => record });
    const r = await findAtlasDeviceByKeyHash("a".repeat(64), db);
    assert.ok(r.ok);
    if (r.ok) assert.deepEqual(r.device, record);
  });

  test("returns { ok:true, device:null } when device not found", async () => {
    const db = makeDb({ findUnique: async () => null });
    const r = await findAtlasDeviceByKeyHash("b".repeat(64), db);
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.device, null);
  });

  test("returns { ok:false, code:DB_ERROR } when findUnique throws", async () => {
    const db = makeDb({ findUnique: async () => { throw new Error("connection refused"); } });
    const r = await findAtlasDeviceByKeyHash("c".repeat(64), db);
    assert.ok(!r.ok);
    if (!r.ok) {
      assert.strictEqual(r.code, "DB_ERROR");
      assert.ok(r.message.length > 0);
    }
  });
});

// ── touchAtlasDeviceLastSeen ──────────────────────────────────────────────────

describe("touchAtlasDeviceLastSeen", () => {
  test("calls update with lastSeenAt as a Date", async () => {
    let capturedData: Record<string, unknown> | null = null;
    const db = makeDb({
      update: async ({ data }) => { capturedData = data; return {}; },
    });
    await touchAtlasDeviceLastSeen("dev-id", db);
    assert.ok(capturedData !== null, "update debe haberse llamado");
    assert.ok((capturedData as Record<string, unknown>).lastSeenAt instanceof Date, "lastSeenAt debe ser Date");
  });

  test("swallows update throw (best-effort)", async () => {
    const db = makeDb({ update: async () => { throw new Error("db gone"); } });
    await assert.doesNotReject(() => touchAtlasDeviceLastSeen("dev-id", db));
  });

  test("does not log the deviceId in any output", async () => {
    const logCapture: string[] = [];
    const orig = { log: console.log, error: console.error, warn: console.warn };
    console.log   = (...args: unknown[]) => logCapture.push(args.map(String).join(" "));
    console.error = (...args: unknown[]) => logCapture.push(args.map(String).join(" "));
    console.warn  = (...args: unknown[]) => logCapture.push(args.map(String).join(" "));
    try {
      const SENSITIVE_ID = "SENSITIVE-DEVICE-ID-MUST-NOT-APPEAR";
      await touchAtlasDeviceLastSeen(SENSITIVE_ID, makeDb());
      assert.ok(!logCapture.join(" ").includes(SENSITIVE_ID), `deviceId leaked in logs`);
    } finally {
      console.log   = orig.log;
      console.error = orig.error;
      console.warn  = orig.warn;
    }
  });
});
