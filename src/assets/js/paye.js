// Take-home pay page. The method (IRD's payroll specification) lives in lib/paye.js and is
// unit-tested against IRD's tables; this file reads the form and shows the results. The pay
// amount is never stored or put in the URL; only the settings go in the fragment.
import { parseMoney, formatMoney } from "../lib/money.js";
import { takeHome, PERIODS } from "../lib/paye.js";

const { $, copyText } = window.ET;
const form = $("#payForm");
const tax = JSON.parse(form.dataset.tax);
const PER = { year: 1, week: 52, fortnight: 26, fourWeeks: 13, month: 12 };
const LABEL = { weekly: "week", fortnightly: "fortnight", fourWeekly: "four weeks", monthly: "month" };
const val = name => form.elements[name].value;
const radio = name => form.querySelector(`input[name="${name}"]:checked`).value;
const set = (id, t) => { $(id).textContent = t; };
const pct = x => `${(x * 100).toFixed(1)}%`;

let last = null;
function update() {
  const raw = $("#payAmount").value.trim();
  const cents = raw ? parseMoney(raw) : 0;
  const bad = raw && (cents === null || cents < 0 || cents > 100000000 * 100);
  $("#payAmount").toggleAttribute("aria-invalid", !!bad);
  set("#payHint", bad ? "Enter your pay in dollars, such as 65000 or 1,250.50." : "");
  const period = radio("period");
  const per = val("per");
  const code = val("code");
  const secondary = code !== "M" && code !== "ME";
  // Convert what was typed (per year/week/...) into pay for one pay period, to the cent.
  const periodGross = bad ? 0 : Math.round(((cents || 0) * PER[per]) / PERIODS[period]);
  const ksRate = Number(val("ks"));
  const r = takeHome(periodGross, { period, code, studentLoan: form.elements.sl.checked, kiwisaverRate: ksRate }, tax);
  last = r;
  const each = LABEL[period];
  set("#rGross", formatMoney(r.gross)); set("#rGrossK", `Before tax, per ${each}`);
  set("#rPaye", formatMoney(r.paye)); set("#rPayeK", `Income tax ${formatMoney(r.incomeTax)} + ACC levy ${formatMoney(r.acc)}`);
  set("#rSl", formatMoney(r.studentLoan)); $("#rowSl").hidden = !form.elements.sl.checked;
  set("#rKs", formatMoney(r.kiwisaver)); set("#rKsK", ksRate ? `${+(ksRate * 100).toFixed(1)}% of gross pay` : "Not a member"); $("#rowKs").hidden = !ksRate;
  set("#rNet", formatMoney(r.net)); set("#rNetK", `Per ${each}`);
  set("#tPer", `Per ${each}`);
  for (const [k, id] of [["gross", "#aGross"], ["paye", "#aPaye"], ["studentLoan", "#aSl"], ["kiwisaver", "#aKs"], ["net", "#aNet"]]) {
    set(id, formatMoney(r.annual[k]));
    set(id.replace("#a", "#p"), formatMoney(k === "net" ? r.net : r[k]));
  }
  set("#effRate", r.gross ? `Tax and ACC take ${pct(r.paye / r.gross)} of your pay${r.studentLoan ? `; with student loan, ${pct(r.effectiveRate)}` : ""}.` : "");
  const emp = $("#employer");
  emp.hidden = !r.employer || !r.gross;
  if (r.employer) set("#employerText", `Your employer adds at least ${formatMoney(r.employer.gross)} per ${each} to your KiwiSaver on top of your pay. After employer superannuation contribution tax (ESCT) at ${pct(r.employer.esctRate)}, ${formatMoney(r.employer.net)} reaches your account.`);
  $("#meNote").hidden = code !== "ME";
  $("#secNote").hidden = !secondary;
  set("#sr", r.gross ? `Take-home pay ${formatMoney(r.net)} per ${each}.` : "");
  // Settings only (never the amount) in the fragment.
  const frag = new URLSearchParams({ per, period, code, ks: String(ksRate), sl: form.elements.sl.checked ? "1" : "0" }).toString();
  history.replaceState(null, "", `#${frag}`);
}

function restore() {
  const p = new URLSearchParams(location.hash.slice(1));
  const pick = (name, ok) => { const v = p.get(name); if (v !== null && ok(v)) form.elements[name].value = v; };
  pick("per", v => v in PER);
  pick("code", v => ["M", "ME", "SB", "S", "SH", "ST", "SA"].includes(v));
  pick("ks", v => ["0", ...tax.kiwisaver.employeeRates.map(String)].includes(v));
  const period = p.get("period");
  if (period in PERIODS) form.querySelector(`input[name="period"][value="${period}"]`).checked = true;
  if (p.get("sl") === "1") form.elements.sl.checked = true;
}

$("#payCopy").addEventListener("click", () => {
  if (!last || !last.gross) return;
  const r = last, each = LABEL[r.period];
  copyText([`Per ${each}: gross ${formatMoney(r.gross)}`, `PAYE incl. ACC: ${formatMoney(r.paye)}`, r.studentLoan ? `Student loan: ${formatMoney(r.studentLoan)}` : "", r.kiwisaver ? `KiwiSaver: ${formatMoney(r.kiwisaver)}` : "", `Take-home: ${formatMoney(r.net)}`, `Per year: take-home ${formatMoney(r.annual.net)}`, `Estimate for the ${tax.taxYear} tax year.`].filter(Boolean).join("\n"));
});
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
restore();
update();
