// Checks on the built HTML and the files around it.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pages, html, publicFiles, readJson, jsonLd, PUBLIC } from "../helpers.mjs";
import { textOf } from "../../src/templates/partials/util.mjs";
import { HEAD_SCRIPT } from "../../src/templates/layout.mjs";
import { checkLinks } from "../../scripts/check-links.mjs";

const site = readJson("site.config.json");
const quality = readJson("config/quality.json");
const all = pages();
const indexable = all.filter(p => !p.noindex && p.type !== "error");
const read = f => fs.readFileSync(path.join(PUBLIC, f), "utf8");

test("every page: one h1, lang, canonical, author meta, title and description limits", () => {
  for (const p of all) {
    const h = html(p);
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1, `${p.path} h1`);
    assert.match(h, /<html lang="en-NZ">/);
    assert.match(h, new RegExp(`<link rel="canonical" href="${site.siteUrl}${p.path === "/" ? "/" : p.path}">`), p.path);
    assert.match(h, /<meta name="author" content="Everyday Tools">/);
    assert.ok(p.title.length <= quality.maxTitle, `${p.path} title ${p.title.length}`);
    assert.ok(p.description.length <= quality.maxDescription, `${p.path} description ${p.description.length}`);
    assert.ok(!/\.html"|href="\/[^"]+\/"/.test(h.replace(/<link rel="canonical"[^>]+>/, "")), `${p.path} links with .html or trailing slash`);
    assert.match(h, /<meta property="og:title"/);
    assert.match(h, /<meta name="twitter:card"/);
  }
});

test("titles and descriptions are unique", () => {
  for (const k of ["title", "description", "h1"]) {
    const vals = indexable.map(p => p[k]);
    assert.equal(new Set(vals).size, vals.length, `duplicate ${k}`);
  }
});

test("header, navigation and footer are in the raw HTML, with trust links on every page", () => {
  for (const p of all) {
    const h = html(p);
    assert.match(h, /<header class="site-header">/);
    assert.match(h, /<nav class="nav" aria-label="Main">/);
    assert.match(h, /<details class="menu"/);
    for (const href of ["/about", "/contact", "/privacy-policy", "/terms"]) assert.ok(h.includes(`href="${href}"`), `${p.path} footer ${href}`);
    assert.match(h, /run by an independent publisher in New Zealand/);
    assert.match(h, /© \d{4} Everyday Tools/);
    assert.match(h, /id="privacy-settings-link" hidden/);
  }
});

test("JSON-LD parses, uses Organization for author/publisher, FAQ matches visible text, breadcrumbs present", () => {
  for (const p of all) {
    const h = html(p);
    const blocks = jsonLd(h);
    const graph = blocks.flatMap(b => b["@graph"]);
    for (const n of graph) for (const k of ["author", "publisher"]) if (n[k] && n[k]["@type"]) assert.equal(n[k]["@type"], "Organization");
    if (p.type === "tool") assert.ok(graph.some(n => n["@type"] === "WebApplication" && n.offers.price === "0"), p.path);
    if (p.type === "guide") assert.ok(graph.some(n => n["@type"] === "Article"), p.path);
    const faq = graph.find(n => n["@type"] === "FAQPage");
    if (p.faq.length) {
      assert.ok(faq, `${p.path} FAQPage`);
      p.faq.forEach((f, i) => {
        assert.equal(faq.mainEntity[i].name, textOf(f.q));
        assert.equal(faq.mainEntity[i].acceptedAnswer.text, textOf(f.a));
        assert.ok(textOf(h).includes(textOf(f.a)), `${p.path} FAQ answer visible`);
      });
    } else assert.ok(!faq, `${p.path} FAQPage without visible FAQ`);
    if (p.path !== "/" && p.type !== "error") {
      assert.match(h, /<nav class="crumbs"/, p.path);
      assert.ok(graph.some(n => n["@type"] === "BreadcrumbList"), p.path);
    }
    if (p.path === "/") assert.ok(graph.some(n => n["@type"] === "WebSite") && graph.some(n => n["@type"] === "Organization"));
  }
});

test("sitemap.xml lists exactly the indexable pages; robots.txt allows all with the Sitemap line", () => {
  const locs = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(site.siteUrl, ""));
  assert.deepEqual(locs.sort(), indexable.map(p => p.path).sort());
  assert.equal(read("robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`);
});

test("404 page is noindex", () => {
  const h = read("404.html");
  assert.match(h, /<meta name="robots" content="noindex">/);
});

test("ads.txt is comment-only and nothing ad-related ships while adsLive is false", () => {
  const ads = readJson("config/ads.json");
  assert.equal(ads.adsLive, false);
  assert.ok(Object.values(ads.pageTypes).every(t => t.enabled === false), "an ad page type is enabled");
  for (const line of read("ads.txt").split("\n")) if (line.trim()) assert.ok(line.startsWith("#"), `ads.txt: ${line}`);
  for (const f of publicFiles().filter(f => /\.(html|js|css)$/.test(f))) {
    const s = read(f).replace(/<!--[\s\S]*?-->/g, "");
    assert.ok(!/adsbygoogle|googlesyndication|pagead|gtag|google-analytics|googletagmanager/.test(s), `${f} has ad/analytics code`);
    assert.ok(!/class="ad-slot/.test(s), `${f} renders an ad slot`);
  }
  for (const p of all) {
    const h = html(p);
    assert.ok(h.indexOf("CMP INTEGRATION POINT") < h.indexOf("ADSENSE INTEGRATION POINT"), "CMP comment before AdSense comment");
  }
});

test("_headers: rule limits, security headers, CSP with the inline script's hash and no third-party origin", () => {
  const text = read("_headers");
  const active = text.split("\n").filter(l => l.trim() && !l.trim().startsWith("#"));
  const rules = active.filter(l => !/^\s/.test(l));
  assert.ok(rules.length <= 100);
  assert.ok(active.every(l => l.length <= 2000));
  for (const h of ["X-Content-Type-Options: nosniff", "Referrer-Policy: strict-origin-when-cross-origin", "Strict-Transport-Security", "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()"]) assert.ok(text.includes(h), h);
  const csp = active.find(l => l.includes("Content-Security-Policy"));
  const hash = createHash("sha256").update(HEAD_SCRIPT).digest("base64");
  assert.ok(csp.includes(`'sha256-${hash}'`));
  assert.ok(!/https?:\/\//.test(active.join("\n")), "third-party origin in an active rule");
  for (const d of ["default-src 'self'", "style-src 'self'", "connect-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'none'"]) assert.ok(csp.includes(d), d);
});

test("no unrendered template placeholders or broken values in page text", () => {
  for (const p of all) {
    const h = html(p).replace(/<script(?! type="application\/ld\+json")[\s\S]*?<\/script>/g, "").replace(/<svg[\s\S]*?<\/svg>/g, "");
    for (const bad of ["${", "undefined", "NaN", "[object Object]"]) assert.ok(!h.includes(bad), `${p.path} contains ${bad}`);
  }
});

test("dark is the default theme: one dark theme-color, no prefers-color-scheme, light only via data-theme", () => {
  const css = fs.readFileSync(path.join(PUBLIC, "assets", fs.readdirSync(path.join(PUBLIC, "assets")).find(f => /^style.*\.css$/.test(f))), "utf8");
  assert.ok(!css.includes("prefers-color-scheme"), "CSS must not follow the system colour scheme");
  assert.ok(css.includes("#0E1735") && css.includes("#0A1030"), "Letterpile dark palette present");
  for (const p of all.filter(p => p.type !== "error")) {
    const h = html(p);
    assert.deepEqual(h.match(/<meta name="theme-color"[^>]*>/g), ['<meta name="theme-color" content="#0A1030">'], p.path);
    assert.ok(!h.includes("prefers-color-scheme"), p.path);
  }
});

test("no inline styles, exactly one inline script, and it is the theme script", () => {
  for (const p of all) {
    const h = html(p);
    assert.ok(!/\sstyle\s*=|<style[\s>]/i.test(h), p.path);
    const inline = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    assert.deepEqual(inline, [HEAD_SCRIPT], p.path);
  }
});

test("public/ holds only site files, at most 1,000", () => {
  const files = publicFiles();
  assert.ok(files.length <= quality.maxPublicFiles);
  for (const f of files) assert.ok(!/(^|\/)(docs|data|tests|scripts|content|src|node_modules)\/|\.md$|\.mjs$|\.dev\.vars|wrangler\.jsonc/.test(f), f);
  for (const need of ["index.html", "404.html", "_headers", "robots.txt", "sitemap.xml", "ads.txt", "favicon.svg"]) assert.ok(files.includes(need), need);
});

test("no broken internal links and no orphan pages", () => {
  const r = checkLinks(PUBLIC);
  assert.deepEqual(r.broken, []);
  assert.deepEqual(r.orphans, []);
});

test("tool pages carry a noscript message and an aria-live result region", () => {
  for (const p of all.filter(p => p.type === "tool" || p.type === "landing")) {
    const h = html(p);
    assert.match(h, /<noscript>/, p.path);
    assert.match(h, /aria-live="polite"/, p.path);
  }
});
