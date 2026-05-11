// Atlas Device Store — production DB lookups for registered AtlasDevice records.
// INVARIANT: deviceKeyHash is never logged.

export type AtlasDeviceRecord = {
  id: string;
  supabaseUserId: string;
  status: string;
  lastSeenAt: Date | null;
};

export interface AtlasDeviceStoreDb {
  atlasDevice: {
    findUnique(args: {
      where: { deviceKeyHash: string };
      select?: Record<string, unknown>;
    }): Promise<AtlasDeviceRecord | null>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
    }): Promise<unknown>;
  };
}

export type FindAtlasDeviceResult =
  | { ok: true; device: AtlasDeviceRecord | null }
  | { ok: false; code: "DB_ERROR"; message: string };

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
