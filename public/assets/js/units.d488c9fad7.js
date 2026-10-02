(function () {
"use strict";
// units.js
// Unit conversion. Linear units convert through each category's base unit using the factors in
// data/units.json; temperature and fuel economy use formulas (NIST Guide to the SI, B.8/B.9).

function convert(value, from, to, category) {
  if (!Number.isFinite(value)) return NaN;
  if (category.key === "temperature") return fromKelvin(toKelvin(value, from), to);
  if (category.key === "fuel") return fromKmPerL(toKmPerL(value, from, category), to, category);
  const f = category.units.find(u => u.key === from), t = category.units.find(u => u.key === to);
  return (value * f.toBase) / t.toBase;
}

function toKelvin(v, u) { return u === "c" ? v + 273.15 : u === "f" ? (v + 459.67) / 1.8 : v; }
function fromKelvin(k, u) { return u === "c" ? k - 273.15 : u === "f" ? k * 1.8 - 459.67 : k; }

function toKmPerL(v, u, cat) {
  if (u === "kml") return v;
  if (u === "l100") return v > 0 ? 100 / v : NaN;
  return v * cat.units.find(x => x.key === u).kmlPer;
}
function fromKmPerL(k, u, cat) {
  if (u === "kml") return k;
  if (u === "l100") return k > 0 ? 100 / k : NaN;
  return k / cat.units.find(x => x.key === u).kmlPer;
}

/** Format a result: up to 6 significant figures, trailing zeros removed, NZ thousands separators. */
function formatNumber(x) {
  if (!Number.isFinite(x)) return "–";
  if (x === 0) return "0";
  const abs = Math.abs(x);
  const digits = abs >= 1e6 || abs < 1e-4 ? null : Math.max(0, 6 - Math.floor(Math.log10(abs)) - 1);
  if (digits === null) return x.toExponential(5).replace(/\.?0+e/, "e");
  return Number(x.toFixed(Math.min(digits, 10))).toLocaleString("en-NZ", { maximumFractionDigits: Math.min(digits, 10) });
}

// units.js
// Unit converter page. Factors come from data/units.json (embedded at build time); the maths is
// in lib/units.js. Only the category and units go in the URL fragment, never the number typed.

const { $, copyText } = window.ET;
const form = $("#unitForm");
const data = JSON.parse(form.dataset.units);
const cats = Object.fromEntries(data.categories.map(c => [c.key, c]));
const DEFAULTS = { length: ["ft", "m"], area: ["acre", "ha"], mass: ["st", "kg"], volume: ["gal_uk", "l"], temperature: ["f", "c"], speed: ["mph", "kmh"], fuel: ["mpg_uk", "l100"] };
const sel = { from: $("#uFrom"), to: $("#uTo"), cat: $("#uCat") };

function fill(cat, from, to) {
  for (const [k, s] of [["from", sel.from], ["to", sel.to]]) {
    s.replaceChildren(...cats[cat].units.map(u => new Option(u.label, u.key)));
    s.value = k === "from" ? from : to;
  }
}

let last = null;
function update() {
  const cat = cats[sel.cat.value];
  const raw = $("#uValue").value.trim().replace(/,/g, "");
  const v = raw === "" ? NaN : Number(raw);
  const bad = raw !== "" && !Number.isFinite(v);
  $("#uValue").toggleAttribute("aria-invalid", bad);
  $("#uHint").textContent = bad ? "Enter a number, such as 12 or 3.5." : "";
  const out = Number.isFinite(v) ? convert(v, sel.from.value, sel.to.value, cat) : NaN;
  const fromU = cat.units.find(u => u.key === sel.from.value), toU = cat.units.find(u => u.key === sel.to.value);
  $("#uResult").textContent = Number.isFinite(out) ? formatNumber(out) : "–";
  $("#uResultK").textContent = toU.label;
  $("#uSentence").textContent = Number.isFinite(out) ? `${formatNumber(v)} ${fromU.label} = ${formatNumber(out)} ${toU.label}` : "";
  const tbody = $("#uAll tbody");
  tbody.replaceChildren();
  for (const u of cat.units) {
    const tr = document.createElement("tr");
    const th = document.createElement("th"); th.scope = "row"; th.textContent = u.label;
    const td = document.createElement("td"); td.className = "num"; td.textContent = Number.isFinite(v) ? formatNumber(convert(v, fromU.key, u.key, cat)) : "–";
    tr.append(th, td); tbody.append(tr);
  }
  $("#uAllCap").textContent = Number.isFinite(v) ? `${formatNumber(v)} ${fromU.label} in every unit` : "Every unit";
  last = $("#uSentence").textContent;
  $("#sr").textContent = last;
  history.replaceState(null, "", `#${new URLSearchParams({ c: cat.key, from: fromU.key, to: toU.key })}`);
}

const p = new URLSearchParams(location.hash.slice(1));
const startCat = cats[p.get("c")] ? p.get("c") : "length";
sel.cat.value = startCat;
const okUnit = k => cats[startCat].units.some(u => u.key === k);
fill(startCat, okUnit(p.get("from")) ? p.get("from") : DEFAULTS[startCat][0], okUnit(p.get("to")) ? p.get("to") : DEFAULTS[startCat][1]);

sel.cat.addEventListener("change", () => { fill(sel.cat.value, ...DEFAULTS[sel.cat.value]); update(); });
$("#uSwap").addEventListener("click", () => { const a = sel.from.value; sel.from.value = sel.to.value; sel.to.value = a; update(); });
$("#uCopy").addEventListener("click", () => last && copyText(last));
form.addEventListener("input", e => { if (e.target !== sel.cat) update(); });
form.addEventListener("submit", e => e.preventDefault());
update();

})();
