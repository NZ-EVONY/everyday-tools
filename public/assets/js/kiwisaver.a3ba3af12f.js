(function () {
"use strict";
// money.js
// Money helpers shared by the NZ calculators. Amounts are whole cents (integers) so
// rounding is exact and repeatable; rates are basis points (15% = 1500).

/** Round n/d to the nearest integer, halves away from zero. n and d are integers, d > 0. */
function divRound(n, d) {
  const q = Math.floor((2 * Math.abs(n) + d) / (2 * d));
  return n < 0 ? -q : q;
}

/** Parse "1,234.56", "$1234.5" or "1234" into cents. Returns null for anything else. */
function parseMoney(input) {
  const s = String(input ?? "").trim().replace(/^\$/, "").replace(/,/g, "").replace(/\s/g, "");
  if (!/^-?\d{1,12}(\.\d{0,4})?$/.test(s)) return null;
  const neg = s.startsWith("-");
  const [whole, frac = ""] = s.replace("-", "").split(".");
  const f = (frac + "0000").slice(0, 4);
  const cents = Number(whole) * 100 + divRound(Number(f), 100);
  return neg ? -cents : cents;
}

/** Format cents as "$1,234.56" (or "-$1,234.56"). */
function formatMoney(cents, { sign = true } = {}) {
  const neg = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString("en-NZ");
  const out = `${sign ? "$" : ""}${dollars}.${String(abs % 100).padStart(2, "0")}`;
  return neg ? `-${out}` : out;
}

/** Rate (0.15) to basis points (1500), exact for rates with up to 4 decimal places. */
const toBasisPoints = rate => Math.round(rate * 10000);

// paye.js
// NZ PAYE, ACC earners' levy, student loan, KiwiSaver and ESCT for one pay period, following
// Inland Revenue's "Payroll calculations and business rules specification" (1 April 2026 to
// 31 March 2027), sections 5.2-5.4, 5.6 and 5.20. All money is in cents. `tax` is one year's
// data file (data/nz/tax-YYYY-YY.json), so nothing here hard-codes a rate.

const PERIODS = { weekly: 52, fortnightly: 26, fourWeekly: 13, monthly: 12 };
const truncCents = x => Math.floor(x + 1e-9);   // x is in cents (possibly fractional)

/** Annual income tax in dollars (not rounded) for whole-dollar annual income. */
function annualTax(income, brackets) {
  let tax = 0, lower = 0;
  for (const b of brackets) {
    const top = b.upTo ?? Infinity;
    if (income > lower) tax += (Math.min(income, top) - lower) * b.rate;
    lower = top;
  }
  return tax;
}

function annualAcc(income, acc) {
  return income >= acc.maxEarnings ? acc.maxLevy : income * acc.rate;
}

/** Independent earner tax credit, in dollars, for whole-dollar annual income (spec 5.3 step 4). */
function ietc(income, rules) {
  if (income < rules.lower || income >= rules.upper) return 0;
  if (income <= rules.abatementStart) return rules.amount;
  return rules.amount - (income - rules.abatementStart) * rules.abatementRate;
}

/** PAYE (tax + ACC) for a main-income code (M or ME) for one pay period. */
function payeMain(grossCents, period, tax, { me = false } = {}) {
  const n = PERIODS[period];
  const annual = Math.floor((grossCents * n) / 100 + 1e-9);         // drop cents
  let total = annualTax(annual, tax.incomeTax.brackets) + annualAcc(annual, tax.acc);
  if (me) total -= ietc(annual, tax.ietc);
  const weekly = truncCents((Math.max(0, total) * 100) / 52);         // whole cents
  return period === "weekly" ? weekly : truncCents((weekly * 52) / n);
}

/** PAYE (tax + ACC) for a secondary code (SB, S, SH, ST, SA) for one pay period. */
function payeSecondary(grossCents, code, tax) {
  const c = tax.secondaryCodes.codes.find(x => x.code === code);
  if (!c) throw new Error(`Unknown secondary code ${code}`);
  const dollars = Math.floor(grossCents / 100);
  return truncCents(dollars * 100 * (c.rate + tax.acc.rate));
}

/** Student loan deduction for one pay period (spec 5.4 for main income, 5.6 for secondary). */
function studentLoan(grossCents, period, tax, { secondary = false } = {}) {
  const sl = tax.studentLoan;
  const dollars = Math.floor(grossCents / 100);
  if (secondary) return truncCents(dollars * 100 * sl.secondaryRate);
  const threshold = Math.round(sl.periodThresholds[period] * 100);
  const over = dollars * 100 - threshold;
  return over > 0 ? truncCents(over * sl.rate) : 0;
}

/** Employee KiwiSaver deduction: rate × gross, fractions of a cent dropped (as IRD's tables do). */
const kiwisaverEmployee = (grossCents, rate) => truncCents(grossCents * rate);

/** ESCT rate for an annual "salary plus employer contributions" figure, in dollars. */
function esctRate(annualDollars, esct) {
  return esct.bands.find(b => b.upTo === null || annualDollars <= b.upTo).rate;
}

/** Employer contribution for one period, and the ESCT on it (worked on whole dollars, spec 5.20.6). */
function employerContribution(grossCents, rate, esctRateValue) {
  const gross = truncCents(grossCents * rate);
  const esct = truncCents(Math.floor(gross / 100) * 100 * esctRateValue);
  return { gross, esct, net: gross - esct };
}

/**
 * Take-home pay for one pay period.
 * opts: { period, code: "M"|"ME"|"SB"|"S"|"SH"|"ST"|"SA", studentLoan: bool, kiwisaverRate: number|0,
 *         employerRate: number (default from data) }
 */
function takeHome(grossCents, opts, tax) {
  const { period, code = "M" } = opts;
  const secondary = code !== "M" && code !== "ME";
  const paye = secondary ? payeSecondary(grossCents, code, tax) : payeMain(grossCents, period, tax, { me: code === "ME" });
  const sl = opts.studentLoan ? studentLoan(grossCents, period, tax, { secondary }) : 0;
  const ks = opts.kiwisaverRate ? kiwisaverEmployee(grossCents, opts.kiwisaverRate) : 0;
  const n = PERIODS[period];
  let employer = null;
  if (opts.kiwisaverRate) {
    const rate = opts.employerRate ?? tax.kiwisaver.employerMinimumRate;
    const annualEstimate = Math.floor((grossCents * n * (1 + rate)) / 100);
    employer = { rate, esctRate: esctRate(annualEstimate, tax.esct), ...employerContribution(grossCents, rate, esctRate(annualEstimate, tax.esct)) };
  }
  // Split PAYE into income tax and ACC for display (IRD deducts them together as one PAYE amount).
  const annualIncome = Math.floor((grossCents * n) / 100);
  const accPart = secondary ? truncCents(Math.floor(grossCents / 100) * 100 * tax.acc.rate) : Math.min(paye, Math.round((annualAcc(annualIncome, tax.acc) * 100) / n));
  const net = grossCents - paye - sl - ks;
  return {
    period, periods: n, gross: grossCents, paye, acc: accPart, incomeTax: paye - accPart, studentLoan: sl, kiwisaver: ks, net, employer,
    annual: { gross: grossCents * n, paye: paye * n, studentLoan: sl * n, kiwisaver: ks * n, net: net * n },
    effectiveRate: grossCents ? (paye + sl) / grossCents : 0,
  };
}

// kiwisaver.js
// KiwiSaver contributions for a year and an illustrative balance projection. Rates and the
// government contribution rule come from the tax-year data file. Amounts are in cents.

/**
 * Yearly contributions. salaryCents: gross salary for the year. Returns cents.
 * opts: { employeeRate, employerRate, eligibleForGovernment (age 16-65, NZ resident), voluntaryCents }
 */
function yearlyContributions(salaryCents, opts, tax) {
  const ks = tax.kiwisaver;
  const employee = Math.floor(salaryCents * opts.employeeRate);
  const voluntary = Math.max(0, opts.voluntaryCents || 0);
  const employerGross = Math.floor(salaryCents * (opts.employerRate ?? ks.employerMinimumRate));
  const rate = esctRate(Math.floor((salaryCents + employerGross) / 100), tax.esct);
  const esct = Math.floor(employerGross * rate);
  const member = employee + voluntary;
  const g = ks.government;
  const incomeOk = salaryCents <= g.incomeLimit * 100;
  const government = opts.eligibleForGovernment && incomeOk ? Math.min(Math.floor(member * g.perDollar), Math.round(g.maxAnnual * 100)) : 0;
  return { employee, voluntary, member, employerGross, esctRate: rate, esct, employerNet: employerGross - esct, government, incomeOk, total: member + employerGross - esct + government };
}

/**
 * Illustrative projection, year by year. Contributions stay the same every year (no pay rises),
 * each year's contributions are added at the end of the year, then:
 *   balance = balance × (1 + return − fee%) + contributions − fixed fee
 * returnRate and feeRate are decimals (0.05 = 5%); fixedFeeCents per year. Not a forecast.
 */
function project({ startCents = 0, yearlyCents, years, returnRate, feeRate = 0, fixedFeeCents = 0 }) {
  const rows = [];
  let bal = startCents, paidIn = 0, growth = 0;
  for (let y = 1; y <= years; y++) {
    const g = Math.round(bal * (returnRate - feeRate));
    bal = Math.max(0, bal + g + yearlyCents - fixedFeeCents);
    paidIn += yearlyCents;
    growth += g - fixedFeeCents;
    rows.push({ year: y, balance: bal, paidIn, growth });
  }
  return rows;
}

// kiwisaver.js
// KiwiSaver calculator page. Contributions and the projection come from lib/kiwisaver.js using
// the tax-year data embedded at build time. The projection only runs when the visitor enters
// their own return assumption: no default return is assumed. Nothing typed is stored or sent.


const { $, copyText } = window.ET;
const form = $("#ksForm");
const tax = JSON.parse(form.dataset.tax);
const set = (id, t) => { $(id).textContent = t; };
const pctIn = id => { const raw = $(id).value.trim(); if (raw === "") return null; const n = Number(raw); const bad = !Number.isFinite(n) || n < -50 || n > 50; $(id).toggleAttribute("aria-invalid", bad); return bad ? NaN : n / 100; };
const moneyIn = id => { const raw = $(id).value.trim(); if (raw === "") { $(id).removeAttribute("aria-invalid"); return 0; } const c = parseMoney(raw); const bad = c === null || c < 0; $(id).toggleAttribute("aria-invalid", bad); return bad ? NaN : c; };

let last = null;
function update() {
  const salary = moneyIn("#ksSalary"), voluntary = moneyIn("#ksVol"), start = moneyIn("#ksStart"), fixedFee = moneyIn("#ksFeeFixed");
  const employerRate = pctIn("#ksEmployer");
  const ret = pctIn("#ksReturn"), fee = pctIn("#ksFee");
  const yearsRaw = $("#ksYears").value.trim();
  const years = yearsRaw === "" ? 0 : Math.floor(Number(yearsRaw));
  const badYears = yearsRaw !== "" && !(years >= 1 && years <= 60);
  $("#ksYears").toggleAttribute("aria-invalid", badYears);
  const bad = [salary, voluntary, start, fixedFee, employerRate, ret, fee].some(Number.isNaN) || badYears;
  set("#ksHint", bad ? "Check the highlighted boxes. Percentages are plain numbers, such as 3.5." : "");
  const y = yearlyContributions(Number.isNaN(salary) ? 0 : salary, {
    employeeRate: Number(form.elements.rate.value), employerRate: employerRate ?? tax.kiwisaver.employerMinimumRate,
    voluntaryCents: Number.isNaN(voluntary) ? 0 : voluntary, eligibleForGovernment: $("#ksGov").checked,
  }, tax);
  set("#vYou", formatMoney(y.member));
  set("#vEmp", formatMoney(y.employerNet));
  set("#vEmpK", `${formatMoney(y.employerGross)} before ESCT at ${(y.esctRate * 100).toFixed(1)}%`);
  set("#vGov", formatMoney(y.government));
  set("#vGovK", !$("#ksGov").checked ? "Not eligible (as entered)" : !y.incomeOk ? "Income over the limit" : y.government >= Math.round(tax.kiwisaver.government.maxAnnual * 100) ? "The yearly maximum" : `${tax.kiwisaver.government.perDollar * 100}c per $1 you put in`);
  set("#vTotal", formatMoney(y.total));
  const proj = $("#ksProjection");
  const canProject = ret !== null && !Number.isNaN(ret) && years >= 1 && !bad;
  proj.hidden = !canProject;
  $("#ksNoProj").hidden = canProject;
  let rows = [];
  if (canProject) {
    rows = project({ startCents: start, yearlyCents: y.total, years, returnRate: ret, feeRate: fee ?? 0, fixedFeeCents: fixedFee });
    const end = rows.at(-1);
    set("#vEnd", formatMoney(end.balance));
    set("#vEndK", `After ${years} year${years === 1 ? "" : "s"}, in today's dollars only if prices don't rise`);
    const tbody = proj.querySelector("tbody");
    tbody.replaceChildren();
    for (const r of rows.filter(r => r.year % 5 === 0 || r.year === years || r.year === 1)) {
      const tr = document.createElement("tr");
      for (const [t, c] of [[`Year ${r.year}`, ""], [formatMoney(r.paidIn), "num"], [formatMoney(r.growth), "num"], [formatMoney(r.balance), "num"]]) { const td = document.createElement("td"); td.textContent = t; if (c) td.className = c; tr.append(td); }
      tbody.append(tr);
    }
  }
  last = { y, rows };
  set("#sr", `Total going in each year ${formatMoney(y.total)}.${canProject ? ` Illustrative balance after ${years} years ${formatMoney(rows.at(-1).balance)}.` : ""}`);
}

$("#ksCopy").addEventListener("click", () => {
  if (!last) return;
  const { y, rows } = last;
  copyText([`KiwiSaver per year: you ${formatMoney(y.member)}, employer after ESCT ${formatMoney(y.employerNet)}, government ${formatMoney(y.government)}, total ${formatMoney(y.total)}.`, rows.length ? `Illustrative balance after ${rows.length} years: ${formatMoney(rows.at(-1).balance)} (not a forecast).` : ""].filter(Boolean).join("\n"));
});
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();

})();
