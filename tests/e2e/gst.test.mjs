// GST calculator end to end: both directions, line items, rounding note, keyboard, privacy of input.
import test from "node:test";
import assert from "node:assert/strict";
import { withBrowser, skip } from "./helpers-browser.mjs";

const amt = (page, i) => page.locator("#gstLines .amt").nth(i);

test("GST calculator: add, remove, validation, line items and fragment", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/gst-calculator");
    await amt(page, 0).fill("100");
    assert.equal(await page.innerText("#vGst"), "$15.00");
    assert.equal(await page.innerText("#vIncl"), "$115.00");
    await page.check('input[value="remove"]', { force: true });
    assert.equal(await page.innerText("#vGst"), "$13.04");
    assert.equal(await page.innerText("#vExcl"), "$86.96");
    assert.equal(await page.textContent("#amtHead"), "Amount, incl. GST");
    assert.equal(new URL(page.url()).hash, "#remove");
    await amt(page, 0).fill("12abc");
    assert.equal(await amt(page, 0).getAttribute("aria-invalid"), "true");
    assert.match(await page.innerText("#gstHint"), /Enter amounts/);
    assert.ok(!page.url().includes("12abc"), "typed text never goes in the URL");

    await amt(page, 0).fill("19.99");
    await page.click("#gstAddLine");
    await amt(page, 1).fill("19.99");
    await page.click("#gstAddLine");
    await amt(page, 2).fill("19.99");
    assert.equal(await page.innerText("#vGst"), "$7.82");
    assert.equal(await page.innerText("#vIncl"), "$59.97");
    assert.equal(await page.isVisible("#gstBreakdown"), true);
    assert.match(await page.innerText("#gstRounding"), /Rounding each line separately gives \$7\.83/);
    await page.click('#gstLines .line:nth-child(2) .rm');
    assert.equal(await page.locator("#gstLines .line").count(), 2);
    assert.equal(await page.getAttribute("#gstLines .line:nth-child(2) .amt", "aria-label"), "Amount, line 2");

    await page.reload();
    assert.equal(await page.isChecked('input[value="remove"]'), true, "mode restored from fragment");
    assert.equal(await amt(page, 0).inputValue(), "", "amounts are not restored");
  });
});

test("GST calculator works with the keyboard only", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/gst-calculator");
    await page.focus('input[value="add"]');
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.isChecked('input[value="remove"]'), true);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    assert.ok(await page.evaluate(() => document.activeElement.classList.contains("amt")));
    await page.keyboard.type("230");
    assert.equal(await page.innerText("#vExcl"), "$200.00");
    assert.match(await page.innerText("#sr"), /GST \$30\.00/);
  });
});

test("home search filters the tool cards without any network request", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/");
    const before = [];
    page.on("request", r => before.push(r.url()));
    await page.fill("#q", "gst");
    assert.equal(await page.isVisible('a[href="/gst-calculator"]'), true);
    assert.equal(await page.locator("[data-kw]:not([hidden])").count(), 1);
    await page.fill("#q", "zzzz");
    assert.equal(await page.getAttribute("#empty", "data-show"), "true");
    await page.click("#clear");
    assert.ok((await page.locator("[data-kw]:not([hidden])").count()) >= 20);
    assert.deepEqual(before.filter(u => !u.endsWith("/favicon.svg")), [], "searching must not load anything");
  });
});
