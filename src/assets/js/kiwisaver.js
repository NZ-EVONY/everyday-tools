// KiwiSaver calculator page. Contributions and the projection come from lib/kiwisaver.js using
// the tax-year data embedded at build time. The projection only runs when the visitor enters
// their own return assumption: no default return is assumed. Nothing typed is stored or sent.
import { parseMoney, formatMoney } from "../lib/money.js";
import { yearlyContributions, project } from "../lib/kiwisaver.js";

const { $, copyText } = window.ET;
const form = $("#ksForm");
const tax = JSON.parse(form.dataset.tax);
const set = (id, t) => { $(id).textContent = t; };
const pctIn = id => { const raw = $(id).value.trim(); if (raw === "") return null; const n = Number(raw); const bad = !Number.isFinite(n) || n < -50 || n > 50; $(id).toggleAttribute("aria-invalid", bad); return bad ? NaN : n / 100; };
const moneyIn = id => { const raw = $(id).value.trim(); if (raw === "") { $(id).removeAttribute("aria-invalid"); return 0; } const c = parseMoney(raw); const bad = c === null || c < 0; $(id).toggleAttribute("aria-invalid", bad); return bad ? NaN : c; };

let last = null;
function update() {
  const salary = moneyIn("#ksSalary"), voluntary = moneyIn("#ksVol"), start = moneyIn("#ksStart"), fixedFee = moneyIn("#ksFeeFixed");
  const employerRate = pctIn("#ksEmployer");
  const ret = pctIn("#ksReturn"), fee = pctIn("#ksFee");
  const yearsRaw = $("#ksYears").value.trim();
  const years = yearsRaw === "" ? 0 : Math.floor(Number(yearsRaw));
  const badYears = yearsRaw !== "" && !(years >= 1 && years <= 60);
  $("#ksYears").toggleAttribute("aria-invalid", badYears);
  const bad = [salary, voluntary, start, fixedFee, employerRate, ret, fee].some(Number.isNaN) || badYears;
  set("#ksHint", bad ? "Check the highlighted boxes. Percentages are plain numbers, such as 3.5." : "");
  const y = yearlyContributions(Number.isNaN(salary) ? 0 : salary, {
    employeeRate: Number(form.elements.rate.value), employerRate: employerRate ?? tax.kiwisaver.employerMinimumRate,
    voluntaryCents: Number.isNaN(voluntary) ? 0 : voluntary, eligibleForGovernment: $("#ksGov").checked,
  }, tax);
  set("#vYou", formatMoney(y.member));
  set("#vEmp", formatMoney(y.employerNet));
  set("#vEmpK", `${formatMoney(y.employerGross)} before ESCT at ${(y.esctRate * 100).toFixed(1)}%`);
  set("#vGov", formatMoney(y.government));
  set("#vGovK", !$("#ksGov").checked ? "Not eligible (as entered)" : !y.incomeOk ? "Income over the limit" : y.government >= Math.round(tax.kiwisaver.government.maxAnnual * 100) ? "The yearly maximum" : `${tax.kiwisaver.government.perDollar * 100}c per $1 you put in`);
  set("#vTotal", formatMoney(y.total));
  const proj = $("#ksProjection");
  const canProject = ret !== null && !Number.isNaN(ret) && years >= 1 && !bad;
  proj.hidden = !canProject;
  $("#ksNoProj").hidden = canProject;
  let rows = [];
  if (canProject) {
    rows = project({ startCents: start, yearlyCents: y.total, years, returnRate: ret, feeRate: fee ?? 0, fixedFeeCents: fixedFee });
    const end = rows.at(-1);
    set("#vEnd", formatMoney(end.balance));
    set("#vEndK", `After ${years} year${years === 1 ? "" : "s"}, in today's dollars only if prices don't rise`);
    const tbody = proj.querySelector("tbody");
    tbody.replaceChildren();
    for (const r of rows.filter(r => r.year % 5 === 0 || r.year === years || r.year === 1)) {
      const tr = document.createElement("tr");
      for (const [t, c] of [[`Year ${r.year}`, ""], [formatMoney(r.paidIn), "num"], [formatMoney(r.growth), "num"], [formatMoney(r.balance), "num"]]) { const td = document.createElement("td"); td.textContent = t; if (c) td.className = c; tr.append(td); }
      tbody.append(tr);
    }
  }
  last = { y, rows };
  set("#sr", `Total going in each year ${formatMoney(y.total)}.${canProject ? ` Illustrative balance after ${years} years ${formatMoney(rows.at(-1).balance)}.` : ""}`);
}

$("#ksCopy").addEventListener("click", () => {
  if (!last) return;
  const { y, rows } = last;
  copyText([`KiwiSaver per year: you ${formatMoney(y.member)}, employer after ESCT ${formatMoney(y.employerNet)}, government ${formatMoney(y.government)}, total ${formatMoney(y.total)}.`, rows.length ? `Illustrative balance after ${rows.length} years: ${formatMoney(rows.at(-1).balance)} (not a forecast).` : ""].filter(Boolean).join("\n"));
});
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();
