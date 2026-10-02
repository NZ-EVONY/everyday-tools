// Pre-deploy gate for the owner: fails if the built site isn't safe to publish.
// Usage: npm run check:deploy (after npm run build; see docs/DEPLOY.md).
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { loadData, expiryChecks, nzToday } from "./lib/data.mjs";
import { windowsNameProblems } from "./lib/names.mjs";

const OUT = path.resolve("public");
const problems = [];
const files = fs.readdirSync(OUT, { recursive: true, withFileTypes: true }).filter(e => e.isFile())
  .map(e => path.relative(OUT, path.join(e.parentPath ?? e.path, e.name)).split(path.sep).join("/")).sort();

for (const need of ["404.html", "_headers", "robots.txt", "sitemap.xml", "ads.txt", "index.html"]) if (!files.includes(need)) problems.push(`public/${need} is missing; run npm run build.`);
for (const f of files.filter(f => f.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(OUT, f), "utf8");
  if (/\{\{[A-Z_]+\}\}/.test(html)) problems.push(`${f}: leftover {{PLACEHOLDER}}`);
  if (/TODO-OWNER/.test(html)) problems.push(`${f}: TODO-OWNER marker in output`);
}
const bad = files.filter(f => /(^|\/)(\.git|\.wrangler|node_modules|docs|tests|scripts|data|content|src)(\/|$)|\.md$|\.mjs$|wrangler\.jsonc$|\.dev\.vars$/.test(f));
if (bad.length) problems.push(`Files that must not be public: ${bad.join(", ")}`);
for (const f of files) for (const p of windowsNameProblems(f)) problems.push(`public/${f}: ${p}`);

// ads.txt: every non-comment line must be a real record (never the placeholder).
if (files.includes("ads.txt")) for (const line of fs.readFileSync(path.join(OUT, "ads.txt"), "utf8").split(/\r?\n/)) {
  if (line.trim() && !line.trim().startsWith("#") && /pub-X+/.test(line)) problems.push(`ads.txt has an uncommented placeholder line: ${line}`);
}
// Ads: nothing while adsLive is false; never an enabled slot while ads are off.
const ads = JSON.parse(fs.readFileSync("config/ads.json", "utf8"));
const enabled = Object.entries(ads.pageTypes).filter(([, t]) => t.enabled).map(([k]) => k);
if (!ads.adsLive) {
  if (enabled.length) problems.push(`config/ads.json: adsLive is false but these page types are enabled: ${enabled.join(", ")}`);
  for (const f of files.filter(f => /\.(html|js)$/.test(f))) {
    const s = fs.readFileSync(path.join(OUT, f), "utf8").replace(/<!--[\s\S]*?-->/g, "");
    if (/adsbygoogle|googlesyndication|pagead|gtag\(|google-analytics|googletagmanager|class="ad-slot/.test(s)) problems.push(`${f}: ad or analytics code while adsLive is false`);
  }
}
// Stale build: public-manifest.json must match public/ exactly.
const manifest = JSON.parse(fs.readFileSync("public-manifest.json", "utf8")).files;
const actual = files.filter(f => f !== ".assetsignore").map(f => { const b = fs.readFileSync(path.join(OUT, f)); return { path: f, size: b.length, sha256: createHash("sha256").update(b).digest("hex") }; });
if (JSON.stringify(manifest) !== JSON.stringify(actual)) problems.push("public-manifest.json does not match public/: rebuild with npm run build and commit both.");
// Data expiry, re-run against today's NZ date.
const exp = expiryChecks(loadData(process.cwd()), process.env.ET_TODAY || nzToday());
problems.push(...exp.errors);
for (const w of exp.warnings) console.warn(`WARNING: ${w}`);

if (problems.length) { console.error("NOT READY TO DEPLOY:\n- " + problems.join("\n- ")); process.exit(1); }
console.log(`OK: ${files.length} files in public/; manifest current; no placeholders, ad code or private files; data in date.`);
