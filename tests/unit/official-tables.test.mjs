// Checks the 2026-27 data file against rows read from IRD's IR340/IR341 April 2026 tables.
// PAYE itself is tested in Phase 2 with the take-home pay library; here we test the parts
// that depend only on the data file: student loan, KiwiSaver and the ACC-inclusive bottom bracket.
import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers.mjs";

const fx = readJson("tests/fixtures/official-examples.json");
const t = readJson("data/nz/tax-2026-27.json");
const r2 = x => Math.round(x * 100) / 100;

test("student loan deductions match every IR340/IR341 sample row", () => {
  for (const row of fx.payeTableRows) {
    const thr = t.studentLoan.periodThresholds[row.period];
    const expected = row.gross > thr ? r2((row.gross - thr) * t.studentLoan.rate) : 0;
    assert.equal(expected, row.studentLoan, row.source);
  }
});

test("student loan matches IRD's worked examples", () => {
  for (const e of fx.irdExamples.filter(e => e.what.startsWith("student loan"))) {
    const got = e.secondary ? r2(e.gross * t.studentLoan.secondaryRate) : r2((e.gross - t.studentLoan.periodThresholds[e.period]) * t.studentLoan.rate);
    assert.equal(got, e.expected, e.source);
  }
});

// IRD's tables drop fractions of a cent from KiwiSaver deductions ($465 x 3.5% = $16.275 is
// shown as $16.27), so the comparison truncates. Recorded in docs/DECISIONS.md.
test("KiwiSaver employee columns match every rate option (fractions of a cent dropped)", () => {
  for (const row of fx.payeTableRows) for (const rate of t.kiwisaver.employeeRates) {
    const cents = Math.floor(Math.round(row.gross * 100) * Math.round(rate * 10000) / 10000);
    assert.equal(cents / 100, row.ks[String(+(rate * 100).toFixed(1))], `${row.source}, ${+(rate * 100).toFixed(1)}%`);
  }
});

test("bottom-bracket weekly PAYE equals annualised 10.5% tax plus ACC (IR340 $300 row)", () => {
  const row = fx.payeTableRows.find(r => r.period === "weekly" && r.gross === 300);
  const annual = row.gross * 52;
  const tax = annual * t.incomeTax.brackets[0].rate + annual * t.acc.rate;
  assert.equal(r2(tax / 52), row.paye_M, row.source);
});
