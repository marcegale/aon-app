/**
 * Phase 4N — Atlas Device Listing & Revocation Route Tests
 *
 * Runner:
 *   node --experimental-strip-types \
 *     --import ./app/api/atlas/_lib/next-server-loader-register.mjs \
 *     --test app/api/atlas/devices/__tests__/atlasDevicesRoutes.test.ts
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { createDevicesGetHandler, POST as collectionPOST } from "../route.ts";
import { createDeviceDeleteHandler, GET as itemGET } from "../[id]/route.ts";
import type {
  AtlasDeviceListItem,
  ListAtlasDevicesResult,
  RevokeAtlasDeviceResult,
} from "../../_lib/atlasDeviceStore.ts";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(): Request {
  return new Request("http://localhost/", { method: "GET" });
}

async function statusOf(res: Response): Promise<number> { return res.status; }
async function jsonOf(res: Response): Promise<unknown>  { return res.json(); }
async function codeOf(res: Response): Promise<string> {
  return ((await res.json()) as { error?: { code?: string } }).error?.code ?? "";
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

// ── Mock factories ─────────────────────────────────────────────────────────────

function makeGetHandler(opts: {
  userId?: string | null;
  listResult: ListAtlasDevicesResult;
}) {
  return createDevicesGetHandler({
    getAuthenticatedUserId: async () => opts.userId ?? null,
    listAtlasDevicesForUser: async () => opts.listResult,
  });
}

function makeDeleteHandler(opts: {
  userId?: string | null;
  revokeResult: RevokeAtlasDeviceResult;
}) {
  return createDeviceDeleteHandler({
    getAuthenticatedUserId: async () => opts.userId ?? null,
    revokeAtlasDeviceForUser: async () => opts.revokeResult,
  });
}

function makeCtx(id: string) {
  return { params: { id } };
}

// ── /api/atlas/devices GET ────────────────────────────────────────────────────

describe("/api/atlas/devices — GET", () => {
  test("authenticated → 200 ok:true with devices array", async () => {
    const items = [makeListItem({ id: "d1" }), makeListItem({ id: "d2" })];
    const handler = makeGetHandler({ userId: "user-123", listResult: { ok: true, devices: items } });
    const res = await handler(makeReq());
    assert.strictEqual(await statusOf(res), 200);
    const body = await jsonOf(res) as { ok: boolean; devices: unknown[] };
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.devices.length, 2);
  });

  test("response uses snake_case field names", async () => {
    const item = makeListItem({ deviceName: "My PC", clientVersion: "4N" });
    const handler = makeGetHandler({ userId: "user-123", listResult: { ok: true, devices: [item] } });
    const res = await handler(makeReq());
    const body = await jsonOf(res) as { devices: Record<string, unknown>[] };
    const d = body.devices[0];
    assert.ok("device_name" in d, "expected device_name (snake_case)");
    assert.ok("client_version" in d, "expected client_version (snake_case)");
    assert.ok("created_at" in d, "expected created_at (snake_case)");
    assert.ok(!("deviceName" in d), "deviceName (camelCase) must not appear");
  });

  test("unauthenticated → 401 UNAUTHENTICATED", async () => {
    const handler = makeGetHandler({ userId: null, listResult: { ok: true, devices: [] } });
    const res = await handler(makeReq());
    assert.strictEqual(await statusOf(res), 401);
    assert.strictEqual(await codeOf(res), "UNAUTHENTICATED");
  });

  test("DB_ERROR → 503 DEVICE_STORE_UNAVAILABLE", async () => {
    const handler = makeGetHandler({ userId: "user-123", listResult: { ok: false, code: "DB_ERROR", message: "fail" } });
    const res = await handler(makeReq());
    assert.strictEqual(await statusOf(res), 503);
    assert.strictEqual(await codeOf(res), "DEVICE_STORE_UNAVAILABLE");
  });

  test("response devices do not contain deviceKeyHash", async () => {
    const item = makeListItem();
    const handler = makeGetHandler({ userId: "user-123", listResult: { ok: true, devices: [item] } });
    const res = await handler(makeReq());
    const body = await jsonOf(res) as { devices: Record<string, unknown>[] };
    const raw = JSON.stringify(body);
    assert.ok(!raw.includes("deviceKeyHash"), "deviceKeyHash must not appear in response");
  });
});

describe("/api/atlas/devices — POST", () => {
  test("POST → 405 INVALID_METHOD", async () => {
    const res = await collectionPOST();
    assert.strictEqual(await statusOf(res), 405);
    assert.strictEqual(await codeOf(res), "INVALID_METHOD");
  });
});

// ── /api/atlas/devices/[id] DELETE ───────────────────────────────────────────

describe("/api/atlas/devices/[id] — DELETE", () => {
  test("authenticated + found → 200 ok:true with revoked device", async () => {
    const device = makeListItem({ status: "revoked", revokedAt: new Date() });
    const handler = makeDeleteHandler({ userId: "user-123", revokeResult: { ok: true, device } });
    const res = await handler(makeReq(), makeCtx("dev-id-123"));
    assert.strictEqual(await statusOf(res), 200);
    const body = await jsonOf(res) as { ok: boolean; device: Record<string, unknown> };
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.device.status, "revoked");
  });

  test("response uses snake_case field names", async () => {
    const device = makeListItem({ status: "revoked", revokedAt: new Date() });
    const handler = makeDeleteHandler({ userId: "user-123", revokeResult: { ok: true, device } });
    const res = await handler(makeReq(), makeCtx("dev-id-123"));
    const body = await jsonOf(res) as { device: Record<string, unknown> };
    assert.ok("device_name" in body.device, "expected device_name (snake_case)");
    assert.ok("revoked_at" in body.device, "expected revoked_at (snake_case)");
    assert.ok(!("deviceName" in body.device), "camelCase must not appear");
  });

  test("unauthenticated → 401 UNAUTHENTICATED", async () => {
    const handler = makeDeleteHandler({ userId: null, revokeResult: { ok: true, device: makeListItem() } });
    const res = await handler(makeReq(), makeCtx("dev-id-123"));
    assert.strictEqual(await statusOf(res), 401);
    assert.strictEqual(await codeOf(res), "UNAUTHENTICATED");
  });

  test("empty id → 400 INVALID_REQUEST", async () => {
    const handler = makeDeleteHandler({ userId: "user-123", revokeResult: { ok: true, device: makeListItem() } });
    const res = await handler(makeReq(), makeCtx(""));
    assert.strictEqual(await statusOf(res), 400);
    assert.strictEqual(await codeOf(res), "INVALID_REQUEST");
  });

  test("NOT_FOUND → 404 DEVICE_NOT_FOUND", async () => {
    const handler = makeDeleteHandler({ userId: "user-123", revokeResult: { ok: false, code: "NOT_FOUND", message: "nf" } });
    const res = await handler(makeReq(), makeCtx("dev-id-123"));
    assert.strictEqual(await statusOf(res), 404);
    assert.strictEqual(await codeOf(res), "DEVICE_NOT_FOUND");
  });

  test("DB_ERROR → 503 DEVICE_STORE_UNAVAILABLE", async () => {
    const handler = makeDeleteHandler({ userId: "user-123", revokeResult: { ok: false, code: "DB_ERROR", message: "fail" } });
    const res = await handler(makeReq(), makeCtx("dev-id-123"));
    assert.strictEqual(await statusOf(res), 503);
    assert.strictEqual(await codeOf(res), "DEVICE_STORE_UNAVAILABLE");
  });

  test("response device does not contain deviceKeyHash", async () => {
    const device = makeListItem({ status: "revoked" });
    const handler = makeDeleteHandler({ userId: "user-123", revokeResult: { ok: true, device } });
    const res = await handler(makeReq(), makeCtx("dev-id-123"));
    const raw = JSON.stringify(await jsonOf(res));
    assert.ok(!raw.includes("deviceKeyHash"), "deviceKeyHash must not appear in response");
  });
});

describe("/api/atlas/devices/[id] — GET", () => {
  test("GET → 405 INVALID_METHOD", async () => {
    const res = await itemGET();
    assert.strictEqual(await statusOf(res), 405);
    assert.strictEqual(await codeOf(res), "INVALID_METHOD");
  });
});
