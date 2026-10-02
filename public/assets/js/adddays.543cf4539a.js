(function () {
"use strict";
// dates.js
// Calendar arithmetic on whole days. Dates are "YYYY-MM-DD" strings handled as UTC day numbers,
// so daylight saving and time zones can never shift a result by a day.

const MS_DAY = 86400000;
const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysInMonth = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

/** Parse "YYYY-MM-DD" (years 1-9999) to a day number; null if it isn't a real date. */
function dayNumber(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  if (!m) return null;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  if (y < 1 || mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
  const t = Date.UTC(y, mo - 1, d);
  const date = new Date(t);
  date.setUTCFullYear(y); // Date.UTC treats years 0-99 as 1900-1999
  return Math.round(date.getTime() / MS_DAY);
}
function isoFromDay(n) {
  const d = new Date(n * MS_DAY);
  return `${String(d.getUTCFullYear()).padStart(4, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
const parts = iso => iso.split("-").map(Number);
/** 0 = Sunday ... 6 = Saturday */
const weekday = iso => new Date(dayNumber(iso) * MS_DAY).getUTCDay();

/** Days from a to b (b - a). With inclusive, both the start and end days count. */
function daysBetween(a, b, { inclusive = false } = {}) {
  const d = dayNumber(b) - dayNumber(a);
  return inclusive ? d + Math.sign(d || 1) : d;
}

/**
 * Calendar difference a -> b (a <= b) as { years, months, days }: the most whole months that fit
 * (using the same month-end rule as addPeriod), then the remaining days.
 */
function ymd(a, b) {
  const [y1, m1] = parts(a), [y2, m2] = parts(b);
  let months = (y2 - y1) * 12 + (m2 - m1);
  while (months > 0 && dayNumber(addPeriod(a, months, "months")) > dayNumber(b)) months -= 1;
  const days = dayNumber(b) - dayNumber(addPeriod(a, months, "months"));
  return { years: Math.floor(months / 12), months: months % 12, days };
}

/**
 * Add n days/weeks/months/years. Months and years keep the day of the month when it exists and
 * otherwise use the last day of the month (31 January + 1 month = 28 or 29 February).
 */
function addPeriod(iso, n, unit) {
  if (unit === "days") return isoFromDay(dayNumber(iso) + n);
  if (unit === "weeks") return isoFromDay(dayNumber(iso) + 7 * n);
  const [y, m, d] = parts(iso);
  const total = (y * 12 + (m - 1)) + (unit === "years" ? 12 * n : n);
  const ny = Math.floor(total / 12), nm = (total % 12) + 1;
  const day = Math.min(d, daysInMonth(ny, nm));
  return `${String(ny).padStart(4, "0")}-${String(nm).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Age on a date. leapRule: what a 29 February birthday counts as in other years ("feb28" | "mar1").
 * Returns { years, months, days, totalDays, nextBirthday, daysToNext }.
 */
function age(birth, on, { leapRule = "feb28" } = {}) {
  const [by, bm, bd] = parts(birth);
  const [oy] = parts(on);
  const birthdayIn = y => (bm === 2 && bd === 29 && !isLeap(y)) ? (leapRule === "mar1" ? `${y}-03-01` : `${y}-02-28`) : `${String(y).padStart(4, "0")}-${String(bm).padStart(2, "0")}-${String(bd).padStart(2, "0")}`;
  let years = oy - by;
  if (dayNumber(birthdayIn(oy)) > dayNumber(on)) years -= 1;
  const lastBirthday = birthdayIn(by + years);
  // Months and days since the last birthday.
  const rest = ymd(lastBirthday, on);
  let next = birthdayIn(by + years + 1);
  return { years, months: rest.months, days: rest.days, totalDays: dayNumber(on) - dayNumber(birth), nextBirthday: next, daysToNext: dayNumber(next) - dayNumber(on), nextAge: years + 1 };
}

/**
 * Working days (Monday-Friday) from start to end inclusive, excluding public holidays that a
 * Monday-to-Friday worker gets off: national ones plus the chosen region's anniversary day.
 * holidays: data/nz/public-holidays.json. Returns { days, weekdays, holidaysOff: [{date,name}], missingYears }.
 */
function workingDays(start, end, holidays, { region = null } = {}) {
  let a = dayNumber(start), b = dayNumber(end);
  if (a > b) [a, b] = [b, a];
  const off = new Map();
  const years = new Set();
  for (let n = a; n <= b; n += 1) years.add(isoFromDay(n).slice(0, 4));
  const missingYears = [...years].filter(y => !holidays.years[y]);
  for (const y of years) for (const h of holidays.years[y]?.holidays || []) {
    if (h.scope === "national" || h.scope === region) off.set(h.observedForMonFri, h.name);
  }
  let weekdays = 0, days = 0;
  const holidaysOff = [];
  for (let n = a; n <= b; n += 1) {
    const iso = isoFromDay(n), wd = new Date(n * MS_DAY).getUTCDay();
    if (wd === 0 || wd === 6) continue;
    weekdays += 1;
    if (off.has(iso)) holidaysOff.push({ date: iso, name: off.get(iso) });
    else days += 1;
  }
  return { days, weekdays, holidaysOff, missingYears };
}

/** Weeks of a month for a calendar: arrays of 7 ISO dates or null. weekStart 1 = Monday, 0 = Sunday. */
function monthGrid(year, month, weekStart = 1) {
  const first = weekday(`${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`);
  const lead = (first - weekStart + 7) % 7;
  const n = daysInMonth(year, month);
  const cells = [...Array(lead).fill(null), ...Array.from({ length: n }, (_, i) => `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`)];
  while (cells.length % 7) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// dateui.js
// Small helpers shared by the date tool pages (bundled into each page script).
function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/** "Friday 2 October 2026" (NZ style). */
function longDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(Date.UTC(2000, 0, 1));
  wd.setUTCFullYear(y, m - 1, d);
  return `${DAYS[wd.getUTCDay()]} ${d} ${MONTHS[m - 1]} ${y}`;
}
const plural = (n, word) => `${n.toLocaleString("en-NZ")} ${word}${Math.abs(n) === 1 ? "" : "s"}`;

// adddays.js
// Add or subtract days, weeks, months or years. Maths in lib/dates.js.


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

})();
