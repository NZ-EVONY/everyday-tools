(function () {
"use strict";
// print.js
// Print helpers shared by the printables. Page size comes from named @page rules in style.css
// (`.sheet.a4p` etc.). For browsers without named-page support, setPageSize() also adds a plain
// @page rule through the CSSOM (allowed by the CSP, unlike inline <style> or style attributes).

let rule = null;
function setPageSize(paper, orientation) {
  const size = `${paper === "letter" ? "letter" : "A4"} ${orientation}`;
  const margin = paper === "letter" ? "0.4in" : "10mm";
  try {
    const sheet = [...document.styleSheets].find(s => { try { return s.href && s.cssRules; } catch (e) { return false; } });
    if (!sheet) return;
    if (rule !== null) { sheet.deleteRule(rule); rule = null; }
    rule = sheet.insertRule(`@page { size: ${size}; margin: ${margin}; }`, sheet.cssRules.length);
  } catch (e) { /* the named @page rules still apply */ }
}

/** CSS classes for a sheet. */
const sheetClass = (paper, orientation) => `sheet ${paper === "letter" ? "letter" : ""} ${orientation === "landscape" ? "landscape" : ""} ${paper === "letter" ? "letter" : "a4"}${orientation === "landscape" ? "l" : "p"}`.replace(/\s+/g, " ").trim();

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

// checklist.js
// Printable checklist. Items typed stay on the page (never stored or put in the URL);
// only layout settings go in the fragment.

const { $ } = window.ET;
const form = $("#ckForm");
const radio = n => form.querySelector(`input[name="${n}"]:checked`).value;
const MAX_ITEMS = 200;

function update() {
  const paper = radio("paper"), orient = "portrait";
  const cols = Number(radio("cols")), style = radio("box");
  const spare = Math.max(0, Math.min(40, Math.trunc(Number($("#ckSpare").value) || 0)));
  const items = $("#ckItems").value.split(/\r?\n/).map(s => s.trim().replace(/^([-*•]|\[ ?\])\s*/, "")).filter(Boolean);
  $("#ckHint").textContent = items.length > MAX_ITEMS ? `Only the first ${MAX_ITEMS} items are used.` : "";
  setPageSize(paper, orient);
  const area = $("#printArea");
  area.replaceChildren();
  const s = el("section", sheetClass(paper, orient));
  s.append(el("h2", "", $("#ckTitle").value.trim() || "Checklist"));
  const ul = el("ul", `chk${style === "circle" ? " circle" : ""}`);
  ul.style.setProperty("--cols", String(cols));
  for (const t of [...items.slice(0, MAX_ITEMS), ...Array(spare).fill("")]) {
    const li = el("li");
    li.append(el("span", "box"), el("span", "", t || " "));
    ul.append(li);
  }
  s.append(ul);
  area.append(s);
  $("#sr").textContent = `Preview updated: ${Math.min(items.length, MAX_ITEMS)} items.`;
  $("#ckCount").textContent = `${Math.min(items.length, MAX_ITEMS)} items${spare ? ` + ${spare} blank lines` : ""}`;
  history.replaceState(null, "", `#${new URLSearchParams({ p: paper, c: cols, b: style, s: spare })}`);
}
const p = new URLSearchParams(location.hash.slice(1));
const setRadio = (n, v) => { const r = form.querySelector(`input[name="${n}"][value="${v}"]`); if (r) r.checked = true; };
for (const [k, n] of [["p", "paper"], ["c", "cols"], ["b", "box"]]) if (p.get(k)) setRadio(n, p.get(k));
if (/^\d{1,2}$/.test(p.get("s") || "")) $("#ckSpare").value = p.get("s");
$("#ckPrint").addEventListener("click", () => window.print());
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();

})();
