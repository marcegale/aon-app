// Atlas Device Store — production DB lookups for registered AtlasDevice records.
// INVARIANT: deviceKeyHash is never returned in any public result type.

export type AtlasDeviceRecord = {
  id: string;
  supabaseUserId: string;
  status: string;
  lastSeenAt: Date | null;
};

// Safe fields for list/revoke responses — never includes deviceKeyHash.
export type AtlasDeviceListItem = {
  id: string;
  deviceName: string;
  status: string;
  platform: string;
  clientVersion: string | null;
  createdAt: Date;
  lastSeenAt: Date | null;
  revokedAt: Date | null;
};

export interface AtlasDeviceStoreDb {
  atlasDevice: {
    findUnique(args: {
      where: { deviceKeyHash: string };
      select?: Record<string, unknown>;
    }): Promise<AtlasDeviceRecord | null>;
    findFirst(args: {
      where: Record<string, unknown>;
      select?: Record<string, unknown>;
    }): Promise<AtlasDeviceListItem | null>;
    findMany(args: {
      where: Record<string, unknown>;
      select?: Record<string, unknown>;
      orderBy?: Record<string, unknown> | Record<string, unknown>[];
    }): Promise<AtlasDeviceListItem[]>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
    }): Promise<unknown>;
  };
}

export type FindAtlasDeviceResult =
  | { ok: true; device: AtlasDeviceRecord | null }
  | { ok: false; code: "DB_ERROR"; message: string };

export type ListAtlasDevicesResult =
  | { ok: true; devices: AtlasDeviceListItem[] }
  | { ok: false; code: "DB_ERROR"; message: string };

export type RevokeAtlasDeviceResult =
  | { ok: true; device: AtlasDeviceListItem }
  | { ok: false; code: "DB_ERROR" | "NOT_FOUND"; message: string };

// ── Internal helpers ──────────────────────────────────────────────────────────

async function getDefaultDb(): Promise<AtlasDeviceStoreDb> {
  const { prisma } = await import("../../../lib/prisma.ts");
  return prisma as unknown as AtlasDeviceStoreDb;
}

// ── findAtlasDeviceByKeyHash ──────────────────────────────────────────────────

export async function findAtlasDeviceByKeyHash(
  deviceKeyHash: string,
  db?: AtlasDeviceStoreDb,
): Promise<FindAtlasDeviceResult> {
  const theDb = db ?? await getDefaultDb();
  try {
    const device = await theDb.atlasDevice.findUnique({
      where: { deviceKeyHash },
      select: { id: true, supabaseUserId: true, status: true, lastSeenAt: true },
    });
    return { ok: true, device };
  } catch {
    return { ok: false, code: "DB_ERROR", message: "Failed to query Atlas device." };
  }
}

// ── listAtlasDevicesForUser ───────────────────────────────────────────────────

const LIST_SELECT = {
  id: true, deviceName: true, status: true, platform: true,
  clientVersion: true, createdAt: true, lastSeenAt: true, revokedAt: true,
};

export async function listAtlasDevicesForUser(
  supabaseUserId: string,
  db?: AtlasDeviceStoreDb,
): Promise<ListAtlasDevicesResult> {
  const theDb = db ?? await getDefaultDb();
  try {
    const devices = await theDb.atlasDevice.findMany({
      where: { supabaseUserId },
      select: LIST_SELECT,
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, devices };
  } catch {
    return { ok: false, code: "DB_ERROR", message: "Failed to list Atlas devices." };
  }
}

// ── revokeAtlasDeviceForUser ──────────────────────────────────────────────────

export async function revokeAtlasDeviceForUser(
  id: string,
  supabaseUserId: string,
  db?: AtlasDeviceStoreDb,
): Promise<RevokeAtlasDeviceResult> {
  const theDb = db ?? await getDefaultDb();

  let device: AtlasDeviceListItem | null;
  try {
    device = await theDb.atlasDevice.findFirst({
      where: { id, supabaseUserId },
      select: LIST_SELECT,
    });
  } catch {
    return { ok: false, code: "DB_ERROR", message: "Failed to query Atlas device." };
  }

  if (!device) {
    return { ok: false, code: "NOT_FOUND", message: "Device not found." };
  }

  if (device.status === "revoked") {
    return { ok: true, device };
  }

  const revokedAt = new Date();
  try {
    await theDb.atlasDevice.update({
      where: { id: device.id },
      data: { status: "revoked", revokedAt },
    });
  } catch {
    return { ok: false, code: "DB_ERROR", message: "Failed to revoke Atlas device." };
  }

  return { ok: true, device: { ...device, status: "revoked", revokedAt } };
}

// ── touchAtlasDeviceLastSeen ──────────────────────────────────────────────────

export async function touchAtlasDeviceLastSeen(
  deviceId: string,
  db?: AtlasDeviceStoreDb,
): Promise<void> {
  const theDb = db ?? await getDefaultDb();
  try {
    await theDb.atlasDevice.update({
      where: { id: deviceId },
      data: { lastSeenAt: new Date() },
    });
  } catch { /* best-effort */ }
}
