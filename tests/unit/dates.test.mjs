import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers.mjs";
import { dayNumber, isoFromDay, daysBetween, ymd, addPeriod, age, workingDays, monthGrid, isLeap, weekday, daysInMonth } from "../../src/assets/lib/dates.js";
import { offsetMinutes, zonedToInstant, remaining, formatOffset } from "../../src/assets/lib/tz.js";

const holidays = readJson("data/nz/public-holidays.json");
const dst = readJson("data/nz/daylight-saving.json");

test("leap years and month lengths, including century rules", () => {
  assert.ok(isLeap(2024) && isLeap(2000) && isLeap(2400));
  assert.ok(!isLeap(1900) && !isLeap(2100) && !isLeap(2026));
  assert.equal(daysInMonth(2028, 2), 29);
  assert.equal(daysInMonth(2100, 2), 28);
  assert.equal(dayNumber("2026-02-29"), null);
  assert.equal(dayNumber("2026-13-01"), null);
  assert.equal(isoFromDay(dayNumber("1900-03-01")), "1900-03-01");
});

test("known weekdays", () => {
  assert.equal(weekday("2026-10-02"), 5);      // Friday
  assert.equal(weekday("2027-04-25"), 0);      // Sunday
  assert.equal(weekday("2000-01-01"), 6);      // Saturday
  assert.equal(weekday("1900-01-01"), 1);      // Monday
});

test("days between: exclusive and inclusive, across leap days", () => {
  assert.equal(daysBetween("2026-10-02", "2026-12-25"), 84);
  assert.equal(daysBetween("2026-10-02", "2026-12-25", { inclusive: true }), 85);
  assert.equal(daysBetween("2028-02-28", "2028-03-01"), 2);
  assert.equal(daysBetween("2026-01-01", "2027-01-01"), 365);
  assert.equal(daysBetween("2028-01-01", "2029-01-01"), 366);
  assert.equal(daysBetween("2026-05-05", "2026-05-05", { inclusive: true }), 1);
  assert.equal(daysBetween("2026-12-25", "2026-10-02"), -84);
});

test("calendar difference and month-end arithmetic", () => {
  assert.deepEqual(ymd("2026-01-31", "2026-03-01"), { years: 0, months: 1, days: 1 });
  assert.deepEqual(ymd("2020-02-29", "2026-10-02"), { years: 6, months: 7, days: 3 });
  assert.equal(addPeriod("2026-01-31", 1, "months"), "2026-02-28");
  assert.equal(addPeriod("2028-01-31", 1, "months"), "2028-02-29");
  assert.equal(addPeriod("2028-02-29", 1, "years"), "2029-02-28");
  assert.equal(addPeriod("2026-10-02", -3, "months"), "2026-07-02");
  assert.equal(addPeriod("2026-12-31", 2, "weeks"), "2027-01-14");
  assert.equal(addPeriod("2026-03-01", -1, "days"), "2026-02-28");
});

test("age, including 29 February birthdays", () => {
  const a = age("1990-06-15", "2026-10-02");
  assert.deepEqual([a.years, a.months, a.days, a.nextBirthday, a.nextAge], [36, 3, 17, "2027-06-15", 37]);
  assert.equal(age("2000-02-29", "2026-02-27").years, 25);
  assert.equal(age("2000-02-29", "2026-02-28").years, 26, "feb28 rule");
  assert.equal(age("2000-02-29", "2026-02-28", { leapRule: "mar1" }).years, 25);
  assert.equal(age("2000-02-29", "2026-03-01", { leapRule: "mar1" }).years, 26);
  assert.equal(age("2000-02-29", "2028-02-29").years, 28);
});

test("working days use MBIE's Monday-to-Friday observed dates", () => {
  // Easter 2026: Good Friday 3 April, Easter Monday 6 April. Week 30 March - 10 April: 10 weekdays, 2 holidays.
  const e = workingDays("2026-03-30", "2026-04-10", holidays);
  assert.equal(e.weekdays, 10);
  assert.equal(e.days, 8);
  // Anzac Day 2026 is a Saturday; Monday 27 April is the Mon-Fri observed date.
  assert.deepEqual(workingDays("2026-04-27", "2026-04-27", holidays).holidaysOff, [{ date: "2026-04-27", name: "Anzac Day" }]);
  // Boxing Day 2026 (Saturday) -> Monday 28 December.
  assert.equal(workingDays("2026-12-28", "2026-12-28", holidays).days, 0);
  // Regional anniversary only counts when that region is chosen.
  assert.equal(workingDays("2026-01-26", "2026-01-26", holidays).days, 1);
  assert.equal(workingDays("2026-01-26", "2026-01-26", holidays, { region: "auckland" }).days, 0);
  assert.deepEqual(workingDays("2028-01-01", "2028-01-31", holidays).missingYears, ["2028"]);
});

test("calendar grid: first weekday and days per month", () => {
  const g = monthGrid(2026, 10, 1); // October 2026 starts on a Thursday
  assert.deepEqual(g[0].slice(0, 4), [null, null, null, "2026-10-01"]);
  assert.equal(g.flat().filter(Boolean).length, 31);
  const s = monthGrid(2026, 2, 0); // February 2026 starts on a Sunday
  assert.equal(s[0][0], "2026-02-01");
  assert.equal(s.length, 4);
  assert.equal(monthGrid(2028, 2, 1).flat().filter(Boolean).length, 29);
});

test("NZ daylight saving changeovers match DIA's dates (Intl time-zone data)", () => {
  const z = "Pacific/Auckland";
  for (const p of dst.periods) {
    const [sd] = p.starts.split("T"), [ed] = p.ends.split("T");
    // Just before and after 2am NZST on the start day: +12 then +13.
    const startUtc = Date.UTC(+sd.slice(0, 4), +sd.slice(5, 7) - 1, +sd.slice(8, 10), 2) - 12 * 3600000;
    assert.equal(offsetMinutes(startUtc - 60000, z), 720, `${sd} before`);
    assert.equal(offsetMinutes(startUtc + 60000, z), 780, `${sd} after`);
    const endUtc = Date.UTC(+ed.slice(0, 4), +ed.slice(5, 7) - 1, +ed.slice(8, 10), 3) - 13 * 3600000;
    assert.equal(offsetMinutes(endUtc - 60000, z), 780, `${ed} before`);
    assert.equal(offsetMinutes(endUtc + 60000, z), 720, `${ed} after`);
  }
  assert.equal(zonedToInstant("2026-09-27", "02:30", z).status, "gap");
  assert.equal(zonedToInstant("2027-04-04", "02:30", z).status, "overlap");
  const ok = zonedToInstant("2026-12-25", "09:00", z);
  assert.equal(ok.status, "ok");
  assert.equal(new Date(ok.ms).toISOString(), "2026-12-24T20:00:00.000Z");
  assert.equal(formatOffset(780), "UTC+13");
  assert.equal(formatOffset(-570), "UTC−9:30");
});

test("countdown remaining time", () => {
  assert.deepEqual(remaining(90061000, 0), { days: 1, hours: 1, minutes: 1, seconds: 1, done: false });
  assert.equal(remaining(0, 5).done, true);
});

test("2027 holiday dates agree with the rules MBIE states (the table has no year heading)", () => {
  const h = Object.fromEntries(holidays.years["2027"].holidays.map(x => [x.scope === "national" ? x.name : x.scope, x]));
  const nth = (y, m, wd, n) => { for (let d = 1, c = 0; d <= 31; d++) { const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; if (weekday(iso) === wd && ++c === n) return iso; } };
  assert.equal(h["King's Birthday"].date, nth(2027, 6, 1, 1), "first Monday in June");
  assert.equal(h["Labour Day"].date, nth(2027, 10, 1, 4), "fourth Monday in October");
  assert.equal(h.taranaki.observedForMonFri, nth(2027, 3, 1, 2), "Taranaki: second Monday in March");
  assert.equal(h["south-canterbury"].observedForMonFri, nth(2027, 9, 1, 4), "South Canterbury: fourth Monday in September");
  assert.equal(h["hawkes-bay"].observedForMonFri, addPeriod(h["Labour Day"].date, -3, "days"), "Hawke's Bay: Friday before Labour Day");
  assert.equal(h.marlborough.observedForMonFri, addPeriod(h["Labour Day"].date, 7, "days"), "Marlborough: first Monday after Labour Day");
  // Easter 2027 is Sunday 28 March (Gregorian computus): Good Friday, Easter Monday, Southland's Easter Tuesday.
  assert.equal(h["Good Friday"].date, "2027-03-26");
  assert.equal(h["Easter Monday"].date, "2027-03-29");
  assert.equal(h.southland.observedForMonFri, "2027-03-30");
  assert.equal(weekday("2027-04-25"), 0, "Anzac Day 2027 is a Sunday (MBIE's label says Saturday)");
  assert.equal(h["Anzac Day"].observedForMonFri, "2027-04-26");
});

test("Easter dates from the Gregorian computus match the holiday data", () => {
  const easter = y => { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), hh = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - hh - k) % 7, m = Math.floor((a + 11 * hh + 22 * l) / 451), mo = Math.floor((hh + l - 7 * m + 114) / 31), da = ((hh + l - 7 * m + 114) % 31) + 1; return `${y}-${String(mo).padStart(2, "0")}-${String(da).padStart(2, "0")}`; };
  for (const y of Object.keys(holidays.years)) {
    const gf = holidays.years[y].holidays.find(x => x.name === "Good Friday").date;
    assert.equal(addPeriod(gf, 2, "days"), easter(+y), y);
  }
});
