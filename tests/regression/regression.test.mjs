// Regression: stale-build detector, URL manifest, wrangler.jsonc shape and golden outputs.
// To accept an intended change: rebuild, then update the expected file in the same commit
// (UPDATE_GOLDEN=1 npm run regression rewrites golden.json; review the diff).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { ROOT, PUBLIC, publicFiles, pages, readJson } from "../helpers.mjs";
import { addGst, removeGst, gstLines } from "../../src/assets/lib/gst.js";
import { toBasisPoints } from "../../src/assets/lib/money.js";
import { takeHome } from "../../src/assets/lib/paye.js";

test("public-manifest.json matches public/ exactly", () => {
  const manifest = readJson("public-manifest.json").files;
  const actual = publicFiles().filter(f => f !== ".assetsignore").map(f => {
    const b = fs.readFileSync(path.join(PUBLIC, f));
    return { path: f, size: b.length, sha256: createHash("sha256").update(b).digest("hex") };
  });
  assert.deepEqual(manifest, actual, "public/ changed without public-manifest.json: run npm run build and commit both");
});

test("URL manifest: no published URL disappears without a redirect decision", () => {
  const expected = readJson("tests/regression/urls.json").urls;
  const built = pages().filter(p => p.type !== "error").map(p => p.path);
  for (const u of expected) assert.ok(built.includes(u), `${u} was published before and is now missing`);
  for (const u of built) assert.ok(expected.includes(u), `${u} is new: add it to tests/regression/urls.json`);
});

test("wrangler.jsonc keeps its static-assets-only shape", () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, ""));
  assert.equal(cfg.name, "everyday-tools");
  assert.deepEqual(cfg.assets, { directory: "./public", html_handling: "drop-trailing-slash", not_found_handling: "404-page" });
  assert.deepEqual(cfg.routes, [{ pattern: "myaddr.app", custom_domain: true }, { pattern: "www.myaddr.app", custom_domain: true }]);
  for (const k of ["main", "vars", "kv_namespaces", "r2_buckets", "d1_databases", "durable_objects", "services"]) assert.ok(!(k in cfg), `wrangler.jsonc must not have ${k}`);
  assert.match(cfg.compatibility_date, /^\d{4}-\d{2}-\d{2}$/);
});

test("golden outputs: GST (a data change shows up as a reviewable diff)", () => {
  const gst = readJson("data/nz/gst.json");
  const bp = toBasisPoints(gst.rate.value);
  const amounts = [1, 3, 4, 99, 100, 1999, 8999, 10000, 11500, 123456, 99999999];
  const golden = {
    gstRateBp: bp,
    add: amounts.map(c => [c, addGst(c, bp).gst]),
    remove: amounts.map(c => [c, removeGst(c, bp).gst]),
    lines: gstLines([1999, 1999, 1999], "remove", bp),
  };
  const file = path.join(ROOT, "tests/regression/golden.json");
  if (process.env.UPDATE_GOLDEN === "1") fs.writeFileSync(file, JSON.stringify({ gst: golden }, null, 1) + "\n");
  assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")).gst, golden);
});

test("golden outputs: take-home pay for fixed incomes (a tax data change shows up as a reviewable diff)", () => {
  const cfg = readJson("config/data.json");
  const tax = readJson(`data/nz/tax-${cfg.currentTaxYear}.json`);
  const golden = {};
  for (const annual of [15600, 24128, 45000, 53500, 65000, 78100, 120000, 156641, 180000, 250000]) for (const period of ["weekly", "fortnightly", "monthly"]) {
    const g = Math.round(annual * 100 / { weekly: 52, fortnightly: 26, monthly: 12 }[period]);
    const r = takeHome(g, { period, code: "M", studentLoan: true, kiwisaverRate: 0.035 }, tax);
    golden[`${annual}-${period}`] = [r.gross, r.paye, r.studentLoan, r.kiwisaver, r.net, r.employer.net];
  }
  const file = path.join(ROOT, "tests/regression/golden-paye.json");
  if (process.env.UPDATE_GOLDEN === "1") fs.writeFileSync(file, JSON.stringify({ taxYear: tax.taxYear, columns: ["gross", "paye", "studentLoan", "kiwisaver", "net", "employerNet"], rows: golden }, null, 1) + "\n");
  assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")).rows, golden);
});
