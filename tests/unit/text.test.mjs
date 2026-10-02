// Text cleaner pipeline and counter.
import test from "node:test";
import assert from "node:assert/strict";
import { cleanText, sortLines, MAX_CHARS } from "../../src/assets/lib/textclean.js";
import { countText, graphemes, formatDuration } from "../../src/assets/lib/count.js";

const run = (t, o) => cleanText(t, o).output;

test("line endings: CRLF and CR input, LF or CRLF output, final newline not an extra line", () => {
  assert.equal(run("a\r\nb\rc\n"), "a\nb\nc");
  assert.equal(run("a\nb", { eol: "crlf" }), "a\r\nb");
  assert.equal(cleanText("a\nb\n").linesIn, 2);
  assert.equal(cleanText("").lines, 0);
});

test("fixed order: trim and collapse happen before blank and duplicate removal", () => {
  const input = "  apple  \n\napple\n   \nbanana   split\nApple";
  assert.equal(run(input, { trim: true, collapse: true, blanks: "whitespace", dedupe: true }), "apple\nbanana split\nApple");
  assert.equal(run(input, { trim: true, collapse: true, blanks: "whitespace", dedupe: true, dedupeCase: false }), "apple\nbanana split");
  // Without trim, "  apple  " and "apple" still match because dedupe ignores surrounding spaces by default.
  assert.equal(run("  apple  \napple", { dedupe: true }), "  apple  ");
  assert.equal(run("  apple  \napple", { dedupe: true, dedupeTrim: false }), "  apple  \napple");
});

test("blank lines: empty only vs whitespace-only", () => {
  const t = "a\n\n \t\nb";
  assert.equal(run(t, { blanks: "empty" }), "a\n \t\nb");
  assert.equal(run(t, { blanks: "whitespace" }), "a\nb");
  assert.equal(cleanText(t, { blanks: "whitespace" }).blanksRemoved, 2);
});

test("duplicates: keep first vs keep last, original order preserved, accents normalised", () => {
  assert.equal(run("b\na\nb\nc\na", { dedupe: true }), "b\na\nc");
  assert.equal(run("b\na\nb\nc\na", { dedupe: true, keep: "last" }), "b\nc\na");
  assert.equal(run("café\ncafé", { dedupe: true }), "café", "composed and decomposed é are the same line");
  assert.equal(cleanText("x\nx\nx", { dedupe: true }).duplicatesRemoved, 2);
});

test("sorting: locale-aware, natural numbers, length, reverse, stable", () => {
  assert.deepEqual(sortLines(["item 10", "item 2", "Item 1"], "az"), ["Item 1", "item 10", "item 2"]);
  assert.deepEqual(sortLines(["item 10", "item 2", "Item 1"], "natural"), ["Item 1", "item 2", "item 10"]);
  assert.deepEqual(sortLines(["Zoë", "zebra", "Ōtaki", "orange"], "az"), ["orange", "Ōtaki", "zebra", "Zoë"]);
  assert.deepEqual(sortLines(["bb", "a", "ccc", "dd"], "length"), ["a", "bb", "dd", "ccc"], "stable for equal lengths");
  assert.deepEqual(sortLines(["1", "2", "3"], "reverse"), ["3", "2", "1"]);
  assert.deepEqual(sortLines(["b", "A", "a", "B"], "az"), ["A", "a", "b", "B"], "case-insensitive keeps original order for ties");
});

test("prefix and suffix, skipping blank lines unless asked; split and join", () => {
  assert.equal(run("a\n\nb", { prefix: "'", suffix: "'," }), "'a',\n\n'b',");
  assert.equal(run("a\n\nb", { prefix: "- ", affixBlank: true }), "- a\n- \n- b");
  assert.equal(run("a, b,c", { split: ",", trim: true }), "a\nb\nc");
  assert.equal(run("a\nb\nc", { prefix: "'", suffix: "'", join: ", " }), "'a', 'b', 'c'");
});

test("performance guard: 1,000,000 lines (at the 2,000,000-character cap) and a 100,000-line sort", () => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const million = Array.from({ length: 1000000 }, (_, i) => letters[i % 26]).join("\n");
  assert.ok(million.length <= MAX_CHARS);
  const t0 = performance.now();
  const r = cleanText(million, { trim: true, blanks: "whitespace", dedupe: true, dedupeCase: false });
  const t1 = performance.now();
  assert.equal(r.linesIn, 1000000);
  assert.equal(r.lines, 26);
  const big = Array.from({ length: 100000 }, (_, i) => `item ${(i * 7919) % 100000}`).join("\n");
  const t2 = performance.now();
  const s = cleanText(big, { sort: "natural" });
  const t3 = performance.now();
  assert.equal(s.output.split("\n")[2], "item 2");
  console.log(`  1M lines trim+blanks+dedupe: ${(t1 - t0).toFixed(0)} ms; natural sort of 100k lines: ${(t3 - t2).toFixed(0)} ms`);
  assert.ok(t1 - t0 < 5000 && t3 - t2 < 5000);
});

test("input is capped at the maximum size", () => {
  assert.equal(cleanText("x".repeat(MAX_CHARS + 10)).charsIn, MAX_CHARS);
});

test("counter: emoji, accents, words with apostrophes and hyphens, empty input", () => {
  assert.equal(graphemes("👍🏽"), 1, "emoji with skin tone counts once");
  assert.equal(graphemes("é"), 1, "e + combining accent counts once");
  assert.equal(graphemes("👨‍👩‍👧"), 1, "family emoji counts once");
  const c = countText("Don't stop.  It's a well-known fact!\n\nNew paragraph here.");
  assert.equal(c.words, 9);
  assert.equal(c.sentences, 3);
  assert.equal(c.paragraphs, 2);
  assert.equal(c.lines, 3);
  assert.deepEqual(countText(""), { chars: 0, noSpaces: 0, words: 0, sentences: 0, lines: 0, paragraphs: 0, readingSeconds: 0, speakingSeconds: 0, segmenter: true });
  assert.equal(countText("one two three four", { readingWpm: 120 }).readingSeconds, 2);
  assert.equal(countText("Tēnā koe, Aotearoa").words, 3);
});

test("formatDuration", () => {
  assert.equal(formatDuration(0), "0 sec");
  assert.equal(formatDuration(45), "45 sec");
  assert.equal(formatDuration(150), "2 min 30 sec");
});
