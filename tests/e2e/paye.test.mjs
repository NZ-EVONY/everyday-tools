// Take-home pay calculator end to end, checked against an IR340 table row.
import test from "node:test";
import assert from "node:assert/strict";
import { withBrowser, skip } from "./helpers-browser.mjs";

test("take-home pay: weekly $1,000 matches IR340 (M, student loan, KiwiSaver 3.5%)", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/nz-paye-calculator");
    await page.selectOption("#per", "week");
    await page.click('label:has(> input[name="period"][value="weekly"])');
    await page.fill("#payAmount", "1000");
    await page.check("#sl");
    assert.equal(await page.textContent("#rGross"), "$1,000.00");
    assert.equal(await page.textContent("#rPaye"), "$171.50");     // IR340 weekly $1,000, code M
    assert.equal(await page.textContent("#rSl"), "$64.32");        // IR340 SL column
    assert.equal(await page.textContent("#rKs"), "$35.00");        // 3.5% column
    assert.equal(await page.textContent("#rNet"), "$729.18");
    assert.equal(await page.textContent("#aNet"), "$37,917.36");
    assert.ok(!page.url().includes("1000"), "the pay amount never goes in the URL");
    assert.match(page.url(), /period=weekly/);
    await page.selectOption("#code", "ME");
    assert.equal(await page.textContent("#rPaye"), "$161.50");     // IR340 ME column
    assert.equal(await page.isVisible("#meNote"), true);
    await page.selectOption("#code", "S");
    assert.equal(await page.textContent("#rPaye"), "$192.50");
    await page.reload();
    assert.equal(await page.inputValue("#code"), "S", "settings restored from the fragment");
    assert.equal(await page.inputValue("#payAmount"), "");
  });
});

test("take-home pay: invalid input is flagged and doesn't produce a result", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/nz-paye-calculator");
    await page.fill("#payAmount", "lots");
    assert.equal(await page.getAttribute("#payAmount", "aria-invalid"), "");
    assert.match(await page.textContent("#payHint"), /Enter your pay/);
    assert.equal(await page.textContent("#rNet"), "$0.00");
  });
});
