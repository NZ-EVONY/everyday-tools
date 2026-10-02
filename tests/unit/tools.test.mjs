// Splitter, unit converter and KiwiSaver logic.
import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers.mjs";
import { allocate, splitFlat } from "../../src/assets/lib/split.js";
import { convert, formatNumber } from "../../src/assets/lib/units.js";
import { yearlyContributions, project } from "../../src/assets/lib/kiwisaver.js";

const units = readJson("data/units.json");
const cat = k => units.categories.find(c => c.key === k);
const tax = readJson("data/nz/tax-2026-27.json");

test("allocate always adds up to the cent for awkward amounts and 2-7 people", () => {
  for (const total of [1, 99, 100, 1001, 33333, 100000, 123457, 999999]) for (let n = 2; n <= 7; n++) {
    const shares = allocate(total, Array.from({ length: n }, (_, i) => 1 + (i % 3)));
    assert.equal(shares.reduce((a, b) => a + b, 0), total, `${total} / ${n}`);
    assert.ok(shares.every(s => s >= 0));
  }
  assert.deepEqual(allocate(100000, [1, 1, 1]), [33334, 33333, 33333]);
  assert.deepEqual(allocate(500, [0, 0]), [250, 250], "all-zero weights fall back to equal");
});

test("splitFlat: methods, bills equal option, and days present", () => {
  const people = [{ name: "A", room: 12, income: 60000, days: 28 }, { name: "B", room: 9, income: 40000, days: 28 }, { name: "C", room: 9, income: 50000, days: 14 }];
  for (const method of ["equal", "room", "income", "days"]) {
    const r = splitFlat({ rentCents: 210000, billCents: 31999, people, method });
    assert.equal(r.reduce((a, p) => a + p.total, 0), 241999, method);
  }
  const room = splitFlat({ rentCents: 300000, people, method: "room" });
  assert.deepEqual(room.map(p => p.rent), [120000, 90000, 90000]);
  const days = splitFlat({ rentCents: 140000, billCents: 0, people, method: "days" });
  assert.deepEqual(days.map(p => p.rent), [56000, 56000, 28000]);
  const be = splitFlat({ rentCents: 0, billCents: 30000, people, method: "income", billsEqual: true });
  assert.deepEqual(be.map(p => p.bills), [10000, 10000, 10000]);
});

test("unit factors: known exact conversions and round trips", () => {
  const close = (a, b, msg) => assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)), `${msg}: ${a} vs ${b}`);
  close(convert(1, "in", "cm", cat("length")), 2.54, "inch");
  close(convert(1, "mi", "km", cat("length")), 1.609344, "mile");
  close(convert(1, "acre", "m2", cat("area")), 4046.8564224, "acre");
  close(convert(1, "acre", "sqyd", cat("area")), 4840, "acre in square yards");
  close(convert(1, "sqmi", "acre", cat("area")), 640, "square mile in acres");
  close(convert(1, "st", "lb", cat("mass")), 14, "stone");
  close(convert(1, "lb", "oz", cat("mass")), 16, "pound");
  close(convert(1, "gal_uk", "l", cat("volume")), 4.54609, "UK gallon");
  close(convert(100, "c", "f", cat("temperature")), 212, "boiling");
  close(convert(-40, "f", "c", cat("temperature")), -40, "-40");
  close(convert(0, "c", "k", cat("temperature")), 273.15, "kelvin");
  close(convert(100, "kmh", "ms", cat("speed")), 27.777777777777778, "km/h");
  close(convert(10, "l100", "kml", cat("fuel")), 10, "10 L/100km = 10 km/L");
  close(convert(convert(30, "mpg_us", "l100", cat("fuel")), "l100", "mpg_us", cat("fuel")), 30, "mpg round trip");
  assert.ok(convert(30, "mpg_uk", "l100", cat("fuel")) > convert(30, "mpg_us", "l100", cat("fuel")), "a UK gallon is bigger, so 30 miles per UK gallon means more litres per 100 km");
  for (const c of units.categories.filter(c => !c.formula)) for (const a of c.units) for (const b of c.units) close(convert(convert(7.25, a.key, b.key, c), b.key, a.key, c), 7.25, `${c.key} ${a.key}<->${b.key}`);
  assert.ok(Number.isNaN(convert(0, "l100", "kml", cat("fuel"))));
});

test("formatNumber", () => {
  assert.equal(formatNumber(2.54), "2.54");
  assert.equal(formatNumber(1609.344), "1,609.34");
  assert.equal(formatNumber(0), "0");
  assert.equal(formatNumber(NaN), "–");
});

test("KiwiSaver: government contribution rule from data, ESCT on employer contributions", () => {
  const y = yearlyContributions(6000000, { employeeRate: 0.035, eligibleForGovernment: true }, tax);
  assert.equal(y.employee, 210000);
  assert.equal(y.employerGross, 210000);
  assert.equal(y.esctRate, 0.175);
  assert.equal(y.government, 26072, "capped at the maximum");
  const small = yearlyContributions(2000000, { employeeRate: 0.035, eligibleForGovernment: true }, tax);
  assert.equal(small.government, Math.floor(70000 * 0.25));
  assert.equal(yearlyContributions(20000000, { employeeRate: 0.035, eligibleForGovernment: true }, tax).government, 0, "over the income limit");
  assert.equal(yearlyContributions(6000000, { employeeRate: 0.035, eligibleForGovernment: false }, tax).government, 0);
  const v = yearlyContributions(1000000, { employeeRate: 0.035, voluntaryCents: 70000, eligibleForGovernment: true }, tax);
  assert.equal(v.government, Math.min(Math.floor((35000 + 70000) * 0.25), 26072));
});

test("projection: zero return just adds contributions; fees reduce growth", () => {
  const flat = project({ startCents: 100000, yearlyCents: 50000, years: 3, returnRate: 0 });
  assert.equal(flat.at(-1).balance, 250000);
  const withFee = project({ startCents: 100000, yearlyCents: 50000, years: 3, returnRate: 0.05, feeRate: 0.01, fixedFeeCents: 3000 });
  const noFee = project({ startCents: 100000, yearlyCents: 50000, years: 3, returnRate: 0.05 });
  assert.ok(withFee.at(-1).balance < noFee.at(-1).balance);
  assert.equal(noFee[0].balance, 100000 + 5000 + 50000);
});
