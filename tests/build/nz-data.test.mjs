// Every NZ money page shows the tax year (or check date), source link and disclaimer, read from data.
import test from "node:test";
import assert from "node:assert/strict";
import { pages, html, readJson } from "../helpers.mjs";

const cfg = readJson("config/data.json");
const tax = readJson(`data/nz/tax-${cfg.currentTaxYear}.json`);
const gst = readJson("data/nz/gst.json");
const sources = Object.fromEntries(readJson("data/sources.json").sources.map(s => [s.id, s]));
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const long = iso => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const DISCLAIMER = "This is an estimate for general information, not financial or tax advice; check with Inland Revenue or a qualified adviser.";

test("each NZ calculator shows the source notice above the explainer", () => {
  const money = pages().filter(p => p.nzMoney);
  assert.ok(money.length >= 1);
  for (const p of money) {
    const h = html(p);
    const notice = h.indexOf('<aside class="notice"'), prose = h.indexOf('<article class="prose">');
    assert.ok(notice > 0 && notice < prose, `${p.path}: notice must come before the explainer`);
    const block = h.slice(notice, h.indexOf("</aside>", notice));
    assert.ok(block.includes(DISCLAIMER), `${p.path} disclaimer`);
    const usesTaxYear = block.includes("tax year");
    if (usesTaxYear) assert.ok(block.includes(`Rates for the ${tax.taxYear} tax year (${long(tax.periodStart)} to ${long(tax.periodEnd)}), checked on ${long(tax.checkedOn)}.`), p.path);
    else assert.ok(block.includes(`checked on ${long(gst.checkedOn)}`), p.path);
    assert.ok(/<a href="https:\/\/www\.ird\.govt\.nz\//.test(block), `${p.path} source link`);
  }
});

test("the GST page's figures come from data/nz/gst.json", () => {
  const p = pages().find(p => p.path === "/gst-calculator");
  const h = html(p);
  const rate = `${+(gst.rate.value * 100).toFixed(2)}%`;
  assert.ok(p.title.includes(rate));
  assert.ok(h.includes(`data-rate-bp="${Math.round(gst.rate.value * 10000)}"`));
  assert.ok(h.includes(`$${gst.registrationThreshold.value.toLocaleString("en-NZ")}`));
  assert.ok(h.includes(`${gst.inclusiveFraction.numerator}/${gst.inclusiveFraction.denominator}`));
  assert.ok(h.includes(sources[gst.rate.sourceId].url));
});
