// A deliberately tiny bundler for the browser scripts. Tool scripts import pure logic from
// src/assets/lib/*.js (which the unit tests import directly). This inlines those modules in
// dependency order, strips the import/export keywords and wraps the result in an IIFE.
// Supported syntax: `import { a, b } from "./x.js";` and `export function|const|let|class`.
import fs from "node:fs";
import path from "node:path";

const IMPORT = /^import\s*\{[^}]*\}\s*from\s*["'](\.{1,2}\/[^"']+)["'];?\s*$/gm;

export function bundle(entry) {
  const seen = new Set();
  const parts = [];
  (function add(file) {
    file = path.resolve(file);
    if (seen.has(file)) return;
    seen.add(file);
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(IMPORT)) add(path.join(path.dirname(file), m[1]));
    if (/^\s*export\s+default\b|^\s*export\s*\{/m.test(src)) throw new Error(`${file}: only "export function/const/let/class" is supported by the bundler.`);
    parts.push(`// ${path.basename(file)}\n` + src.replace(IMPORT, "").replace(/^export\s+(?=(async\s+)?function|const|let|class)/gm, ""));
  })(entry);
  return `(function () {\n"use strict";\n${parts.join("\n")}\n})();\n`;
}
