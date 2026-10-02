// Fancy text end to end: every row follows the input, copy and its copied state, the length
// filter, favourites that stay local and clear completely, privacy of typed text, 360px layout
// and axe after interaction.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../helpers.mjs";
import { withBrowser, skip } from "./helpers-browser.mjs";
import { STYLES, decorate, lengths, listText } from "../../src/assets/lib/fancy.js";

const AXE = fs.readFileSync(path.join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
const rowsOf = page => page.$$eval(".fx-row", lis => lis.map(li => ({ id: li.dataset.id, text: li.querySelector(".fx-out").textContent, hidden: li.hidden, len: li.querySelector(".fx-len").textContent })));

test("typing updates every row, the counter and the length labels", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/fancy-text-generator");
    const before = await rowsOf(page);
    assert.equal(before.length, STYLES.length);
    assert.equal(before.find(r => r.id === "bold").text, decorate("Night Owl", "bold"), "example shown before typing");
    await page.fill("#fxIn", "Kia ora 42");
    const after = await rowsOf(page);
    for (const s of STYLES) {
      const r = after.find(x => x.id === s.id), want = decorate("Kia ora 42", s.id), l = lengths(want);
      assert.equal(r.text, want, s.id);
      assert.equal(r.len, `${l.codePoints} characters · ${l.utf16} UTF-16 units`, s.id);
    }
    assert.equal(await page.textContent("#fxCount"), "10 / 100");
    await page.selectOption("#fxFrame", "stars");
    assert.equal((await rowsOf(page)).find(r => r.id === "gothic").text, decorate("Kia ora 42", "gothic", "stars"));
    await page.uncheck("#fxGap");
    assert.equal((await rowsOf(page)).find(r => r.id === "gothic").text, decorate("Kia ora 42", "gothic", "stars", { gap: false }));
    await page.fill("#fxIn", "x".repeat(150));
    assert.equal((await page.inputValue("#fxIn")).length, 100, "the box stops at 100");
    await page.click("#fxClear");
    assert.equal((await rowsOf(page)).find(r => r.id === "plain").text, "★Night Owl★");
  });
});

test("copy puts the row on the clipboard and shows a copied state; copy all gives the visible list", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const ctx = await browser.newContext();
    await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base });
    const page = await ctx.newPage();
    await page.goto(base + "/fancy-text-generator");
    await page.fill("#fxIn", "Tama");
    const btn = page.locator('.fx-row[data-id="bold"] [data-copy]');
    await btn.click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), decorate("Tama", "bold"));
    assert.match(await btn.getAttribute("class"), /is-copied/);
    assert.equal((await btn.textContent()).trim(), "Copied");
    assert.equal(await page.textContent("#sr"), "Copied to the clipboard.");
    await page.waitForFunction(() => !document.querySelector('.fx-row[data-id="bold"] [data-copy]').classList.contains("is-copied"), null, { timeout: 5000 });
    await page.selectOption("#fxGroup", "script");
    await page.click("#fxAll");
    const visible = STYLES.filter(s => s.id === "plain" || s.group === "script").map(s => ({ name: s.name, text: decorate("Tama", s.id) }));
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), listText(visible));
  });
});

test("the length filter keeps only styles that fit, by UTF-16 units or by characters", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/fancy-text-generator");
    await page.fill("#fxIn", "Kai Tane");
    await page.fill("#fxLimit", "10");
    const shown = r => r.filter(x => !x.hidden).map(x => x.id);
    const expect = by => STYLES.filter(s => { const l = lengths(decorate("Kai Tane", s.id)); return s.id === "plain" || (by === "utf16" ? l.utf16 : l.codePoints) <= 10; }).map(s => s.id);
    assert.deepEqual(shown(await rowsOf(page)), expect("utf16"));
    assert.ok(!shown(await rowsOf(page)).includes("bold"), "bold is 15 units");
    assert.equal(await page.textContent("#fxShown"), `${expect("utf16").length} shown`);
    await page.selectOption("#fxBy", "codePoints");
    assert.deepEqual(shown(await rowsOf(page)), expect("codePoints"));
    assert.ok(shown(await rowsOf(page)).includes("bold"));
    await page.fill("#fxLimit", "2");
    assert.equal(await page.isVisible("#fxEmpty"), true);
    await page.fill("#fxLimit", "abc");
    assert.equal(await page.getAttribute("#fxLimit", "aria-invalid"), "");
    assert.equal(shown(await rowsOf(page)).length, STYLES.length, "an invalid limit filters nothing");
    // the games landing opens with its own limit already applied
    await page.goto(base + "/name-styler-for-games");
    assert.equal(await page.inputValue("#fxLimit"), "12");
    assert.equal(await page.isHidden('.fx-row[data-id="bold"]'), true);
  });
});

test("favourites store only style ids, survive a reload and clear completely", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/fancy-text-generator");
    await page.fill("#fxIn", "private words");
    await page.click('.fx-row[data-id="bold"] .fx-fav');
    await page.click('.fx-row[data-id="gothic"] .fx-fav');
    const store = await page.evaluate(() => ({ ...localStorage }));
    assert.deepEqual(JSON.parse(store["et-fancy-favourites"]), ["bold", "gothic"]);
    assert.ok(!JSON.stringify(store).includes("private"), "typed text is never stored");
    await page.reload();
    assert.equal(await page.getAttribute('.fx-row[data-id="bold"] .fx-fav', "aria-pressed"), "true");
    assert.equal(await page.inputValue("#fxIn"), "", "typed text is not restored");
    await page.selectOption("#fxGroup", "favourites");
    assert.deepEqual((await rowsOf(page)).filter(r => !r.hidden).map(r => r.id), ["plain", "bold", "gothic"]);
    await page.click('.fx-row[data-id="bold"] .fx-fav');
    assert.deepEqual(JSON.parse(await page.evaluate(() => localStorage.getItem("et-fancy-favourites"))), ["gothic"]);
    await page.click("#fxFavClear");
    const keys = await page.evaluate(() => Object.keys(localStorage));
    assert.ok(!keys.includes("et-fancy-favourites"), "the key is removed, not emptied");
    assert.ok(keys.every(k => k === "et-theme"), `only the theme may remain: ${keys}`);
    assert.equal(await page.isVisible("#fxEmpty"), true, "favourites view explains it is empty");
    assert.equal(await page.evaluate(() => document.cookie), "");
  });
});

test("nothing typed reaches the URL or any network request", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    const seen = [];
    page.on("request", r => seen.push(`${r.url()} ${r.postData() || ""}`));
    for (const u of ["/fancy-text-generator", "/name-styler-for-games", "/fancy-text-for-bios"]) {
      await page.goto(base + u);
      await page.waitForLoadState("networkidle");
      const n = seen.length;
      await page.fill("#fxIn", "Secret Name 77");
      await page.selectOption("#fxFrame", "swords");
      await page.fill("#fxLimit", "30");
      await page.click('.fx-row[data-id="bold"] .fx-fav');
      await page.waitForTimeout(300);
      assert.equal(seen.length, n, `${u}: typing made a request: ${seen.slice(n).join(", ")}`);
      assert.ok(!/secret|Secret|77/.test(page.url()), page.url());
      assert.equal(new URL(page.url()).hash, "");
    }
    assert.ok(!seen.some(s => /secret/i.test(decodeURIComponent(s))));
    assert.ok(seen.every(s => s.startsWith(base)), "only same-origin requests");
  });
});

test("360px: long and wide input never scrolls sideways; axe is clean in both themes after use", { skip, timeout: 120000 }, async () => {
  await withBrowser(async (browser, base) => {
    const problems = [];
    fs.mkdirSync(path.join(ROOT, "reports/screens"), { recursive: true });
    // Dark is the site default; light comes only from the saved toggle value, so set that.
    for (const colorScheme of ["dark", "light"]) {
      const ctx = await browser.newContext({ viewport: { width: 360, height: 800 }, bypassCSP: true });
      await ctx.addInitScript(th => { try { localStorage.setItem("et-theme", th); } catch (e) { /* storage blocked */ } }, colorScheme);
      const page = await ctx.newPage();
      for (const u of ["/fancy-text-generator", "/name-styler-for-games", "/fancy-text-for-bios"]) {
        await page.goto(base + u);
        await page.fill("#fxLimit", "");
        await page.fill("#fxIn", "W".repeat(60) + " " + "m".repeat(39));
        await page.selectOption("#fxFrame", "box-ends");
        await page.click('.fx-row[data-id="wide"] .fx-fav');
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), colorScheme);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (over > 0) problems.push(`${colorScheme} ${u}: horizontal overflow ${over}px`);
        await page.addScriptTag({ content: AXE });
        const v = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations.map(v => ({ id: v.id, impact: v.impact, sample: v.nodes[0]?.html.slice(0, 120) })));
        for (const x of v) problems.push(`${colorScheme} ${u}: ${x.impact} ${x.id} ${x.sample}`);
        await page.screenshot({ path: path.join(ROOT, `reports/screens/fancy-${u.slice(1)}-360-${colorScheme}-used.png`), fullPage: true });
      }
      await ctx.close();
    }
    assert.deepEqual(problems, []);
  });
});
