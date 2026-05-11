// Custom ESM loader: remaps "next/server" bare specifier to next/server.js.
// Required because Next.js 16 has no package.json exports field, so Node's
// ESM resolver cannot find "next/server" without the explicit .js extension.
// Used only in test runs — not loaded by the Next.js server.
import { pathToFileURL } from "url";
import { resolve as resolvePath } from "path";

export function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") {
    const abs = resolvePath(process.cwd(), "node_modules/next/server.js");
    return { url: pathToFileURL(abs).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
