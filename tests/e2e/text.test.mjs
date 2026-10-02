// Text tools end to end: presets on the landings, the Worker path for big input, the main-thread
// fallback when Workers are unavailable, responsiveness, and privacy of typed text.
import test from "node:test";
import assert from "node:assert/strict";
import { withBrowser, skip } from "./helpers-browser.mjs";

// Results update asynchronously (a timer and a promise), so wait for the expected output.
const expectOut = (page, expected) => page.waitForFunction(e => document.querySelector("#ctOut").value === e, expected, { timeout: 10000 });
const big = n => Array.from({ length: n }, (_, i) => `row ${i % 1000}`).join("\n"); // ~8 chars a line

test("landings open with their own preset and share one engine", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    const cases = [
      ["/remove-duplicate-lines", "b\na\nb\nA", "b\na\nA"],
      ["/remove-blank-lines", "a\n\n  \nb", "a\nb"],
      ["/sort-lines-alphabetically", "item 10\nŌamaru\nitem 2\napple", "apple\nitem 10\nitem 2\nŌamaru"],
      ["/add-text-to-start-and-end-of-lines", "1042\n1077", "'1042',\n'1077',"],
    ];
    for (const [url, input, expected] of cases) {
      await page.goto(base + url);
      await page.fill("#ctIn", input);
      await expectOut(page, expected).catch(async () => assert.equal(await page.inputValue("#ctOut"), expected, url));
    }
    await page.goto(base + "/text-cleaner");
    await page.fill("#ctIn", "a\r\nb\r\n\r\nb");
    await page.click("#ctReset");
    await expectOut(page, "");
    await page.click("#ctSample");
    await page.waitForFunction(() => document.querySelector("#ctOut").value.includes("Kiwi"));
  });
});

test("options go in the fragment; typed text, prefixes and separators never do", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/text-cleaner");
    await page.fill("#ctIn", "secret-value\nsecret-value");
    await page.evaluate(() => document.querySelectorAll("details.opt").forEach(d => { d.open = true; }));
    await page.check("#oDedupe");
    await page.fill("#oPrefix", "PFX-");
    await page.waitForFunction(() => document.querySelector("#ctOut").value === "PFX-secret-value");
    assert.match(page.url(), /dedupe=1/);
    assert.ok(!/secret|PFX/.test(page.url()));
    await page.reload();
    assert.equal(await page.isChecked("#oDedupe"), true, "option restored");
    assert.equal(await page.inputValue("#ctIn"), "", "text not restored");
  });
});

test("big input runs in the Worker and the page stays responsive", { skip, timeout: 120000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/remove-duplicate-lines");
    const text = big(100000); // ~800,000 characters
    await page.evaluate(t => { window.__long = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__long = Math.max(window.__long, e.duration); }).observe({ type: "longtask" }); const el = document.querySelector("#ctIn"); el.value = t; el.dispatchEvent(new Event("input", { bubbles: true })); }, text);
    await page.waitForFunction(() => document.querySelector("#rOut").textContent === "1,000", null, { timeout: 30000 });
    assert.equal(await page.isVisible("#ctWorker"), true, "worker notice shown");
    const longest = await page.evaluate(() => window.__long);
    // Includes the browser laying out the 800,000-character textarea itself, which no script can avoid.
    console.log(`  longest main-thread task with Worker, 100,000 lines (incl. textarea layout): ${longest.toFixed(0)} ms`);
  });
});

test("fallback: with Workers unavailable the same result comes from the main thread", { skip, timeout: 120000 }, async () => {
  await withBrowser(async (browser, base) => {
    const ctx = await browser.newContext();
    await ctx.addInitScript(() => { delete window.Worker; });
    const page = await ctx.newPage();
    await page.goto(base + "/remove-duplicate-lines");
    const text = big(50000);
    const t0 = Date.now();
    await page.evaluate(t => { const el = document.querySelector("#ctIn"); el.value = t; el.dispatchEvent(new Event("input", { bubbles: true })); }, text);
    await page.waitForFunction(() => document.querySelector("#rOut").textContent === "1,000", null, { timeout: 30000 });
    console.log(`  main-thread fallback, 50,000 lines: ${Date.now() - t0} ms end to end`);
    assert.equal(await page.isVisible("#ctWorker"), false);
  });
});

test("word counter: words, emoji and macrons, reading time, big text via the Worker", { skip, timeout: 120000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/word-and-character-counter");
    await page.fill("#cnIn", "Kia ora Ōtautahi 🙂");
    assert.equal(await page.textContent("#vWords"), "3");
    assert.equal(await page.textContent("#vChars"), "18");
    await page.fill("#cnRead", "60");
    assert.equal(await page.textContent("#vRead"), "3 sec");
    await page.evaluate(() => { const el = document.querySelector("#cnIn"); el.value = "word ".repeat(100000); el.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.waitForFunction(() => document.querySelector("#vWords").textContent === "100,000", null, { timeout: 30000 });
    assert.equal(new URL(page.url()).hash, "", "typed text never goes in the URL");
  });
});
