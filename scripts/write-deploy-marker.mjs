/**
 * Write the deploy marker the fleet's daily hygiene check reads.
 *
 * The marker is how scripts/site-hygiene.mjs proves that the live site was built
 * from the current HEAD: if the file's contents differ from `git rev-parse HEAD`,
 * either the Git integration broke, the build failed, or somebody deployed
 * locally with `wrangler deploy`. That check is the reason every site in the
 * fleet — including the two that do not use the AnvilWiki template — emits this
 * exact path and format.
 *
 * Commit source, in order:
 *   1. WORKERS_CI_COMMIT_SHA — set by Cloudflare Workers Builds.
 *   2. `git rev-parse HEAD` — local builds.
 *   3. "unknown" — never fail a build over a marker.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", ".well-known", "anvilwiki-deploy.txt");

function sha() {
  const fromCi = process.env.WORKERS_CI_COMMIT_SHA;
  if (fromCi) return fromCi.trim();
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

const commit = sha();
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, commit + "\n", "utf8");
console.log(`[deploy-marker] ${commit}`);
