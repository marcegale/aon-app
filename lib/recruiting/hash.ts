import { createHash } from "crypto";

export function sha256Buffer(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}
