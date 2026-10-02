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

// print.js
// Print helpers shared by the printables. Page size comes from named @page rules in style.css
// (`.sheet.a4p` etc.). For browsers without named-page support, setPageSize() also adds a plain
// @page rule through the CSSOM (allowed by the CSP, unlike inline <style> or style attributes).

let rule = null;
function setPageSize(paper, orientation) {
  const size = `${paper === "letter" ? "letter" : "A4"} ${orientation}`;
  const margin = paper === "letter" ? "0.4in" : "10mm";
  try {
    const sheet = [...document.styleSheets].find(s => { try { return s.href && s.cssRules; } catch (e) { return false; } });
    if (!sheet) return;
    if (rule !== null) { sheet.deleteRule(rule); rule = null; }
    rule = sheet.insertRule(`@page { size: ${size}; margin: ${margin}; }`, sheet.cssRules.length);
  } catch (e) { /* the named @page rules still apply */ }
}

/** CSS classes for a sheet. */
const sheetClass = (paper, orientation) => `sheet ${paper === "letter" ? "letter" : ""} ${orientation === "landscape" ? "landscape" : ""} ${paper === "letter" ? "letter" : "a4"}${orientation === "landscape" ? "l" : "p"}`.replace(/\s+/g, " ").trim();

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

// calendar.js
// Printable calendar. Grids come from lib/dates.js; NZ holidays only for years in the MBIE data
// (embedded at build time). Settings go in the URL fragment.


const { $ } = window.ET;
const form = $("#calForm");
const holidays = JSON.parse(form.dataset.holidays);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const val = id => $(id).value;
const radio = n => form.querySelector(`input[name="${n}"]:checked`).value;

function holidayMap(year, region) {
  const m = new Map();
  for (const h of holidays.years[year]?.holidays || []) {
    if (h.scope !== "national" && h.scope !== region) continue;
    const add = (d, name) => m.set(d, [...(m.get(d) || []), name]);
    add(h.date, h.name);
    if (h.observedForMonFri !== h.date) add(h.observedForMonFri, `${h.name} (Mon–Fri day off)`);
  }
  return m;
}

function monthTable(y, mo, start, hol, { mini = false } = {}) {
  const t = el("table");
  const head = el("tr");
  for (let i = 0; i < 7; i++) head.append(el("th", "", mini ? DAYS[(start + i) % 7][0] : DAYS[(start + i) % 7]));
  t.append(el("thead")); t.tHead.append(head);
  const body = el("tbody");
  for (const week of monthGrid(y, mo, start)) {
    const tr = el("tr");
    for (const iso of week) {
      const td = el("td", iso ? "" : "out");
      if (iso) {
        const names = hol.get(iso);
        if (mini) { td.textContent = String(+iso.slice(8)); if (names) td.classList.add("h"); }
        else { td.append(el("span", "d", String(+iso.slice(8)))); for (const n of names || []) td.append(el("span", "hol", n)); }
      }
      tr.append(td);
    }
    body.append(tr);
  }
  t.append(body);
  return t;
}

function update() {
  const year = Math.trunc(Number(val("#calYear")));
  const okYear = year >= 1900 && year <= 2100;
  $("#calYear").toggleAttribute("aria-invalid", !okYear);
  $("#calHint").textContent = okYear ? "" : "Choose a year from 1900 to 2100.";
  if (!okYear) return;
  const view = radio("view"), paper = radio("paper"), orient = radio("orient");
  const start = Number(radio("start"));
  const region = val("#calRegion") || null;
  const notes = $("#calNotes").checked;
  const hasData = !!holidays.years[year];
  const hol = $("#calHol").checked && hasData ? holidayMap(String(year), region) : new Map();
  $("#calNoData").hidden = !$("#calHol").checked || hasData;
  $("#calNoData").textContent = `NZ holiday data isn't available for ${year}, so this calendar shows no holidays. Holiday dates are included for ${Object.keys(holidays.years).join(" and ")}.`;
  $("#monthField").hidden = view !== "month";
  setPageSize(paper, orient);
  const area = $("#printArea");
  area.replaceChildren();
  const cls = sheetClass(paper, orient);
  if (view === "year") {
    const s = el("section", cls);
    s.append(el("h2", "", String(year)));
    const grid = el("div", "year-grid");
    for (let m = 1; m <= 12; m++) { const box = el("div", "mini"); box.append(el("h3", "", MONTHS[m - 1]), monthTable(year, m, start, hol, { mini: true })); grid.append(box); }
    s.append(grid);
    if (hol.size) s.append(el("p", "legend", "Underlined dates are New Zealand public holidays" + (region ? " or the regional anniversary day" : "") + ", from Employment New Zealand's table."));
    area.append(s);
  } else {
    const months = view === "month" ? [Number(val("#calMonth"))] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (const m of months) {
      const s = el("section", cls);
      s.append(el("h2", "", `${MONTHS[m - 1]} ${year}`), monthTable(year, m, start, hol));
      if (notes) { const n = el("div", "notes"); for (let i = 0; i < 4; i++) n.append(el("div")); s.append(n); }
      if (hol.size) s.append(el("p", "foot-note", "Holidays from Employment New Zealand's table. Workplaces may observe some holidays on other days."));
      area.append(s);
    }
  }
  $("#calSummary").textContent = `${view === "year" ? "1 page" : view === "month" ? "1 page" : "12 pages"}, ${paper === "letter" ? "US Letter" : "A4"} ${orient}.`;
  history.replaceState(null, "", `#${new URLSearchParams({ y: year, v: view, m: val("#calMonth"), s: start, p: paper, o: orient, r: region || "", h: $("#calHol").checked ? 1 : 0, n: notes ? 1 : 0 })}`);
}

const p = new URLSearchParams(location.hash.slice(1));
const setRadio = (n, v) => { const r = form.querySelector(`input[name="${n}"][value="${v}"]`); if (r) r.checked = true; };
const now = new Date();
$("#calYear").value = /^\d{4}$/.test(p.get("y") || "") ? p.get("y") : String(now.getFullYear());
$("#calMonth").value = /^([1-9]|1[0-2])$/.test(p.get("m") || "") ? p.get("m") : String(now.getMonth() + 1);
for (const [k, n] of [["v", "view"], ["s", "start"], ["p", "paper"], ["o", "orient"]]) if (p.get(k)) setRadio(n, p.get(k));
if ([...$("#calRegion").options].some(o => o.value === p.get("r"))) $("#calRegion").value = p.get("r");
if (p.get("h") === "0") $("#calHol").checked = false;
if (p.get("n") === "1") $("#calNotes").checked = true;
$("#calPrint").addEventListener("click", () => window.print());
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();

})();
