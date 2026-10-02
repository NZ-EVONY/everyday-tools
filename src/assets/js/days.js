// Days between dates. Maths in lib/dates.js; dates typed stay on the page (only the
// inclusive/exclusive choice goes in the fragment).
import { dayNumber, daysBetween, ymd } from "../lib/dates.js";
import { todayLocal, longDay, plural } from "../lib/dateui.js";

const { $, copyText } = window.ET;
const form = $("#daysForm");
let last = "";
function update() {
  const a = $("#dFrom").value, b = $("#dTo").value;
  const incl = $("#dIncl").checked;
  const ok = dayNumber(a) !== null && dayNumber(b) !== null;
  $("#dHint").textContent = (a && b && !ok) ? "Enter both dates in full." : "";
  if (!ok) { $("#vDays").textContent = "–"; return; }
  const [s, e] = dayNumber(a) <= dayNumber(b) ? [a, b] : [b, a];
  const n = daysBetween(s, e, { inclusive: incl });
  const w = Math.floor(n / 7), r = n % 7;
  const c = ymd(s, e);
  $("#vDays").textContent = n.toLocaleString("en-NZ");
  $("#vDaysK").textContent = incl ? "days, counting both dates" : "days, not counting the start date";
  $("#vWeeks").textContent = `${plural(w, "week")}${r ? ` ${plural(r, "day")}` : ""}`;
  $("#vCal").textContent = [c.years && plural(c.years, "year"), c.months && plural(c.months, "month"), plural(c.days, "day")].filter(Boolean).join(", ");
  $("#vRange").textContent = `${longDay(s)} to ${longDay(e)}${dayNumber(a) > dayNumber(b) ? " (dates swapped)" : ""}`;
  last = `${longDay(s)} to ${longDay(e)}: ${n} days${incl ? " (inclusive)" : ""}`;
  $("#sr").textContent = last;
  history.replaceState(null, "", incl ? "#inclusive" : location.pathname);
}
if (location.hash === "#inclusive") $("#dIncl").checked = true;
$("#dFrom").value = todayLocal();
$("#dToday").addEventListener("click", () => { $("#dFrom").value = todayLocal(); update(); });
$("#dCopy").addEventListener("click", () => last && copyText(last));
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();
