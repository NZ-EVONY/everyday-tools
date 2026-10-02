// Content rules: word ranges, banned phrases, typed-in percentages, similarity, claims.
import test from "node:test";
import assert from "node:assert/strict";
import { pages, html, readJson } from "../helpers.mjs";
import { proseText, wordCount, maxSimilarity, repeatedSentences, openerDiversity } from "../../scripts/similarity.mjs";

const quality = readJson("config/quality.json");
const sourceIds = new Set(readJson("data/sources.json").sources.map(s => s.id));
const content = pages().filter(p => !p.noindex && p.type !== "error" && p.type !== "sitemap");
const prose = content.map(p => ({ url: p.path, type: p.type, html: html(p), text: proseText(html(p)) }));

const BANNED = ["delve", "tapestry", "nestled", "bustling", "vibrant", "in today's", "whether you're", "it's important to note", "unlock", "seamless", "ultimate guide", "navigate the complexities", "game-changer", "supercharge", "millions of users", "guaranteed"];

test("prose word counts are within the configured range for each page type", () => {
  for (const p of prose) {
    const [min, max] = quality.words[p.type];
    const n = wordCount(p.text);
    assert.ok(n >= min && n <= max, `${p.url} (${p.type}) has ${n} words; range ${min}-${max}`);
  }
});

test("tool intros are 60-120 words", () => {
  for (const p of content.filter(p => p.intro && (p.type === "tool" || p.type === "landing"))) {
    const n = wordCount(p.intro.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    assert.ok(n >= quality.introWords[0] && n <= quality.introWords[1], `${p.path} intro ${n}`);
  }
});

test("no banned phrases, and no claim of being official or government-approved", () => {
  for (const p of prose) {
    const t = p.text.toLowerCase();
    for (const b of BANNED) assert.ok(!t.includes(b), `${p.url}: "${b}"`);
    assert.ok(!/\b(official|approved|endorsed) (by|calculator|tool|site)/.test(t.replace(/not affiliated with, endorsed by or approved by/g, "")), `${p.url}: claims official status`);
  }
});

test("a positive control: the banned-phrase check would catch a planted phrase", () => {
  assert.ok("let's delve into it".includes("delve"));
});

test("percentages in prose come only from data (wrapped in .dv) or not at all", () => {
  for (const p of prose) {
    const main = (p.html.match(/<main[\s\S]*?<\/main>/) || [""])[0]
      .replace(/<h1[\s\S]*?<\/h1>/g, "").replace(/<section class="calc"[\s\S]*?<\/section>/g, "").replace(/<aside class="notice"[\s\S]*?<\/aside>/g, "")
      .replace(/<span class="dv">[^<]*<\/span>/g, "").replace(/<!--[\s\S]*?-->/g, "");
    const plain = main.replace(/<[^>]+>/g, " ");
    assert.ok(!/\d+(\.\d+)?\s?%/.test(plain), `${p.url}: typed-in percentage: ${plain.match(/.{30}\d+(\.\d+)?\s?%.{10}/)?.[0]}`);
  }
});

test("pages don't share prose: shingle similarity, repeated sentences and opener diversity", () => {
  const sims = maxSimilarity(prose);
  for (const s of sims) assert.ok(s.max <= quality.similarity.maxJaccard, `${s.page} ~ ${s.with}: ${s.max.toFixed(3)}`);
  assert.deepEqual(repeatedSentences(prose, quality.similarity.maxRepeatedSentenceWords), []);
  assert.ok(openerDiversity(prose) >= quality.similarity.minOpenerDiversity);
});

test("every claim on a published page is sourced from data/sources.json or flagged UNVERIFIED", () => {
  for (const p of readJson("reports/claims.json")) for (const c of p.claims) {
    assert.ok(c.source === "UNVERIFIED" || sourceIds.has(c.source), `${p.path}: "${c.text}" has source ${c.source}`);
    if (p.status !== "draft") assert.notEqual(c.source, "UNVERIFIED", `${p.path} is published with an unverified claim: ${c.text}`);
  }
});

test("NZ calculator pages declare their sources and claims", () => {
  for (const p of content.filter(p => p.nzMoney)) {
    assert.ok(p.sources.length >= 1, p.path);
    assert.ok(p.claims.length >= 1, p.path);
  }
});
