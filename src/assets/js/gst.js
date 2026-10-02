// GST calculator page. Pure arithmetic lives in lib/gst.js (unit-tested); this file wires up
// the form. Nothing typed leaves the page; only the add/remove choice goes in the URL fragment.
import { parseMoney, formatMoney } from "../lib/money.js";
import { addGst, removeGst, gstLines } from "../lib/gst.js";

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
