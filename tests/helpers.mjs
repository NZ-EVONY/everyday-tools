// Shared helpers for tests. Build-output tests read public/ and reports/pages.json, which
// `npm test` produces by running the build first.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PUBLIC = path.join(ROOT, "public");
export const readJson = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
export const pages = () => readJson("reports/pages.json");
export const html = p => fs.readFileSync(path.join(PUBLIC, p.file), "utf8");
export const publicFiles = () => fs.readdirSync(PUBLIC, { recursive: true, withFileTypes: true }).filter(e => e.isFile())
  .map(e => path.relative(PUBLIC, path.join(e.parentPath ?? e.path, e.name)).split(path.sep).join("/")).sort();

/** Repo text files outside node_modules, .git, public and reports (for identity and name scans). */
export function repoFiles({ includePublic = false } = {}) {
  const skip = new Set(["node_modules", ".git", "reports", ".wrangler", ".wrangler-dry", ...(includePublic ? [] : ["public"])]);
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (skip.has(e.name)) continue;
      const f = path.join(d, e.name);
      e.isDirectory() ? walk(f) : out.push(path.relative(ROOT, f).split(path.sep).join("/"));
    }
  })(ROOT);
  return out;
}

/** JSON-LD blocks in a page, parsed. */
export const jsonLd = h => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
