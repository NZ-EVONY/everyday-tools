// Timings for the text tools on large input (Chromium, local server). Separates the browser's own
// textarea layout from the cleaner's work. Usage: node scripts/measure-text.mjs
import { chromium } from "playwright-core";
import { createServer } from "./serve.mjs";
import { findChrome } from "./chrome.mjs";

const chrome = findChrome();
if (!chrome) { console.error("NOT VERIFIED: no Chrome/Chromium found."); process.exit(2); }
const server = createServer("public").listen(0);
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch({ executablePath: chrome });
const rows = [];
try {
  for (const [lines, worker] of [[25000, true], [100000, true], [250000, true], [100000, false]]) {
    const ctx = await browser.newContext();
    if (!worker) await ctx.addInitScript(() => { delete window.Worker; });
    const page = await ctx.newPage();
    await page.goto(base + "/remove-duplicate-lines");
    const text = Array.from({ length: lines }, (_, i) => `row ${i % 1000}`).join("\n");
    const r = await page.evaluate(async t => {
      const el = document.querySelector("#ctIn");
      const t0 = performance.now();
      el.value = t;
      await new Promise(res => requestAnimationFrame(() => setTimeout(res, 0)));
      const layout = performance.now() - t0;
      const long = [];
      new PerformanceObserver(l => { for (const e of l.getEntries()) long.push(e.duration); }).observe({ type: "longtask" });
      const t1 = performance.now();
      el.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise(res => { const i = setInterval(() => { if (document.querySelector("#rOut").textContent === "1,000") { clearInterval(i); res(); } }, 10); });
      await new Promise(res => setTimeout(res, 50));
      return { layout, processing: performance.now() - t1, longest: long.length ? Math.max(...long) : 0 };
    }, text);
    rows.push({ lines, chars: text.length, worker, layoutMs: Math.round(r.layout), processingMs: Math.round(r.processing), longestTaskMs: Math.round(r.longest) });
    await ctx.close();
  }
} finally { await browser.close(); server.close(); }
console.table(rows);
