// Builds a temporary copy of the project to prove (1) the expiry checks stop the build and
// (2) changing a figure in data/ changes the page. Real data files are never edited.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT } from "../helpers.mjs";

function copyProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "et-build-"));
  for (const f of ["config", "content", "data", "scripts", "src", "site.config.json", "package.json"]) fs.cpSync(path.join(ROOT, f), path.join(dir, f), { recursive: true });
  return dir;
}
const build = (dir, env = {}) => spawnSync(process.execPath, ["scripts/build.mjs", "--out", "tmp-out"], { cwd: dir, env: { ...process.env, ...env }, encoding: "utf8" });

test("build fails after the tax year ends, and when the current year's holidays are missing", () => {
  const dir = copyProject();
  try {
    const ok = build(dir, { ET_TODAY: "2026-10-02" });
    assert.equal(ok.status, 0, ok.stderr);
    const taxGone = build(dir, { ET_TODAY: "2027-04-01" });
    assert.notEqual(taxGone.status, 0);
    assert.match(taxGone.stderr, /Tax data for 2026-27 ended/);
    const hf = path.join(dir, "data/nz/public-holidays.json");
    const h = JSON.parse(fs.readFileSync(hf, "utf8"));
    delete h.years["2027"];
    fs.writeFileSync(hf, JSON.stringify(h));
    const noHolidays = build(dir, { ET_TODAY: "2027-01-15" });
    assert.notEqual(noHolidays.status, 0);
    assert.match(noHolidays.stderr, /no entry for 2027/);
    const warn = build(dir, { ET_TODAY: "2026-09-15" });
    assert.equal(warn.status, 0);
    assert.match(warn.stderr, /WARNING: Public-holiday data for 2027 not added yet/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("changing the GST rate in a copy of data/ changes the built page", () => {
  const dir = copyProject();
  try {
    const f = path.join(dir, "data/nz/gst.json");
    const g = JSON.parse(fs.readFileSync(f, "utf8"));
    g.rate.value = 0.125;
    g.registrationThreshold.value = 75000;
    fs.writeFileSync(f, JSON.stringify(g));
    const r = build(dir, { ET_TODAY: "2026-10-02" });
    assert.equal(r.status, 0, r.stderr);
    const h = fs.readFileSync(path.join(dir, "tmp-out/gst-calculator.html"), "utf8");
    assert.match(h, /<title>GST Calculator NZ: Add or Remove 12\.5% GST<\/title>/);
    assert.ok(h.includes("$75,000") && !h.includes("$60,000"));
    assert.ok(h.includes('data-rate-bp="1250"'));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("an unknown sourceId stops the build", () => {
  const dir = copyProject();
  try {
    const f = path.join(dir, "data/nz/tax-2026-27.json");
    const t = JSON.parse(fs.readFileSync(f, "utf8"));
    t.acc.sourceId = "not-a-real-source";
    fs.writeFileSync(f, JSON.stringify(t));
    const r = build(dir, { ET_TODAY: "2026-10-02" });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /unknown source "not-a-real-source"/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
