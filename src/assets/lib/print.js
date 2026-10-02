// Print helpers shared by the printables. Page size comes from named @page rules in style.css
// (`.sheet.a4p` etc.). For browsers without named-page support, setPageSize() also adds a plain
// @page rule through the CSSOM (allowed by the CSP, unlike inline <style> or style attributes).

let rule = null;
export function setPageSize(paper, orientation) {
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
export const sheetClass = (paper, orientation) => `sheet ${paper === "letter" ? "letter" : ""} ${orientation === "landscape" ? "landscape" : ""} ${paper === "letter" ? "letter" : "a4"}${orientation === "landscape" ? "l" : "p"}`.replace(/\s+/g, " ").trim();

export function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
