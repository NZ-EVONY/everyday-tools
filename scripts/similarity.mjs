// Prose extraction, word counts and similarity between pages.
// Prose = the written copy inside <main>: no breadcrumbs, tool card, source notice, tables,
// headings, related-link lists, "Last reviewed" line, scripts or comments.
export function proseText(html) {
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [html])[0];
  return main
    .replace(/<script[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, " ")
    .replace(/<nav class="crumbs"[\s\S]*?<\/nav>/g, " ")
    .replace(/<div class="t-meta">[\s\S]*?<\/div>/g, " ")
    .replace(/<section class="calc[^"]*"[\s\S]*?<\/section>/g, " ")
    .replace(/<div class="preview"[\s\S]*?<div class="pv-float">[\s\S]*?<\/div>/g, " ")
    .replace(/<aside class="notice"[\s\S]*?<\/aside>/g, " ")
    .replace(/<section class="related"[\s\S]*?<\/section>/g, " ")
    .replace(/<ul class="grid">[\s\S]*?<\/ul>/g, " ")
    .replace(/<aside class="aside-card"[\s\S]*?<\/aside>/g, " ")
    .replace(/<table[\s\S]*?<\/table>/g, " ")
    .replace(/<p class="updated">[\s\S]*?<\/p>/g, " ")
    .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/g, " ")
    .replace(/<summary[^>]*>[\s\S]*?<\/summary>/g, " ")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ").trim();
}
/** Words as a reader would count them (numbers like $1,999.00 count as one word). */
export const wordCount = text => (text ? text.split(" ").filter(w => /[A-Za-z0-9]/.test(w)).length : 0);
const norm = text => text.toLowerCase().replace(/[^a-z0-9$%.' -]+/g, " ").replace(/\s+/g, " ").trim();

export function shingles(text, n = 5) {
  const w = norm(text).split(" ").filter(Boolean);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}

/** For each page, the highest 5-word-shingle Jaccard index against any other page. */
export function maxSimilarity(pages, n = 5) {
  const sets = pages.map(p => shingles(p.text, n));
  return sets.map((s, i) => {
    let best = 0, with_ = null;
    sets.forEach((t, j) => {
      if (j === i || !s.size || !t.size) return;
      let c = 0;
      for (const x of s) if (t.has(x)) c++;
      const jac = c / (s.size + t.size - c);
      if (jac > best) { best = jac; with_ = pages[j].url; }
    });
    return { page: pages[i].url, max: best, with: with_ };
  });
}

/** Sentences of at least minWords words that appear on more than one page. */
export function repeatedSentences(pages, minWords = 8) {
  const seen = new Map();
  for (const p of pages) {
    for (const s of p.text.split(/(?<=[.!?])\s+/)) {
      const key = norm(s).replace(/[.!?]$/, "");
      if (key.split(" ").length < minWords) continue;
      if (!seen.has(key)) seen.set(key, new Set());
      seen.get(key).add(p.url);
    }
  }
  return [...seen].filter(([, urls]) => urls.size > 1).map(([sentence, urls]) => ({ sentence, pages: [...urls] }));
}

/** Share of pages whose first three words are unique among the set. */
export function openerDiversity(pages) {
  const openers = pages.map(p => norm(p.text).split(" ").slice(0, 3).join(" "));
  const counts = new Map();
  for (const o of openers) counts.set(o, (counts.get(o) || 0) + 1);
  return openers.length ? openers.filter(o => counts.get(o) === 1).length / openers.length : 1;
}
