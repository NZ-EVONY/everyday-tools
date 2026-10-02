// Countdown timer. The date, time and zone live in the URL fragment so a countdown can be
// bookmarked or shared; the optional label is typed text, so it stays on the page and is never
// put in the URL.
// The ticking stops while the tab is hidden and moves once a minute with reduced motion.
import { zonedToInstant, remaining } from "../lib/tz.js";

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
