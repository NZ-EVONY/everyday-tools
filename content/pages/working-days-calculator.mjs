// /working-days-calculator: Monday-Friday days with NZ public holidays (MBIE data).
import { workingDays } from "../../src/assets/lib/dates.js";

export default function page(ctx) {
  const { link, icon, holidays, esc, src, longDate } = ctx;
  const years = Object.keys(holidays.years).sort();
  const easter = workingDays("2026-03-30", "2026-04-10", holidays);
  const xmas = workingDays("2026-12-21", "2027-01-08", holidays);
  const akl = workingDays("2026-01-19", "2026-01-30", holidays, { region: "auckland" });
  const wgtn = workingDays("2026-01-19", "2026-01-30", holidays, { region: "wellington" });
  const y26 = holidays.years["2026"].holidays;
  const nat26 = y26.filter(h => h.scope === "national");
  const nice = iso => longDate(iso);
  const rows = nat26.map(h => `<tr><td>${esc(h.name)}</td><td>${nice(h.date)}</td><td>${h.observedForMonFri !== h.date ? nice(h.observedForMonFri) : "same day"}</td></tr>`).join("");
  return {
    path: "/working-days-calculator",
    type: "tool",
    pillar: "date-and-time-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Working Days Calculator NZ: Business Days and Holidays",
    description: `Count working days between two dates in New Zealand, leaving out weekends, public holidays and your regional anniversary day (data for ${years.join(" and ")}).`,
    crumbName: "Working days calculator",
    h1: "Working days calculator",
    h1Accent: "NZ",
    appName: "NZ working days calculator",
    script: "workdays",
    chips: [`<span class="chip">${icon("brief")}Holidays for ${years.join(" and ")}</span>`, `<span class="chip">Checked ${longDate(holidays.years[years.at(-1)].checkedOn)}</span>`],
    sources: [ctx.source("mbie-public-holidays")],
    claims: [
      { text: `Public holiday and anniversary dates ${years.join(", ")}`, source: "mbie-public-holidays" },
      { text: "Waitangi Day and Anzac Day are Mondayised for people who wouldn't work that weekend; Christmas, Boxing Day and the New Year days move to the next Monday or Tuesday", source: "mbie-public-holidays" },
      { text: "Regional anniversary days are set by custom and local practice; MBIE says to check with councils", source: "mbie-public-holidays" },
    ],
    intro: `<p>Count the working days between two dates in New Zealand. Weekends are left out, and so are public holidays on the day a Monday-to-Friday worker gets them off, including Mondayised holidays. Add your region to take out its anniversary day too. Use it for notice periods, project timelines, delivery estimates or leave planning. The holiday list underneath the result shows exactly which days were removed.</p>`,
    tool: `<form id="wdForm" autocomplete="off" novalidate data-holidays="${esc(JSON.stringify(holidays))}">
      <div class="panel-h"><h2>Date range</h2></div>
      <div class="fields">
        <div class="field"><label for="wFrom">From</label><input class="in" id="wFrom" type="date" min="1900-01-01" max="2100-12-31" aria-describedby="wHint"></div>
        <div class="field"><label for="wTo">To (included)</label><input class="in" id="wTo" type="date" min="1900-01-01" max="2100-12-31"></div>
        <div class="field"><label for="wRegion">Regional anniversary day</label><select class="in" id="wRegion"><option value="">None (national holidays only)</option>${holidays.regions.map(r => `<option value="${r.key}">${esc(r.name)}</option>`).join("")}</select></div>
      </div>
      <p class="hint" id="wHint" role="alert"></p>
      <p class="rounding" id="wMissing" hidden></p>
      <label class="check" id="wAcceptRow" hidden><input type="checkbox" id="wAccept"> Count weekends only for years without holiday data</label>
    </form>`,
    results: `<div class="results">
        <div class="res key"><div class="k">Working days<small id="vWorkK">Monday to Friday</small></div><div class="v" id="vWork">–</div></div>
        <div class="res"><div class="k">Weekdays in range</div><div class="v" id="vWeekdays">–</div></div>
        <div class="res"><div class="k">Holidays on weekdays</div><div class="v" id="vHol">–</div></div>
      </div>
      <div class="breakdown" id="wListBox" hidden><p class="rounding"><strong>Holidays taken out</strong></p><ul class="muted" id="wList"></ul></div>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="wCopy">${icon("copy")}Copy result</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    notice: `<aside class="notice" aria-label="Source">${icon("info")}<div><p><strong>Holiday dates for ${years.join(" and ")}, checked on ${longDate(holidays.years[years.at(-1)].checkedOn)}.</strong> Source: ${src("mbie-public-holidays")}.</p><p>A workplace may observe a holiday on a different day under its employment agreement, and regional dates can vary locally.</p></div></aside>`,
    body: `
        <h2>How holidays are counted</h2>
        <p>The calculator counts Monday to Friday from the first date to the last, both included, then removes public holidays that fall on those weekdays. It uses the date a Monday-to-Friday worker actually gets the day off. When Waitangi Day or Anzac Day falls on a weekend, Employment New Zealand explains that the holiday moves to the Monday for people who wouldn't normally work that weekend. Christmas Day, Boxing Day, New Year's Day and 2 January move to the following Monday or Tuesday in the same situation. The 2026 national holidays, with the day a Monday-to-Friday worker gets off:</p>
        <table><thead><tr><th scope="col">Holiday</th><th scope="col">Date</th><th scope="col">Monday-to-Friday day off</th></tr></thead><tbody>${rows}</tbody></table>
        <p>Regional anniversary days are added only when you choose a region. Employment New Zealand notes that these are set by local custom and practice, that some regions observe them on a different day from the actual anniversary, and that its own table may contain errors, so check with your local council if the exact day matters.</p>

        <h2>Worked examples</h2>
        <ul>
          <li>The two weeks from Monday 30 March to Friday 10 April 2026 have ${easter.weekdays} weekdays, but Good Friday and Easter Monday fall inside, leaving ${easter.days} working days.</li>
          <li>From Monday 21 December 2026 to Friday 8 January 2027 there are ${xmas.weekdays} weekdays and ${xmas.days} working days, once the Christmas and New Year holidays and their Monday-to-Friday days off are removed.</li>
          <li>The fortnight starting Monday 19 January 2026 has ${akl.days} working days for someone in Auckland and ${wgtn.days} in Wellington, because each loses its own anniversary Monday.</li>
        </ul>
        <!--@slot after-explainer-1-->
        <h2>When the data runs out</h2>
        <p>Holiday dates are only included for years Employment New Zealand has published and this site has checked: currently ${years.join(" and ")}. For any other year the calculator says so plainly and won't guess. If you tick the box, it counts weekends only for those years, so the result may include days that will turn out to be holidays.</p>

        <h2>Mistakes to avoid</h2>
        <ul>
          <li><strong>Assuming a weekend holiday is lost.</strong> For most Monday-to-Friday workers, a weekend Anzac Day, Waitangi Day, Christmas or New Year holiday moves to a weekday.</li>
          <li><strong>Forgetting the anniversary day</strong> when a deadline falls in late January or around a regional date.</li>
          <li><strong>Mixing up "within 10 working days" rules.</strong> Contracts and laws define their own counting; check whether the first day counts.</li>
          <li><strong>Ignoring shutdowns.</strong> Many businesses close over Christmas and New Year beyond the public holidays. The calculator doesn't know about those, so remove them yourself if they apply.</li>
        </ul>
        <p>Dates stay in your browser; only the region you pick is kept in the page address after the # sign. For calendar days, use ${link("/days-between-dates", "days between dates")}; to print a year with the holidays marked, see the ${link("/printable-calendar", "printable calendar")}.</p>`,
    faq: [
      { q: "Does the end date count?", a: "<p>Yes. Both the start and end dates are included if they're working days.</p>" },
      { q: "What about Matariki?", a: `<p>Matariki is a national public holiday and is included in the data for ${years.join(" and ")}, on the date Employment New Zealand lists.</p>` },
    ],
    related: [
      { href: "/days-between-dates", label: "Days between dates" },
      { href: "/printable-calendar", label: "Printable calendar" },
      { href: "/date-and-time-tools", label: "All date and time tools" },
    ],
  };
}
