import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { sha256hex, hmacSha256hex } from "../atlasHashUtils.ts";

describe("sha256hex", () => {
  test("returns 64-char lowercase hex string", () => {
    const result = sha256hex("hello");
    assert.strictEqual(result.length, 64);
    assert.match(result, /^[0-9a-f]{64}$/);
  });

  test("is deterministic", () => {
    assert.strictEqual(sha256hex("atlas"), sha256hex("atlas"));
  });

  test("differs with different inputs", () => {
    assert.notStrictEqual(sha256hex("abc"), sha256hex("xyz"));
  });
});

describe("hmacSha256hex", () => {
  test("returns 64-char lowercase hex string", () => {
    const result = hmacSha256hex("hello", "secret");
    assert.strictEqual(result.length, 64);
    assert.match(result, /^[0-9a-f]{64}$/);
  });

  test("is deterministic with same secret", () => {
    assert.strictEqual(hmacSha256hex("atlas", "key"), hmacSha256hex("atlas", "key"));
  });

  test("differs with different secret", () => {
    assert.notStrictEqual(hmacSha256hex("atlas", "key1"), hmacSha256hex("atlas", "key2"));
  });
});

describe("no logging side effects", () => {
  test("neither function logs inputs or secrets", () => {
    const logged: string[] = [];
    const orig = console.log;
    console.log = (...args: unknown[]) => { logged.push(args.join(" ")); };
    try {
      sha256hex("sensitive-value");
      hmacSha256hex("sensitive-value", "sensitive-secret");
    } finally {
      console.log = orig;
    }
    assert.strictEqual(logged.length, 0);
  });
});
