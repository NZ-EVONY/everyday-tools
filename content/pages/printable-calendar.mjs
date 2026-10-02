// /printable-calendar
import { monthGrid } from "../../src/assets/lib/dates.js";

const paperFields = (ctx, { orient = true, defaultOrient = "portrait" } = {}) => `
      <fieldset><legend class="field-label">Paper</legend>
        <div class="seg"><label><input type="radio" name="paper" value="a4" checked><span>A4</span></label><label><input type="radio" name="paper" value="letter"><span>US Letter</span></label></div>
      </fieldset>
      ${orient ? `<fieldset><legend class="field-label">Orientation</legend>
        <div class="seg"><label><input type="radio" name="orient" value="portrait"${defaultOrient === "portrait" ? " checked" : ""}><span>Portrait</span></label><label><input type="radio" name="orient" value="landscape"${defaultOrient === "landscape" ? " checked" : ""}><span>Landscape</span></label></div>
      </fieldset>` : ""}`;
export { paperFields };

export default function page(ctx) {
  const { link, icon, holidays, esc, src, longDate } = ctx;
  const years = Object.keys(holidays.years).sort();
  const n2027 = holidays.years["2027"]?.holidays.filter(h => h.scope === "national") || [];
  const oct = monthGrid(2026, 10, 1);
  const rows2027 = n2027.map(h => `<tr><td>${esc(h.name)}</td><td>${longDate(h.date)}</td><td>${h.observedForMonFri !== h.date ? longDate(h.observedForMonFri) : "same day"}</td></tr>`).join("");
  return {
    path: "/printable-calendar",
    type: "tool",
    pillar: "printables",
    status: "published",
    reviewed: "2026-10-02",
    title: `Printable Calendar ${years.at(-1)} NZ: Holidays Marked`,
    description: `Print a calendar for any month or year, A4 or US Letter, week starting Monday or Sunday, with New Zealand public holidays marked for ${years.join(" and ")}.`,
    crumbName: "Printable calendar",
    h1: "Printable calendar",
    h1Accent: "with NZ holidays",
    appName: "Printable calendar",
    script: "calendar",
    chips: [`<span class="chip">${icon("cal")}A4 or US Letter</span>`, `<span class="chip">NZ holidays ${years.join(" and ")}</span>`],
    sources: [ctx.source("mbie-public-holidays")],
    claims: [{ text: `NZ public holiday dates ${years.join(", ")}`, source: "mbie-public-holidays" }],
    intro: `<p>Make a clean, ink-friendly calendar to print at home: one month on a page, all twelve months as separate pages, or the whole year on a single sheet. Weeks can start on Monday, as most New Zealand calendars do, or Sunday. New Zealand public holidays, and your regional anniversary day if you choose one, are marked for ${years.join(" and ")}. Set it up on screen, check the preview, then print at actual size.</p>`,
    tool: `<form id="calForm" autocomplete="off" novalidate data-holidays="${esc(JSON.stringify(holidays))}">
      <div class="panel-h"><h2>Calendar</h2></div>
      <fieldset><legend class="sr-only">Layout</legend>
        <div class="seg three"><label><input type="radio" name="view" value="month" checked><span>One month</span></label><label><input type="radio" name="view" value="months"><span>12 pages</span></label><label><input type="radio" name="view" value="year"><span>Year on 1 page</span></label></div>
      </fieldset>
      <div class="fields">
        <div class="field"><label for="calYear">Year</label><input class="in" id="calYear" type="text" inputmode="numeric" maxlength="4" aria-describedby="calHint"></div>
        <div class="field" id="monthField"><label for="calMonth">Month</label><select class="in" id="calMonth">${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => `<option value="${i + 1}">${m}</option>`).join("")}</select></div>
        <div class="field"><label for="calRegion">Regional anniversary day</label><select class="in" id="calRegion"><option value="">None</option>${holidays.regions.map(r => `<option value="${r.key}">${esc(r.name)}</option>`).join("")}</select></div>
      </div>
      <fieldset><legend class="field-label">Week starts on</legend>
        <div class="seg"><label><input type="radio" name="start" value="1" checked><span>Monday</span></label><label><input type="radio" name="start" value="0"><span>Sunday</span></label></div>
      </fieldset>
      ${paperFields(ctx)}
      <label class="check"><input type="checkbox" id="calHol" checked> Mark NZ public holidays</label>
      <label class="check"><input type="checkbox" id="calNotes"> Add note lines under each month</label>
      <p class="hint" id="calHint" role="alert"></p>
    </form>`,
    results: `<p class="rounding" id="calNoData" hidden></p>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="calPrint">${icon("file")}Print</button><span class="muted" id="calSummary" role="status" aria-live="polite"></span></div>
      <p class="print-tips">In the print dialog choose the same paper size, set scale to 100 per cent (or "actual size"), and turn off headers and footers.</p>
      <div class="print-area" id="printArea" aria-label="Print preview"></div>`,
    notice: `<aside class="notice" aria-label="Source">${icon("info")}<div><p><strong>Holiday dates for ${years.join(" and ")}, checked on ${longDate(holidays.years[years.at(-1)].checkedOn)}.</strong> Source: ${src("mbie-public-holidays")}. Other years print without holidays.</p></div></aside>`,
    body: `
        <h2>Holidays: which years, and why only those</h2>
        <p>Public holidays are marked only for years whose dates Employment New Zealand has published and this site has checked. For other years you still get an accurate calendar; it just doesn't mark holidays, and the page tells you so rather than guessing. Holidays are shown on their actual date, and where a Monday-to-Friday worker gets the day off on a different date (for example when Anzac Day falls on a weekend), that weekday is marked too.</p>
        <p>The ${years.at(-1)} national holidays, as Employment New Zealand lists them:</p>
        <table><thead><tr><th scope="col">Holiday</th><th scope="col">Date</th><th scope="col">Monday-to-Friday day off</th></tr></thead><tbody>${rows2027}</tbody></table>

        <h2>Getting a good print</h2>
        <p>Choose the same paper size in the print dialog as here: A4 in New Zealand, or US Letter if you're printing for North America. Set the scale to 100 per cent (sometimes called "actual size") rather than "fit to page", which can shrink the grid unevenly. Turning off the browser's headers and footers removes the page address and date from the edges. The calendar uses black lines and grey shading only, so it prints well in black and white and uses little ink.</p>
        <p>A single month fits one page in portrait or landscape; landscape gives wider boxes for writing in. The year view puts all twelve months on one sheet, three across in portrait or four in landscape. The 12-page option prints each month on its own page in one go.</p>
        <!--@slot after-explainer-1-->
        <h2>An example grid</h2>
        <p>October 2026 begins on a Thursday, so with weeks starting on Monday the first row has three empty boxes before the 1st, and the month runs over ${oct.length} rows. February 2026 starts on a Sunday, so with Sunday-first weeks it fills exactly four rows, which happens only in some years.</p>

        <h2>Common problems</h2>
        <ul>
          <li><strong>The calendar prints on two pages.</strong> The paper size or orientation in the print dialog doesn't match the one chosen here, or the scale isn't 100 per cent.</li>
          <li><strong>Margins are cut off.</strong> Some printers can't print to the edge; the calendar leaves a 10 mm margin, but borderless or "fit" settings can still crop it.</li>
          <li><strong>Holidays are missing.</strong> Check the year: only ${years.join(" and ")} have holiday data. Regional days appear only when you choose a region.</li>
        </ul>
        <p>Nothing you set up is sent anywhere; your choices are kept in the page address after the # sign so a bookmark recreates the same calendar. For planning a week hour by hour, use the ${link("/weekly-planner-and-timetable", "weekly planner and timetable")}; to count working days around holidays, try the ${link("/working-days-calculator", "working days calculator")}.</p>`,
    faq: [
      { q: "Can I print a calendar for 2028 or later?", a: `<p>Yes, any year from 1900 to 2100. Public holidays are marked only for years with checked data (${years.join(" and ")}); other years print without them.</p>` },
      { q: "Why does my print come out smaller than the page?", a: "<p>The print dialog is probably set to \"fit to page\" or a scale below 100 per cent. Choose 100 per cent or \"actual size\", and the same paper size as the calendar.</p>" },
    ],
    related: [
      { href: "/weekly-planner-and-timetable", label: "Weekly planner and timetable" },
      { href: "/working-days-calculator", label: "Working days calculator" },
      { href: "/printables", label: "All printables" },
      { href: "/guides/printing-calendars-and-planners-at-home", label: "Guide: printing at home" },
    ],
  };
}
