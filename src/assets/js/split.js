// Flatmate rent and bills splitter. The rounding (largest remainder, to the cent) is in
// lib/split.js. Names and amounts stay on the page; only the split method goes in the fragment.
import { parseMoney, formatMoney } from "../lib/money.js";
import { splitFlat } from "../lib/split.js";

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
