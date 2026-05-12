/**
 * Phase 4O — Atlas Backend Device Lifecycle Integration Tests
 *
 * Runner:
 *   node --experimental-strip-types \
 *     --test app/api/atlas/__tests__/atlasDeviceLifecycle.test.ts
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import {
  createPendingRegistration,
  approveRegistrationByDeviceCode,
  pickupApprovedRegistrationByDeviceCode,
  cleanupExpiredPendingRegistrations,
  type PickupDb,
} from "../_lib/atlasRegistrationStore.ts";
import {
  listAtlasDevicesForUser,
  revokeAtlasDeviceForUser,
  type AtlasDeviceStoreDb,
  type AtlasDeviceListItem,
} from "../_lib/atlasDeviceStore.ts";
import { validateAtlasDeviceKey } from "../_lib/atlasDeviceAuth.ts";
import { hashAtlasDeviceKey } from "../_lib/atlasDeviceKey.ts";
import { hmacSha256hex } from "../_lib/atlasHashUtils.ts";

// ── Environment ───────────────────────────────────────────────────────────────

const TEST_SECRET = "test-lifecycle-secret-4o";
process.env.ATLAS_DEVICE_CODE_SECRET = TEST_SECRET;

// ── Fake store row types (mirror private interfaces in production stores) ──────

type FakeRegRow = {
  id: string;
  deviceCodeHash: string;
  status: string;
  platform: string;
  clientVersion: string | null;
  approvedByUserId: string | null;
  deviceName: string | null;
  deviceKeyHash: string | null;
  pickedUpAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  approvedAt: Date | null;
  completedAt: Date | null;
  deniedAt: Date | null;
  atlasDeviceId: string | null;
};

type FakeDevRow = {
  id: string;
  supabaseUserId: string;
  deviceName: string;
  deviceKeyHash: string;
  status: string;
  lastSeenAt: Date | null;
  createdAt: Date;
  revokedAt: Date | null;
  platform: string;
  clientVersion: string | null;
  fingerprint: string | null;
};

// ── FakeStore ─────────────────────────────────────────────────────────────────

class FakeStore {
  readonly regs      = new Map<string, FakeRegRow>();    // keyed by deviceCodeHash
  readonly devs      = new Map<string, FakeDevRow>();    // keyed by id
  readonly devsByHash = new Map<string, FakeDevRow>();   // keyed by deviceKeyHash

  private findAndUpdateReg(id: string, data: Record<string, unknown>): FakeRegRow {
    for (const [k, r] of this.regs.entries()) {
      if (r.id === id) {
        const updated = { ...r, ...(data as Partial<FakeRegRow>) };
        this.regs.set(k, updated);
        return updated;
      }
    }
    throw new Error(`Registration not found: ${id}`);
  }

  private findAndUpdateDev(id: string, data: Record<string, unknown>): FakeDevRow {
    const dev = this.devs.get(id);
    if (!dev) throw new Error(`Device not found: ${id}`);
    const updated = { ...dev, ...(data as Partial<FakeDevRow>) };
    this.devs.set(id, updated);
    this.devsByHash.set(updated.deviceKeyHash, updated);
    return updated;
  }

  asPickupDb(): PickupDb {
    const store = this;
    const db = {
      atlasDeviceRegistration: {
        async create({ data }: { data: Record<string, unknown> }) {
          const row: FakeRegRow = {
            id:              randomUUID(),
            deviceCodeHash:  data.deviceCodeHash as string,
            status:          (data.status         as string)        ?? "pending",
            platform:        data.platform        as string,
            clientVersion:   (data.clientVersion  as string | null) ?? null,
            approvedByUserId: null,
            deviceName:      null,
            deviceKeyHash:   null,
            pickedUpAt:      null,
            expiresAt:       data.expiresAt       as Date,
            createdAt:       new Date(),
            approvedAt:      null,
            completedAt:     null,
            deniedAt:        null,
            atlasDeviceId:   null,
          };
          store.regs.set(row.deviceCodeHash, row);
          return row;
        },
        async findUnique({ where }: { where: { deviceCodeHash: string } }) {
          return store.regs.get(where.deviceCodeHash) ?? null;
        },
        async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
          return store.findAndUpdateReg(where.id, data);
        },
        async updateMany({ where, data }: { where: { status: string; expiresAt: { lt: Date } }; data: { status: string } }) {
          let count = 0;
          for (const [k, r] of store.regs.entries()) {
            if (r.status === where.status && r.expiresAt < where.expiresAt.lt) {
              store.regs.set(k, { ...r, status: data.status });
              count++;
            }
          }
          return { count };
        },
      },
      atlasDevice: {
        async create({ data }: { data: Record<string, unknown> }) {
          const dev: FakeDevRow = {
            id:             randomUUID(),
            supabaseUserId: data.supabaseUserId as string,
            deviceName:     data.deviceName     as string,
            deviceKeyHash:  data.deviceKeyHash  as string,
            status:         "active",
            lastSeenAt:     null,
            createdAt:      new Date(),
            revokedAt:      null,
            platform:       data.platform       as string,
            clientVersion:  (data.clientVersion as string | null) ?? null,
            fingerprint:    null,
          };
          store.devs.set(dev.id, dev);
          store.devsByHash.set(dev.deviceKeyHash, dev);
          return dev;
        },
      },
      $transaction: async <T>(fn: (tx: PickupDb) => Promise<T>): Promise<T> => fn(db as unknown as PickupDb),
    };
    return db as unknown as PickupDb;
  }

  asDeviceStoreDb(): AtlasDeviceStoreDb {
    const store = this;
    return {
      atlasDevice: {
        async findUnique({ where }: { where: { deviceKeyHash: string }; select?: Record<string, unknown> }) {
          const dev = store.devsByHash.get(where.deviceKeyHash);
          if (!dev) return null;
          return { id: dev.id, supabaseUserId: dev.supabaseUserId, status: dev.status, lastSeenAt: dev.lastSeenAt };
        },
        async findFirst({ where }: { where: Record<string, unknown>; select?: Record<string, unknown> }) {
          for (const dev of store.devs.values()) {
            if (matchWhere(dev, where)) return toListItem(dev);
          }
          return null;
        },
        async findMany({ where }: { where: Record<string, unknown>; select?: Record<string, unknown>; orderBy?: unknown }) {
          const result: AtlasDeviceListItem[] = [];
          for (const dev of store.devs.values()) {
            if (matchWhere(dev, where)) result.push(toListItem(dev));
          }
          return result;
        },
        async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
          return store.findAndUpdateDev(where.id, data);
        },
      },
    };
  }

  authDeps() {
    const store = this;
    return {
      findAtlasDeviceByKeyHash: async (hash: string) => {
        const dev = store.devsByHash.get(hash);
        if (!dev) return { ok: true as const, device: null };
        return {
          ok: true as const,
          device: { id: dev.id, supabaseUserId: dev.supabaseUserId, status: dev.status, lastSeenAt: dev.lastSeenAt },
        };
      },
      touchAtlasDeviceLastSeen: async (id: string) => {
        const dev = store.devs.get(id);
        if (!dev) return;
        const updated = { ...dev, lastSeenAt: new Date() };
        store.devs.set(id, updated);
        store.devsByHash.set(updated.deviceKeyHash, updated);
      },
    };
  }

  expireAllRegistrations(): void {
    const past = new Date(Date.now() - 1_000);
    for (const [k, r] of this.regs.entries()) {
      this.regs.set(k, { ...r, expiresAt: past });
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchWhere(dev: FakeDevRow, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([k, v]) => (dev as unknown as Record<string, unknown>)[k] === v);
}

function toListItem(dev: FakeDevRow): AtlasDeviceListItem {
  return {
    id:            dev.id,
    deviceName:    dev.deviceName,
    status:        dev.status,
    platform:      dev.platform,
    clientVersion: dev.clientVersion,
    createdAt:     dev.createdAt,
    lastSeenAt:    dev.lastSeenAt,
    revokedAt:     dev.revokedAt,
  };
}

async function withProdEnv<T>(fn: () => Promise<T>): Promise<T> {
  const savedNodeEnv = process.env.NODE_ENV;
  const savedDevKey  = process.env.ATLAS_DEV_DEVICE_KEY;
  process.env.NODE_ENV = "production";
  delete process.env.ATLAS_DEV_DEVICE_KEY;
  try {
    return await fn();
  } finally {
    if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = savedNodeEnv;
    if (savedDevKey === undefined) delete process.env.ATLAS_DEV_DEVICE_KEY;
    else process.env.ATLAS_DEV_DEVICE_KEY = savedDevKey;
  }
}

// Runs the full create → approve → pickup flow; returns device_key + deviceId.
async function register(
  store: FakeStore,
  opts: { device_code: string; supabaseUserId: string; deviceName?: string },
): Promise<{ device_key: string; deviceId: string }> {
  const db = store.asPickupDb();

  const cr = await createPendingRegistration(
    { device_code: opts.device_code, platform: "windows", clientVersion: "4O" },
    db,
  );
  assert.ok(cr.ok, `createPending failed: ${JSON.stringify(cr)}`);

  const ar = await approveRegistrationByDeviceCode(
    {
      device_code:    opts.device_code,
      supabaseUserId: opts.supabaseUserId,
      deviceName:     opts.deviceName ?? "Test Device 4O",
    },
    db,
  );
  assert.ok(ar.ok, `approve failed: ${JSON.stringify(ar)}`);

  const pr = await pickupApprovedRegistrationByDeviceCode(opts.device_code, db);
  assert.ok(pr.ok);
  assert.strictEqual(pr.status, "approved");
  if (!pr.ok || pr.status !== "approved") throw new Error("unreachable");

  return { device_key: pr.device_key, deviceId: pr.deviceId };
}

// ── Test 1 — Full happy path ──────────────────────────────────────────────────

test("full lifecycle: register → approve → pickup → auth → list → revoke → auth fails", async () => {
  const store     = new FakeStore();
  const userId    = "user-lifecycle-4o";
  const devCode   = "device-code-full-lifecycle";

  // 1. Register
  const { device_key, deviceId } = await register(store, { device_code: devCode, supabaseUserId: userId });
  assert.ok(device_key.startsWith("atl_"), "device_key must have atl_ prefix");

  // 2. Created device must be active
  const dev = store.devs.get(deviceId);
  assert.ok(dev, "device must exist in store");
  assert.strictEqual(dev!.status, "active");
  assert.strictEqual(dev!.supabaseUserId, userId);

  // 3. Auth with raw key in prod mode → ok
  const authOk = await withProdEnv(() =>
    validateAtlasDeviceKey(device_key, store.authDeps()),
  );
  assert.ok(authOk.ok);
  if (authOk.ok) {
    assert.strictEqual(authOk.mode, "prod");
    assert.strictEqual(authOk.deviceId, deviceId);
    assert.strictEqual(authOk.supabaseUserId, userId);
  }

  // 4. List devices — own device appears
  const listResult = await listAtlasDevicesForUser(userId, store.asDeviceStoreDb());
  assert.ok(listResult.ok);
  if (listResult.ok) {
    assert.strictEqual(listResult.devices.length, 1);
    assert.strictEqual(listResult.devices[0].id, deviceId);
    assert.strictEqual(listResult.devices[0].status, "active");
  }

  // 5. Revoke
  const revokeResult = await revokeAtlasDeviceForUser(deviceId, userId, store.asDeviceStoreDb());
  assert.ok(revokeResult.ok);
  if (revokeResult.ok) {
    assert.strictEqual(revokeResult.device.status, "revoked");
    assert.ok(revokeResult.device.revokedAt instanceof Date);
  }

  // 6. Auth after revocation → DEVICE_REVOKED
  const authRevoked = await withProdEnv(() =>
    validateAtlasDeviceKey(device_key, store.authDeps()),
  );
  assert.ok(!authRevoked.ok);
  if (!authRevoked.ok) {
    assert.strictEqual(authRevoked.code, "DEVICE_REVOKED");
    assert.strictEqual(authRevoked.httpStatus, 401);
  }
});

// ── Test 2 — One-time pickup ──────────────────────────────────────────────────

test("one-time pickup: second call returns completed with no device_key", async () => {
  const store   = new FakeStore();
  const db      = store.asPickupDb();
  const devCode = "device-code-one-time";
  const userId  = "user-one-time";

  await createPendingRegistration({ device_code: devCode, platform: "windows" }, db);
  await approveRegistrationByDeviceCode({ device_code: devCode, supabaseUserId: userId }, db);

  // First pickup
  const first = await pickupApprovedRegistrationByDeviceCode(devCode, db);
  assert.ok(first.ok);
  assert.strictEqual(first.status, "approved");
  assert.ok(first.ok && first.status === "approved" && "device_key" in first);

  // Second pickup
  const second = await pickupApprovedRegistrationByDeviceCode(devCode, db);
  assert.ok(second.ok);
  assert.strictEqual(second.status, "completed");
  assert.ok(!("device_key" in second), "second pickup must not include device_key");

  // Exactly one device created
  assert.strictEqual(store.devs.size, 1);
});

// ── Test 3 — Ownership isolation ─────────────────────────────────────────────

test("ownership isolation: cross-user list and revoke are blocked", async () => {
  const store  = new FakeStore();
  const userA  = "user-owner-a";
  const userB  = "user-owner-b";
  const devCode = "device-code-isolation";

  const { deviceId } = await register(store, { device_code: devCode, supabaseUserId: userA });
  const deviceStoreDb = store.asDeviceStoreDb();

  // userB cannot list userA's devices
  const listB = await listAtlasDevicesForUser(userB, deviceStoreDb);
  assert.ok(listB.ok);
  if (listB.ok) assert.strictEqual(listB.devices.length, 0);

  // userB cannot revoke userA's device
  const revokeB = await revokeAtlasDeviceForUser(deviceId, userB, deviceStoreDb);
  assert.ok(!revokeB.ok);
  if (!revokeB.ok) assert.strictEqual(revokeB.code, "NOT_FOUND");

  // userA can list their own device
  const listA = await listAtlasDevicesForUser(userA, deviceStoreDb);
  assert.ok(listA.ok);
  if (listA.ok) assert.strictEqual(listA.devices.length, 1);

  // userA can revoke their own device
  const revokeA = await revokeAtlasDeviceForUser(deviceId, userA, deviceStoreDb);
  assert.ok(revokeA.ok);
});

// ── Test 4 — Expired registration ────────────────────────────────────────────

test("expired registration: pickup and approve fail, no device created", async () => {
  const store   = new FakeStore();
  const db      = store.asPickupDb();
  const devCode = "device-code-expired";
  const userId  = "user-expired";

  await createPendingRegistration({ device_code: devCode, platform: "windows" }, db);

  // Simulate time passing — expire the row
  store.expireAllRegistrations();

  // Approve must reject with REGISTRATION_EXPIRED
  const approveResult = await approveRegistrationByDeviceCode(
    { device_code: devCode, supabaseUserId: userId },
    db,
  );
  assert.ok(!approveResult.ok);
  if (!approveResult.ok) assert.strictEqual(approveResult.code, "REGISTRATION_EXPIRED");

  // Pickup must return expired
  const pickupResult = await pickupApprovedRegistrationByDeviceCode(devCode, db);
  assert.ok(pickupResult.ok);
  if (pickupResult.ok) assert.strictEqual(pickupResult.status, "expired");

  // No device was created, no device_key issued
  assert.strictEqual(store.devs.size, 0);
});

// ── Test 5 — Security invariants ─────────────────────────────────────────────

describe("security invariants", () => {
  test("raw device_key is not stored — only its SHA-256 hash is persisted", async () => {
    const store   = new FakeStore();
    const devCode = "device-code-sec-key";
    const userId  = "user-sec-key";

    const { device_key } = await register(store, { device_code: devCode, supabaseUserId: userId });
    const expectedHash = hashAtlasDeviceKey(device_key);

    // Registration row stores hash, not raw key
    const regRow = [...store.regs.values()][0];
    assert.ok(regRow.deviceKeyHash !== device_key, "registration must not store raw device_key");
    assert.strictEqual(regRow.deviceKeyHash, expectedHash, "registration must store correct hash");

    // Device row stores hash, not raw key
    const devRow = [...store.devs.values()][0];
    assert.ok(devRow.deviceKeyHash !== device_key, "device must not store raw device_key");
    assert.strictEqual(devRow.deviceKeyHash, expectedHash, "device must store correct hash");
  });

  test("raw device_code is not stored — only its HMAC-SHA256 hash is used as key", async () => {
    const store   = new FakeStore();
    const devCode = "raw-device-code-sec-test";
    const db      = store.asPickupDb();

    await createPendingRegistration({ device_code: devCode, platform: "windows" }, db);

    // The map key must be the HMAC hash, not the raw code
    const storedKeys = [...store.regs.keys()];
    assert.strictEqual(storedKeys.length, 1);
    const key = storedKeys[0];
    assert.ok(key !== devCode, "raw device_code must not appear as store key");
    assert.strictEqual(key, hmacSha256hex(devCode, TEST_SECRET), "stored key must be HMAC-SHA256 of device_code");
  });

  test("listAtlasDevicesForUser result does not include deviceKeyHash", async () => {
    const store  = new FakeStore();
    const userId = "user-sec-list";

    await register(store, { device_code: "device-code-sec-list", supabaseUserId: userId });

    const result = await listAtlasDevicesForUser(userId, store.asDeviceStoreDb());
    assert.ok(result.ok);
    if (result.ok) {
      for (const d of result.devices) {
        assert.ok(!("deviceKeyHash" in d), "deviceKeyHash must not appear in list result");
        assert.ok(!("supabaseUserId" in d), "supabaseUserId must not appear in list result");
      }
    }
  });

  test("logs during registration and pickup do not include raw device_code or device_key", async () => {
    const store   = new FakeStore();
    const db      = store.asPickupDb();
    const SENSITIVE_CODE = "SENSITIVE-CODE-MUST-NOT-LOG";
    const logs: string[] = [];

    const saved = { log: console.log, warn: console.warn, error: console.error };
    console.log   = (...a: unknown[]) => logs.push(a.map(String).join(" "));
    console.warn  = (...a: unknown[]) => logs.push(a.map(String).join(" "));
    console.error = (...a: unknown[]) => logs.push(a.map(String).join(" "));

    let device_key = "";
    try {
      await createPendingRegistration({ device_code: SENSITIVE_CODE, platform: "windows" }, db);
      await approveRegistrationByDeviceCode({ device_code: SENSITIVE_CODE, supabaseUserId: "user-log" }, db);
      const pr = await pickupApprovedRegistrationByDeviceCode(SENSITIVE_CODE, db);
      if (pr.ok && pr.status === "approved") device_key = pr.device_key;
    } finally {
      console.log   = saved.log;
      console.warn  = saved.warn;
      console.error = saved.error;
    }

    const combined = logs.join(" ");
    assert.ok(!combined.includes(SENSITIVE_CODE), "raw device_code must not appear in logs");
    if (device_key) {
      assert.ok(!combined.includes(device_key), "raw device_key must not appear in logs");
    }
  });
});

// ── Test 6 — Production auth errors ──────────────────────────────────────────

describe("production auth errors", () => {
  test("unknown device_key → INVALID_DEVICE_KEY (401)", async () => {
    const store = new FakeStore(); // empty store — no devices
    const result = await withProdEnv(() =>
      validateAtlasDeviceKey("atl_" + "x".repeat(64), store.authDeps()),
    );
    assert.ok(!result.ok);
    if (!result.ok) {
      assert.strictEqual(result.code, "INVALID_DEVICE_KEY");
      assert.strictEqual(result.httpStatus, 401);
    }
  });

  test("revoked device → DEVICE_REVOKED (401)", async () => {
    const store  = new FakeStore();
    const userId = "user-auth-revoked";
    const { device_key, deviceId } = await register(store, {
      device_code: "device-code-auth-revoked",
      supabaseUserId: userId,
    });

    await revokeAtlasDeviceForUser(deviceId, userId, store.asDeviceStoreDb());

    const result = await withProdEnv(() =>
      validateAtlasDeviceKey(device_key, store.authDeps()),
    );
    assert.ok(!result.ok);
    if (!result.ok) {
      assert.strictEqual(result.code, "DEVICE_REVOKED");
      assert.strictEqual(result.httpStatus, 401);
    }
  });

  test("DB lookup failure → DEVICE_AUTH_UNAVAILABLE (503)", async () => {
    const failingDeps = {
      findAtlasDeviceByKeyHash: async (_: string) => ({
        ok: false as const,
        code: "DB_ERROR" as const,
        message: "simulated DB failure",
      }),
      touchAtlasDeviceLastSeen: async (_: string) => {},
    };

    const result = await withProdEnv(() =>
      validateAtlasDeviceKey("atl_" + "a".repeat(64), failingDeps),
    );
    assert.ok(!result.ok);
    if (!result.ok) {
      assert.strictEqual(result.code, "DEVICE_AUTH_UNAVAILABLE");
      assert.strictEqual(result.httpStatus, 503);
    }
  });
});

// ── Test 7+8 — Registration cleanup integration ───────────────────────────────

describe("registration cleanup integration", () => {
  test("cleanup marks expired pending registration — subsequent pickup returns expired, no device_key", async () => {
    const store   = new FakeStore();
    const db      = store.asPickupDb();
    const devCode = "device-code-cleanup-lifecycle";

    // Create pending registration, then simulate expiry
    await createPendingRegistration({ device_code: devCode, platform: "windows" }, db);
    store.expireAllRegistrations();

    // Cleanup runs → count 1
    const cleanupResult = await cleanupExpiredPendingRegistrations(db);
    assert.ok(cleanupResult.ok);
    if (cleanupResult.ok) assert.strictEqual(cleanupResult.count, 1);

    // Store row is now expired
    const regRow = [...store.regs.values()][0];
    assert.strictEqual(regRow.status, "expired");

    // Pickup sees expired status — no device_key issued
    const pickupResult = await pickupApprovedRegistrationByDeviceCode(devCode, db);
    assert.ok(pickupResult.ok);
    if (pickupResult.ok) assert.strictEqual(pickupResult.status, "expired");
    assert.ok(!("device_key" in (pickupResult.ok ? pickupResult : {})), "no device_key for expired");

    // No device created
    assert.strictEqual(store.devs.size, 0);
  });

  test("cleanup does not affect approved, completed, or denied registrations", async () => {
    const store   = new FakeStore();
    const db      = store.asPickupDb();
    const userId  = "user-cleanup-isolation";

    // 1. Register and approve one device (status → approved, not yet picked up)
    await createPendingRegistration({ device_code: "code-approved", platform: "windows" }, db);
    await approveRegistrationByDeviceCode({ device_code: "code-approved", supabaseUserId: userId }, db);

    // 2. Create and fully complete another (status → completed)
    await createPendingRegistration({ device_code: "code-completed", platform: "windows" }, db);
    await approveRegistrationByDeviceCode({ device_code: "code-completed", supabaseUserId: userId }, db);
    await pickupApprovedRegistrationByDeviceCode("code-completed", db);

    // 3. Create one pending and expire it
    await createPendingRegistration({ device_code: "code-expired", platform: "windows" }, db);
    for (const [k, r] of store.regs.entries()) {
      if (r.status === "pending") store.regs.set(k, { ...r, expiresAt: new Date(Date.now() - 1_000) });
    }

    // Snapshot statuses before cleanup
    const before = [...store.regs.values()].map(r => ({ hash: r.deviceCodeHash.slice(0, 8), status: r.status }));
    const approvedBefore  = before.filter(r => r.status === "approved").length;
    const completedBefore = before.filter(r => r.status === "completed").length;
    const pendingBefore   = before.filter(r => r.status === "pending").length;

    assert.strictEqual(approvedBefore,  1);
    assert.strictEqual(completedBefore, 1);
    assert.strictEqual(pendingBefore,   1);

    // Run cleanup
    const cleanupResult = await cleanupExpiredPendingRegistrations(db);
    assert.ok(cleanupResult.ok);
    if (cleanupResult.ok) assert.strictEqual(cleanupResult.count, 1, "only 1 pending-expired row touched");

    // After cleanup: approved and completed rows are unchanged
    const after = [...store.regs.values()];
    const approvedAfter  = after.filter(r => r.status === "approved").length;
    const completedAfter = after.filter(r => r.status === "completed").length;
    const expiredAfter   = after.filter(r => r.status === "expired").length;

    assert.strictEqual(approvedAfter,  1, "approved row must remain approved");
    assert.strictEqual(completedAfter, 1, "completed row must remain completed");
    assert.strictEqual(expiredAfter,   1, "only the pending-expired row becomes expired");
  });
});
