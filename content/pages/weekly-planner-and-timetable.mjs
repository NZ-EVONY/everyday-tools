// /weekly-planner-and-timetable
import { paperFields } from "./printable-calendar.mjs";

export default function page(ctx) {
  const { link, icon } = ctx;
  const hours = [["6", "6am"], ["7", "7am"], ["8", "8am"], ["9", "9am"], ["10", "10am"], ["12", "12pm"]];
  const ends = [["15", "3pm"], ["16", "4pm"], ["17", "5pm"], ["18", "6pm"], ["20", "8pm"], ["22", "10pm"]];
  return {
    path: "/weekly-planner-and-timetable",
    type: "tool",
    pillar: "printables",
    status: "published",
    reviewed: "2026-10-02",
    title: "Printable Weekly Planner and Hourly Timetable",
    description: "Print a weekly planner for any week, or a blank hourly timetable with your own start, end and interval. A4 or US Letter, five or seven days.",
    crumbName: "Weekly planner and timetable",
    h1: "Weekly planner",
    h1Accent: "and timetable",
    appName: "Weekly planner and timetable",
    script: "planner",
    chips: [`<span class="chip">${icon("grid")}Planner or timetable</span>`],
    sources: [], claims: [],
    intro: `<p>Print a page to plan your week or map out a routine. The weekly planner gives a row for each day of the week you choose, with space for plans and an optional priorities column. The timetable gives a grid of times down the side and days across the top, from the start and end times you set, at 15-minute to two-hour intervals. Both print on A4 or US Letter in black and white.</p>`,
    tool: `<form id="plForm" autocomplete="off" novalidate>
      <div class="panel-h"><h2>Layout</h2></div>
      <fieldset><legend class="sr-only">Type</legend>
        <div class="seg"><label><input type="radio" name="mode" value="planner" checked><span>Weekly planner</span></label><label><input type="radio" name="mode" value="timetable"><span>Timetable</span></label></div>
      </fieldset>
      <fieldset><legend class="field-label">Days</legend>
        <div class="seg"><label><input type="radio" name="days" value="5"><span>Monday to Friday</span></label><label><input type="radio" name="days" value="7" checked><span>All 7 days</span></label></div>
      </fieldset>
      <div id="plWeekFields">
        <div class="fields"><div class="field"><label for="plDate">Any date in the week</label><input class="in" id="plDate" type="date" min="1900-01-01" max="2100-12-31"></div></div>
        <label class="check"><input type="checkbox" id="plNotes" checked> Priorities column</label>
        <label class="check"><input type="checkbox" id="plWeekNotes"> Notes lines at the bottom</label>
      </div>
      <div id="plTimeFields" hidden>
        <div class="fields">
          <div class="field"><label for="plStart">Start</label><select class="in" id="plStart">${hours.map(([v, l]) => `<option value="${v}"${v === "8" ? " selected" : ""}>${l}</option>`).join("")}</select></div>
          <div class="field"><label for="plEnd">End</label><select class="in" id="plEnd">${ends.map(([v, l]) => `<option value="${v}"${v === "17" ? " selected" : ""}>${l}</option>`).join("")}</select></div>
          <div class="field"><label for="plStep">Every</label><select class="in" id="plStep"><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60" selected>1 hour</option><option value="120">2 hours</option></select></div>
          <div class="field"><label for="plTitle">Title (optional)</label><input class="in" id="plTitle" type="text" maxlength="50" placeholder="Term 4 timetable"></div>
        </div>
        <label class="check"><input type="checkbox" id="pl24"> 24-hour times</label>
      </div>
      ${paperFields(ctx)}
      <p class="hint" id="plHint" role="alert"></p>
    </form>`,
    results: `<div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="plPrint">${icon("file")}Print</button></div>
      <p class="print-tips">Print at 100% ("actual size") on the paper size chosen here, with headers and footers turned off.</p>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>
      <div class="print-area" id="printArea" aria-label="Print preview"></div>`,
    body: `
        <h2>Planner or timetable?</h2>
        <p>Use the <strong>weekly planner</strong> when the week is a list of things to fit in: appointments, school runs, deadlines, meals, training sessions. Pick any date and the planner starts on the Monday of that week, with the date beside each day. The priorities column gives room for the two or three things that must happen, which is often more useful than a full schedule.</p>
        <p>Use the <strong>timetable</strong> when the week repeats: a school or university timetable, a shift roster, a practice schedule or a family routine. Choose when the day starts and ends and how long each row is. An hour suits most school days; 30 minutes suits university lectures and busy households; 15 minutes gives a detailed grid but uses more of the page.</p>

        <h2>Fitting it on one page</h2>
        <p>Everything is sized to fit one sheet. A seven-day planner in portrait gives tall rows for writing; landscape gives a wider plans column. For timetables, the number of rows is the span of the day divided by the interval: 8am to 5pm in one-hour steps is 9 rows, while the same day in 15-minute steps is 36 rows, which is still readable in portrait but tight. The tool caps a timetable at 48 rows so it stays legible. If you need more, split the day into two pages by printing the morning and afternoon separately.</p>
        <!--@slot after-explainer-1-->
        <h2>Printing tips</h2>
        <ul>
          <li><strong>Match the paper size</strong> in the print dialog to the one chosen here, and print at 100 per cent. "Fit to page" can shrink the grid and make rows uneven.</li>
          <li><strong>Turn off headers and footers</strong> in the print dialog so the page address and date don't print at the edges.</li>
          <li><strong>Print a few copies</strong> or save the setup as a bookmark: your layout choices are kept in the page address after the # sign. A title you type isn't saved or put in the address.</li>
          <li><strong>Laminate</strong> a timetable and use a whiteboard marker if the details change each term.</li>
        </ul>

        <h2>Examples</h2>
        <ul>
          <li><strong>A school timetable</strong>: Monday to Friday, 8am to 4pm, every hour, in portrait. Write subjects and rooms in the boxes.</li>
          <li><strong>A university week</strong>: 8am to 6pm every 30 minutes shows lectures, tutorials and labs that don't start on the hour.</li>
          <li><strong>A household planner</strong>: all seven days with the priorities column, printed each Sunday night and stuck on the fridge.</li>
          <li><strong>A shift roster</strong>: 6am to 10pm every two hours across seven days, landscape, for a small team.</li>
        </ul>

        <h2>What it doesn't do</h2>
        <p>The planner and timetable are blank grids for writing on; they don't fill in events, sync with a digital calendar or mark public holidays. For a month or year view with New Zealand holidays marked, use the ${link("/printable-calendar", "printable calendar")}. To turn a list into tick boxes, use the ${link("/printable-checklist", "printable checklist")}.</p>`,
    related: [
      { href: "/printable-calendar", label: "Printable calendar" },
      { href: "/printable-checklist", label: "Printable checklist" },
      { href: "/printables", label: "All printables" },
    ],
  };
}
