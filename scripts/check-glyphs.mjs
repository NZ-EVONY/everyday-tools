// Which characters the fancy text tool can output does this machine's headless Chromium draw as an
// empty box ("tofu") or as nothing? Each character is drawn on a canvas in the site's font stack and
// compared with the missing-glyph box, taken from a private-use character (U+E000) that no installed
// font draws. (An unassigned code point is no good as the reference: GNU Unifont, if installed, draws
// those as boxes labelled with the code point, each different.) A control character known to be
// missing must come out as a box, or the run is reported NOT VERIFIED.
// Combining marks are drawn on "o" and compared with a bare "o".
// Results: reports/glyphs.json. Usage: npm run check:glyphs
// This only describes the fonts on the machine running it, not visitors' devices.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../tests/helpers.mjs";
import { withBrowser, chrome } from "../tests/e2e/helpers-browser.mjs";
import { STYLES, FRAMES } from "../src/assets/lib/fancy.js";

if (!chrome) { console.error("NOT VERIFIED: no Chrome/Chromium found."); process.exit(2); }
const hex = ch => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
const owners = new Map();
const own = (ch, who) => { if (!owners.has(ch)) owners.set(ch, new Set()); owners.get(ch).add(who); };
for (const s of STYLES) {
  if (s.kind === "mark") own(String.fromCodePoint(s.mark), s.name);
  else for (const v of Object.values(s.map)) for (const ch of v) if (/[^\x20-\x7E]/.test(ch)) own(ch, s.name);
}
for (const f of FRAMES) for (const ch of f.prefix + f.suffix) if (/[^\x20-\x7E]/.test(ch)) own(ch, `frame ${f.id}`);
const chars = [...owners.keys()];

const result = await withBrowser(async (browser, base) => {
  const page = await browser.newPage();
  await page.goto(base + "/fancy-text-generator");
  return page.evaluate(chars => {
    const font = getComputedStyle(document.body).fontFamily;
    const c = document.createElement("canvas"); c.width = 64; c.height = 64;
    const g = c.getContext("2d", { willReadFrequently: true });
    const draw = s => {
      g.clearRect(0, 0, 64, 64); g.font = `40px ${font}`; g.fillStyle = "#000"; g.textBaseline = "middle"; g.fillText(s, 8, 32);
      const d = g.getImageData(0, 0, 64, 64).data; let ink = 0, h = 0;
      for (let i = 3; i < d.length; i += 4) { if (d[i]) ink++; h = (h * 31 + d[i]) >>> 0; }
      return { ink, h };
    };
    const tofu = draw("\uE000"), bareO = draw("o");
    const control = draw("\u{13000}").h === tofu.h;
    const rows = chars.map(ch => {
      const mark = /\p{M}/u.test(ch);
      const r = draw(mark ? "o" + ch : ch);
      const box = r.h === tofu.h;
      const blank = mark ? r.h === bareO.h : r.ink === 0;
      return { ch, box, blank };
    });
    return { control, rows };
  }, chars);
});

if (!result.control) { console.error("NOT VERIFIED: the control character (U+13000) was not detected as a box, so the detector can't be trusted on this machine."); process.exit(2); }
const bad = result.rows.filter(r => r.box || r.blank).map(r => ({ char: r.ch, codePoint: hex(r.ch), problem: r.box ? "box" : "nothing drawn", usedBy: [...owners.get(r.ch)] }));
fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "reports/glyphs.json"), JSON.stringify({ when: new Date().toISOString(), chrome, checked: chars.length, problems: bad }, null, 2));
console.log(`Checked ${chars.length} characters in headless Chromium (${chrome}).`);
if (!bad.length) console.log("None drawn as a box or blank.");
for (const b of bad) console.log(`${b.codePoint} ${b.char}  ${b.problem}  (${b.usedBy.join(", ")})`);
