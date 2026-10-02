// Money helpers shared by the NZ calculators. Amounts are whole cents (integers) so
// rounding is exact and repeatable; rates are basis points (15% = 1500).

/** Round n/d to the nearest integer, halves away from zero. n and d are integers, d > 0. */
export function divRound(n, d) {
  const q = Math.floor((2 * Math.abs(n) + d) / (2 * d));
  return n < 0 ? -q : q;
}

/** Parse "1,234.56", "$1234.5" or "1234" into cents. Returns null for anything else. */
export function parseMoney(input) {
  const s = String(input ?? "").trim().replace(/^\$/, "").replace(/,/g, "").replace(/\s/g, "");
  if (!/^-?\d{1,12}(\.\d{0,4})?$/.test(s)) return null;
  const neg = s.startsWith("-");
  const [whole, frac = ""] = s.replace("-", "").split(".");
  const f = (frac + "0000").slice(0, 4);
  const cents = Number(whole) * 100 + divRound(Number(f), 100);
  return neg ? -cents : cents;
}

/** Format cents as "$1,234.56" (or "-$1,234.56"). */
export function formatMoney(cents, { sign = true } = {}) {
  const neg = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString("en-NZ");
  const out = `${sign ? "$" : ""}${dollars}.${String(abs % 100).padStart(2, "0")}`;
  return neg ? `-${out}` : out;
}

/** Rate (0.15) to basis points (1500), exact for rates with up to 4 decimal places. */
export const toBasisPoints = rate => Math.round(rate * 10000);
