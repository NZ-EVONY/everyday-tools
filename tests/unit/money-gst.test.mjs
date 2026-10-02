import test from "node:test";
import assert from "node:assert/strict";
import { parseMoney, formatMoney, divRound, toBasisPoints } from "../../src/assets/lib/money.js";
import { addGst, removeGst, gstLines } from "../../src/assets/lib/gst.js";
import { readJson } from "../helpers.mjs";

const gstData = readJson("data/nz/gst.json");
const BP = toBasisPoints(gstData.rate.value);
const fx = readJson("tests/fixtures/official-examples.json");

test("parseMoney accepts common formats and rejects junk", () => {
  assert.equal(parseMoney("100"), 10000);
  assert.equal(parseMoney("$1,234.56"), 123456);
  assert.equal(parseMoney(" 49.9 "), 4990);
  assert.equal(parseMoney("0.005"), 1);
  assert.equal(parseMoney("0.004"), 0);
  for (const bad of ["", "abc", "1.2.3", "12e3", "$", "1,23a"]) assert.equal(parseMoney(bad), null, bad);
});

test("formatMoney and divRound", () => {
  assert.equal(formatMoney(123456), "$1,234.56");
  assert.equal(formatMoney(5), "$0.05");
  assert.equal(formatMoney(-150), "-$1.50");
  assert.equal(divRound(5, 2), 3);
  assert.equal(divRound(-5, 2), -3);
  assert.equal(divRound(7, 3), 2);
});

test("GST matches Inland Revenue's own examples", () => {
  for (const e of fx.irdExamples.filter(e => "inclusiveCents" in e)) assert.equal(removeGst(e.inclusiveCents, BP).gst, e.expectedGstCents, e.source);
  for (const e of fx.irdExamples.filter(e => "exclusiveCents" in e)) assert.equal(addGst(e.exclusiveCents, BP).inclusive, e.expectedInclusiveCents, e.source);
});

test("GST hand-computed rounding cases (labelled as not from IRD)", () => {
  for (const e of fx.handComputed) {
    if ("inclusiveCents" in e) assert.equal(removeGst(e.inclusiveCents, BP).gst, e.expectedGstCents, e.source);
    else assert.equal(addGst(e.exclusiveCents, BP).gst, e.expectedGstCents, e.source);
  }
});

test("adding then removing GST round-trips for every amount up to $50", () => {
  for (let c = 0; c <= 5000; c++) {
    const inc = addGst(c, BP).inclusive;
    assert.equal(removeGst(inc, BP).exclusive, c, `cents ${c}`);
  }
});

test("line items: GST once on the total, per-line rounding reported alongside", () => {
  const r = gstLines([1999, 1999, 1999], "remove", BP);
  assert.equal(r.total.exclusive + r.total.gst, r.total.inclusive);
  assert.equal(r.total.gst, 782);
  assert.equal(r.perLine.gst, 783);
  assert.equal(r.roundingDifference, 1);
  const add = gstLines([995, 1495, 2495], "add", BP);
  assert.deepEqual(add.total, addGst(4985, BP));
  assert.equal(add.perLine.gst, 747);
  assert.equal(add.total.gst, 748);
  assert.equal(gstLines([], "add", BP).total.gst, 0);
  assert.equal(gstLines([10000, 15000], "add", BP).total.inclusive, 28750);
});
