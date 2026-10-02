// Add or subtract days, weeks, months or years. Maths in lib/dates.js.
import { dayNumber, addPeriod } from "../lib/dates.js";
import { todayLocal, longDay } from "../lib/dateui.js";

const { $, copyText } = window.ET;
const form = $("#addForm");
let last = "";
function update() {
  const start = $("#adStart").value;
  const raw = $("#adN").value.trim();
  const n = raw === "" ? 0 : Number(raw);
  const bad = raw !== "" && (!Number.isInteger(n) || Math.abs(n) > 100000);
  $("#adN").toggleAttribute("aria-invalid", bad);
  $("#adHint").textContent = bad ? "Enter a whole number, up to 100,000." : "";
  if (dayNumber(start) === null || bad) { $("#vResult").textContent = "–"; return; }
  const unit = $("#adUnit").value;
  const sign = form.querySelector('input[name="dir"]:checked').value === "sub" ? -1 : 1;
  const out = addPeriod(start, sign * n, unit);
  if (dayNumber(out) === null || out < "0001-01-01" || out > "9999-12-31") { $("#vResult").textContent = "Out of range"; return; }
  $("#vResult").textContent = longDay(out);
  const [, , d] = start.split("-").map(Number);
  const clamped = (unit === "months" || unit === "years") && Number(out.slice(8)) !== d;
  $("#adClamp").hidden = !clamped;
  last = `${longDay(start)} ${sign > 0 ? "+" : "−"} ${n} ${unit} = ${longDay(out)}`;
  $("#vSentence").textContent = last;
  $("#sr").textContent = last;
  history.replaceState(null, "", `#${unit}-${sign > 0 ? "add" : "sub"}`);
}
const [hu, hd] = location.hash.slice(1).split("-");
if (["days", "weeks", "months", "years"].includes(hu)) $("#adUnit").value = hu;
if (hd === "sub") form.querySelector('input[value="sub"]').checked = true;
$("#adStart").value = todayLocal();
$("#adCopy").addEventListener("click", () => last && copyText(last));
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();
