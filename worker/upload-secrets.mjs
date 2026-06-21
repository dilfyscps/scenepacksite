#!/usr/bin/env node
/**
 * Upload worker/.dev.vars secrets to the live scenepacks-stats worker.
 * Run from repo root: npm run deploy:secrets
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)));
const devVarsPath = join(root, ".dev.vars");
const wranglerConfig = join(root, "wrangler.toml");
const keys = ["ADMIN_USERNAME", "ADMIN_PASSWORD", "TMDB_API_KEY"];

if (!existsSync(devVarsPath)) {
  console.error("Missing worker/.dev.vars — add ADMIN_USERNAME, ADMIN_PASSWORD, TMDB_API_KEY first.");
  process.exit(1);
}

const values = Object.fromEntries(
  readFileSync(devVarsPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

for (const key of keys) {
  const value = values[key];
  if (!value) {
    console.error(`Missing ${key} in worker/.dev.vars`);
    process.exit(1);
  }

  console.log(`Uploading ${key}...`);
  const result = spawnSync(
    "npx",
    ["wrangler", "secret", "put", key, "--config", wranglerConfig],
    { input: value, stdio: ["pipe", "inherit", "inherit"] },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Done. Try admin login again (no redeploy needed).");
