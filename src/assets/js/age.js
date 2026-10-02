// Age calculator. Maths in lib/dates.js. Nothing typed is stored or put in the URL.
import { dayNumber, age } from "../lib/dates.js";
import { todayLocal, longDay, plural } from "../lib/dateui.js";

const { $, copyText } = window.ET;
const form = $("#ageForm");
let last = "";
function update() {
  const b = $("#aBirth").value, on = $("#aOn").value;
  const ok = dayNumber(b) !== null && dayNumber(on) !== null;
  const future = ok && dayNumber(b) > dayNumber(on);
  $("#aHint").textContent = future ? "The date of birth is after the 'age on' date." : "";
  if (!ok || future) { $("#vAge").textContent = "–"; $("#vNext").textContent = "–"; $("#vAlive").textContent = "–"; return; }
  const r = age(b, on, { leapRule: form.querySelector('input[name="leap"]:checked').value });
  $("#vAge").textContent = plural(r.years, "year");
  $("#vAgeK").textContent = `${plural(r.months, "month")} and ${plural(r.days, "day")} more`;
  $("#vNext").textContent = r.daysToNext === 0 ? "Today" : plural(r.daysToNext, "day");
  $("#vNextK").textContent = `Turns ${r.nextAge} on ${longDay(r.nextBirthday)}`;
  $("#vAlive").textContent = r.totalDays.toLocaleString("en-NZ");
  $("#leapRow").hidden = !b.endsWith("-02-29");
  last = `Age on ${longDay(on)}: ${r.years} years, ${r.months} months, ${r.days} days`;
  $("#sr").textContent = last;
}
$("#aOn").value = todayLocal();
$("#aCopy").addEventListener("click", () => last && copyText(last));
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();
