(function () {
"use strict";
// tz.js
// Time zones through the browser's built-in Intl data (no network). Converts a wall-clock time
// in one IANA zone to an instant, and formats instants in other zones.

/** Offset of `zone` from UTC at instant `ms`, in minutes (NZDT = +780). */
function offsetMinutes(ms, zone) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).filter(x => x.type !== "literal").map(x => [x.type, +x.value]));
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
}

/**
 * The instant for a wall-clock date ("YYYY-MM-DD") and time ("HH:MM") in `zone`.
 * Returns { ms, status: "ok" | "gap" | "overlap" }. In a spring-forward gap the time doesn't exist
 * and the result moves forward by the gap; in an autumn overlap the earlier (daylight) instant is used.
 */
function zonedToInstant(date, time, zone) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const candidates = new Set();
  for (const guess of [wall - 14 * 3600000, wall, wall + 14 * 3600000]) {
    const off = offsetMinutes(guess, zone);
    const ms = wall - off * 60000;
    if (offsetMinutes(ms, zone) === off) candidates.add(ms);
  }
  const list = [...candidates].sort((a, b) => a - b);
  if (list.length === 0) {
    const before = offsetMinutes(wall - 86400000, zone);
    return { ms: wall - before * 60000, status: "gap" };
  }
  return { ms: list[0], status: list.length > 1 ? "overlap" : "ok" };
}

function formatInZone(ms, zone, { withDate = true } = {}) {
  return new Intl.DateTimeFormat("en-NZ", { timeZone: zone, weekday: withDate ? "short" : undefined, day: withDate ? "numeric" : undefined, month: withDate ? "short" : undefined, year: withDate ? "numeric" : undefined, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(ms));
}

function formatOffset(min) {
  const s = min < 0 ? "−" : "+";
  const a = Math.abs(min);
  return `UTC${s}${Math.floor(a / 60)}${a % 60 ? ":" + String(a % 60).padStart(2, "0") : ""}`;
}

/** Days, hours, minutes and seconds left until `ms` from `now` (all zero once passed). */
function remaining(ms, now) {
  let s = Math.max(0, Math.floor((ms - now) / 1000));
  const days = Math.floor(s / 86400); s -= days * 86400;
  const hours = Math.floor(s / 3600); s -= hours * 3600;
  const minutes = Math.floor(s / 60); s -= minutes * 60;
  return { days, hours, minutes, seconds: s, done: ms <= now };
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

// timezones.js
// Time zone converter. Uses the browser's Intl time-zone data only (no network). Settings (zones)
// go in the fragment; the time typed does not.


const { $, $$, copyText } = window.ET;
const form = $("#tzForm");
const FALLBACK = JSON.parse(form.dataset.zones);
let zones = FALLBACK;
try { if (Intl.supportedValuesOf) zones = Intl.supportedValuesOf("timeZone"); } catch (e) { zones = FALLBACK; }
const valid = z => { try { new Intl.DateTimeFormat("en", { timeZone: z }); return true; } catch (e) { return false; } };
const list = $("#tzZones");
list.replaceChildren(...zones.map(z => new Option(z.replace(/_/g, " "), z)));

let last = "";
function update() {
  const from = $("#tzFrom").value, to = $("#tzTo").value;
  const okZones = valid(from) && valid(to);
  $("#tzHint").textContent = okZones ? "" : "Pick a time zone from the list, for example Pacific/Auckland or Europe/London.";
  const d = $("#tzDate").value, t = $("#tzTime").value;
  if (!okZones || !d || !t) { $("#vTo").textContent = "–"; return; }
  const r = zonedToInstant(d, t, from);
  const offF = offsetMinutes(r.ms, from), offT = offsetMinutes(r.ms, to);
  $("#vFrom").textContent = formatInZone(r.ms, from);
  $("#vFromK").textContent = `${from.replace(/_/g, " ")} (${formatOffset(offF)})`;
  $("#vTo").textContent = formatInZone(r.ms, to);
  $("#vToK").textContent = `${to.replace(/_/g, " ")} (${formatOffset(offT)})`;
  const diff = (offT - offF) / 60;
  $("#vDiff").textContent = diff === 0 ? "Same time" : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} hours`;
  $("#tzNote").hidden = r.status === "ok";
  $("#tzNote").textContent = r.status === "gap" ? "That time doesn't exist in the first zone: the clocks jump forward an hour that night. The result uses the first valid time after it." : r.status === "overlap" ? "That time happens twice in the first zone because the clocks go back an hour that night. The result uses the first (daylight saving) one." : "";
  last = `${$("#vFrom").textContent} ${from} = ${$("#vTo").textContent} ${to}`;
  $("#sr").textContent = last;
  history.replaceState(null, "", `#${new URLSearchParams({ from, to })}`);
}
const p = new URLSearchParams(location.hash.slice(1));
if (p.get("from") && valid(p.get("from"))) $("#tzFrom").value = p.get("from");
if (p.get("to") && valid(p.get("to"))) $("#tzTo").value = p.get("to");
$("#tzDate").value = todayLocal();
const now = new Date();
$("#tzTime").value = `${String(now.getHours()).padStart(2, "0")}:00`;
for (const b of $$("[data-zone]")) b.addEventListener("click", () => { $("#tzTo").value = b.dataset.zone; update(); });
$("#tzSwap").addEventListener("click", () => { const a = $("#tzFrom").value; $("#tzFrom").value = $("#tzTo").value; $("#tzTo").value = a; update(); });
$("#tzCopy").addEventListener("click", () => last && copyText(last));
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();

})();
