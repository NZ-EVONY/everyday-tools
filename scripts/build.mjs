// Builds the deployable site into public/.
//   node scripts/build.mjs                 normal build (writes public/ and public-manifest.json)
//   node scripts/build.mjs --ads-preview   renders every ad slot into reports/ads-preview (never deploy)
//   node scripts/build.mjs --out <dir>     write somewhere else (tests use this)
// The build fails on expired tax or holiday data, unknown source ids, leftover {{PLACEHOLDERS}},
// inline styles, reserved Windows file names, forbidden files or more than 1,000 files.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import layout, { HEAD_SCRIPT } from "../src/templates/layout.mjs";
import { esc } from "../src/templates/partials/util.mjs";
import { loadData, checkSourceIds, expiryChecks, nzToday } from "./lib/data.mjs";
import { bundle } from "./lib/bundle.mjs";
import { formatMoney } from "../src/assets/lib/money.js";
import { toolGrid, guideLink } from "../src/templates/partials/cards.mjs";
import { icon } from "../src/templates/icons.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
import { WINDOWS_RESERVED } from "./lib/names.mjs";

const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const PREVIEW = process.argv.includes("--ads-preview");
const OUT = path.resolve(ROOT, arg("--out") || (PREVIEW ? "reports/ads-preview" : "public"));
const MAIN = OUT === path.join(ROOT, "public");
// ET_TODAY (YYYY-MM-DD) exists only so tests can prove the expiry checks; never set it for a real build.
const TODAY = process.env.ET_TODAY || nzToday();

const readJson = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
const site = readJson("site.config.json");
const nav = readJson("config/nav.json");
const adsCfg = readJson("config/ads.json");
const quality = readJson("config/quality.json");
const toolList = readJson("config/tools.json").tools;

// ---------- data and expiry ----------

const data = loadData(ROOT);
const srcProblems = checkSourceIds(data);
if (srcProblems.length) throw new Error(`Data source problems:\n  ${srcProblems.join("\n  ")}`);
const expiry = expiryChecks(data, TODAY);
for (const w of expiry.warnings) console.warn(`WARNING: ${w}`);
if (expiry.errors.length) throw new Error(`Data expiry check failed (today in NZ: ${TODAY}):\n  ${expiry.errors.join("\n  ")}`);

// ---------- helpers ----------

const hash = buf => createHash("sha256").update(buf).digest("hex").slice(0, 10);
function write(rel, content) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const longDate = iso => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
// Percentages that come from data are wrapped in <span class="dv"> so the content test can tell
// them apart from typed-in percentages (which the content rules forbid).
const pctText = rate => `${+(rate * 100).toFixed(2)}%`;
const pct = rate => `<span class="dv">${pctText(rate)}</span>`;
const dollars = n => (Number.isInteger(n) ? `$${n.toLocaleString("en-NZ")}` : formatMoney(Math.round(n * 100)));
const sourceById = Object.fromEntries(data.sources.map(s => [s.id, s]));
const srcLink = id => { const s = sourceById[id]; if (!s) throw new Error(`Unknown source id ${id}`); return `<a href="${s.url}" rel="noopener">${esc(s.label)}</a> (${esc(s.publisher)})`; };

// ---------- start clean ----------

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// ---------- assets (content-hashed names) ----------

const SRC = path.join(ROOT, "src/assets");
const assets = {};
function addAsset(rel, buf) {
  const ext = path.extname(rel);
  const name = `/assets/${rel.slice(0, -ext.length)}.${hash(buf)}${ext}`;
  write(name, buf);
  assets[rel] = name;
}
addAsset("style.css", fs.readFileSync(path.join(SRC, "style.css")));
addAsset("site.js", fs.readFileSync(path.join(SRC, "site.js")));
if (fs.existsSync(path.join(SRC, "worker.js"))) addAsset("worker.js", bundle(path.join(SRC, "worker.js")));
for (const f of fs.readdirSync(path.join(SRC, "js")).filter(f => f.endsWith(".js")).sort()) addAsset(`js/${f}`, bundle(path.join(SRC, "js", f)));
write("favicon.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4D8DFF"/><stop offset="1" stop-color="#9A7BFF"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#g)"/><g fill="#0A1030"><rect x="6" y="6" width="9" height="9" rx="3"/><rect x="17" y="17" width="9" height="9" rx="3"/><rect x="17" y="6" width="9" height="9" rx="3" opacity=".55"/><rect x="6" y="17" width="9" height="9" rx="3" opacity=".55"/></g></svg>\n`);

// ---------- content ----------

function listModules(dir) {
  const abs = path.join(ROOT, dir);
  return fs.existsSync(abs) ? fs.readdirSync(abs).filter(f => f.endsWith(".mjs")).sort().map(f => path.join(abs, f)) : [];
}
const modules = [];
for (const f of [...listModules("content/pages"), ...listModules("content/guides")]) {
  modules.push({ file: path.relative(ROOT, f).split(path.sep).join("/"), mod: await import(pathToFileURL(f).href) });
}

const ads = {
  preview: PREVIEW,
  enabledFor(page) {
    const t = adsCfg.pageTypes[page.type];
    if (!t || page.noindex) return [];
    if (PREVIEW) return t.slots;
    if (!adsCfg.adsLive || !t.enabled) return [];
    return t.slots;
  },
};

const tax = data.tax;
const ctx = {
  site, nav, assets, esc, longDate, pct, pctText, dollars, money: formatMoney, today: TODAY, year: Number(TODAY.slice(0, 4)),
  adsLive: !!adsCfg.adsLive, dstData: readJson("data/nz/daylight-saving.json"), data, tax, gst: data.gst, holidays: data.holidays, src: srcLink, source: id => sourceById[id],
  // The standard source line and disclaimer for NZ money pages, above the explainer.
  taxNotice(ids, { taxYear = true } = {}) {
    const links = [...new Set(ids)].map(srcLink).join("; ");
    const yearLine = taxYear
      ? `Rates for the ${tax.taxYear} tax year (${longDate(tax.periodStart)} to ${longDate(tax.periodEnd)}), checked on ${longDate(tax.checkedOn)}.`
      : `Rates checked on ${longDate(data.gst.checkedOn)}.`;
    return `<aside class="notice" aria-label="Source and disclaimer">${icon("info")}<div><p><strong>${yearLine}</strong> Source: ${links}.</p><p>This is an estimate for general information, not financial or tax advice; check with Inland Revenue or a qualified adviser.</p></div></aside>`;
  },
};

// Pass 1 learns every page's path and status; pass 2 renders with links only to published pages.
let published = new Set(), titles = new Map();
const blurb = s => s.replace("{gstRate}", pct(data.gst.rate.value));
ctx.tools = toolList;
ctx.icon = icon;
ctx.guideLink = guideLink;
ctx.toolGrid = (pillar, isPub) => toolGrid(toolList.filter(t => !pillar || t.pillar === pillar), { isPublished: isPub, blurb });
const link = (href, label) => (published.has(href.split("#")[0]) ? `<a href="${href}">${label}</a>` : label);
const render = (m) => m.mod.default({ ...ctx, link, isPublished: p => published.has(p), titleOf: p => titles.get(p) });
for (const m of modules) {
  const p = render(m);
  if (!p.path) throw new Error(`${m.file} has no path`);
  if (p.status !== "draft") { published.add(p.path); titles.set(p.path, p.h1); }
}
let pages = [];
const drafts = [];
for (const m of modules) {
  const p = render(m);
  p.source = m.file;
  if (p.status === "draft") { drafts.push(p); continue; }
  if (p.path !== "/" && p.type !== "error") {
    const hub = p.pillar && nav.pillars.find(n => n.key === p.pillar);
    p.crumbs = p.crumbs || [{ name: "Home", path: "/" }, ...(hub && hub.href !== p.path ? [{ name: hub.label, path: hub.href }] : []), { name: p.crumbName || p.h1, path: p.path }];
  }
  pages.push(p);
}
ctx.pages = pages;
// Pages that list other pages (the HTML sitemap) render last with the final page list.
for (const p of pages) if (p.late) Object.assign(p, p.late({ ...ctx, link, pages }));

// ---------- render ----------

ctx.isPublished = p => published.has(p);
const stripOwnerMarkers = html => html.replace(/<!--[^>]*?TODO-OWNER[\s\S]*?-->/g, "").replace(/^.*TODO-OWNER.*\n?/gm, "");
const seen = new Map();
for (const page of pages) {
  if (seen.has(page.path)) throw new Error(`Two pages claim ${page.path}: ${seen.get(page.path)} and ${page.source}`);
  seen.set(page.path, page.source);
  page.file = page.type === "error" ? "404.html" : page.path === "/" ? "index.html" : `${page.path.slice(1)}.html`;
  page.html = stripOwnerMarkers(layout(page, { ...ctx, ads }));
  write(page.file, page.html);
}

// ---------- robots, sitemap, ads.txt ----------

const indexable = pages.filter(p => !p.noindex && p.type !== "error");
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map(p => `  <url><loc>${site.siteUrl}${p.path}</loc><lastmod>${p.reviewed}</lastmod></url>`).join("\n")}
</urlset>
`);
write("ads.txt", `# ads.txt placeholder: advertising is not switched on yet.\n# After AdSense approval, replace the publisher id with the real one from the AdSense account and remove the leading "# ".\n# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0  (replace after approval)\n`);

// ---------- headers (security + caching) ----------

const scriptHash = createHash("sha256").update(HEAD_SCRIPT).digest("base64");
const csp = [
  "default-src 'self'", `script-src 'self' 'sha256-${scriptHash}'`, "style-src 'self'", "img-src 'self' data:",
  "connect-src 'self'", "worker-src 'self'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'", "object-src 'none'",
].join("; ");
write("_headers", `# Cloudflare static-asset headers (max 100 rules, 2,000 characters per line).
# Generated by scripts/build.mjs: edit there, not here.
#
# CSP additions that will be needed once a consent platform and AdSense are switched on
# (the owner verifies these against Google's and the CMP's current documentation first):
#   script-src  + https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com
#                 https://*.gstatic.com https://*.doubleclick.net + the CMP's origin(s)
#   frame-src   + https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com
#   img-src     + https:
#   connect-src + https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net
#   style-src   may need 'unsafe-inline' for ad and CMP markup.

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Strict-Transport-Security: max-age=31536000
  Content-Security-Policy: ${csp}

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/ads.txt
  Content-Type: text/plain; charset=utf-8
`);
write(".assetsignore", ".assetsignore\n.DS_Store\nThumbs.db\n");

// ---------- checks ----------

const all = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) e.isDirectory() ? walk(path.join(d, e.name)) : all.push(path.relative(OUT, path.join(d, e.name)).split(path.sep).join("/")); })(OUT);
const fail = [];
if (all.length > quality.maxPublicFiles) fail.push(`public/ has ${all.length} files; the limit is ${quality.maxPublicFiles}.`);
const reserved = all.filter(f => f.split("/").some(seg => WINDOWS_RESERVED.test(seg.split(".")[0])));
if (reserved.length) fail.push(`Reserved Windows names: ${reserved.join(", ")}`);
const forbidden = all.filter(f => /(^|\/)(\.git|\.wrangler|node_modules|docs|tests|scripts|data|content|src)(\/|$)|\.md$|\.mjs$|wrangler\.jsonc$|\.dev\.vars$/.test(f));
if (forbidden.length) fail.push(`Forbidden files: ${forbidden.join(", ")}`);
for (const p of pages) {
  if (/\{\{[A-Z_]+\}\}/.test(p.html)) fail.push(`${p.file}: leftover {{PLACEHOLDER}}`);
  if (/\sstyle\s*=|<style[\s>]/i.test(p.html)) fail.push(`${p.file}: inline style found (the CSP forbids it)`);
  if (/TODO-OWNER/.test(p.html)) fail.push(`${p.file}: TODO-OWNER marker reached the output`);
  if ((p.html.match(/<script>/g) || []).length !== 1) fail.push(`${p.file}: expected exactly one inline script`);
}
if (fail.length) throw new Error(`Build checks failed:\n  ${fail.join("\n  ")}`);

if (MAIN) {
  const manifest = all.filter(f => f !== ".assetsignore").sort().map(f => {
    const buf = fs.readFileSync(path.join(OUT, f));
    return { path: f, size: buf.length, sha256: createHash("sha256").update(buf).digest("hex") };
  });
  fs.writeFileSync(path.join(ROOT, "public-manifest.json"), JSON.stringify({ files: manifest }, null, 2) + "\n");
}
// Page metadata for tests and reports (gitignored).
if (MAIN) {
  fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "reports", "pages.json"), JSON.stringify(pages.map(p => ({
    path: p.path, file: p.file, type: p.type, pillar: p.pillar || null, title: p.title, description: p.description, h1: p.h1,
    noindex: !!p.noindex, reviewed: p.reviewed || null, source: p.source, intro: p.intro || null, sources: p.sources || [], claims: p.claims || [], faq: p.faq || [],
    nzMoney: p.pillar === "nz-calculators" && p.type === "tool" && !!p.notice,
  })), null, 2));
  fs.writeFileSync(path.join(ROOT, "reports", "claims.json"), JSON.stringify([...pages, ...drafts].map(p => ({ path: p.path, status: p.status, source: p.source, claims: p.claims || [] })), null, 2));
}
console.log(`Built ${pages.length} pages, ${all.length} files into ${path.relative(ROOT, OUT)}/${PREVIEW ? " (ADS PREVIEW: do not deploy)" : ""}. Tax year ${tax.taxYear}; today in NZ ${TODAY}.`);
