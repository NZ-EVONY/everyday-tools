// NZ PAYE, ACC earners' levy, student loan, KiwiSaver and ESCT for one pay period, following
// Inland Revenue's "Payroll calculations and business rules specification" (1 April 2026 to
// 31 March 2027), sections 5.2-5.4, 5.6 and 5.20. All money is in cents. `tax` is one year's
// data file (data/nz/tax-YYYY-YY.json), so nothing here hard-codes a rate.

export const PERIODS = { weekly: 52, fortnightly: 26, fourWeekly: 13, monthly: 12 };
const truncCents = x => Math.floor(x + 1e-9);   // x is in cents (possibly fractional)

/** Annual income tax in dollars (not rounded) for whole-dollar annual income. */
export function annualTax(income, brackets) {
  let tax = 0, lower = 0;
  for (const b of brackets) {
    const top = b.upTo ?? Infinity;
    if (income > lower) tax += (Math.min(income, top) - lower) * b.rate;
    lower = top;
  }
  return tax;
}

export function annualAcc(income, acc) {
  return income >= acc.maxEarnings ? acc.maxLevy : income * acc.rate;
}

/** Independent earner tax credit, in dollars, for whole-dollar annual income (spec 5.3 step 4). */
export function ietc(income, rules) {
  if (income < rules.lower || income >= rules.upper) return 0;
  if (income <= rules.abatementStart) return rules.amount;
  return rules.amount - (income - rules.abatementStart) * rules.abatementRate;
}

/** PAYE (tax + ACC) for a main-income code (M or ME) for one pay period. */
export function payeMain(grossCents, period, tax, { me = false } = {}) {
  const n = PERIODS[period];
  const annual = Math.floor((grossCents * n) / 100 + 1e-9);         // drop cents
  let total = annualTax(annual, tax.incomeTax.brackets) + annualAcc(annual, tax.acc);
  if (me) total -= ietc(annual, tax.ietc);
  const weekly = truncCents((Math.max(0, total) * 100) / 52);         // whole cents
  return period === "weekly" ? weekly : truncCents((weekly * 52) / n);
}

/** PAYE (tax + ACC) for a secondary code (SB, S, SH, ST, SA) for one pay period. */
export function payeSecondary(grossCents, code, tax) {
  const c = tax.secondaryCodes.codes.find(x => x.code === code);
  if (!c) throw new Error(`Unknown secondary code ${code}`);
  const dollars = Math.floor(grossCents / 100);
  return truncCents(dollars * 100 * (c.rate + tax.acc.rate));
}

/** Student loan deduction for one pay period (spec 5.4 for main income, 5.6 for secondary). */
export function studentLoan(grossCents, period, tax, { secondary = false } = {}) {
  const sl = tax.studentLoan;
  const dollars = Math.floor(grossCents / 100);
  if (secondary) return truncCents(dollars * 100 * sl.secondaryRate);
  const threshold = Math.round(sl.periodThresholds[period] * 100);
  const over = dollars * 100 - threshold;
  return over > 0 ? truncCents(over * sl.rate) : 0;
}

/** Employee KiwiSaver deduction: rate × gross, fractions of a cent dropped (as IRD's tables do). */
export const kiwisaverEmployee = (grossCents, rate) => truncCents(grossCents * rate);

/** ESCT rate for an annual "salary plus employer contributions" figure, in dollars. */
export function esctRate(annualDollars, esct) {
  return esct.bands.find(b => b.upTo === null || annualDollars <= b.upTo).rate;
}

/** Employer contribution for one period, and the ESCT on it (worked on whole dollars, spec 5.20.6). */
export function employerContribution(grossCents, rate, esctRateValue) {
  const gross = truncCents(grossCents * rate);
  const esct = truncCents(Math.floor(gross / 100) * 100 * esctRateValue);
  return { gross, esct, net: gross - esct };
}

/**
 * Take-home pay for one pay period.
 * opts: { period, code: "M"|"ME"|"SB"|"S"|"SH"|"ST"|"SA", studentLoan: bool, kiwisaverRate: number|0,
 *         employerRate: number (default from data) }
 */
export function takeHome(grossCents, opts, tax) {
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
