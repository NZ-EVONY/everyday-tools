// Per-page prose word counts against config/quality.json. Usage: npm run report:content
// (run after npm run build). Exits 1 if any page is outside its range.
import fs from "node:fs";
import path from "node:path";
import { proseText, wordCount, maxSimilarity, openerDiversity, repeatedSentences } from "./similarity.mjs";

const quality = JSON.parse(fs.readFileSync("config/quality.json", "utf8"));
const pages = JSON.parse(fs.readFileSync("reports/pages.json", "utf8")).filter(p => !p.noindex && p.type !== "sitemap");
const rows = pages.map(p => {
  const text = proseText(fs.readFileSync(path.join("public", p.file), "utf8"));
  const [min, max] = quality.words[p.type] || [0, Infinity];
  const words = wordCount(text);
  const intro = p.intro ? wordCount(p.intro.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")) : null;
  return { page: p.path, type: p.type, words, range: `${min}-${max}`, intro, status: words >= min && words <= max ? "ok" : "OUT", text };
});
const order = ["home", "tool", "landing", "guide", "hub", "trust"];
rows.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || a.page.localeCompare(b.page));
console.log("page".padEnd(52), "type".padEnd(8), "words".padStart(6), "range".padStart(10), "intro".padStart(6), " status");
for (const r of rows) console.log(r.page.padEnd(52), r.type.padEnd(8), String(r.words).padStart(6), r.range.padStart(10), String(r.intro ?? "-").padStart(6), " " + r.status);
const sims = maxSimilarity(rows.map(r => ({ url: r.page, text: r.text }))).sort((a, b) => b.max - a.max);
console.log(`\nHighest 5-word-shingle similarity: ${sims.slice(0, 5).map(s => `${s.page} ~ ${s.with} ${s.max.toFixed(3)}`).join("; ")} (limit ${quality.similarity.maxJaccard})`);
console.log(`Opener diversity: ${(openerDiversity(rows.map(r => ({ url: r.page, text: r.text }))) * 100).toFixed(0)}% (minimum ${quality.similarity.minOpenerDiversity * 100}%)`);
const rep = repeatedSentences(rows.map(r => ({ url: r.page, text: r.text })), quality.similarity.maxRepeatedSentenceWords);
console.log(`Repeated sentences of ${quality.similarity.maxRepeatedSentenceWords}+ words across pages: ${rep.length}`);
for (const r of rep) console.log(`  "${r.sentence}" on ${r.pages.join(", ")}`);
if (rows.some(r => r.status !== "ok")) process.exitCode = 1;
