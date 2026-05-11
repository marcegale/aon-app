import { hmacSha256hex } from "./atlasHashUtils.ts";

// ── Internal DB interface (minimal, for DI) ───────────────────────────────────

interface DbRegistrationRow {
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
}

export interface RegistrationDb {
  atlasDeviceRegistration: {
    create(args: { data: Record<string, unknown> }): Promise<DbRegistrationRow>;
    findUnique(args: { where: { deviceCodeHash: string } }): Promise<DbRegistrationRow | null>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<DbRegistrationRow>;
  };
}

// ── Public types ──────────────────────────────────────────────────────────────

export type RegistrationRecord = {
  id: string;
  status: string;
  platform: string;
  clientVersion: string | null;
  expiresAt: Date;
  createdAt: Date;
  approvedAt: Date | null;
  completedAt: Date | null;
  deniedAt: Date | null;
  pickedUpAt: Date | null;
  atlasDeviceId: string | null;
};

export type StoreErrorCode = "SECRET_NOT_CONFIGURED" | "DB_ERROR";

export type StoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: StoreErrorCode; message: string };

export type CreateRegistrationInput = {
  device_code: string;
  platform: string;
  clientVersion?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const REGISTRATION_TTL_MS = 15 * 60 * 1000;

// ── Internal helpers ──────────────────────────────────────────────────────────

function mapRow(row: DbRegistrationRow): RegistrationRecord {
  return {
    id: row.id,
    status: row.status,
    platform: row.platform,
    clientVersion: row.clientVersion,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    approvedAt: row.approvedAt,
    completedAt: row.completedAt,
    deniedAt: row.deniedAt,
    pickedUpAt: row.pickedUpAt,
    atlasDeviceId: row.atlasDeviceId,
  };
}

async function getDefaultDb(): Promise<RegistrationDb> {
  const { prisma } = await import("../../../lib/prisma.ts");
  return prisma as unknown as RegistrationDb;
}

// ── createPendingRegistration ─────────────────────────────────────────────────

export async function createPendingRegistration(
  input: CreateRegistrationInput,
  db?: RegistrationDb,
): Promise<StoreResult<RegistrationRecord>> {
  const secret = process.env.ATLAS_DEVICE_CODE_SECRET;
  if (!secret) {
    return { ok: false, code: "SECRET_NOT_CONFIGURED", message: "ATLAS_DEVICE_CODE_SECRET is not set." };
  }

  const deviceCodeHash = hmacSha256hex(input.device_code, secret);
  const expiresAt = new Date(Date.now() + REGISTRATION_TTL_MS);
  const theDb = db ?? await getDefaultDb();

  try {
    const row = await theDb.atlasDeviceRegistration.create({
      data: {
        deviceCodeHash,
        status: "pending",
        platform: input.platform,
        clientVersion: input.clientVersion ?? null,
        expiresAt,
      },
    });
    return { ok: true, data: mapRow(row) };
  } catch {
    return { ok: false, code: "DB_ERROR", message: "Failed to create registration." };
  }
}

// ── getRegistrationByDeviceCode ───────────────────────────────────────────────

export async function getRegistrationByDeviceCode(
  device_code: string,
  db?: RegistrationDb,
): Promise<StoreResult<RegistrationRecord | null>> {
  const secret = process.env.ATLAS_DEVICE_CODE_SECRET;
  if (!secret) {
    return { ok: false, code: "SECRET_NOT_CONFIGURED", message: "ATLAS_DEVICE_CODE_SECRET is not set." };
  }

  const deviceCodeHash = hmacSha256hex(device_code, secret);
  const theDb = db ?? await getDefaultDb();

  try {
    const row = await theDb.atlasDeviceRegistration.findUnique({ where: { deviceCodeHash } });
    if (!row) return { ok: true, data: null };
    return { ok: true, data: mapRow(row) };
  } catch {
    return { ok: false, code: "DB_ERROR", message: "Failed to query registration." };
  }
}

// ── getPollStatusByDeviceCode ─────────────────────────────────────────────────

export type PollRegistrationStatus =
  | "pending"
  | "expired"
  | "denied"
  | "completed"
  | "approved_pending_pickup";

export type PollStoreResult =
  | { ok: true; status: PollRegistrationStatus }
  | { ok: false; code: StoreErrorCode | "NOT_FOUND"; message: string };

export async function getPollStatusByDeviceCode(
  device_code: string,
  db?: RegistrationDb,
): Promise<PollStoreResult> {
  const lookup = await getRegistrationByDeviceCode(device_code, db);

  if (!lookup.ok) {
    return { ok: false, code: lookup.code, message: lookup.message };
  }

  if (lookup.data === null) {
    return { ok: false, code: "NOT_FOUND", message: "Device code not found." };
  }

  const record = lookup.data;

  if (record.status === "pending") {
    if (record.expiresAt < new Date()) {
      const expireResult = await expirePendingRegistrationIfNeeded(record, db);
      if (!expireResult.ok) {
        return { ok: false, code: expireResult.code, message: expireResult.message };
      }
      return { ok: true, status: "expired" };
    }
    return { ok: true, status: "pending" };
  }

  if (record.status === "approved") {
    return { ok: true, status: "approved_pending_pickup" };
  }

  const terminal: PollRegistrationStatus[] = ["expired", "denied", "completed"];
  if (terminal.includes(record.status as PollRegistrationStatus)) {
    return { ok: true, status: record.status as PollRegistrationStatus };
  }

  return { ok: false, code: "DB_ERROR", message: "Unknown registration status." };
}

// ── approveRegistrationByDeviceCode ──────────────────────────────────────────

export type ApproveErrorCode =
  | StoreErrorCode
  | "NOT_FOUND"
  | "REGISTRATION_EXPIRED"
  | "REGISTRATION_ALREADY_APPROVED"
  | "REGISTRATION_ALREADY_COMPLETED"
  | "REGISTRATION_DENIED";

export type ApproveResult =
  | { ok: true; status: "approved" }
  | { ok: false; code: ApproveErrorCode; message: string };

export type ApproveRegistrationInput = {
  device_code: string;
  supabaseUserId: string;
  deviceName?: string;
};

export async function approveRegistrationByDeviceCode(
  input: ApproveRegistrationInput,
  db?: RegistrationDb,
): Promise<ApproveResult> {
  const lookup = await getRegistrationByDeviceCode(input.device_code, db);

  if (!lookup.ok) {
    return { ok: false, code: lookup.code, message: lookup.message };
  }

  if (lookup.data === null) {
    return { ok: false, code: "NOT_FOUND", message: "Device code not found." };
  }

  const record = lookup.data;

  if (record.status === "pending") {
    if (record.expiresAt < new Date()) {
      await expirePendingRegistrationIfNeeded(record, db); // best-effort, result ignored
      return { ok: false, code: "REGISTRATION_EXPIRED", message: "Registration has expired." };
    }

    const theDb = db ?? await getDefaultDb();
    try {
      await theDb.atlasDeviceRegistration.update({
        where: { id: record.id },
        data: {
          status: "approved",
          approvedByUserId: input.supabaseUserId,
          deviceName: input.deviceName ?? null,
          approvedAt: new Date(),
        },
      });
      return { ok: true, status: "approved" };
    } catch {
      return { ok: false, code: "DB_ERROR", message: "Failed to approve registration." };
    }
  }

  if (record.status === "approved")   return { ok: false, code: "REGISTRATION_ALREADY_APPROVED",   message: "Registration already approved." };
  if (record.status === "completed")  return { ok: false, code: "REGISTRATION_ALREADY_COMPLETED", message: "Registration already completed." };
  if (record.status === "expired")    return { ok: false, code: "REGISTRATION_EXPIRED",            message: "Registration has expired." };
  if (record.status === "denied")     return { ok: false, code: "REGISTRATION_DENIED",             message: "Registration was denied." };

  return { ok: false, code: "DB_ERROR", message: "Unknown registration status." };
}

// ── expirePendingRegistrationIfNeeded ─────────────────────────────────────────

export async function expirePendingRegistrationIfNeeded(
  record: RegistrationRecord,
  db?: RegistrationDb,
): Promise<StoreResult<{ expired: boolean }>> {
  if (record.status !== "pending") {
    return { ok: true, data: { expired: false } };
  }
  if (record.expiresAt >= new Date()) {
    return { ok: true, data: { expired: false } };
  }

  const theDb = db ?? await getDefaultDb();

  try {
    await theDb.atlasDeviceRegistration.update({
      where: { id: record.id },
      data: { status: "expired" },
    });
    return { ok: true, data: { expired: true } };
  } catch {
    return { ok: false, code: "DB_ERROR", message: "Failed to expire registration." };
  }
}
