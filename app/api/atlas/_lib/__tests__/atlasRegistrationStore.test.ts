/**
 * Phase 4H — Registration Store Tests
 * Runner: node --experimental-strip-types --test <this-file>
 * No DB — all Prisma calls are intercepted via DI parameter.
 */

import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  createPendingRegistration,
  getRegistrationByDeviceCode,
  expirePendingRegistrationIfNeeded,
  getPollStatusByDeviceCode,
  approveRegistrationByDeviceCode,
  pickupApprovedRegistrationByDeviceCode,
  cleanupExpiredPendingRegistrations,
  type RegistrationDb,
  type RegistrationRecord,
  type PickupDb,
} from "../atlasRegistrationStore.ts";

// ── Mock types ────────────────────────────────────────────────────────────────

type DbRow = {
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

// ── Mock helpers ──────────────────────────────────────────────────────────────

function makeRow(overrides: Partial<DbRow> = {}): DbRow {
  return {
    id: "reg-test-id",
    deviceCodeHash: "a".repeat(64),
    status: "pending",
    platform: "windows",
    clientVersion: null,
    approvedByUserId: null,
    deviceName: null,
    deviceKeyHash: null,
    pickedUpAt: null,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    createdAt: new Date(),
    approvedAt: null,
    completedAt: null,
    deniedAt: null,
    atlasDeviceId: null,
    ...overrides,
  };
}

type DbOverrides = {
  create?: (args: { data: Record<string, unknown> }) => Promise<DbRow>;
  findUnique?: (args: { where: { deviceCodeHash: string } }) => Promise<DbRow | null>;
  update?: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<DbRow>;
  updateMany?: (args: { where: { status: string; expiresAt: { lt: Date } }; data: { status: string } }) => Promise<{ count: number }>;
};

function makeDb(overrides: DbOverrides = {}): RegistrationDb {
  return {
    atlasDeviceRegistration: {
      create: overrides.create ?? (async ({ data }) => makeRow(data as Partial<DbRow>)),
      findUnique: overrides.findUnique ?? (async () => null),
      update: overrides.update ?? (async ({ where, data }) =>
        makeRow({ id: where.id, ...data as Partial<DbRow> })
      ),
      updateMany: overrides.updateMany ?? (async () => ({ count: 0 })),
    },
  };
}

// ── PickupDb mock helpers ─────────────────────────────────────────────────────

type DbDeviceRow = {
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

function makeDeviceRow(overrides: Partial<DbDeviceRow> = {}): DbDeviceRow {
  return {
    id: "device-test-id",
    supabaseUserId: "user-test",
    deviceName: "Atlas Desktop",
    deviceKeyHash: "b".repeat(64),
    status: "active",
    lastSeenAt: null,
    createdAt: new Date(),
    revokedAt: null,
    platform: "windows",
    clientVersion: null,
    fingerprint: null,
    ...overrides,
  };
}

type TransactionFn = <T>(fn: (tx: PickupDb) => Promise<T>) => Promise<T>;

type PickupDbOverrides = DbOverrides & {
  atlasDeviceCreate?: (args: { data: Record<string, unknown> }) => Promise<DbDeviceRow>;
  $transaction?: TransactionFn;
};

function makePickupDb(overrides: PickupDbOverrides = {}): PickupDb {
  const self: PickupDb = {
    atlasDeviceRegistration: {
      create: overrides.create ?? (async ({ data }) => makeRow(data as Partial<DbRow>)),
      findUnique: overrides.findUnique ?? (async () => null),
      update: overrides.update ?? (async ({ where, data }) =>
        makeRow({ id: where.id, ...data as Partial<DbRow> })
      ),
      updateMany: overrides.updateMany ?? (async () => ({ count: 0 })),
    },
    atlasDevice: {
      create: overrides.atlasDeviceCreate ?? (async () => makeDeviceRow()),
    },
    $transaction: overrides.$transaction ?? ((fn) => fn(self)),
  };
  return self;
}

// ── Env isolation ─────────────────────────────────────────────────────────────

let savedSecret: string | undefined;

function saveEnv(): void { savedSecret = process.env.ATLAS_DEVICE_CODE_SECRET; }
function restoreEnv(): void {
  if (savedSecret === undefined) delete process.env.ATLAS_DEVICE_CODE_SECRET;
  else process.env.ATLAS_DEVICE_CODE_SECRET = savedSecret;
}
function setSecret(s = "test-secret-32chars-padded!!!!!!"): void {
  process.env.ATLAS_DEVICE_CODE_SECRET = s;
}
function clearSecret(): void { delete process.env.ATLAS_DEVICE_CODE_SECRET; }

// ── createPendingRegistration ─────────────────────────────────────────────────

describe("createPendingRegistration", () => {
  beforeEach(saveEnv);
  afterEach(restoreEnv);

  test("SECRET_NOT_CONFIGURED cuando falta env var", async () => {
    clearSecret();
    const r = await createPendingRegistration({ device_code: "ABCD1234", platform: "windows" }, makeDb());
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "SECRET_NOT_CONFIGURED");
  });

  test("crea pending con expiresAt aproximadamente +15 min", async () => {
    setSecret();
    const before = Date.now();
    const r = await createPendingRegistration({ device_code: "ABCD1234", platform: "linux" }, makeDb());
    assert.ok(r.ok);
    if (r.ok) {
      assert.strictEqual(r.data.status, "pending");
      const diff = r.data.expiresAt.getTime() - before;
      assert.ok(diff >= 14 * 60 * 1000, `expiresAt demasiado pronto: ${diff}ms`);
      assert.ok(diff <= 16 * 60 * 1000, `expiresAt demasiado tarde: ${diff}ms`);
    }
  });

  test("usa HMAC para deviceCodeHash — no guarda device_code raw", async () => {
    setSecret();
    let captured: Record<string, unknown> | null = null;
    const db = makeDb({
      create: async ({ data }) => { captured = data; return makeRow(data as Partial<DbRow>); },
    });
    await createPendingRegistration({ device_code: "RAWCODE1", platform: "windows" }, db);
    assert.ok(captured !== null, "create debe haberse llamado");
    const d = captured as Record<string, unknown>;
    assert.ok(!("device_code" in d), "device_code raw no debe guardarse");
    assert.ok("deviceCodeHash" in d, "deviceCodeHash debe estar presente");
    const hash = d.deviceCodeHash as string;
    assert.strictEqual(hash.length, 64, "HMAC-SHA256 debe ser 64 hex chars");
    assert.match(hash, /^[0-9a-f]{64}$/, "debe ser hex lowercase");
  });

  test("DB_ERROR cuando db.create lanza", async () => {
    setSecret();
    const db = makeDb({ create: async () => { throw new Error("connection refused"); } });
    const r = await createPendingRegistration({ device_code: "ABCD1234", platform: "windows" }, db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });
});

// ── getRegistrationByDeviceCode ───────────────────────────────────────────────

describe("getRegistrationByDeviceCode", () => {
  beforeEach(saveEnv);
  afterEach(restoreEnv);

  test("SECRET_NOT_CONFIGURED cuando falta env var", async () => {
    clearSecret();
    const r = await getRegistrationByDeviceCode("ABCD1234", makeDb());
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "SECRET_NOT_CONFIGURED");
  });

  test("null cuando findUnique retorna null", async () => {
    setSecret();
    const r = await getRegistrationByDeviceCode("ABCD1234", makeDb({ findUnique: async () => null }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.data, null);
  });

  test("retorna record existente aunque expiresAt esté en el pasado", async () => {
    setSecret();
    const expiredRow = makeRow({ status: "pending", expiresAt: new Date(Date.now() - 1_000) });
    const r = await getRegistrationByDeviceCode("ABCD1234", makeDb({ findUnique: async () => expiredRow }));
    assert.ok(r.ok);
    if (r.ok) {
      assert.ok(r.data !== null, "debe retornar el record aunque esté expirado");
      assert.strictEqual(r.data?.status, "pending");
    }
  });

  test("DB_ERROR cuando findUnique lanza", async () => {
    setSecret();
    const db = makeDb({ findUnique: async () => { throw new Error("timeout"); } });
    const r = await getRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });
});

// ── expirePendingRegistrationIfNeeded ─────────────────────────────────────────

describe("expirePendingRegistrationIfNeeded", () => {
  function makeRecord(overrides: Partial<RegistrationRecord> = {}): RegistrationRecord {
    return {
      id: "rec-id",
      status: "pending",
      platform: "windows",
      clientVersion: null,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      approvedAt: null,
      completedAt: null,
      deniedAt: null,
      pickedUpAt: null,
      atlasDeviceId: null,
      ...overrides,
    };
  }

  test("no-op cuando status no es pending", async () => {
    const rec = makeRecord({ status: "approved" });
    const r = await expirePendingRegistrationIfNeeded(rec, makeDb());
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.data.expired, false);
  });

  test("no-op cuando pending pero no expiró", async () => {
    const rec = makeRecord({ status: "pending", expiresAt: new Date(Date.now() + 60_000) });
    const r = await expirePendingRegistrationIfNeeded(rec, makeDb());
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.data.expired, false);
  });

  test("actualiza status='expired' cuando pending y expiró", async () => {
    const rec = makeRecord({ status: "pending", expiresAt: new Date(Date.now() - 1_000) });
    let updateCalled = false;
    let updatedData: Record<string, unknown> | null = null;
    const db = makeDb({
      update: async ({ where, data }) => {
        updateCalled = true;
        updatedData = data;
        return makeRow({ id: where.id, status: "expired" });
      },
    });
    const r = await expirePendingRegistrationIfNeeded(rec, db);
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.data.expired, true);
    assert.ok(updateCalled, "db.update debe haberse llamado");
    assert.strictEqual((updatedData as Record<string, unknown>)?.status, "expired");
  });

  test("DB_ERROR cuando update lanza", async () => {
    const rec = makeRecord({ status: "pending", expiresAt: new Date(Date.now() - 1_000) });
    const db = makeDb({ update: async () => { throw new Error("deadlock"); } });
    const r = await expirePendingRegistrationIfNeeded(rec, db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });
});

// ── getPollStatusByDeviceCode ─────────────────────────────────────────────────

describe("getPollStatusByDeviceCode", () => {
  beforeEach(saveEnv);
  afterEach(restoreEnv);

  test("SECRET_NOT_CONFIGURED cuando falta env var", async () => {
    clearSecret();
    const r = await getPollStatusByDeviceCode("ABCD1234", makeDb());
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "SECRET_NOT_CONFIGURED");
  });

  test("NOT_FOUND cuando findUnique retorna null", async () => {
    setSecret();
    const r = await getPollStatusByDeviceCode("ABCD1234", makeDb({ findUnique: async () => null }));
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "NOT_FOUND");
  });

  test("pending vigente → status pending", async () => {
    setSecret();
    const row = makeRow({ status: "pending", expiresAt: new Date(Date.now() + 60_000) });
    const r = await getPollStatusByDeviceCode("ABCD1234", makeDb({ findUnique: async () => row }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "pending");
  });

  test("pending expirado → llama update y retorna expired", async () => {
    setSecret();
    const expiredRow = makeRow({ status: "pending", expiresAt: new Date(Date.now() - 1_000) });
    let updateCalled = false;
    const db = makeDb({
      findUnique: async () => expiredRow,
      update: async ({ where, data }) => {
        updateCalled = true;
        return makeRow({ id: where.id, ...data as Partial<DbRow> });
      },
    });
    const r = await getPollStatusByDeviceCode("ABCD1234", db);
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "expired");
    assert.ok(updateCalled, "db.update debe haberse llamado para expirar");
  });

  test("status expired existente → expired", async () => {
    setSecret();
    const row = makeRow({ status: "expired", expiresAt: new Date(Date.now() - 1_000) });
    const r = await getPollStatusByDeviceCode("ABCD1234", makeDb({ findUnique: async () => row }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "expired");
  });

  test("status denied → denied", async () => {
    setSecret();
    const row = makeRow({ status: "denied" });
    const r = await getPollStatusByDeviceCode("ABCD1234", makeDb({ findUnique: async () => row }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "denied");
  });

  test("status completed → completed", async () => {
    setSecret();
    const row = makeRow({ status: "completed" });
    const r = await getPollStatusByDeviceCode("ABCD1234", makeDb({ findUnique: async () => row }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "completed");
  });

  test("status approved → approved_pending_pickup", async () => {
    setSecret();
    const row = makeRow({ status: "approved" });
    const r = await getPollStatusByDeviceCode("ABCD1234", makeDb({ findUnique: async () => row }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "approved_pending_pickup");
  });

  test("DB_ERROR en lookup → propaga DB_ERROR", async () => {
    setSecret();
    const db = makeDb({ findUnique: async () => { throw new Error("network error"); } });
    const r = await getPollStatusByDeviceCode("ABCD1234", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("DB_ERROR al expirar → propaga DB_ERROR", async () => {
    setSecret();
    const expiredRow = makeRow({ status: "pending", expiresAt: new Date(Date.now() - 1_000) });
    const db = makeDb({
      findUnique: async () => expiredRow,
      update: async () => { throw new Error("write failed"); },
    });
    const r = await getPollStatusByDeviceCode("ABCD1234", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });
});

// ── approveRegistrationByDeviceCode ──────────────────────────────────────────

describe("approveRegistrationByDeviceCode", () => {
  beforeEach(saveEnv);
  afterEach(restoreEnv);

  const INPUT = { device_code: "ABCD1234", supabaseUserId: "user-abc", deviceName: "My PC" };

  test("SECRET_NOT_CONFIGURED cuando falta env var", async () => {
    clearSecret();
    const r = await approveRegistrationByDeviceCode(INPUT, makeDb());
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "SECRET_NOT_CONFIGURED");
  });

  test("NOT_FOUND cuando findUnique retorna null", async () => {
    setSecret();
    const r = await approveRegistrationByDeviceCode(INPUT, makeDb({ findUnique: async () => null }));
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "NOT_FOUND");
  });

  test("pending vigente → actualiza approved + approvedByUserId + deviceName + approvedAt", async () => {
    setSecret();
    const validRow = makeRow({ status: "pending", expiresAt: new Date(Date.now() + 60_000) });
    let capturedData: Record<string, unknown> | null = null;
    const db = makeDb({
      findUnique: async () => validRow,
      update: async ({ where, data }) => {
        capturedData = data;
        return makeRow({ id: where.id, ...data as Partial<DbRow> });
      },
    });
    const r = await approveRegistrationByDeviceCode(INPUT, db);
    assert.ok(r.ok, `expected ok, got ${JSON.stringify(r)}`);
    if (r.ok) assert.strictEqual(r.status, "approved");
    assert.ok(capturedData !== null, "update debe haberse llamado");
    const d = capturedData as Record<string, unknown>;
    assert.strictEqual(d.status, "approved");
    assert.strictEqual(d.approvedByUserId, "user-abc");
    assert.strictEqual(d.deviceName, "My PC");
    assert.ok(d.approvedAt instanceof Date, "approvedAt debe ser Date");
  });

  test("pending expirado → retorna REGISTRATION_EXPIRED", async () => {
    setSecret();
    const expiredRow = makeRow({ status: "pending", expiresAt: new Date(Date.now() - 1_000) });
    const db = makeDb({
      findUnique: async () => expiredRow,
      update: async ({ where, data }) => makeRow({ id: where.id, ...data as Partial<DbRow> }),
    });
    const r = await approveRegistrationByDeviceCode(INPUT, db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "REGISTRATION_EXPIRED");
  });

  test("status approved → REGISTRATION_ALREADY_APPROVED", async () => {
    setSecret();
    const row = makeRow({ status: "approved" });
    const r = await approveRegistrationByDeviceCode(INPUT, makeDb({ findUnique: async () => row }));
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "REGISTRATION_ALREADY_APPROVED");
  });

  test("status completed → REGISTRATION_ALREADY_COMPLETED", async () => {
    setSecret();
    const row = makeRow({ status: "completed" });
    const r = await approveRegistrationByDeviceCode(INPUT, makeDb({ findUnique: async () => row }));
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "REGISTRATION_ALREADY_COMPLETED");
  });

  test("status expired → REGISTRATION_EXPIRED", async () => {
    setSecret();
    const row = makeRow({ status: "expired", expiresAt: new Date(Date.now() - 1_000) });
    const r = await approveRegistrationByDeviceCode(INPUT, makeDb({ findUnique: async () => row }));
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "REGISTRATION_EXPIRED");
  });

  test("status denied → REGISTRATION_DENIED", async () => {
    setSecret();
    const row = makeRow({ status: "denied" });
    const r = await approveRegistrationByDeviceCode(INPUT, makeDb({ findUnique: async () => row }));
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "REGISTRATION_DENIED");
  });

  test("DB_ERROR en lookup → propaga DB_ERROR", async () => {
    setSecret();
    const db = makeDb({ findUnique: async () => { throw new Error("conn failed"); } });
    const r = await approveRegistrationByDeviceCode(INPUT, db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("DB_ERROR en update → DB_ERROR", async () => {
    setSecret();
    const validRow = makeRow({ status: "pending", expiresAt: new Date(Date.now() + 60_000) });
    const db = makeDb({
      findUnique: async () => validRow,
      update: async () => { throw new Error("write failed"); },
    });
    const r = await approveRegistrationByDeviceCode(INPUT, db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("update no escribe deviceKeyHash", async () => {
    setSecret();
    const validRow = makeRow({ status: "pending", expiresAt: new Date(Date.now() + 60_000) });
    let capturedData: Record<string, unknown> | null = null;
    const db = makeDb({
      findUnique: async () => validRow,
      update: async ({ where, data }) => { capturedData = data; return makeRow({ id: where.id }); },
    });
    await approveRegistrationByDeviceCode(INPUT, db);
    assert.ok(!("deviceKeyHash" in (capturedData ?? {})), "deviceKeyHash no debe escribirse");
  });

  test("update no escribe atlasDeviceId", async () => {
    setSecret();
    const validRow = makeRow({ status: "pending", expiresAt: new Date(Date.now() + 60_000) });
    let capturedData: Record<string, unknown> | null = null;
    const db = makeDb({
      findUnique: async () => validRow,
      update: async ({ where, data }) => { capturedData = data; return makeRow({ id: where.id }); },
    });
    await approveRegistrationByDeviceCode(INPUT, db);
    assert.ok(!("atlasDeviceId" in (capturedData ?? {})), "atlasDeviceId no debe escribirse");
  });

  test("update no escribe pickedUpAt", async () => {
    setSecret();
    const validRow = makeRow({ status: "pending", expiresAt: new Date(Date.now() + 60_000) });
    let capturedData: Record<string, unknown> | null = null;
    const db = makeDb({
      findUnique: async () => validRow,
      update: async ({ where, data }) => { capturedData = data; return makeRow({ id: where.id }); },
    });
    await approveRegistrationByDeviceCode(INPUT, db);
    assert.ok(!("pickedUpAt" in (capturedData ?? {})), "pickedUpAt no debe escribirse");
  });
});

// ── pickupApprovedRegistrationByDeviceCode ────────────────────────────────────

describe("pickupApprovedRegistrationByDeviceCode", () => {
  beforeEach(saveEnv);
  afterEach(restoreEnv);

  test("SECRET_NOT_CONFIGURED cuando falta env var", async () => {
    clearSecret();
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", makePickupDb());
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "SECRET_NOT_CONFIGURED");
  });

  test("NOT_FOUND cuando findUnique retorna null", async () => {
    setSecret();
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", makePickupDb({ findUnique: async () => null }));
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "NOT_FOUND");
  });

  test("DB_ERROR cuando findUnique lanza", async () => {
    setSecret();
    const db = makePickupDb({ findUnique: async () => { throw new Error("network error"); } });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("pending vigente → status pending", async () => {
    setSecret();
    const row = makeRow({ status: "pending", expiresAt: new Date(Date.now() + 60_000) });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", makePickupDb({ findUnique: async () => row }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "pending");
  });

  test("pending expirado → llama update y retorna expired", async () => {
    setSecret();
    const expiredRow = makeRow({ status: "pending", expiresAt: new Date(Date.now() - 1_000) });
    let updateCalled = false;
    const db = makePickupDb({
      findUnique: async () => expiredRow,
      update: async ({ where, data }) => { updateCalled = true; return makeRow({ id: where.id, ...data as Partial<DbRow> }); },
    });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "expired");
    assert.ok(updateCalled, "db.update debe haberse llamado para expirar");
  });

  test("status expired → expired", async () => {
    setSecret();
    const row = makeRow({ status: "expired", expiresAt: new Date(Date.now() - 1_000) });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", makePickupDb({ findUnique: async () => row }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "expired");
  });

  test("status denied → denied", async () => {
    setSecret();
    const row = makeRow({ status: "denied" });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", makePickupDb({ findUnique: async () => row }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "denied");
  });

  test("status completed → completed", async () => {
    setSecret();
    const row = makeRow({ status: "completed" });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", makePickupDb({ findUnique: async () => row }));
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.status, "completed");
  });

  test("approved → retorna status:approved con device_key que empieza con 'atl_'", async () => {
    setSecret();
    const row = makeRow({ status: "approved", approvedByUserId: "user-123" });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", makePickupDb({ findUnique: async () => row }));
    assert.ok(r.ok);
    if (r.ok && r.status === "approved") {
      assert.ok(r.device_key.startsWith("atl_"), `device_key debe empezar con 'atl_', got: ${r.device_key.slice(0, 8)}`);
      assert.strictEqual(r.device_key.length, 68, "device_key debe tener 68 chars");
    } else {
      assert.fail(`expected approved, got ${JSON.stringify(r)}`);
    }
  });

  test("approved → deviceKeyHash guardado no es el raw device_key", async () => {
    setSecret();
    const row = makeRow({ status: "approved", approvedByUserId: "user-123" });
    let capturedUpdateData: Record<string, unknown> | null = null;
    const db = makePickupDb({
      findUnique: async () => row,
      update: async ({ where, data }) => { capturedUpdateData = data; return makeRow({ id: where.id }); },
    });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(r.ok && r.status === "approved");
    if (r.ok && r.status === "approved") {
      const storedHash = (capturedUpdateData as Record<string, unknown>)?.deviceKeyHash as string;
      assert.ok(typeof storedHash === "string", "deviceKeyHash debe guardarse");
      assert.notStrictEqual(storedHash, r.device_key, "hash no debe igualar el raw key");
      assert.match(storedHash, /^[0-9a-f]{64}$/, "hash debe ser SHA-256 hex");
    }
  });

  test("approved → registration update incluye status, pickedUpAt, completedAt, atlasDeviceId", async () => {
    setSecret();
    const row = makeRow({ status: "approved", approvedByUserId: "user-123" });
    let capturedUpdateData: Record<string, unknown> | null = null;
    const db = makePickupDb({
      findUnique: async () => row,
      update: async ({ where, data }) => { capturedUpdateData = data; return makeRow({ id: where.id }); },
    });
    await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    const d = capturedUpdateData as Record<string, unknown>;
    assert.strictEqual(d.status, "completed");
    assert.ok(d.pickedUpAt instanceof Date, "pickedUpAt debe ser Date");
    assert.ok(d.completedAt instanceof Date, "completedAt debe ser Date");
    assert.ok(typeof d.atlasDeviceId === "string", "atlasDeviceId debe ser string");
  });

  test("approved → DB_ERROR en atlasDevice.create → retorna DB_ERROR", async () => {
    setSecret();
    const row = makeRow({ status: "approved", approvedByUserId: "user-123" });
    const db = makePickupDb({
      findUnique: async () => row,
      atlasDeviceCreate: async () => { throw new Error("device create failed"); },
    });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("approved → DB_ERROR en registration update → retorna DB_ERROR", async () => {
    setSecret();
    const row = makeRow({ status: "approved", approvedByUserId: "user-123" });
    const db = makePickupDb({
      findUnique: async () => row,
      update: async () => { throw new Error("update failed"); },
    });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("approved sin approvedByUserId → DB_ERROR", async () => {
    setSecret();
    const row = makeRow({ status: "approved", approvedByUserId: null });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", makePickupDb({ findUnique: async () => row }));
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("$transaction es llamado en approved pickup", async () => {
    setSecret();
    const row = makeRow({ status: "approved", approvedByUserId: "user-123" });
    let txCalled = false;
    const db = makePickupDb({
      findUnique: async () => row,
      $transaction: (fn) => {
        txCalled = true;
        const tx: PickupDb = {
          atlasDeviceRegistration: {
            create: async ({ data }) => makeRow(data as Partial<DbRow>),
            findUnique: async () => row,
            update: async ({ where, data }) => makeRow({ id: where.id, ...data as Partial<DbRow> }),
          },
          atlasDevice: { create: async () => makeDeviceRow() },
          $transaction: (fn2) => fn2(tx),
        };
        return fn(tx);
      },
    });
    await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(txCalled, "$transaction debe haberse llamado");
  });

  test("$transaction falla → DB_ERROR", async () => {
    setSecret();
    const row = makeRow({ status: "approved", approvedByUserId: "user-123" });
    const db = makePickupDb({
      findUnique: async () => row,
      $transaction: async () => { throw new Error("tx connection lost"); },
    });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(!r.ok);
    if (!r.ok) assert.strictEqual(r.code, "DB_ERROR");
  });

  test("re-read dentro de tx con pickedUpAt existente → completed sin device_key", async () => {
    setSecret();
    const outerRow = makeRow({ status: "approved", approvedByUserId: "user-123" });
    const innerRow = makeRow({ status: "approved", approvedByUserId: "user-123", pickedUpAt: new Date(), atlasDeviceId: "dev-existing" });
    let calls = 0;
    const db = makePickupDb({ findUnique: async () => calls++ === 0 ? outerRow : innerRow });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(r.ok);
    if (r.ok) {
      assert.strictEqual(r.status, "completed");
      assert.ok(!("device_key" in r), "device_key must not be present");
    }
  });

  test("re-read dentro de tx con atlasDeviceId existente → completed sin device_key", async () => {
    setSecret();
    const outerRow = makeRow({ status: "approved", approvedByUserId: "user-123" });
    const innerRow = makeRow({ status: "approved", approvedByUserId: "user-123", atlasDeviceId: "dev-already" });
    let calls = 0;
    const db = makePickupDb({ findUnique: async () => calls++ === 0 ? outerRow : innerRow });
    const r = await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(r.ok);
    if (r.ok) {
      assert.strictEqual(r.status, "completed");
      assert.ok(!("device_key" in r), "device_key must not be present");
    }
  });

  test("AtlasDevice.create y registration.update ocurren dentro de la tx", async () => {
    setSecret();
    const row = makeRow({ status: "approved", approvedByUserId: "user-123" });
    let deviceCreatedInsideTx = false;
    let regUpdatedInsideTx = false;
    const db = makePickupDb({
      findUnique: async () => row,
      $transaction: (fn) => {
        const tx: PickupDb = {
          atlasDeviceRegistration: {
            create: async ({ data }) => makeRow(data as Partial<DbRow>),
            findUnique: async () => row,
            update: async ({ where, data }) => {
              regUpdatedInsideTx = true;
              return makeRow({ id: where.id, ...data as Partial<DbRow> });
            },
          },
          atlasDevice: {
            create: async () => { deviceCreatedInsideTx = true; return makeDeviceRow(); },
          },
          $transaction: (fn2) => fn2(tx),
        };
        return fn(tx);
      },
    });
    await pickupApprovedRegistrationByDeviceCode("ABCD1234", db);
    assert.ok(deviceCreatedInsideTx, "AtlasDevice.create debe ocurrir dentro de la tx");
    assert.ok(regUpdatedInsideTx, "registration.update debe ocurrir dentro de la tx");
  });
});

// ── cleanupExpiredPendingRegistrations ────────────────────────────────────────

describe("cleanupExpiredPendingRegistrations", () => {
  beforeEach(saveEnv);
  afterEach(restoreEnv);

  test("marks pending expired registrations → ok:true with count N", async () => {
    let callCount = 0;
    const db = makeDb({ updateMany: async () => { callCount++; return { count: 3 }; } });
    const result = await cleanupExpiredPendingRegistrations(db);
    assert.ok(result.ok);
    if (result.ok) assert.strictEqual(result.count, 3);
    assert.strictEqual(callCount, 1, "updateMany must be called exactly once");
  });

  test("calls updateMany with where status:'pending' and expiresAt.lt as a Date", async () => {
    let capturedWhere: { status: string; expiresAt: { lt: Date } } | null = null;
    const db = makeDb({
      updateMany: async ({ where }) => { capturedWhere = where; return { count: 0 }; },
    });
    const before = new Date();
    await cleanupExpiredPendingRegistrations(db);
    const after = new Date();
    assert.ok(capturedWhere !== null, "updateMany must be called");
    assert.strictEqual(capturedWhere!.status, "pending");
    assert.ok(capturedWhere!.expiresAt.lt instanceof Date, "expiresAt.lt must be a Date");
    assert.ok(
      capturedWhere!.expiresAt.lt >= before && capturedWhere!.expiresAt.lt <= after,
      "expiresAt.lt must be approximately now",
    );
  });

  test("calls updateMany with data status:'expired'", async () => {
    let capturedData: { status: string } | null = null;
    const db = makeDb({
      updateMany: async ({ data }) => { capturedData = data; return { count: 0 }; },
    });
    await cleanupExpiredPendingRegistrations(db);
    assert.ok(capturedData !== null);
    assert.strictEqual(capturedData!.status, "expired");
  });

  test("does not require ATLAS_DEVICE_CODE_SECRET", async () => {
    clearSecret();
    const db = makeDb({ updateMany: async () => ({ count: 2 }) });
    const result = await cleanupExpiredPendingRegistrations(db);
    assert.ok(result.ok, "must succeed without ATLAS_DEVICE_CODE_SECRET");
    if (result.ok) assert.strictEqual(result.count, 2);
  });

  test("DB throw → DB_ERROR", async () => {
    const db = makeDb({ updateMany: async () => { throw new Error("db gone"); } });
    const result = await cleanupExpiredPendingRegistrations(db);
    assert.ok(!result.ok);
    if (!result.ok) {
      assert.strictEqual(result.code, "DB_ERROR");
      assert.ok(result.message.length > 0);
    }
  });

  test("does not log anything", async () => {
    const logs: string[] = [];
    const orig = { log: console.log, warn: console.warn, error: console.error };
    console.log   = (...a: unknown[]) => logs.push(a.map(String).join(" "));
    console.warn  = (...a: unknown[]) => logs.push(a.map(String).join(" "));
    console.error = (...a: unknown[]) => logs.push(a.map(String).join(" "));
    try {
      const db = makeDb({ updateMany: async () => ({ count: 0 }) });
      await cleanupExpiredPendingRegistrations(db);
    } finally {
      console.log   = orig.log;
      console.warn  = orig.warn;
      console.error = orig.error;
    }
    assert.strictEqual(logs.length, 0, "cleanup must produce no console output");
  });

  test("where.status is 'pending' — approved/completed/denied rows are not targeted", async () => {
    let capturedWhere: { status: string } | null = null;
    const db = makeDb({
      updateMany: async ({ where }) => { capturedWhere = where as { status: string }; return { count: 0 }; },
    });
    await cleanupExpiredPendingRegistrations(db);
    assert.ok(capturedWhere !== null);
    assert.strictEqual(capturedWhere!.status, "pending",
      "updateMany must target only 'pending' rows — approved/completed/denied must not be touched");
  });
});
