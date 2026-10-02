// Unit conversion. Linear units convert through each category's base unit using the factors in
// data/units.json; temperature and fuel economy use formulas (NIST Guide to the SI, B.8/B.9).

export function convert(value, from, to, category) {
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
export function formatNumber(x) {
  if (!Number.isFinite(x)) return "–";
  if (x === 0) return "0";
  const abs = Math.abs(x);
  const digits = abs >= 1e6 || abs < 1e-4 ? null : Math.max(0, 6 - Math.floor(Math.log10(abs)) - 1);
  if (digits === null) return x.toExponential(5).replace(/\.?0+e/, "e");
  return Number(x.toFixed(Math.min(digits, 10))).toLocaleString("en-NZ", { maximumFractionDigits: Math.min(digits, 10) });
}
