// Working days calculator. Holiday data (MBIE) is embedded at build time; the count is in
// lib/dates.js. Only the chosen region goes in the fragment.
import { dayNumber, daysBetween, workingDays } from "../lib/dates.js";
import { todayLocal, longDay, plural } from "../lib/dateui.js";

const { $, copyText } = window.ET;
const form = $("#wdForm");
const holidays = JSON.parse(form.dataset.holidays);
let last = "";
function update() {
  const a = $("#wFrom").value, b = $("#wTo").value;
  const region = $("#wRegion").value || null;
  history.replaceState(null, "", region ? `#${region}` : location.pathname);
  if (dayNumber(a) === null || dayNumber(b) === null) { $("#vWork").textContent = "–"; return; }
  const [s, e] = dayNumber(a) <= dayNumber(b) ? [a, b] : [b, a];
  if (daysBetween(s, e) > 3660) { $("#wHint").textContent = "Choose a range of ten years or less."; return; }
  $("#wHint").textContent = "";
  const r = workingDays(s, e, holidays, { region });
  const missing = r.missingYears.length > 0;
  $("#wMissing").hidden = !missing;
  $("#wMissing").textContent = missing ? `Holiday data not available for ${r.missingYears.join(", ")}. ${$("#wAccept").checked ? "Those years count weekends only." : "Tick the box below to count weekends only for those years."}` : "";
  $("#wAcceptRow").hidden = !missing;
  const show = !missing || $("#wAccept").checked;
  $("#vWork").textContent = show ? r.days.toLocaleString("en-NZ") : "–";
  $("#vWorkK").textContent = `Monday to Friday, ${longDay(s)} to ${longDay(e)}, both included`;
  $("#vWeekdays").textContent = r.weekdays.toLocaleString("en-NZ");
  $("#vHol").textContent = r.holidaysOff.length.toLocaleString("en-NZ");
  const list = $("#wList");
  list.replaceChildren();
  for (const h of r.holidaysOff) { const li = document.createElement("li"); li.textContent = `${longDay(h.date)}: ${h.name}`; list.append(li); }
  $("#wListBox").hidden = !r.holidaysOff.length;
  last = show ? `${plural(r.days, "working day")} from ${longDay(s)} to ${longDay(e)}${region ? ` (${$("#wRegion").selectedOptions[0].textContent})` : ""}` : "";
  $("#sr").textContent = last;
}
const hr = location.hash.slice(1);
if ([...$("#wRegion").options].some(o => o.value === hr)) $("#wRegion").value = hr;
$("#wFrom").value = todayLocal();
$("#wCopy").addEventListener("click", () => last && copyText(last));
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();
