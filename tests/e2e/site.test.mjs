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
      assert.ok(await page.isVisible("nav.nav"), `${u} nav hidden without JS`);
      assert.ok(await page.isVisible("footer"), `${u} footer`);
      assert.ok((await page.innerText("main")).split(/\s+/).length > 30, `${u} main text`);
      if (await page.$(".tool-card")) assert.ok(await page.isVisible(".noscript"), `${u} noscript message`);
    }
  });
});

// Dark is the default for everyone; light is used only when the header toggle has set data-theme="light"
// (saved as et-theme). The system colour scheme is not followed, so these tests choose the theme via the saved value.
const THEMES = ["dark", "light"];
const withTheme = async (browser, theme, opts = {}) => {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(th => { try { localStorage.setItem("et-theme", th); } catch (e) {} }, theme);
  return ctx;
};

test("axe: no serious or critical issues on any page, dark (default) and light (toggle)", { skip, timeout: 300000 }, async () => {
  await withBrowser(async (browser, base) => {
    const problems = [];
    for (const colorScheme of THEMES) {
      const ctx = await withTheme(browser, colorScheme, { bypassCSP: true });
      const page = await ctx.newPage();
      for (const u of ALL_URLS()) {
        await page.goto(base + u);
        if (u === "/gst-calculator") { await page.fill("#gstLines .amt", "115"); await page.click('label:has(> input[value="remove"])'); await page.click("#gstAddLine"); await page.locator("#gstLines .amt").nth(1).fill("10"); }
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
    for (const width of [360, 1280]) for (const colorScheme of THEMES) {
      const ctx = await withTheme(browser, colorScheme, { viewport: { width, height: 800 } });
      const page = await ctx.newPage();
      await page.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); });
      for (const u of ALL_URLS()) {
        await page.goto(base + u);
        await page.waitForLoadState("networkidle");
        if (u === "/gst-calculator") { await page.fill("#gstLines .amt", "240"); await page.waitForTimeout(100); }
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
    assert.deepEqual(Object.keys(storage), ["et-theme"]);
    assert.equal(await page.evaluate(() => document.cookie), "");
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "light", "first click on the default dark theme switches to light");
    await page.goto(base + "/");
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "light", "the saved choice is applied on the next page");
    await page.click("#themeToggle");
    assert.equal(await page.evaluate(() => localStorage.getItem("et-theme")), "dark");
  });
});

test("dark is the default for everyone: a light system setting does not change it, and the toggle starts as dark", { skip }, async () => {
  await withBrowser(async (browser, base) => {
    for (const colorScheme of ["light", "dark", "no-preference"]) {
      const ctx = await browser.newContext({ colorScheme });
      const page = await ctx.newPage();
      for (const u of ["/", "/gst-calculator", "/no-such-page"]) {
        await page.goto(base + u);
        assert.notEqual(await page.evaluate(() => document.documentElement.dataset.theme), "light", `${colorScheme} ${u}`);
        assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), "rgb(14, 23, 53)", `${colorScheme} ${u}: page background is #0E1735`);
        assert.equal(await page.getAttribute("#themeToggle", "aria-pressed"), "true");
      }
      await ctx.close();
    }
  });
});

test("hidden elements stay hidden (the consent link waits for a CMP)", { skip }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/");
    assert.equal(await page.isVisible("#privacy-settings-link"), false);
  });
});
