// The text cleaner engine. One pass, always in this order (documented on /text-cleaner):
//  1. line endings normalised (CRLF and CR become LF)   2. optional split on a separator
//  3. trim each line   4. collapse repeated spaces and tabs   5. remove blank lines
//  6. remove duplicates   7. sort or reverse   8. add prefix and suffix   9. optional join
// Then the chosen output line ending is applied. Pure functions; the Worker and the page share them.

export const MAX_CHARS = 2000000;

const DEFAULTS = {
  split: "", trim: false, collapse: false, blanks: "keep",            // blanks: keep | empty | whitespace
  dedupe: false, dedupeCase: true, dedupeTrim: true, keep: "first",   // dedupeCase: true = case-sensitive
  sort: "none", sortCase: false,                                     // sort: none | az | za | natural | natural-desc | length | length-desc | reverse
  prefix: "", suffix: "", affixBlank: false, join: null, eol: "lf",
};

export function cleanText(input, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const text = String(input ?? "").slice(0, MAX_CHARS);
  const stats = { charsIn: text.length, linesIn: 0, blanksRemoved: 0, duplicatesRemoved: 0 };
  let lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (text.endsWith("\n") || text.endsWith("\r")) lines.pop();          // a final newline isn't an extra line
  if (text === "") lines = [];
  stats.linesIn = lines.length;

  if (o.split) lines = lines.flatMap(l => l.split(o.split === "\\t" ? "\t" : o.split));
  if (o.trim) lines = lines.map(l => l.replace(/^[\s ]+|[\s ]+$/g, ""));
  if (o.collapse) lines = lines.map(l => l.replace(/[ \t ]{2,}/g, " "));
  if (o.blanks !== "keep") {
    const before = lines.length;
    lines = lines.filter(l => (o.blanks === "empty" ? l !== "" : /\S/.test(l)));
    stats.blanksRemoved = before - lines.length;
  }
  if (o.dedupe) {
    const key = l => { let k = o.dedupeTrim ? l.trim() : l; k = k.normalize("NFC"); return o.dedupeCase ? k : k.toLocaleLowerCase("en-NZ"); };
    const before = lines.length;
    if (o.keep === "last") {
      const seen = new Set(), out = [];
      for (let i = lines.length - 1; i >= 0; i--) { const k = key(lines[i]); if (!seen.has(k)) { seen.add(k); out.push(lines[i]); } }
      lines = out.reverse();
    } else {
      const seen = new Set();
      lines = lines.filter(l => { const k = key(l); if (seen.has(k)) return false; seen.add(k); return true; });
    }
    stats.duplicatesRemoved = before - lines.length;
  }
  if (o.sort !== "none") lines = sortLines(lines, o.sort, { caseSensitive: o.sortCase });
  if (o.prefix || o.suffix) lines = lines.map(l => (l === "" && !o.affixBlank ? l : o.prefix + l + o.suffix));
  const eol = o.eol === "crlf" ? "\r\n" : "\n";
  const output = o.join !== null && o.join !== undefined ? lines.join(o.join === "\\t" ? "\t" : o.join) : lines.join(eol);
  return { output, lines: o.join !== null && o.join !== undefined ? (lines.length ? 1 : 0) : lines.length, ...stats, charsOut: output.length };
}

/** Stable sort. "natural" compares numbers by value (2 before 10); accents sort with their base letter. */
export function sortLines(lines, mode, { caseSensitive = false } = {}) {
  if (mode === "reverse") return lines.slice().reverse();
  const base = new Intl.Collator("en-NZ", { sensitivity: caseSensitive ? "variant" : "accent", caseFirst: caseSensitive ? "upper" : "false" });
  const natural = new Intl.Collator("en-NZ", { sensitivity: caseSensitive ? "variant" : "accent", numeric: true });
  const idx = lines.map((l, i) => [l, i]);
  const cmp = {
    az: (a, b) => base.compare(a[0], b[0]),
    za: (a, b) => base.compare(b[0], a[0]),
    natural: (a, b) => natural.compare(a[0], b[0]),
    "natural-desc": (a, b) => natural.compare(b[0], a[0]),
    length: (a, b) => [...a[0]].length - [...b[0]].length,
    "length-desc": (a, b) => [...b[0]].length - [...a[0]].length,
  }[mode];
  if (!cmp) return lines.slice();
  return idx.sort((a, b) => cmp(a, b) || a[1] - b[1]).map(x => x[0]);
}
