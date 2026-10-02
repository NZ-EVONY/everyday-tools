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
 * Several amounts entered the same way (all excluding GST, or all including it).
 * total: GST worked out once on the sum of the lines (the calculator's headline answer).
 * rows / perLine: GST worked out and rounded on each line, then summed, as some invoicing
 * software does. roundingDifference = perLine.gst - total.gst (usually 0, sometimes a cent or two).
 */
function gstLines(cents, mode, rateBp) {
  const one = mode === "remove" ? removeGst : addGst;
  const rows = cents.map(c => one(c, rateBp));
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  const perLine = { exclusive: sum("exclusive"), gst: sum("gst"), inclusive: sum("inclusive") };
  const total = one(cents.reduce((a, c) => a + c, 0), rateBp);
  return { rows, perLine, total, roundingDifference: perLine.gst - total.gst };
}

// gst.js
// GST calculator page (layout from design/tool-gst.html). Pure arithmetic lives in lib/gst.js
// (unit-tested); this file wires up the form. Nothing typed leaves the page; only the add/remove
// choice goes in the URL fragment (#remove).


const { $, $$, copyText } = window.ET;
const form = $("#gstForm");
const rateBp = Number(form.dataset.rateBp);
const ratePct = form.dataset.ratePct;
const lines = $("#gstLines");
const tpl = $("#gstLineTpl");
const hint = $("#gstHint");
const MAX_LINES = 50;

const mode = () => form.querySelector('input[name="mode"]:checked').value;
const set = (id, text) => { $(id).textContent = text; };

function renumber() {
  $$(".line", lines).forEach((li, i) => {
    li.querySelector(".desc").setAttribute("aria-label", `Description, line ${i + 1} (optional)`);
    li.querySelector(".amt").setAttribute("aria-label", `Amount, line ${i + 1}`);
    li.querySelector(".rm").setAttribute("aria-label", `Remove line ${i + 1}`);
  });
}
function addLine() {
  if (lines.children.length >= MAX_LINES) return null;
  const li = tpl.content.firstElementChild.cloneNode(true);
  li.querySelector(".rm").addEventListener("click", () => {
    if (lines.children.length > 1) li.remove(); else li.querySelectorAll("input").forEach(i => { i.value = ""; });
    renumber(); update();
  });
  lines.append(li);
  renumber();
  return li;
}

let last = null;
function update() {
  const m = mode();
  set("#amtHead", m === "add" ? "Amount, excl. GST" : "Amount, incl. GST");
  const items = $$(".line", lines).map(li => ({ desc: li.querySelector(".desc").value.trim(), input: li.querySelector(".amt") }));
  let bad = 0;
  const good = [];
  for (const it of items) {
    const raw = it.input.value.trim();
    const c = raw ? parseMoney(raw) : null;
    if (raw && (c === null || c < 0)) { it.input.setAttribute("aria-invalid", "true"); bad++; }
    else { it.input.removeAttribute("aria-invalid"); if (raw) good.push({ desc: it.desc, cents: c }); }
  }
  hint.textContent = bad ? "Enter amounts in dollars and cents, such as 49.95 or 1,200." : "";
  const r = gstLines(good.map(g => g.cents), m, rateBp);
  last = { r, good, m };
  set("#vExcl", formatMoney(r.total.exclusive));
  set("#vGst", formatMoney(r.total.gst));
  set("#vIncl", formatMoney(r.total.inclusive));
  set("#kExcl", m === "add" ? (good.length > 1 ? "Sum of your lines" : "What you entered") : "Worked out for you");
  set("#kIncl", m === "add" ? "Total to pay" : (good.length > 1 ? "Sum of your lines" : "What you entered"));
  const share = r.total.inclusive ? (r.total.gst / r.total.inclusive) * 100 : 0;
  $("#bar").style.setProperty("--p", String(share));
  set("#pct", `${share.toFixed(1)}%`);
  // Breakdown: each line, plus a note when per-line rounding differs.
  const box = $("#gstBreakdown");
  box.hidden = good.length < 2;
  if (good.length >= 2) {
    const tbody = box.querySelector("tbody");
    tbody.replaceChildren();
    r.rows.forEach((row, i) => {
      const tr = document.createElement("tr");
      for (const [t, cls] of [[good[i].desc || `Line ${i + 1}`, ""], [formatMoney(row.exclusive), "num"], [formatMoney(row.gst), "num"], [formatMoney(row.inclusive), "num"]]) {
        const td = document.createElement("td"); td.textContent = t; if (cls) td.className = cls; tr.append(td);
      }
      tbody.append(tr);
    });
    const note = $("#gstRounding");
    note.hidden = r.roundingDifference === 0;
    note.textContent = `Rounding each line separately gives ${formatMoney(r.perLine.gst)} of GST. The total above works GST out once, on the sum, giving ${formatMoney(r.total.gst)}. The gap is only rounding to whole cents.`;
  }
  set("#sr", good.length ? `GST ${formatMoney(r.total.gst)}. Excluding GST ${formatMoney(r.total.exclusive)}. Including GST ${formatMoney(r.total.inclusive)}.` : "");
}

$("#gstCopy").addEventListener("click", () => {
  if (!last) return;
  const { r, good } = last;
  const rows = good.length > 1 ? r.rows.map((row, i) => `${good[i].desc || `Line ${i + 1}`}: ${formatMoney(row.exclusive)} + GST ${formatMoney(row.gst)} = ${formatMoney(row.inclusive)}`).join("\n") + "\n\n" : "";
  copyText(`${rows}Excluding GST: ${formatMoney(r.total.exclusive)}\nGST (${ratePct}): ${formatMoney(r.total.gst)}\nIncluding GST: ${formatMoney(r.total.inclusive)}`);
});
$("#gstAddLine").addEventListener("click", () => addLine()?.querySelector(".amt").focus());
$("#gstReset").addEventListener("click", () => { lines.replaceChildren(); addLine(); update(); lines.querySelector(".amt").focus(); });

if (location.hash === "#remove") form.querySelector('input[value="remove"]').checked = true;
form.addEventListener("input", update);
form.addEventListener("change", e => {
  if (e.target.name === "mode") history.replaceState(null, "", e.target.value === "remove" ? "#remove" : location.pathname);
});
form.addEventListener("submit", e => e.preventDefault());
lines.replaceChildren();
addLine();
update();

})();
