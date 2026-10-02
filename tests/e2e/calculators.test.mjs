// KiwiSaver, flatmate splitter and unit converter end to end.
import test from "node:test";
import assert from "node:assert/strict";
import { withBrowser, skip } from "./helpers-browser.mjs";

test("KiwiSaver: contributions, government cap and opt-in projection", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/kiwisaver-calculator");
    await page.fill("#ksSalary", "60000");
    assert.equal(await page.textContent("#vYou"), "$2,100.00");
    assert.equal(await page.textContent("#vGov"), "$260.72");
    assert.equal(await page.isVisible("#ksProjection"), false, "no projection without the visitor's own return");
    await page.fill("#ksYears", "10");
    await page.fill("#ksReturn", "0");
    assert.equal(await page.isVisible("#ksProjection"), true);
    const total = await page.textContent("#vTotal");
    const end = await page.textContent("#vEnd");
    assert.equal(Number(end.replace(/[$,]/g, "")), Number(total.replace(/[$,]/g, "")) * 10, "zero return: balance = 10 years of contributions");
    await page.uncheck("#ksGov");
    assert.equal(await page.textContent("#vGov"), "$0.00");
    await page.fill("#ksReturn", "abc");
    assert.equal(await page.getAttribute("#ksReturn", "aria-invalid"), "");
  });
});

test("flatmate splitter: shares add to the cent, by room and by days", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/flatmate-rent-splitter");
    await page.fill("#rent", "1000");
    assert.equal(await page.textContent("#tTotal"), "$1,000.00");
    const cells = await page.$$eval("#splitTable tbody tr td:last-child", tds => tds.map(t => t.textContent));
    assert.deepEqual(cells, ["$333.34", "$333.33", "$333.33"]);
    await page.check('input[name="method"][value="room"]', { force: true });
    const w = page.locator("#people .pw");
    await w.nth(0).fill("14"); await w.nth(1).fill("10"); await w.nth(2).fill("10");
    const rent = await page.$$eval("#splitTable tbody tr td:nth-child(2)", tds => tds.map(t => t.textContent));
    assert.deepEqual(rent, ["$411.76", "$294.12", "$294.12"]); // exact 411.7647, 294.1176 x2: the spare cent goes to the biggest fraction (Ben)
    assert.equal(await page.textContent("#tRent"), "$1,000.00");
    await page.click("#addPerson");
    assert.equal(await page.locator("#people .line").count(), 4);
    assert.match(page.url(), /#method=room$/);
  });
});

test("unit converter: values, swap and fragment settings", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/unit-converter");
    await page.fill("#uValue", "6");
    assert.equal(await page.textContent("#uResult"), "1.8288");
    await page.selectOption("#uCat", "temperature");
    await page.selectOption("#uFrom", "c"); await page.selectOption("#uTo", "f");
    await page.fill("#uValue", "100");
    assert.equal(await page.textContent("#uResult"), "212");
    await page.click("#uSwap");
    assert.equal(await page.textContent("#uResult"), "37.7778");
    assert.ok(!page.url().includes("100"));
    await page.reload();
    assert.equal(await page.inputValue("#uCat"), "temperature");
    assert.equal(await page.inputValue("#uFrom"), "f");
  });
});
