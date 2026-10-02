// KiwiSaver contributions for a year and an illustrative balance projection. Rates and the
// government contribution rule come from the tax-year data file. Amounts are in cents.
import { esctRate } from "./paye.js";

/**
 * Yearly contributions. salaryCents: gross salary for the year. Returns cents.
 * opts: { employeeRate, employerRate, eligibleForGovernment (age 16-65, NZ resident), voluntaryCents }
 */
export function yearlyContributions(salaryCents, opts, tax) {
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
export function project({ startCents = 0, yearlyCents, years, returnRate, feeRate = 0, fixedFeeCents = 0 }) {
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
