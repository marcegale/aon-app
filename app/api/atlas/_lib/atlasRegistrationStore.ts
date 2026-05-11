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
