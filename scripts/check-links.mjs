// Fails on broken internal links and orphan pages (pages no other page links to).
// Usage: node scripts/check-links.mjs [dir=public]. Also used by tests/build.
import fs from "node:fs";
import path from "node:path";

export function checkLinks(dir = "public") {
  const files = fs.readdirSync(dir, { recursive: true }).map(f => String(f).split(path.sep).join("/")).filter(f => f.endsWith(".html"));
  const urlOf = f => (f === "index.html" ? "/" : "/" + f.replace(/\.html$/, ""));
  const exists = new Set(files.map(urlOf));
  const assets = new Set(fs.readdirSync(dir, { recursive: true }).map(f => "/" + String(f).split(path.sep).join("/")));
  const broken = [], inbound = new Map([...exists].map(u => [u, 0]));
  for (const f of files) {
    const html = fs.readFileSync(path.join(dir, f), "utf8");
    for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const u = m[1];
      if (exists.has(u)) { if (u !== urlOf(f)) inbound.set(u, inbound.get(u) + 1); }
      else if (!assets.has(u)) broken.push(`${f} -> ${u}`);
    }
  }
  const orphans = [...inbound].filter(([u, n]) => n === 0 && u !== "/" && u !== "/404").map(([u]) => u);
  return { pages: files.length, broken, orphans };
}

if (process.argv[1]?.endsWith("check-links.mjs")) {
  const r = checkLinks(process.argv[2] || "public");
  console.log(`${r.pages} pages; ${r.broken.length} broken links; ${r.orphans.length} orphans.`);
  for (const b of r.broken) console.log(`  broken: ${b}`);
  for (const o of r.orphans) console.log(`  orphan: ${o}`);
  if (r.broken.length || r.orphans.length) process.exitCode = 1;
}
