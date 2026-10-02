// WCAG 2.2 contrast check for the colour tokens in src/assets/style.css (dark default and light).
// Text pairs need 4.5:1, large text and UI components 3:1. Exits 1 on any failure.
import fs from "node:fs";
const css = fs.readFileSync(new URL("../src/assets/style.css", import.meta.url), "utf8");
const block = re => (css.match(re) || [])[1] || "";
const parse = b => Object.fromEntries([...b.matchAll(/--([\w-]+):(#[0-9A-Fa-f]{6})\b/g)].map(m => [m[1], m[2]]));
const dark = parse(block(/--ease:[^;]+;([\s\S]*?)\n\}/));
const light = { ...dark, ...parse(block(/:root\[data-theme="light"\]\{([\s\S]*?)\n\}/)) };
const lum = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
// [foreground, background, minimum, description]; "#hex" literals allowed
const pairs = [
  ["ink", "bg", 4.5, "body text on page"], ["ink", "surface", 4.5, "text on card"], ["ink", "surface-2", 4.5, "text on quiet panel"],
  ["ink-2", "bg", 4.5, "secondary text on page"], ["ink-2", "surface", 4.5, "secondary text on card"], ["ink-2", "surface-2", 4.5, "secondary text on quiet panel"], ["ink-2", "bg-2", 4.5, "secondary text on segmented control / formula"],
  ["ink-3", "bg", 4.5, "muted text on page"], ["ink-3", "surface", 4.5, "muted text on card"], ["ink-3", "surface-2", 4.5, "muted text on quiet panel"], ["ink-3", "bg-2", 4.5, "muted text on footer / segmented control"],
  ["accent", "bg", 4.5, "links on page"], ["accent", "surface", 4.5, "links on card"], ["accent", "surface-2", 4.5, "links on quiet panel"], ["accent", "bg-2", 4.5, "links on footer"],
  ["error", "bg", 4.5, "error text on page"], ["error", "surface", 4.5, "error text on card"], ["error", "surface-2", 4.5, "error text on input"],
  ["on-grad", "#4D8DFF", 4.5, "navy text on gradient (blue end)"], ["on-grad", "#7D86FF", 4.5, "navy text on gradient (middle)"], ["on-grad", "#9A7BFF", 4.5, "navy text on gradient (violet end)"],
  ["accent", "#FFFFFF", 3, "n/a"],
  ["field", "surface-2", 3, "input border on field (non-text)"], ["field", "surface", 3, "input border on card (non-text)"], ["field", "bg", 3, "input border on page (non-text)"],
  ["focus", "bg", 3, "focus ring on page"], ["focus", "surface", 3, "focus ring on card"],
  ["violet", "surface", 3, "violet chart/legend on card (non-text)"], ["accent-2", "surface", 3, "blue chart/legend on card (non-text)"],
  ["#F2F5FF", "#0A1030", 4.5, "stage text on navy card"], ["#D3DBFF", "#0A1030", 4.5, "stage muted text on navy card"], ["#7FB0FF", "#0A1030", 4.5, "stage icon/gradient text start on navy"], ["#B7A2FF", "#0A1030", 4.5, "stage gradient text end on navy"],
].filter(p => p[3] !== "n/a");
const gradText = { dark: ["#7FB0FF", "#9A7BFF"], light: ["#1F4FD8", "#6A3FE0"] };
let fail = 0, n = 0;
for (const [name, t] of [["dark", dark], ["light", light]]) {
  const get = k => (k.startsWith("#") ? k : t[k]);
  const rows = pairs.map(([f, b, min, d]) => [f, b, min, d, ratio(get(f), get(b))]);
  for (const g of gradText[name]) for (const bgk of ["bg", "surface"]) rows.push([`grad-text ${g}`, bgk, 3, "gradient heading text (large)", ratio(g, get(bgk))]);
  for (const [f, b, min, d, r] of rows) {
    n++; const ok = r >= min; if (!ok) fail++;
    console.log(`${ok ? "PASS" : "FAIL"} ${name.padEnd(5)} ${String(f).padEnd(22)} on ${String(b).padEnd(10)} ${r.toFixed(2).padStart(6)}:1 (min ${min}) ${d}`);
  }
}
console.log(`${n - fail}/${n} pairs pass`);
process.exit(fail ? 1 : 0);
