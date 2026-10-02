import test from "node:test";
import assert from "node:assert/strict";
import { windowsNameProblems } from "../../scripts/lib/names.mjs";
import { repoFiles, publicFiles } from "../helpers.mjs";

test("windowsNameProblems catches reserved names, bad characters and long paths", () => {
  for (const bad of ["con.html", "a/CON", "x/aux.txt", "lpt9.js", "com1", "nul.json", "a/b.", "a/b ", "a?b", "x".repeat(120)]) assert.ok(windowsNameProblems(bad).length, bad);
  for (const ok of ["console.html", "content/pages/a.mjs", "com10.txt", "lpt.js"]) assert.deepEqual(windowsNameProblems(ok), [], ok);
});

test("no repo or public file has a name Windows can't check out", () => {
  const all = [...repoFiles(), ...publicFiles().map(f => `public/${f}`)];
  const problems = all.flatMap(f => windowsNameProblems(f).map(p => `${f}: ${p}`));
  assert.deepEqual(problems, []);
  const lower = new Map();
  for (const f of all) { const k = f.toLowerCase(); assert.ok(!lower.has(k), `case clash: ${f} / ${lower.get(k)}`); lower.set(k, f); }
});
