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

// paye.js
// Take-home pay page. The method (IRD's payroll specification) lives in lib/paye.js and is
// unit-tested against IRD's tables; this file reads the form and shows the results. The pay
// amount is never stored or put in the URL; only the settings go in the fragment.


const { $, copyText } = window.ET;
const form = $("#payForm");
const tax = JSON.parse(form.dataset.tax);
const PER = { year: 1, week: 52, fortnight: 26, fourWeeks: 13, month: 12 };
const LABEL = { weekly: "week", fortnightly: "fortnight", fourWeekly: "four weeks", monthly: "month" };
const val = name => form.elements[name].value;
const radio = name => form.querySelector(`input[name="${name}"]:checked`).value;
const set = (id, t) => { $(id).textContent = t; };
const pct = x => `${(x * 100).toFixed(1)}%`;

let last = null;
function update() {
  const raw = $("#payAmount").value.trim();
  const cents = raw ? parseMoney(raw) : 0;
  const bad = raw && (cents === null || cents < 0 || cents > 100000000 * 100);
  $("#payAmount").toggleAttribute("aria-invalid", !!bad);
  set("#payHint", bad ? "Enter your pay in dollars, such as 65000 or 1,250.50." : "");
  const period = radio("period");
  const per = val("per");
  const code = val("code");
  const secondary = code !== "M" && code !== "ME";
  // Convert what was typed (per year/week/...) into pay for one pay period, to the cent.
  const periodGross = bad ? 0 : Math.round(((cents || 0) * PER[per]) / PERIODS[period]);
  const ksRate = Number(val("ks"));
  const r = takeHome(periodGross, { period, code, studentLoan: form.elements.sl.checked, kiwisaverRate: ksRate }, tax);
  last = r;
  const each = LABEL[period];
  set("#rGross", formatMoney(r.gross)); set("#rGrossK", `Before tax, per ${each}`);
  set("#rPaye", formatMoney(r.paye)); set("#rPayeK", `Income tax ${formatMoney(r.incomeTax)} + ACC levy ${formatMoney(r.acc)}`);
  set("#rSl", formatMoney(r.studentLoan)); $("#rowSl").hidden = !form.elements.sl.checked;
  set("#rKs", formatMoney(r.kiwisaver)); set("#rKsK", ksRate ? `${+(ksRate * 100).toFixed(1)}% of gross pay` : "Not a member"); $("#rowKs").hidden = !ksRate;
  set("#rNet", formatMoney(r.net)); set("#rNetK", `Per ${each}`);
  set("#tPer", `Per ${each}`);
  for (const [k, id] of [["gross", "#aGross"], ["paye", "#aPaye"], ["studentLoan", "#aSl"], ["kiwisaver", "#aKs"], ["net", "#aNet"]]) {
    set(id, formatMoney(r.annual[k]));
    set(id.replace("#a", "#p"), formatMoney(k === "net" ? r.net : r[k]));
  }
  set("#effRate", r.gross ? `Tax and ACC take ${pct(r.paye / r.gross)} of your pay${r.studentLoan ? `; with student loan, ${pct(r.effectiveRate)}` : ""}.` : "");
  const emp = $("#employer");
  emp.hidden = !r.employer || !r.gross;
  if (r.employer) set("#employerText", `Your employer adds at least ${formatMoney(r.employer.gross)} per ${each} to your KiwiSaver on top of your pay. After employer superannuation contribution tax (ESCT) at ${pct(r.employer.esctRate)}, ${formatMoney(r.employer.net)} reaches your account.`);
  $("#meNote").hidden = code !== "ME";
  $("#secNote").hidden = !secondary;
  set("#sr", r.gross ? `Take-home pay ${formatMoney(r.net)} per ${each}.` : "");
  // Settings only (never the amount) in the fragment.
  const frag = new URLSearchParams({ per, period, code, ks: String(ksRate), sl: form.elements.sl.checked ? "1" : "0" }).toString();
  history.replaceState(null, "", `#${frag}`);
}

function restore() {
  const p = new URLSearchParams(location.hash.slice(1));
  const pick = (name, ok) => { const v = p.get(name); if (v !== null && ok(v)) form.elements[name].value = v; };
  pick("per", v => v in PER);
  pick("code", v => ["M", "ME", "SB", "S", "SH", "ST", "SA"].includes(v));
  pick("ks", v => ["0", ...tax.kiwisaver.employeeRates.map(String)].includes(v));
  const period = p.get("period");
  if (period in PERIODS) form.querySelector(`input[name="period"][value="${period}"]`).checked = true;
  if (p.get("sl") === "1") form.elements.sl.checked = true;
}

$("#payCopy").addEventListener("click", () => {
  if (!last || !last.gross) return;
  const r = last, each = LABEL[r.period];
  copyText([`Per ${each}: gross ${formatMoney(r.gross)}`, `PAYE incl. ACC: ${formatMoney(r.paye)}`, r.studentLoan ? `Student loan: ${formatMoney(r.studentLoan)}` : "", r.kiwisaver ? `KiwiSaver: ${formatMoney(r.kiwisaver)}` : "", `Take-home: ${formatMoney(r.net)}`, `Per year: take-home ${formatMoney(r.annual.net)}`, `Estimate for the ${tax.taxYear} tax year.`].filter(Boolean).join("\n"));
});
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
restore();
update();

})();
