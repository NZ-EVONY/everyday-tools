// Browser checks for every page: same-origin requests only, no-JS rendering, axe, CLS,
// keyboard basics, and screenshots (to gitignored reports/screens/).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../helpers.mjs";
import { withBrowser, skip, ALL_URLS } from "./helpers-browser.mjs";

const AXE = fs.readFileSync(path.join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");

test("every request on every page is same-origin", { skip, timeout: 120000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    const foreign = [];
    page.on("request", r => { if (!r.url().startsWith(base) && !r.url().startsWith("data:")) foreign.push(`${page.url()} -> ${r.url()}`); });
    for (const u of ALL_URLS()) { await page.goto(base + u); await page.waitForLoadState("networkidle"); }
    assert.deepEqual(foreign, []);
  });
});

test("without JavaScript: text, navigation and footer render; tools show the noscript message", { skip, timeout: 120000 }, async () => {
  await withBrowser(async (browser, base) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    for (const u of ALL_URLS()) {
      await page.goto(base + u);
      assert.ok(await page.isVisible("nav.navbar"), `${u} nav hidden without JS`);
      assert.ok(await page.isVisible("footer"), `${u} footer`);
      assert.ok((await page.innerText("main")).split(/\s+/).length > 30, `${u} main text`);
      if (await page.$(".tool-card")) assert.ok(await page.isVisible(".noscript"), `${u} noscript message`);
    }
  });
});

test("axe: no serious or critical issues on any page, light and dark", { skip, timeout: 300000 }, async () => {
  await withBrowser(async (browser, base) => {
    const problems = [];
    for (const colorScheme of ["light", "dark"]) {
      const ctx = await browser.newContext({ bypassCSP: true, colorScheme });
      const page = await ctx.newPage();
      for (const u of ALL_URLS()) {
        await page.goto(base + u);
        if (u === "/gst-calculator") { await page.fill("#gstAmount", "115"); await page.click('input[value="remove"]'); await page.click(".advanced summary"); }
        await page.addScriptTag({ content: AXE });
        const v = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations.map(v => ({ id: v.id, impact: v.impact, sample: v.nodes[0]?.html.slice(0, 120) })));
        for (const x of v) if (["serious", "critical"].includes(x.impact)) problems.push(`${colorScheme} ${u}: ${x.id} ${x.sample}`);
      }
      await ctx.close();
    }
    assert.deepEqual(problems, []);
  });
});

test("layout: no horizontal scroll at 360px, CLS stays under 0.02, screenshots saved", { skip, timeout: 300000 }, async () => {
  await withBrowser(async (browser, base) => {
    const out = path.join(ROOT, "reports/screens");
    fs.mkdirSync(out, { recursive: true });
    const problems = [];
    for (const width of [360, 1280]) for (const colorScheme of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width, height: 800 }, colorScheme });
      const page = await ctx.newPage();
      await page.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); });
      for (const u of ALL_URLS()) {
        await page.goto(base + u);
        await page.waitForLoadState("networkidle");
        if (u === "/gst-calculator") { await page.fill("#gstAmount", "240"); await page.waitForTimeout(100); }
        const cls = await page.evaluate(() => window.__cls);
        if (cls > 0.02) problems.push(`${width} ${colorScheme} ${u}: CLS ${cls.toFixed(3)}`);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (over > 0) problems.push(`${width} ${u}: horizontal overflow ${over}px`);
        await page.screenshot({ path: path.join(out, `${(u.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home")}-${width}-${colorScheme}.png`), fullPage: true });
      }
      await ctx.close();
    }
    assert.deepEqual(problems, []);
  });
});

test("keyboard: skip link works and the theme toggle persists only the theme", { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/about");
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement.className), "skip");
    await page.click("#themeToggle");
    const storage = await page.evaluate(() => ({ ...localStorage }));
    assert.deepEqual(Object.keys(storage), ["theme"]);
    assert.equal(await page.evaluate(() => document.cookie), "");
    await page.goto(base + "/");
    assert.ok(["dark", "light"].includes(await page.evaluate(() => document.documentElement.dataset.theme)));
  });
});

test("hidden elements stay hidden (the consent link waits for a CMP)", { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/");
    assert.equal(await page.isVisible("#privacy-settings-link"), false);
  });
});
