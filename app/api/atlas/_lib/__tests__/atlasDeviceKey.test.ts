/**
 * Phase 4L — Device Key Utility Tests
 * Runner: node --experimental-strip-types --test <this-file>
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { generateAtlasDeviceKey, hashAtlasDeviceKey } from "../atlasDeviceKey.ts";

describe("generateAtlasDeviceKey", () => {
  test("key starts with 'atl_' and has correct length", () => {
    const key = generateAtlasDeviceKey();
    assert.ok(key.startsWith("atl_"), `expected prefix 'atl_', got: ${key.slice(0, 8)}`);
    // "atl_" + 64 hex chars = 68
    assert.strictEqual(key.length, 68, `expected length 68, got ${key.length}`);
    assert.match(key, /^atl_[0-9a-f]{64}$/, "key must be atl_ followed by 64 lowercase hex chars");
  });

  test("two calls produce different keys", () => {
    const a = generateAtlasDeviceKey();
    const b = generateAtlasDeviceKey();
    assert.notStrictEqual(a, b, "generateAtlasDeviceKey must produce unique keys");
  });
});

describe("hashAtlasDeviceKey", () => {
  test("hash is 64-char lowercase hex (SHA-256)", () => {
    const hash = hashAtlasDeviceKey("atl_" + "a".repeat(64));
    assert.strictEqual(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  test("hash is deterministic", () => {
    const key = generateAtlasDeviceKey();
    assert.strictEqual(hashAtlasDeviceKey(key), hashAtlasDeviceKey(key));
  });

  test("hash differs from raw key", () => {
    const key = generateAtlasDeviceKey();
    assert.notStrictEqual(hashAtlasDeviceKey(key), key, "hash must not equal the raw key");
  });
});
