// Time zone converter. Uses the browser's Intl time-zone data only (no network). Settings (zones)
// go in the fragment; the time typed does not.
import { zonedToInstant, formatInZone, offsetMinutes, formatOffset } from "../lib/tz.js";
import { todayLocal } from "../lib/dateui.js";

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
