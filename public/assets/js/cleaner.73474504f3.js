(function () {
"use strict";
// textclean.js
// The text cleaner engine. One pass, always in this order (documented on /text-cleaner):
//  1. line endings normalised (CRLF and CR become LF)   2. optional split on a separator
//  3. trim each line   4. collapse repeated spaces and tabs   5. remove blank lines
//  6. remove duplicates   7. sort or reverse   8. add prefix and suffix   9. optional join
// Then the chosen output line ending is applied. Pure functions; the Worker and the page share them.

const MAX_CHARS = 2000000;

const DEFAULTS = {
  split: "", trim: false, collapse: false, blanks: "keep",            // blanks: keep | empty | whitespace
  dedupe: false, dedupeCase: true, dedupeTrim: true, keep: "first",   // dedupeCase: true = case-sensitive
  sort: "none", sortCase: false,                                     // sort: none | az | za | natural | natural-desc | length | length-desc | reverse
  prefix: "", suffix: "", affixBlank: false, join: null, eol: "lf",
};

function cleanText(input, options = {}) {
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
function sortLines(lines, mode, { caseSensitive = false } = {}) {
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

// count.js
// Word and character counts. Characters are counted as graphemes (what a reader sees as one
// character, so an emoji or an accented letter counts once) using Intl.Segmenter where the browser
// has it, otherwise as Unicode code points. A word is a run of letters or digits, which may contain
// apostrophes or hyphens inside it ("don't", "well-known", "2026-27").

const hasSegmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function";
const WORD = /[\p{L}\p{M}\p{N}]+(?:['’\-.][\p{L}\p{M}\p{N}]+)*/gu;

function graphemes(text) {
  if (hasSegmenter) { let n = 0; for (const _ of new Intl.Segmenter("en-NZ", { granularity: "grapheme" }).segment(text)) n++; return n; }
  return Array.from(text).length;
}

function countText(text, { readingWpm = 200, speakingWpm = 130 } = {}) {
  const t = String(text ?? "");
  const chars = graphemes(t);
  const noSpaces = graphemes(t.replace(/\s+/g, ""));
  const words = (t.match(WORD) || []).length;
  let sentences = 0;
  if (hasSegmenter) { for (const s of new Intl.Segmenter("en-NZ", { granularity: "sentence" }).segment(t)) if (/[\p{L}\p{N}]/u.test(s.segment)) sentences++; }
  else sentences = (t.match(/[^.!?]*[\p{L}\p{N}][^.!?]*(?:[.!?]+|$)/gu) || []).length;
  const norm = t.replace(/\r\n?/g, "\n");
  const lines = norm === "" ? 0 : norm.replace(/\n$/, "").split("\n").length;
  const paragraphs = norm.split(/\n\s*\n/).filter(p => /\S/.test(p)).length;
  return {
    chars, noSpaces, words, sentences, lines, paragraphs,
    readingSeconds: words ? Math.round((words / readingWpm) * 60) : 0,
    speakingSeconds: words ? Math.round((words / speakingWpm) * 60) : 0,
    segmenter: hasSegmenter,
  };
}

function formatDuration(seconds) {
  if (!seconds) return "0 sec";
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return s ? `${m} min ${s} sec` : `${m} min`;
}

// runner.js
// Runs text jobs in the Worker when the input is large and Workers are available, otherwise on the
// main thread. A newer job replaces an older one, so only the latest result is shown.


const WORKER_THRESHOLD = 200000;

function makeRunner(workerUrl) {
  let worker = null, seq = 0, failed = false;
  const pending = new Map();
  function getWorker() {
    if (worker || failed || !workerUrl || typeof Worker === "undefined") return worker;
    try {
      worker = new Worker(workerUrl);
      worker.onmessage = e => { const p = pending.get(e.data.id); if (!p) return; pending.delete(e.data.id); e.data.error ? p.reject(new Error(e.data.error)) : p.resolve(e.data.result); };
      worker.onerror = () => { failed = true; worker = null; for (const [id, p] of pending) { pending.delete(id); p.retry(); } };
    } catch (e) { failed = true; worker = null; }
    return worker;
  }
  const local = (op, text, options) => (op === "count" ? countText(text, options) : cleanText(text, options));
  return {
    usedWorker: false,
    run(op, text, options) {
      const id = ++seq;
      const w = text.length > WORKER_THRESHOLD ? getWorker() : null;
      this.usedWorker = !!w;
      if (!w) return Promise.resolve({ id, result: local(op, text, options), latest: () => id === seq });
      return new Promise((resolve, reject) => {
        pending.set(id, {
          resolve: result => resolve({ id, result, latest: () => id === seq }),
          reject,
          retry: () => resolve({ id, result: local(op, text, options), latest: () => id === seq }),
        });
        w.postMessage({ id, op, text, options });
      });
    },
  };
}

// cleaner.js
// Text cleaner pages. The engine (lib/textclean.js) runs here for normal input and in a Web Worker
// over 200,000 characters (lib/runner.js). Text, prefixes, suffixes and separators are never stored
// or put in the URL; only on/off options and choices go in the fragment.


const { $, copyText } = window.ET;
const form = $("#cleanForm");
const preset = JSON.parse(form.dataset.preset);
const runner = makeRunner(form.dataset.worker);
const input = $("#ctIn"), output = $("#ctOut");
const CHECKS = { trim: "#oTrim", collapse: "#oCollapse", dedupe: "#oDedupe", dedupeCase: "#oDedupeCase", dedupeTrim: "#oDedupeTrim", sortCase: "#oSortCase", affixBlank: "#oAffixBlank" };
const SELECTS = { blanks: "#oBlanks", keep: "#oKeep", sort: "#oSort", eol: "#oEol" };
const SAMPLE = form.dataset.sample || "Kiwi\n  kiwi  \nTūī\n\nfantail\nKiwi\nkererū\n   \nfantail\nItem 10\nItem 2";

function options() {
  const o = {};
  for (const [k, id] of Object.entries(CHECKS)) o[k] = $(id).checked;
  for (const [k, id] of Object.entries(SELECTS)) o[k] = $(id).value;
  o.prefix = $("#oPrefix").value; o.suffix = $("#oSuffix").value; o.split = $("#oSplit").value;
  o.join = $("#oJoin").value === "" ? null : $("#oJoin").value;
  return o;
}
const lineCount = t => (t === "" ? 0 : t.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").length);

let timer = null;
function schedule() { clearTimeout(timer); timer = setTimeout(update, input.value.length > WORKER_THRESHOLD ? 250 : 0); }

async function update() {
  const text = input.value;
  $("#ctHint").textContent = text.length >= MAX_CHARS ? `Only the first ${MAX_CHARS.toLocaleString("en-NZ")} characters are used.` : "";
  if (text.length <= WORKER_THRESHOLD) $("#inCount").textContent = `${lineCount(text).toLocaleString("en-NZ")} lines`;
  const o = options();
  const job = await runner.run("clean", text, o);
  if (!job.latest()) return;
  const r = job.result;
  output.value = r.output;
  $("#inCount").textContent = `${r.linesIn.toLocaleString("en-NZ")} lines`;
  $("#rOut").textContent = r.lines.toLocaleString("en-NZ");
  $("#rIn").textContent = `${r.linesIn.toLocaleString("en-NZ")} lines in`;
  $("#rRemoved").textContent = (r.blanksRemoved + r.duplicatesRemoved).toLocaleString("en-NZ");
  $("#rRemovedK").textContent = `${r.blanksRemoved.toLocaleString("en-NZ")} blank, ${r.duplicatesRemoved.toLocaleString("en-NZ")} duplicate`;
  $("#ctWorker").hidden = !runner.usedWorker;
  $("#ctWorker").textContent = runner.usedWorker ? "Large text: processed in the background so the page stays responsive." : "";
  $("#sr").textContent = text ? `${r.lines} lines out of ${r.linesIn}.` : "";
  const frag = {};
  for (const k of Object.keys(CHECKS)) if (o[k] !== preset[k]) frag[k] = o[k] ? "1" : "0";
  for (const k of Object.keys(SELECTS)) if (o[k] !== preset[k]) frag[k] = o[k];
  const f = new URLSearchParams(frag).toString();
  history.replaceState(null, "", f ? `#${f}` : location.pathname);
}

const p = new URLSearchParams(location.hash.slice(1));
for (const [k, id] of Object.entries(CHECKS)) if (p.has(k)) $(id).checked = p.get(k) === "1";
for (const [k, id] of Object.entries(SELECTS)) if (p.has(k) && [...$(id).options].some(x => x.value === p.get(k))) $(id).value = p.get(k);
$("#ctCopy").addEventListener("click", () => copyText(output.value));
$("#ctUse").addEventListener("click", () => { input.value = output.value; schedule(); input.focus(); });
$("#ctReset").addEventListener("click", () => { input.value = ""; schedule(); input.focus(); });
$("#ctSample").addEventListener("click", () => { input.value = SAMPLE; schedule(); });
form.addEventListener("input", schedule);
form.addEventListener("submit", e => e.preventDefault());
update();

})();
