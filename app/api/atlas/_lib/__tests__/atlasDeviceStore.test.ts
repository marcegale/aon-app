/**
 * Phase 4M — Atlas Device Store Tests
 * Runner: node --experimental-strip-types --test <this-file>
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  findAtlasDeviceByKeyHash,
  touchAtlasDeviceLastSeen,
  listAtlasDevicesForUser,
  revokeAtlasDeviceForUser,
  type AtlasDeviceRecord,
  type AtlasDeviceListItem,
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

function makeListItem(overrides: Partial<AtlasDeviceListItem> = {}): AtlasDeviceListItem {
  return {
    id: "dev-test-id",
    deviceName: "Test Device",
    status: "active",
    platform: "windows",
    clientVersion: null,
    createdAt: new Date("2024-01-01"),
    lastSeenAt: null,
    revokedAt: null,
    ...overrides,
  };
}

function makeDb(overrides: {
  findUnique?: (args: unknown) => Promise<AtlasDeviceRecord | null>;
  findFirst?: (args: unknown) => Promise<AtlasDeviceListItem | null>;
  findMany?: (args: unknown) => Promise<AtlasDeviceListItem[]>;
  update?: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
} = {}): AtlasDeviceStoreDb {
  return {
    atlasDevice: {
      findUnique: overrides.findUnique ?? (async () => null),
      findFirst:  overrides.findFirst  ?? (async () => null),
      findMany:   overrides.findMany   ?? (async () => []),
      update:     overrides.update     ?? (async () => ({})),
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

  test("does not log the deviceId in any output (touch)", async () => {
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

// ── listAtlasDevicesForUser ───────────────────────────────────────────────────

describe("listAtlasDevicesForUser", () => {
  test("returns { ok:true, devices } with safe fields", async () => {
    const items = [makeListItem({ id: "d1" }), makeListItem({ id: "d2" })];
    const db = makeDb({ findMany: async () => items });
    const r = await listAtlasDevicesForUser("user-id", db);
    assert.ok(r.ok);
    if (r.ok) {
      assert.strictEqual(r.devices.length, 2);
      assert.strictEqual(r.devices[0].id, "d1");
    }
  });

  test("returns empty array when user has no devices", async () => {
    const db = makeDb({ findMany: async () => [] });
    const r = await listAtlasDevicesForUser("user-id", db);
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.devices.length, 0);
  });

  test("returns { ok:false, DB_ERROR } when findMany throws", async () => {
    const db = makeDb({ findMany: async () => { throw new Error("db fail"); } });
    const r = await listAtlasDevicesForUser("user-id", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("result items do not contain deviceKeyHash", async () => {
    const item = makeListItem();
    const db = makeDb({ findMany: async () => [item] });
    const r = await listAtlasDevicesForUser("user-id", db);
    assert.ok(r.ok);
    if (r.ok) {
      for (const d of r.devices) {
        assert.ok(!("deviceKeyHash" in d), "deviceKeyHash must not appear in list result");
      }
    }
  });
});

// ── revokeAtlasDeviceForUser ──────────────────────────────────────────────────

describe("revokeAtlasDeviceForUser", () => {
  test("active device → updates status:revoked + revokedAt", async () => {
    const device = makeListItem({ status: "active" });
    let capturedData: Record<string, unknown> | null = null;
    const db = makeDb({
      findFirst: async () => device,
      update: async ({ data }) => { capturedData = data; return {}; },
    });
    const r = await revokeAtlasDeviceForUser("dev-id", "user-id", db);
    assert.ok(r.ok);
    if (r.ok) {
      assert.strictEqual(r.device.status, "revoked");
      assert.ok(r.device.revokedAt instanceof Date, "revokedAt debe ser Date");
    }
    assert.ok(capturedData !== null, "update debe haberse llamado");
    assert.strictEqual((capturedData as Record<string, unknown>).status, "revoked");
    assert.ok((capturedData as Record<string, unknown>).revokedAt instanceof Date);
  });

  test("already revoked → ok:true without calling update", async () => {
    const existingRevokedAt = new Date(Date.now() - 10_000);
    const device = makeListItem({ status: "revoked", revokedAt: existingRevokedAt });
    let updateCalled = false;
    const db = makeDb({
      findFirst: async () => device,
      update: async () => { updateCalled = true; return {}; },
    });
    const r = await revokeAtlasDeviceForUser("dev-id", "user-id", db);
    assert.ok(r.ok);
    if (r.ok) {
      assert.strictEqual(r.device.status, "revoked");
      assert.deepStrictEqual(r.device.revokedAt, existingRevokedAt);
    }
    assert.ok(!updateCalled, "update no debe llamarse para device ya revocado");
  });

  test("device not found → NOT_FOUND", async () => {
    const db = makeDb({ findFirst: async () => null });
    const r = await revokeAtlasDeviceForUser("dev-id", "user-id", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "NOT_FOUND");
  });

  test("findFirst throws → DB_ERROR", async () => {
    const db = makeDb({ findFirst: async () => { throw new Error("conn fail"); } });
    const r = await revokeAtlasDeviceForUser("dev-id", "user-id", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("update throws → DB_ERROR", async () => {
    const device = makeListItem({ status: "active" });
    const db = makeDb({
      findFirst: async () => device,
      update: async () => { throw new Error("write fail"); },
    });
    const r = await revokeAtlasDeviceForUser("dev-id", "user-id", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("result device does not contain deviceKeyHash", async () => {
    const device = makeListItem({ status: "active" });
    const db = makeDb({ findFirst: async () => device, update: async () => ({}) });
    const r = await revokeAtlasDeviceForUser("dev-id", "user-id", db);
    assert.ok(r.ok);
    if (r.ok) {
      assert.ok(!("deviceKeyHash" in r.device), "deviceKeyHash must not appear in revoke result");
    }
  });
});
