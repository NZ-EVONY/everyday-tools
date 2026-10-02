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
 * Line items: each line is { cents, mode: "add" | "remove" }. GST is worked out and rounded
 * per line, then summed. Also returns the GST worked out once on the summed totals (on the exclusive total when every
 * line adds GST, otherwise on the inclusive total), so the
 * page can show when per-line rounding gives a slightly different answer.
 */
export function gstLines(lines, rateBp) {
  const rows = lines.map(l => (l.mode === "remove" ? removeGst(l.cents, rateBp) : addGst(l.cents, rateBp)));
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  const totals = { exclusive: sum("exclusive"), gst: sum("gst"), inclusive: sum("inclusive") };
  const allAdd = lines.length > 0 && lines.every(l => l.mode !== "remove");
  const onTotal = allAdd ? addGst(totals.exclusive, rateBp).gst : removeGst(totals.inclusive, rateBp).gst;
  return { rows, totals, gstOnTotal: onTotal, roundingDifference: totals.gst - onTotal };
}
