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

test("pages with their own word range stay inside it", () => {
  for (const [url, [min, max]] of Object.entries(quality.pageWords)) {
    const p = prose.find(x => x.url === url);
    assert.ok(p, `${url} is not built`);
    const n = wordCount(p.text);
    assert.ok(n >= min && n <= max, `${url} has ${n} words; range ${min}-${max}`);
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
      .replace(/<h1[\s\S]*?<\/h1>/g, "").replace(/<section class="calc[^"]*"[\s\S]*?<\/section>/g, "").replace(/<aside class="notice"[\s\S]*?<\/aside>/g, "")
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

// The fancy text pages: no game, app or company named in titles, descriptions, headings, the tool
// UI or the copy, and no claim that any of them accepts a style.
const fancy = content.filter(p => quality.fancyPages.includes(p.path));
const word = b => new RegExp(`(^|[^a-z])${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i");

test("fancy text pages exist and name no specific game, app or company", () => {
  assert.equal(fancy.length, quality.fancyPages.length);
  for (const p of fancy) {
    const main = (html(p).match(/<main[\s\S]*?<\/main>/) || [""])[0].replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
    const where = { title: p.title, description: p.description, h1: p.h1, main };
    for (const b of quality.brandDenylist) for (const [k, v] of Object.entries(where)) assert.ok(!word(b).test(v), `${p.path} ${k} names "${b}"`);
  }
});

test("fancy text pages claim nowhere that a game, app or site accepts a style", () => {
  for (const p of fancy) {
    const t = proseText(html(p)).toLowerCase();
    assert.ok(!/\b(is|are|will be|always) accepted\b|\bworks (in|on|with) (all|every|any|most)\b|\b(all|every|most) (games|apps|sites) (accept|allow|support)\b|\bguarantee/.test(t), `${p.path}: acceptance claim`);
  }
});

test("a positive control: the brand and acceptance checks catch planted text", () => {
  assert.ok(word("discord").test("Join our Discord server"));
  assert.ok(!word("meta").test("metadata and metaphor"));
  assert.ok(/\bworks (in|on|with) (all|every|any|most)\b/.test("it works in all games"));
});

test("no page says it was written or generated with AI", () => {
  for (const p of prose) assert.ok(!/\bwritten with ai\b|\bai[- ]assist|\bgenerated (by|with) ai\b|\bchatgpt\b|\bclaude\b|\blanguage model\b/i.test(p.text), p.url);
});
