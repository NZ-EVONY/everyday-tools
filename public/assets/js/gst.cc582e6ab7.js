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

// gst.js
// GST arithmetic. Adding: GST = exclusive × rate. Removing: GST = inclusive × rate ÷ (1 + rate),
// which is 3/23 of the inclusive price at 15%. All amounts in cents, rate in basis points.

function addGst(exclusiveCents, rateBp) {
  const gst = divRound(exclusiveCents * rateBp, 10000);
  return { exclusive: exclusiveCents, gst, inclusive: exclusiveCents + gst };
}

function removeGst(inclusiveCents, rateBp) {
  const gst = divRound(inclusiveCents * rateBp, 10000 + rateBp);
  return { exclusive: inclusiveCents - gst, gst, inclusive: inclusiveCents };
}

/**
 * Line items: each line is { cents, mode: "add" | "remove" }. GST is worked out and rounded
 * per line, then summed. Also returns the GST worked out once on the summed totals (on the exclusive total when every
 * line adds GST, otherwise on the inclusive total), so the
 * page can show when per-line rounding gives a slightly different answer.
 */
function gstLines(lines, rateBp) {
  const rows = lines.map(l => (l.mode === "remove" ? removeGst(l.cents, rateBp) : addGst(l.cents, rateBp)));
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  const totals = { exclusive: sum("exclusive"), gst: sum("gst"), inclusive: sum("inclusive") };
  const allAdd = lines.length > 0 && lines.every(l => l.mode !== "remove");
  const onTotal = allAdd ? addGst(totals.exclusive, rateBp).gst : removeGst(totals.inclusive, rateBp).gst;
  return { rows, totals, gstOnTotal: onTotal, roundingDifference: totals.gst - onTotal };
}

// gst.js
// GST calculator page. Pure arithmetic lives in lib/gst.js (unit-tested); this file wires up
// the form. Nothing typed leaves the page; only the add/remove choice goes in the URL fragment.


const { $, copyText } = window.ET;
const form = $("#gstForm");
const rateBp = Number(form.dataset.rateBp);
const ratePct = form.dataset.ratePct;
const amount = $("#gstAmount");
const err = $("#gstAmountError");
const out = $("#gstResult");
const linesBox = $("#gstLines");
const linesOut = $("#gstLinesResult");
const MAX_LINES = 50;

const mode = () => form.querySelector('input[name="mode"]:checked').value;

function cell(text, cls) {
  const td = document.createElement("td");
  td.textContent = text;
  if (cls) td.className = cls;
  return td;
}
function row(label, value, strong) {
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  th.scope = "row";
  th.textContent = label;
  tr.append(th, cell(value, "num" + (strong ? " strong" : "")));
  return tr;
}

function renderSingle() {
  const raw = amount.value.trim();
  out.replaceChildren();
  if (!raw) {
    err.textContent = "";
    amount.removeAttribute("aria-invalid");
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = mode() === "add" ? `Enter a price without GST, for example 100, to see ${ratePct} GST added.` : `Enter a price that includes GST, for example 115, to see the GST inside it.`;
    out.append(p);
    return;
  }
  const cents = parseMoney(raw);
  if (cents === null || cents < 0) {
    err.textContent = "Enter an amount in dollars and cents, such as 49.95 or 1,200.";
    amount.setAttribute("aria-invalid", "true");
    return;
  }
  err.textContent = "";
  amount.removeAttribute("aria-invalid");
  const r = mode() === "add" ? addGst(cents, rateBp) : removeGst(cents, rateBp);
  const big = document.createElement("p");
  big.className = "big";
  big.textContent = mode() === "add" ? `${formatMoney(r.inclusive)} including GST` : `${formatMoney(r.exclusive)} excluding GST`;
  const table = document.createElement("table");
  table.append(row("Price excluding GST", formatMoney(r.exclusive)), row(`GST at ${ratePct}`, formatMoney(r.gst), true), row("Price including GST", formatMoney(r.inclusive)));
  const actions = document.createElement("div");
  actions.className = "actions";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "btn secondary small";
  copy.textContent = "Copy result";
  copy.addEventListener("click", () => copyText(`Excluding GST: ${formatMoney(r.exclusive)}\nGST (${ratePct}): ${formatMoney(r.gst)}\nIncluding GST: ${formatMoney(r.inclusive)}`));
  actions.append(copy);
  out.append(big, table, actions);
}

function addLine(value = "") {
  if (linesBox.children.length >= MAX_LINES) return;
  const n = linesBox.children.length + 1;
  const wrap = document.createElement("div");
  wrap.className = "line";
  const desc = document.createElement("input");
  desc.type = "text"; desc.maxLength = 60; desc.setAttribute("aria-label", `Line ${n} description (optional)`); desc.placeholder = "Description (optional)";
  const amt = document.createElement("input");
  amt.type = "text"; amt.inputMode = "decimal"; amt.maxLength = 16; amt.value = value; amt.setAttribute("aria-label", `Line ${n} amount`); amt.placeholder = "0.00";
  const del = document.createElement("button");
  del.type = "button"; del.className = "btn secondary small"; del.textContent = "Remove"; del.setAttribute("aria-label", `Remove line ${n}`);
  del.addEventListener("click", () => { wrap.remove(); renderLines(); });
  wrap.append(desc, amt, del);
  linesBox.append(wrap);
}

function renderLines() {
  const items = [...linesBox.children].map(l => {
    const [d, a] = l.querySelectorAll("input");
    return { label: d.value.trim(), cents: parseMoney(a.value), raw: a.value.trim(), input: a };
  });
  items.forEach(i => (i.raw && (i.cents === null || i.cents < 0) ? i.input.setAttribute("aria-invalid", "true") : i.input.removeAttribute("aria-invalid")));
  const good = items.filter(i => i.raw && i.cents !== null && i.cents >= 0);
  linesOut.replaceChildren();
  if (!good.length) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = "Add each item's price to get per-line GST and totals.";
    linesOut.append(p);
    return;
  }
  const m = mode();
  const res = gstLines(good.map(g => ({ cents: g.cents, mode: m })), rateBp);
  const table = document.createElement("table");
  const head = document.createElement("tr");
  for (const h of ["Item", "Excl. GST", "GST", "Incl. GST"]) { const th = document.createElement("th"); th.scope = "col"; th.textContent = h; if (h !== "Item") th.className = "num"; head.append(th); }
  table.append(head);
  res.rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.append(cell(good[i].label || `Line ${i + 1}`), cell(formatMoney(r.exclusive), "num"), cell(formatMoney(r.gst), "num"), cell(formatMoney(r.inclusive), "num"));
    table.append(tr);
  });
  const tot = document.createElement("tr");
  tot.append(cell("Total"), cell(formatMoney(res.totals.exclusive), "num"), cell(formatMoney(res.totals.gst), "num"), cell(formatMoney(res.totals.inclusive), "num"));
  tot.className = "strong";
  table.append(tot);
  linesOut.append(table);
  if (res.roundingDifference !== 0) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = `Rounding each line gives ${formatMoney(res.totals.gst)} of GST; working it out once on the total gives ${formatMoney(res.gstOnTotal)}. The difference comes only from rounding to whole cents.`;
    linesOut.append(p);
  }
  const copy = document.createElement("button");
  copy.type = "button"; copy.className = "btn secondary small"; copy.textContent = "Copy table";
  copy.addEventListener("click", () => copyText([["Item", "Excl. GST", "GST", "Incl. GST"], ...res.rows.map((r, i) => [good[i].label || `Line ${i + 1}`, formatMoney(r.exclusive), formatMoney(r.gst), formatMoney(r.inclusive)]), ["Total", formatMoney(res.totals.exclusive), formatMoney(res.totals.gst), formatMoney(res.totals.inclusive)]].map(r => r.join("\t")).join("\n")));
  const actions = document.createElement("div");
  actions.className = "actions";
  actions.append(copy);
  linesOut.append(actions);
}

function update() {
  renderSingle();
  renderLines();
  const label = $("#gstAmountLabel");
  label.textContent = mode() === "add" ? "Price excluding GST ($)" : "Price including GST ($)";
}

// Restore the add/remove choice from the fragment (#remove), never any amounts.
if (location.hash === "#remove") form.querySelector('input[value="remove"]').checked = true;
form.addEventListener("input", update);
form.addEventListener("change", e => {
  if (e.target.name === "mode") history.replaceState(null, "", e.target.value === "remove" ? "#remove" : location.pathname);
});
form.addEventListener("submit", e => e.preventDefault());
$("#gstAddLine").addEventListener("click", () => { addLine(); linesBox.lastElementChild?.querySelector("input")?.focus(); });
addLine(); addLine();
update();

})();
