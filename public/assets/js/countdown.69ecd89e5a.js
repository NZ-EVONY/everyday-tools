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

// countdown.js
// Countdown timer. The date, time and zone live in the URL fragment so a countdown can be
// bookmarked or shared; the optional label is typed text, so it stays on the page and is never
// put in the URL.
// The ticking stops while the tab is hidden and moves once a minute with reduced motion.

const { $, copyText } = window.ET;
const form = $("#cdForm");
const valid = z => { try { new Intl.DateTimeFormat("en", { timeZone: z }); return true; } catch (e) { return false; } };
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let target = null, timer = null;

function paint() {
  if (target === null) return;
  const r = remaining(target, Date.now());
  for (const k of ["days", "hours", "minutes", "seconds"]) $(`#c-${k}`).textContent = String(r[k]).padStart(k === "days" ? 1 : 2, "0");
  $("#cdDone").hidden = !r.done;
  if (r.done) { stop(); $("#sr").textContent = "That moment has arrived."; }
}
function stop() { clearInterval(timer); timer = null; }
function start() { stop(); if (target !== null && !document.hidden) { paint(); timer = setInterval(paint, reduce ? 60000 : 1000); } }

function update() {
  const d = $("#cdDate").value, t = $("#cdTime").value || "00:00", z = $("#cdZone").value;
  const okZone = valid(z);
  $("#cdHint").textContent = okZone ? "" : "Pick a time zone from the list.";
  if (!d || !okZone) { target = null; stop(); return; }
  target = zonedToInstant(d, t, z).ms;
  const label = $("#cdLabel").value.trim();
  $("#cdTitle").textContent = label || "Countdown";
  $("#cdWhen").textContent = new Intl.DateTimeFormat("en-NZ", { timeZone: z, dateStyle: "full", timeStyle: "short" }).format(new Date(target)) + ` (${z.replace(/_/g, " ")})`;
  history.replaceState(null, "", `#${new URLSearchParams({ d, t, z })}`);
  const r = remaining(target, Date.now());
  $("#sr").textContent = r.done ? "That moment has arrived." : `Counting down: ${r.days} days, ${r.hours} hours and ${r.minutes} minutes to go.`;
  start();
}
const p = new URLSearchParams(location.hash.slice(1));
if (/^\d{4}-\d{2}-\d{2}$/.test(p.get("d") || "")) $("#cdDate").value = p.get("d");
if (/^\d{2}:\d{2}$/.test(p.get("t") || "")) $("#cdTime").value = p.get("t");
if (p.get("z") && valid(p.get("z"))) $("#cdZone").value = p.get("z");
document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
$("#cdCopy").addEventListener("click", () => copyText(location.href));
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();

})();
