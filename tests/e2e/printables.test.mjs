// Printables: render real PDFs with Chromium's print engine (preferCSSPageSize) and check the
// page size and page count. Other browsers' printing is NOT VERIFIED (see docs/UNVERIFIED.md).
import test from "node:test";
import assert from "node:assert/strict";
import { withBrowser, skip } from "./helpers-browser.mjs";

const A4 = [595, 842], LETTER = [612, 792]; // PDF points
function pdfInfo(buf) {
  const s = buf.toString("latin1");
  const boxes = [...s.matchAll(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g)].map(m => [Math.round(+m[1]), Math.round(+m[2])]);
  const pages = (s.match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
  return { pages, box: boxes[0] };
}
const near = (a, b) => Math.abs(a[0] - b[0]) <= 2 && Math.abs(a[1] - b[1]) <= 2;

async function pdfOf(page, setup) {
  await setup();
  await page.waitForTimeout(100);
  return pdfInfo(await page.pdf({ preferCSSPageSize: true, printBackground: true }));
}
const pick = (page, name, value) => page.click(`label:has(> input[name="${name}"][value="${value}"])`);

test("printable calendar: one month A4 portrait, landscape, US Letter, 12 pages, year on one page", { skip, timeout: 120000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/printable-calendar");
    await page.fill("#calYear", "2026");
    await page.selectOption("#calMonth", "4");
    let r = await pdfOf(page, async () => {});
    assert.equal(r.pages, 1, "one month = one page"); assert.ok(near(r.box, A4), `A4 portrait ${r.box}`);
    r = await pdfOf(page, () => pick(page, "orient", "landscape"));
    assert.equal(r.pages, 1); assert.ok(near(r.box, [A4[1], A4[0]]), `A4 landscape ${r.box}`);
    r = await pdfOf(page, async () => { await pick(page, "orient", "portrait"); await pick(page, "paper", "letter"); });
    assert.equal(r.pages, 1); assert.ok(near(r.box, LETTER), `Letter ${r.box}`);
    r = await pdfOf(page, async () => { await pick(page, "paper", "a4"); await pick(page, "view", "months"); });
    assert.equal(r.pages, 12, "12-page option");
    r = await pdfOf(page, () => pick(page, "view", "year"));
    assert.equal(r.pages, 1, "year on one page");
    // A six-week month (August 2026, weeks from Monday) with note lines, in landscape.
    r = await pdfOf(page, async () => { await pick(page, "view", "month"); await page.selectOption("#calMonth", "8"); await page.check("#calNotes"); await pick(page, "orient", "landscape"); });
    assert.equal(await page.locator("#printArea tbody tr").count(), 6);
    assert.equal(r.pages, 1, "six-week month with notes, landscape");
    await pick(page, "orient", "portrait"); await page.uncheck("#calNotes"); await page.selectOption("#calMonth", "4");
    // Holidays: April 2026 shows Anzac Day and its Monday day off.
    await pick(page, "view", "month");
    const text = await page.innerText("#printArea");
    assert.match(text, /Anzac Day/);
    assert.match(text, /Anzac Day \(Mon–Fri day off\)/);
    await page.fill("#calYear", "2031");
    assert.equal(await page.isVisible("#calNoData"), true, "honest note for years without data");
    assert.doesNotMatch(await page.innerText("#printArea"), /Anzac/);
  });
});

test("weekly planner and timetable print on one page", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/weekly-planner-and-timetable");
    await page.fill("#plDate", "2026-10-02");
    assert.match(await page.innerText("#printArea"), /Week of Monday 28 September 2026/);
    let r = await pdfOf(page, async () => {});
    assert.equal(r.pages, 1); assert.ok(near(r.box, A4));
    r = await pdfOf(page, async () => { await pick(page, "mode", "timetable"); await page.selectOption("#plStep", "15"); });
    assert.equal(r.pages, 1, "36-row timetable still fits");
    assert.equal(await page.locator("#printArea tbody tr").count(), 36);
    r = await pdfOf(page, async () => { await pick(page, "paper", "letter"); await pick(page, "orient", "landscape"); });
    assert.equal(r.pages, 1); assert.ok(near(r.box, [LETTER[1], LETTER[0]]), `Letter landscape ${r.box}`);
    // Worst case: 6am to 10pm every 15 minutes (capped at 48 rows) on every paper and orientation.
    await page.selectOption("#plStart", "6"); await page.selectOption("#plEnd", "22");
    for (const paper of ["a4", "letter"]) for (const orient of ["portrait", "landscape"]) {
      r = await pdfOf(page, async () => { await pick(page, "paper", paper); await pick(page, "orient", orient); });
      assert.equal(r.pages, 1, `48 rows, ${paper} ${orient}`);
    }
  });
});

test("checklist: pasted bullets are cleaned, nothing typed goes in the URL, prints on A4", { skip, timeout: 60000 }, async () => {
  await withBrowser(async (browser, base) => {
    const page = await browser.newPage();
    await page.goto(base + "/printable-checklist");
    await page.fill("#ckTitle", "Camping");
    await page.fill("#ckItems", "- Tent\n• Torch\n[ ] First aid kit\n\n  Rope  ");
    const items = await page.$$eval("#printArea .chk li", lis => lis.map(l => l.textContent.trim()).filter(Boolean));
    assert.deepEqual(items, ["Tent", "Torch", "First aid kit", "Rope"]);
    assert.ok(!page.url().includes("Tent") && !page.url().includes("Camping"));
    const r = await pdfOf(page, async () => {});
    assert.equal(r.pages, 1); assert.ok(near(r.box, A4));
  });
});
