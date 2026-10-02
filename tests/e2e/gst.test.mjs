// GST calculator end to end: both directions, line items, keyboard use, privacy of input.
import test from "node:test";
import assert from "node:assert/strict";
import { withBrowser, skip } from "./helpers-browser.mjs";

test("GST calculator: add, remove, validation, line items and fragment", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/gst-calculator");
    await page.fill("#gstAmount", "100");
    assert.match(await page.innerText("#gstResult"), /\$115\.00 including GST/);
    assert.match(await page.innerText("#gstResult"), /GST at 15%\s+\$15\.00/);
    await page.check('input[value="remove"]');
    await page.fill("#gstAmount", "100");
    assert.match(await page.innerText("#gstResult"), /\$86\.96 excluding GST/);
    assert.match(await page.innerText("#gstResult"), /\$13\.04/);
    assert.equal(new URL(page.url()).hash, "#remove");
    await page.fill("#gstAmount", "12abc");
    assert.equal(await page.getAttribute("#gstAmount", "aria-invalid"), "true");
    assert.match(await page.innerText("#gstAmountError"), /Enter an amount/);
    assert.ok(!page.url().includes("12abc"), "typed text never goes in the URL");

    await page.click(".advanced summary");
    const amts = page.locator("#gstLines .line input[inputmode=decimal]");
    await amts.nth(0).fill("19.99");
    await amts.nth(1).fill("19.99");
    await page.click("#gstAddLine");
    await amts.nth(2).fill("19.99");
    const lines = await page.innerText("#gstLinesResult");
    assert.match(lines, /Total\s+\$52\.14\s+\$7\.83\s+\$59\.97/);
    assert.match(lines, /working it out once on the total gives \$7\.82/);

    await page.reload();
    assert.equal(await page.isChecked('input[value="remove"]'), true, "mode restored from fragment");
    assert.equal(await page.inputValue("#gstAmount"), "", "amounts are not restored");
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
    assert.equal(await page.evaluate(() => document.activeElement.id), "gstAmount");
    await page.keyboard.type("230");
    assert.match(await page.innerText("#gstResult"), /\$200\.00 excluding GST/);
  });
});
