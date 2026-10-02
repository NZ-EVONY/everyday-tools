// Printable checklist. Items typed stay on the page (never stored or put in the URL);
// only layout settings go in the fragment.
import { setPageSize, sheetClass, el } from "../lib/print.js";

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
