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

// split.js
// Splitting money between people so the shares always add up to the total, to the cent.
// Largest-remainder method: everyone gets the whole cents of their exact share, then the cents
// left over go one each to the largest fractional remainders (ties: earlier person first).

/** Split totalCents in proportion to weights (non-negative numbers). Returns an array of cents. */
function allocate(totalCents, weights) {
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
function splitFlat({ rentCents, billCents = 0, people, method = "equal", billsEqual = false }) {
  const weight = p => method === "room" ? p.room : method === "income" ? p.income : method === "days" ? p.days : 1;
  const w = people.map(weight);
  const rent = allocate(rentCents, w);
  const bills = allocate(billCents, billsEqual && method !== "days" ? people.map(() => 1) : w);
  return people.map((p, i) => ({ ...p, rent: rent[i], bills: bills[i], total: rent[i] + bills[i] }));
}

// split.js
// Flatmate rent and bills splitter. The rounding (largest remainder, to the cent) is in
// lib/split.js. Names and amounts stay on the page; only the split method goes in the fragment.


const { $, $$, copyText } = window.ET;
const form = $("#splitForm");
const people = $("#people"), bills = $("#bills");
const MAX = 12;
const method = () => form.querySelector('input[name="method"]:checked').value;
const COL = { room: "Room size (m²)", income: "Income ($)", days: "Days present" };

function addRow(list, tplId, labelFn) {
  if (list.children.length >= MAX) return null;
  const li = $(tplId).content.firstElementChild.cloneNode(true);
  li.querySelector(".rm").addEventListener("click", () => { if (list.children.length > (list === people ? 2 : 0)) li.remove(); relabel(); update(); });
  list.append(li);
  relabel();
  return li;
}
function relabel() {
  $$(".line", people).forEach((li, i) => {
    li.querySelector(".pname").setAttribute("aria-label", `Name, person ${i + 1}`);
    li.querySelector(".pw").setAttribute("aria-label", `${COL[method()] || "Weight"}, person ${i + 1}`);
    li.querySelector(".rm").setAttribute("aria-label", `Remove person ${i + 1}`);
  });
  $$(".line", bills).forEach((li, i) => {
    li.querySelector(".bname").setAttribute("aria-label", `Bill ${i + 1} name`);
    li.querySelector(".bamt").setAttribute("aria-label", `Bill ${i + 1} amount`);
    li.querySelector(".rm").setAttribute("aria-label", `Remove bill ${i + 1}`);
  });
}

let last = null;
function update() {
  const m = method();
  form.classList.toggle("no-weight", m === "equal");
  $("#wHead").textContent = COL[m] || "";
  $("#billsEqual").disabled = m === "days" || m === "equal";
  const errors = [];
  const money = el => { const raw = el.value.trim(); if (!raw) { el.removeAttribute("aria-invalid"); return 0; } const c = parseMoney(raw); const bad = c === null || c < 0; el.toggleAttribute("aria-invalid", bad); if (bad) errors.push(el); return bad ? 0 : c; };
  const rent = money($("#rent"));
  const billCents = $$(".bamt", bills).reduce((a, el) => a + money(el), 0);
  const ppl = $$(".line", people).map((li, i) => {
    const w = li.querySelector(".pw");
    const raw = w.value.trim().replace(/[$,]/g, "");
    const n = raw === "" ? NaN : Number(raw);
    const bad = m !== "equal" && raw !== "" && !(n >= 0);
    w.toggleAttribute("aria-invalid", bad);
    if (bad) errors.push(w);
    const val = Number.isFinite(n) && n >= 0 ? n : 0;
    return { name: li.querySelector(".pname").value.trim() || `Person ${i + 1}`, room: val, income: val, days: val };
  });
  const missing = m !== "equal" && ppl.every(p => p[m] === 0);
  $("#splitHint").textContent = errors.length ? "Check the highlighted boxes: amounts in dollars and cents, sizes and days as plain numbers." : missing && (rent || billCents) ? `Enter ${COL[m].toLowerCase()} for each person; until then everyone pays the same.` : "";
  const res = splitFlat({ rentCents: rent, billCents, people: ppl, method: m, billsEqual: $("#billsEqual").checked && !$("#billsEqual").disabled });
  last = res;
  const tbody = $("#splitTable tbody");
  tbody.replaceChildren();
  for (const p of res) {
    const tr = document.createElement("tr");
    for (const [t, cls] of [[p.name, ""], [formatMoney(p.rent), "num"], [formatMoney(p.bills), "num"], [formatMoney(p.total), "num"]]) { const td = document.createElement("td"); td.textContent = t; if (cls) td.className = cls; tr.append(td); }
    tbody.append(tr);
  }
  const sum = k => res.reduce((a, p) => a + p[k], 0);
  $("#tRent").textContent = formatMoney(sum("rent")); $("#tBills").textContent = formatMoney(sum("bills")); $("#tTotal").textContent = formatMoney(sum("total"));
  $("#vTotal").textContent = formatMoney(rent + billCents);
  $("#vEach").textContent = res.length ? formatMoney(Math.round((rent + billCents) / res.length)) : "$0.00";
  $("#perLabel").textContent = `per ${$("#per").value}`;
  $("#sr").textContent = res.map(p => `${p.name} ${formatMoney(p.total)}`).join(", ");
  history.replaceState(null, "", `#method=${m}`);
}

$("#splitCopy").addEventListener("click", () => {
  if (!last) return;
  copyText([`Flat split per ${$("#per").value} (${method()})`, ...last.map(p => `${p.name}: ${formatMoney(p.total)} (rent ${formatMoney(p.rent)}, bills ${formatMoney(p.bills)})`)].join("\n"));
});
$("#addPerson").addEventListener("click", () => addRow(people, "#personTpl")?.querySelector(".pname").focus());
$("#addBill").addEventListener("click", () => addRow(bills, "#billTpl")?.querySelector(".bname").focus());
const hm = new URLSearchParams(location.hash.slice(1)).get("method");
if (["equal", "room", "income", "days"].includes(hm)) form.querySelector(`input[name="method"][value="${hm}"]`).checked = true;
form.addEventListener("input", update);
form.addEventListener("change", relabel);
form.addEventListener("submit", e => e.preventDefault());
for (const li of $$(".line", people)) li.querySelector(".rm").addEventListener("click", () => { if (people.children.length > 2) li.remove(); relabel(); update(); });
for (const li of $$(".line", bills)) li.querySelector(".rm").addEventListener("click", () => { li.remove(); relabel(); update(); });
relabel();
update();

})();
