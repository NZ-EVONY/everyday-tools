// Rule 4: no personal name anywhere public; Organization-only JSON-LD; TODO-OWNER never reaches HTML.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT, PUBLIC, publicFiles, repoFiles, readJson } from "../helpers.mjs";

const TEXT = /\.(html|js|mjs|css|json|jsonc|md|txt|xml|svg|yml|yaml)$|^(_headers|_redirects|\.gitignore|\.gitattributes|\.assetsignore)$/;

test("site.config.json identity fields are exactly as specified", () => {
  const s = readJson("site.config.json");
  assert.equal(s.brand, "Everyday Tools");
  assert.equal(s.publisherName, "Everyday Tools");
  assert.equal(s.authorName, "Everyday Tools");
  assert.equal(s.operatorName, "an independent publisher");
  assert.equal(s.contactEmail, "nz@myaddr.app");
  assert.equal(s.governingLaw, "New Zealand");
  assert.equal(s.siteUrl, "https://myaddr.app");
});

test("public/ has no Person JSON-LD and no TODO-OWNER marker", () => {
  for (const f of publicFiles().filter(f => TEXT.test(path.basename(f)))) {
    const s = fs.readFileSync(path.join(PUBLIC, f), "utf8");
    assert.ok(!/"@type"\s*:\s*"Person"/.test(s), `${f} has Person JSON-LD`);
    assert.ok(!s.includes("TODO-OWNER"), `${f} has a TODO-OWNER marker`);
  }
});

test("NAME_DENYLIST patterns appear nowhere in the repo or public/", t => {
  const raw = process.env.NAME_DENYLIST;
  if (!raw) { console.warn("WARNING: NAME_DENYLIST is not set; personal-name scan skipped (the owner sets it locally)."); t.skip("NAME_DENYLIST not set"); return; }
  const pats = raw.split(",").map(s => s.trim()).filter(Boolean).map(s => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  const hits = [];
  for (const f of repoFiles({ includePublic: true }).filter(f => TEXT.test(path.basename(f)))) {
    const s = fs.readFileSync(path.join(ROOT, f), "utf8");
    for (const p of pats) if (p.test(s)) hits.push(`${f} matches pattern #${pats.indexOf(p) + 1}`);
  }
  assert.deepEqual(hits, []);
});

test("no Person JSON-LD in source, and no absolute local paths anywhere in the repo", () => {
  for (const f of repoFiles({ includePublic: true }).filter(f => TEXT.test(path.basename(f)))) {
    const s = fs.readFileSync(path.join(ROOT, f), "utf8");
    assert.ok(!/"@type"\s*:\s*"Person"/.test(s), f);
    assert.ok(!/[A-Za-z]:\\Users\\|(^|[\s"'`(=])\/(Users|home|root)\/[A-Za-z]/m.test(s) || f.startsWith("tests/build/identity"), `${f} contains an absolute local path`);
  }
});
