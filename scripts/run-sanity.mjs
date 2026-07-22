/**
 * Maps shared Sanity env vars into SANITY_STUDIO_* so Vite exposes them
 * to the Studio browser bundle. Keep SANITY_PROJECT_ID / SANITY_DATASET
 * as the single source of truth in .env.local.
 */
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");
try {
  process.loadEnvFile(envPath);
} catch {
  // .env.local is optional for hosts that inject env another way
}

if (process.env.SANITY_PROJECT_ID && !process.env.SANITY_STUDIO_PROJECT_ID) {
  process.env.SANITY_STUDIO_PROJECT_ID = process.env.SANITY_PROJECT_ID;
}
if (!process.env.SANITY_STUDIO_DATASET) {
  process.env.SANITY_STUDIO_DATASET =
    process.env.SANITY_DATASET?.trim() || "development";
}

const sanityBin = resolve(process.cwd(), "node_modules/.bin/sanity");
const args = process.argv.slice(2);
const child = spawn(process.execPath, [sanityBin, ...args], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
