// Printable calendar. Grids come from lib/dates.js; NZ holidays only for years in the MBIE data
// (embedded at build time). Settings go in the URL fragment.
import { monthGrid } from "../lib/dates.js";
import { setPageSize, sheetClass, el } from "../lib/print.js";

const { $ } = window.ET;
const form = $("#calForm");
const holidays = JSON.parse(form.dataset.holidays);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const val = id => $(id).value;
const radio = n => form.querySelector(`input[name="${n}"]:checked`).value;

function holidayMap(year, region) {
  const m = new Map();
  for (const h of holidays.years[year]?.holidays || []) {
    if (h.scope !== "national" && h.scope !== region) continue;
    const add = (d, name) => m.set(d, [...(m.get(d) || []), name]);
    add(h.date, h.name);
    if (h.observedForMonFri !== h.date) add(h.observedForMonFri, `${h.name} (Mon–Fri day off)`);
  }
  return m;
}

function monthTable(y, mo, start, hol, { mini = false } = {}) {
  const t = el("table");
  const head = el("tr");
  for (let i = 0; i < 7; i++) head.append(el("th", "", mini ? DAYS[(start + i) % 7][0] : DAYS[(start + i) % 7]));
  t.append(el("thead")); t.tHead.append(head);
  const body = el("tbody");
  for (const week of monthGrid(y, mo, start)) {
    const tr = el("tr");
    for (const iso of week) {
      const td = el("td", iso ? "" : "out");
      if (iso) {
        const names = hol.get(iso);
        if (mini) { td.textContent = String(+iso.slice(8)); if (names) td.classList.add("h"); }
        else { td.append(el("span", "d", String(+iso.slice(8)))); for (const n of names || []) td.append(el("span", "hol", n)); }
      }
      tr.append(td);
    }
    body.append(tr);
  }
  t.append(body);
  return t;
}

function update() {
  const year = Math.trunc(Number(val("#calYear")));
  const okYear = year >= 1900 && year <= 2100;
  $("#calYear").toggleAttribute("aria-invalid", !okYear);
  $("#calHint").textContent = okYear ? "" : "Choose a year from 1900 to 2100.";
  if (!okYear) return;
  const view = radio("view"), paper = radio("paper"), orient = radio("orient");
  const start = Number(radio("start"));
  const region = val("#calRegion") || null;
  const notes = $("#calNotes").checked;
  const hasData = !!holidays.years[year];
  const hol = $("#calHol").checked && hasData ? holidayMap(String(year), region) : new Map();
  $("#calNoData").hidden = !$("#calHol").checked || hasData;
  $("#calNoData").textContent = `NZ holiday data isn't available for ${year}, so this calendar shows no holidays. Holiday dates are included for ${Object.keys(holidays.years).join(" and ")}.`;
  $("#monthField").hidden = view !== "month";
  setPageSize(paper, orient);
  const area = $("#printArea");
  area.replaceChildren();
  const cls = sheetClass(paper, orient);
  if (view === "year") {
    const s = el("section", cls);
    s.append(el("h2", "", String(year)));
    const grid = el("div", "year-grid");
    for (let m = 1; m <= 12; m++) { const box = el("div", "mini"); box.append(el("h3", "", MONTHS[m - 1]), monthTable(year, m, start, hol, { mini: true })); grid.append(box); }
    s.append(grid);
    if (hol.size) s.append(el("p", "legend", "Underlined dates are New Zealand public holidays" + (region ? " or the regional anniversary day" : "") + ", from Employment New Zealand's table."));
    area.append(s);
  } else {
    const months = view === "month" ? [Number(val("#calMonth"))] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (const m of months) {
      const s = el("section", cls);
      s.append(el("h2", "", `${MONTHS[m - 1]} ${year}`), monthTable(year, m, start, hol));
      if (notes) { const n = el("div", "notes"); for (let i = 0; i < 4; i++) n.append(el("div")); s.append(n); }
      if (hol.size) s.append(el("p", "foot-note", "Holidays from Employment New Zealand's table. Workplaces may observe some holidays on other days."));
      area.append(s);
    }
  }
  $("#calSummary").textContent = `${view === "year" ? "1 page" : view === "month" ? "1 page" : "12 pages"}, ${paper === "letter" ? "US Letter" : "A4"} ${orient}.`;
  history.replaceState(null, "", `#${new URLSearchParams({ y: year, v: view, m: val("#calMonth"), s: start, p: paper, o: orient, r: region || "", h: $("#calHol").checked ? 1 : 0, n: notes ? 1 : 0 })}`);
}

const p = new URLSearchParams(location.hash.slice(1));
const setRadio = (n, v) => { const r = form.querySelector(`input[name="${n}"][value="${v}"]`); if (r) r.checked = true; };
const now = new Date();
$("#calYear").value = /^\d{4}$/.test(p.get("y") || "") ? p.get("y") : String(now.getFullYear());
$("#calMonth").value = /^([1-9]|1[0-2])$/.test(p.get("m") || "") ? p.get("m") : String(now.getMonth() + 1);
for (const [k, n] of [["v", "view"], ["s", "start"], ["p", "paper"], ["o", "orient"]]) if (p.get(k)) setRadio(n, p.get(k));
if ([...$("#calRegion").options].some(o => o.value === p.get("r"))) $("#calRegion").value = p.get("r");
if (p.get("h") === "0") $("#calHol").checked = false;
if (p.get("n") === "1") $("#calNotes").checked = true;
$("#calPrint").addEventListener("click", () => window.print());
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();
