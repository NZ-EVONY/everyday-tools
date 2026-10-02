// Splitting money between people so the shares always add up to the total, to the cent.
// Largest-remainder method: everyone gets the whole cents of their exact share, then the cents
// left over go one each to the largest fractional remainders (ties: earlier person first).

/** Split totalCents in proportion to weights (non-negative numbers). Returns an array of cents. */
export function allocate(totalCents, weights) {
  const sum = weights.reduce((a, w) => a + (w > 0 ? w : 0), 0);
  if (!weights.length) return [];
  if (sum <= 0) return allocate(totalCents, weights.map(() => 1));
  const exact = weights.map(w => (totalCents * (w > 0 ? w : 0)) / sum);
  const base = exact.map(x => Math.floor(x + 1e-9));
  let left = totalCents - base.reduce((a, b) => a + b, 0);
  const order = exact.map((x, i) => [x - base[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) base[order[k][1]]++;
  return base;
}

/**
 * The flat splitter. people: [{ name, room, income, days }]; method: "equal" | "room" | "income" | "days".
 * rentCents is split by the method; bills (cents) by the method too, unless billsEqual is set.
 * With "days", both are weighted by days present in the period.
 */
export function splitFlat({ rentCents, billCents = 0, people, method = "equal", billsEqual = false }) {
  const weight = p => method === "room" ? p.room : method === "income" ? p.income : method === "days" ? p.days : 1;
  const w = people.map(weight);
  const rent = allocate(rentCents, w);
  const bills = allocate(billCents, billsEqual && method !== "days" ? people.map(() => 1) : w);
  return people.map((p, i) => ({ ...p, rent: rent[i], bills: bills[i], total: rent[i] + bills[i] }));
}
