import { randomBytes } from "node:crypto";
import { sha256hex } from "./atlasHashUtils.ts";

export function generateAtlasDeviceKey(): string {
  return "atl_" + randomBytes(32).toString("hex");
}

export function hashAtlasDeviceKey(deviceKey: string): string {
  return sha256hex(deviceKey);
}
