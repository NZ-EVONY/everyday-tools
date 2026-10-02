// The take-home pay library against Inland Revenue's own figures: IR340/IR341 April 2026 table
// rows (main and secondary codes) and the formulas in IRD's payroll specification for 2026-27.
import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers.mjs";
import { payeMain, payeSecondary, studentLoan, kiwisaverEmployee, employerContribution, annualTax, ietc, takeHome, esctRate } from "../../src/assets/lib/paye.js";

const tax = readJson("data/nz/tax-2026-27.json");
const fx = readJson("tests/fixtures/official-examples.json");
const c = d => Math.round(d * 100);

test("main codes M and ME, student loan, KiwiSaver and net employer contribution match every IR340/IR341 sample row", () => {
  for (const r of fx.payeTableRows) {
    const g = c(r.gross);
    assert.equal(payeMain(g, r.period, tax), c(r.paye_M), `${r.source}: M`);
    assert.equal(payeMain(g, r.period, tax, { me: true }), c(r.paye_ME), `${r.source}: ME`);
    assert.equal(studentLoan(g, r.period, tax), c(r.studentLoan), `${r.source}: SL`);
    for (const rate of tax.kiwisaver.employeeRates) assert.equal(kiwisaverEmployee(g, rate), c(r.ks[String(+(rate * 100).toFixed(1))]), `${r.source}: KS ${rate}`);
    assert.equal(employerContribution(g, tax.kiwisaver.employerMinimumRate, tax.esct.bands[0].rate).net, c(r.cec), `${r.source}: net CEC`);
  }
});

test("secondary codes SB, S, SH, ST, SA and secondary student loan match IRD's secondary tables", () => {
  for (const r of fx.secondaryRows) {
    for (const code of ["SB", "S", "SH", "ST", "SA"]) assert.equal(payeSecondary(c(r.gross), code, tax), c(r[code]), `${r.source}: ${code}`);
    assert.equal(studentLoan(c(r.gross), r.period, tax, { secondary: true }), c(r.studentLoan), `${r.source}: SL`);
  }
});

test("annual tax equals the specification's 'rate minus constant' formulas at and around every bracket boundary", () => {
  // IRD payroll specification 2026-27, section 5.2 step 3 (hand-copied constants).
  const spec = x => x <= 15600 ? x * 0.105 : x <= 53500 ? x * 0.175 - 1092 : x <= 78100 ? x * 0.30 - 7779.5 : x <= 180000 ? x * 0.33 - 10122.5 : x * 0.39 - 20922.5;
  for (const x of [1, 15600, 15601, 30000, 53500, 53501, 78100, 78101, 120000, 180000, 180001, 250000]) {
    assert.ok(Math.abs(annualTax(x, tax.incomeTax.brackets) - spec(x)) < 1e-6, `income ${x}`);
  }
});

test("ACC stops at the maximum liable earnings", () => {
  const r1 = takeHome(c(160000 / 52), { period: "weekly" }, tax);
  const r2 = takeHome(c(200000 / 52), { period: "weekly" }, tax);
  assert.equal(r1.acc, r2.acc);
  assert.ok(Math.abs(r1.acc * 52 / 100 - tax.acc.maxLevy) < 1);
});

test("independent earner tax credit follows the specification's steps", () => {
  assert.equal(ietc(23999, tax.ietc), 0);
  assert.equal(ietc(24000, tax.ietc), 520);
  assert.equal(ietc(66000, tax.ietc), 520);
  assert.ok(Math.abs(ietc(68000, tax.ietc) - (520 - 2000 * 0.13)) < 1e-9);
  assert.equal(ietc(70000, tax.ietc), 0);
});

test("student loan: nothing at or below the threshold, 12 cents a dollar above it", () => {
  assert.equal(studentLoan(46400, "weekly", tax), 0);
  assert.equal(studentLoan(46499, "weekly", tax), 0); // cents are dropped first
  assert.equal(studentLoan(46500, "weekly", tax), 12);
  assert.equal(studentLoan(60000, "weekly", tax), 1632); // IRD's own example
});

test("ESCT bands and employer contribution", () => {
  assert.equal(esctRate(18720, tax.esct), 0.105);
  assert.equal(esctRate(18721, tax.esct), 0.175);
  assert.equal(esctRate(300000, tax.esct), 0.39);
  assert.deepEqual(employerContribution(46500, 0.035, 0.105), { gross: 1627, esct: 168, net: 1459 });
});

test("take-home pay adds up: gross = PAYE + student loan + KiwiSaver + net, and annual = per period x periods", () => {
  for (const period of ["weekly", "fortnightly", "fourWeekly", "monthly"]) for (const code of ["M", "ME", "S", "SA"]) {
    const r = takeHome(250000, { period, code, studentLoan: true, kiwisaverRate: 0.035 }, tax);
    assert.equal(r.paye + r.studentLoan + r.kiwisaver + r.net, r.gross);
    assert.equal(r.annual.net, r.net * r.periods);
    assert.equal(r.incomeTax + r.acc, r.paye);
  }
  assert.equal(takeHome(0, { period: "weekly" }, tax).net, 0);
});
