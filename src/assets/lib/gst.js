// GST arithmetic. Adding: GST = exclusive × rate. Removing: GST = inclusive × rate ÷ (1 + rate),
// which is 3/23 of the inclusive price at 15%. All amounts in cents, rate in basis points.
import { divRound } from "./money.js";

export function addGst(exclusiveCents, rateBp) {
  const gst = divRound(exclusiveCents * rateBp, 10000);
  return { exclusive: exclusiveCents, gst, inclusive: exclusiveCents + gst };
}

export function removeGst(inclusiveCents, rateBp) {
  const gst = divRound(inclusiveCents * rateBp, 10000 + rateBp);
  return { exclusive: inclusiveCents - gst, gst, inclusive: inclusiveCents };
}

/**
 * Several amounts entered the same way (all excluding GST, or all including it).
 * total: GST worked out once on the sum of the lines (the calculator's headline answer).
 * rows / perLine: GST worked out and rounded on each line, then summed, as some invoicing
 * software does. roundingDifference = perLine.gst - total.gst (usually 0, sometimes a cent or two).
 */
export function gstLines(cents, mode, rateBp) {
  const one = mode === "remove" ? removeGst : addGst;
  const rows = cents.map(c => one(c, rateBp));
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  const perLine = { exclusive: sum("exclusive"), gst: sum("gst"), inclusive: sum("inclusive") };
  const total = one(cents.reduce((a, c) => a + c, 0), rateBp);
  return { rows, perLine, total, roundingDifference: perLine.gst - total.gst };
}
