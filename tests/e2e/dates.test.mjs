// Date and time tools end to end.
import test from "node:test";
import assert from "node:assert/strict";
import { withBrowser, skip } from "./helpers-browser.mjs";

test("days between, age, add/subtract, working days", { skip, timeout: 90000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/days-between-dates");
    await page.fill("#dFrom", "2026-10-02"); await page.fill("#dTo", "2026-12-25");
    assert.equal(await page.textContent("#vDays"), "84");
    await page.check("#dIncl");
    assert.equal(await page.textContent("#vDays"), "85");
    assert.equal(new URL(page.url()).hash, "#inclusive");

    await page.goto(base + "/age-calculator");
    await page.fill("#aBirth", "2000-02-29"); await page.fill("#aOn", "2026-02-28");
    assert.equal(await page.isVisible("#leapRow"), true);
    assert.equal(await page.textContent("#vAge"), "26 years");
    await page.click('label:has(> input[name="leap"][value="mar1"])');
    assert.equal(await page.textContent("#vAge"), "25 years");

    await page.goto(base + "/add-subtract-days");
    await page.fill("#adStart", "2026-01-31"); await page.fill("#adN", "1"); await page.selectOption("#adUnit", "months");
    assert.equal(await page.textContent("#vResult"), "Saturday 28 February 2026");
    assert.equal(await page.isVisible("#adClamp"), true);

    await page.goto(base + "/working-days-calculator");
    await page.fill("#wFrom", "2026-03-30"); await page.fill("#wTo", "2026-04-10");
    assert.equal(await page.textContent("#vWork"), "8");
    assert.match(await page.innerText("#wList"), /Good Friday[\s\S]*Easter Monday/);
    await page.fill("#wFrom", "2026-01-19"); await page.fill("#wTo", "2026-01-30");
    await page.selectOption("#wRegion", "wellington");
    assert.equal(await page.textContent("#vWork"), "9");
    assert.equal(new URL(page.url()).hash, "#wellington");
    await page.fill("#wTo", "2028-01-31");
    assert.equal(await page.isVisible("#wMissing"), true);
    assert.equal(await page.textContent("#vWork"), "–", "no guess without data unless accepted");
  });
});

test("time zones across NZ daylight saving, and countdown link has no typed label", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/time-zone-converter");
    await page.fill("#tzDate", "2026-11-15"); await page.fill("#tzTime", "09:00");
    await page.fill("#tzTo", "Europe/London");
    assert.match(await page.textContent("#vFromK"), /UTC\+13/);
    assert.match(await page.textContent("#vTo"), /8:00\s?pm/i);
    await page.fill("#tzDate", "2026-09-27"); await page.fill("#tzTime", "02:30");
    assert.equal(await page.isVisible("#tzNote"), true, "gap explained");

    await page.goto(base + "/countdown-timer");
    await page.fill("#cdDate", "2030-01-01"); await page.fill("#cdLabel", "My secret party");
    assert.match(page.url(), /d=2030-01-01/);
    assert.ok(!page.url().includes("secret"), "typed label never goes in the URL");
    assert.notEqual(await page.textContent("#c-days"), "0");
  });
});
