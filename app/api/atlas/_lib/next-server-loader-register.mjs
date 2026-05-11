// Entry point for --import flag: registers the next-server-loader hook.
// Usage: node --import ./app/api/atlas/_lib/next-server-loader-register.mjs ...
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./next-server-loader.mjs", pathToFileURL("./app/api/atlas/_lib/"));
