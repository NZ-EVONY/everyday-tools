import test from "node:test";
import assert from "node:assert/strict";
import { loadData, checkSourceIds, expiryChecks, nzToday } from "../../scripts/lib/data.mjs";
import { ROOT } from "../helpers.mjs";

const real = loadData(ROOT);
const clone = o => JSON.parse(JSON.stringify(o));

test("nzToday uses New Zealand time", () => {
  assert.equal(nzToday(new Date("2026-03-31T11:30:00Z")), "2026-04-01"); // 00:30 NZDT on 1 April
  assert.equal(nzToday(new Date("2026-06-30T11:59:00Z")), "2026-06-30"); // 23:59 NZST
});

test("every sourceId in data/ resolves, and every source is an official govt.nz page", () => {
  assert.deepEqual(checkSourceIds(real), []);
  const bad = clone(real);
  bad.tax.acc.sourceId = "made-up";
  bad.sources.push({ id: "x", url: "https://example.com/rates" });
  const problems = checkSourceIds({ ...bad, taxYears: { [bad.tax.taxYear]: bad.tax } });
  assert.ok(problems.some(p => p.includes("made-up")));
  assert.ok(problems.some(p => p.includes("example.com")));
});

test("expiry: real data passes on the planner's date", () => {
  assert.deepEqual(expiryChecks(real, "2026-10-02").errors, []);
});

test("expiry: tax year ended -> error; from 1 March -> warning", () => {
  assert.match(expiryChecks(real, "2027-04-01").errors.join(), /Tax data for 2026-27 ended/);
  assert.match(expiryChecks(real, "2027-03-01").warnings.join(), /Next tax year's rates not added/);
  assert.equal(expiryChecks(real, "2027-02-28").warnings.filter(w => /tax year/.test(w)).length, 0);
});

test("expiry: holiday data must cover the current year; warning from 1 September", () => {
  assert.match(expiryChecks(real, "2027-01-10").errors.join(), /no entry for 2027/);
  assert.match(expiryChecks(real, "2026-09-01").warnings.join(), /2027 not added/);
  assert.equal(expiryChecks(real, "2026-08-31").warnings.length, 0);
  const withNext = clone(real);
  withNext.holidays.years["2027"] = { holidays: [] };
  assert.equal(expiryChecks(withNext, "2026-10-02").warnings.length, 0);
});

test("tax data is internally consistent", () => {
  const t = real.tax;
  const b = t.incomeTax.brackets;
  for (let i = 1; i < b.length - 1; i++) assert.ok(b[i].upTo > b[i - 1].upTo);
  assert.equal(b.at(-1).upTo, null);
  assert.equal(Math.round(t.acc.maxEarnings * t.acc.rate * 100) / 100, t.acc.maxLevy, "ACC max levy = rate x max earnings");
  const s = t.studentLoan;
  assert.equal(s.periodThresholds.weekly * 52, s.annualThreshold);
  assert.equal(s.periodThresholds.fortnightly * 26, s.annualThreshold);
  assert.equal(s.periodThresholds.fourWeekly * 13, s.annualThreshold);
  assert.ok(Math.abs(s.periodThresholds.monthly * 12 - s.annualThreshold) < 0.1);
  assert.ok(t.kiwisaver.employeeRates.includes(t.kiwisaver.defaultEmployeeRate));
  assert.ok(Math.abs(t.kiwisaver.government.contributionForMax * t.kiwisaver.government.perDollar - t.kiwisaver.government.maxAnnual) <= 0.01, "max government contribution = 25c x required member contribution, to the cent");
  assert.ok(t.periodStart < t.periodEnd && t.checkedOn >= "2026-04-01");
});

test("holiday data: observed dates for Mon-Fri workers are weekdays", () => {
  for (const [, y] of Object.entries(real.holidays.years)) for (const h of y.holidays) {
    const day = new Date(h.observedForMonFri + "T00:00:00Z").getUTCDay();
    assert.ok(day >= 1 && day <= 5, `${h.name} ${h.observedForMonFri}`);
  }
  const anzac = real.holidays.years["2026"].holidays.find(h => h.name === "Anzac Day");
  assert.equal(anzac.observedForMonFri, "2026-04-27");
  assert.equal(real.holidays.years["2026"].holidays.find(h => h.name === "Boxing Day").observedForMonFri, "2026-12-28");
});
