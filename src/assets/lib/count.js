// Word and character counts. Characters are counted as graphemes (what a reader sees as one
// character, so an emoji or an accented letter counts once) using Intl.Segmenter where the browser
// has it, otherwise as Unicode code points. A word is a run of letters or digits, which may contain
// apostrophes or hyphens inside it ("don't", "well-known", "2026-27").

const hasSegmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function";
const WORD = /[\p{L}\p{M}\p{N}]+(?:['’\-.][\p{L}\p{M}\p{N}]+)*/gu;

export function graphemes(text) {
  if (hasSegmenter) { let n = 0; for (const _ of new Intl.Segmenter("en-NZ", { granularity: "grapheme" }).segment(text)) n++; return n; }
  return Array.from(text).length;
}

export function countText(text, { readingWpm = 200, speakingWpm = 130 } = {}) {
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

export function formatDuration(seconds) {
  if (!seconds) return "0 sec";
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return s ? `${m} min ${s} sec` : `${m} min`;
}
