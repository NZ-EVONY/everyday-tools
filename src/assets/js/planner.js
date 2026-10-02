// Weekly planner and hourly timetable. Labels typed for the timetable stay on the page;
// only layout settings go in the URL fragment.
import { addPeriod, weekday } from "../lib/dates.js";
import { setPageSize, sheetClass, el } from "../lib/print.js";
import { todayLocal, longDay } from "../lib/dateui.js";

const { $ } = window.ET;
const form = $("#plForm");
const radio = n => form.querySelector(`input[name="${n}"]:checked`).value;
const DAYNAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const fmtHour = (mins, h24) => { const h = Math.floor(mins / 60), m = mins % 60; if (h24) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; const hh = ((h + 11) % 12) + 1; return `${hh}:${String(m).padStart(2, "0")}${h < 12 || h === 24 ? "am" : "pm"}`; };

function update() {
  const mode = radio("mode"), paper = radio("paper"), orient = radio("orient");
  const days = Number(radio("days"));
  $("#plWeekFields").hidden = mode !== "planner";
  $("#plTimeFields").hidden = mode !== "timetable";
  setPageSize(paper, orient);
  const area = $("#printArea");
  area.replaceChildren();
  const s = el("section", sheetClass(paper, orient));
  if (mode === "planner") {
    const d = $("#plDate").value || todayLocal();
    const back = (weekday(d) + 6) % 7; // Monday of that week
    const monday = addPeriod(d, -back, "days");
    s.append(el("h2", "", `Week of ${longDay(monday)}`));
    const t = el("table", "wk");
    const extra = $("#plNotes").checked;
    const head = el("tr"); head.append(el("th", "", "Day"), el("th", "", "Plans"), ...(extra ? [el("th", "", "Priorities")] : []));
    t.append(el("thead")); t.tHead.append(head);
    const body = el("tbody");
    for (let i = 0; i < days; i++) {
      const iso = addPeriod(monday, i, "days");
      const tr = el("tr");
      const c = el("td"); c.append(el("span", "day", DAYNAMES[weekday(iso)]), el("br"), document.createTextNode(String(+iso.slice(8))));
      tr.append(c, el("td"), ...(extra ? [el("td")] : []));
      body.append(tr);
    }
    t.append(body); s.append(t);
    if ($("#plWeekNotes").checked) { const n = el("div", "notes"); n.prepend(el("strong", "", "Notes")); for (let i = 0; i < 4; i++) n.append(el("div")); s.append(n); }
  } else {
    const start = Number($("#plStart").value), end = Number($("#plEnd").value), step = Number($("#plStep").value);
    const ok = end > start;
    $("#plHint").textContent = ok ? "" : "The end time must be after the start time.";
    if (!ok) return;
    const title = $("#plTitle").value.trim();
    s.append(el("h2", "", title || "Timetable"));
    const t = el("table", "tt");
    const names = (days === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 0]).map(i => DAYNAMES[i]);
    const head = el("tr"); head.append(el("th", "", "Time"), ...names.map(n => el("th", "", n)));
    t.append(el("thead")); t.tHead.append(head);
    const body = el("tbody");
    const h24 = $("#pl24").checked;
    let rows = 0;
    for (let m = start * 60; m < end * 60 && rows < 48; m += step, rows++) {
      const tr = el("tr"); tr.append(el("td", "", `${fmtHour(m, h24)}`));
      for (let i = 0; i < names.length; i++) tr.append(el("td"));
      body.append(tr);
    }
    t.append(body); s.append(t);
    // Shrink the print font so every row fits one page: printable height in points, less the title.
    const avail = { a4portrait: 782, a4landscape: 536, letterportrait: 727, letterlandscape: 547 }[paper + orient] - 60;
    t.style.setProperty("--tt-font", `${Math.min(10, Math.max(5.5, avail / (rows + 1) / 1.45)).toFixed(2)}pt`);
    if (rows >= 48) $("#plHint").textContent = "Showing the first 48 rows; use a longer interval to fit the whole day.";
  }
  area.append(s);
  $("#sr").textContent = `Preview updated: ${mode === "planner" ? "weekly planner" : "timetable"}, ${paper === "letter" ? "US Letter" : "A4"} ${orient}.`;
  history.replaceState(null, "", `#${new URLSearchParams({ mode, days, p: paper, o: orient })}`);
}
const p = new URLSearchParams(location.hash.slice(1));
const setRadio = (n, v) => { const r = form.querySelector(`input[name="${n}"][value="${v}"]`); if (r) r.checked = true; };
for (const [k, n] of [["mode", "mode"], ["days", "days"], ["p", "paper"], ["o", "orient"]]) if (p.get(k)) setRadio(n, p.get(k));
$("#plDate").value = todayLocal();
$("#plPrint").addEventListener("click", () => window.print());
form.addEventListener("input", update);
form.addEventListener("submit", e => e.preventDefault());
update();
