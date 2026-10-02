// /time-zone-converter: Intl time zones only.
import { zonedToInstant, formatInZone, offsetMinutes, formatOffset } from "../../src/assets/lib/tz.js";

export default function page(ctx) {
  const { link, icon, src, data, longDate } = ctx;
  const dst = JSON.parse(JSON.stringify(ctx.dstData));
  const presets = [["Australia/Sydney", "Sydney"], ["Australia/Brisbane", "Brisbane"], ["Australia/Perth", "Perth"], ["Pacific/Fiji", "Fiji"], ["Pacific/Rarotonga", "Rarotonga"], ["Pacific/Tongatapu", "Nuku'alofa"], ["Europe/London", "London"], ["America/Los_Angeles", "Los Angeles"], ["America/New_York", "New York"], ["Asia/Tokyo", "Tokyo"], ["Asia/Singapore", "Singapore"], ["UTC", "UTC"]];
  const fallback = ["Pacific/Auckland", "Pacific/Chatham", ...presets.map(p => p[0]), "Asia/Shanghai", "Asia/Kolkata", "Europe/Paris", "Europe/Berlin", "America/Chicago", "America/Denver", "America/Vancouver", "Pacific/Honolulu", "Pacific/Apia", "Pacific/Port_Moresby"];
  const z = "Pacific/Auckland";
  const ex1 = zonedToInstant("2026-11-15", "09:00", z);
  const ex2 = zonedToInstant("2026-06-15", "09:00", z);
  const p0 = dst.periods[0];
  const fmt = (ms, zone) => formatInZone(ms, zone);
  const offJan = zz => formatOffset(offsetMinutes(Date.UTC(2026, 0, 15), zz)), offJul = zz => formatOffset(offsetMinutes(Date.UTC(2026, 6, 15), zz));
  const bne = [offJan("Australia/Brisbane"), offJul("Australia/Brisbane")], syd = [offJan("Australia/Sydney"), offJul("Australia/Sydney")];
  return {
    path: "/time-zone-converter",
    type: "tool",
    pillar: "date-and-time-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Time Zone Converter NZ: NZ Time to Anywhere",
    description: "Convert New Zealand time to Australia, the Pacific, the UK, the US and anywhere else, with daylight saving handled for both places.",
    crumbName: "Time zone converter",
    h1: "Time zone converter:",
    h1Accent: "NZ and the world",
    appName: "Time zone converter",
    script: "timezones",
    chips: [`<span class="chip">${icon("globe")}Daylight saving aware</span>`],
    sources: [ctx.source("govt-daylight-saving")],
    claims: [{ text: `NZ daylight saving: starts ${dst.rule.starts}, ends ${dst.rule.ends}`, source: "govt-daylight-saving" }],
    intro: `<p>See what time it is somewhere else when it's a given time in New Zealand, or the other way round. Pick a date and time, the zone it's in and the zone you want, and the converter shows both local times with their offsets from UTC. Daylight saving is handled for both places, including the nights the clocks change. Quick buttons cover Australia, the Pacific Islands, the UK, the US and Asia.</p>`,
    tool: `<form id="tzForm" autocomplete="off" novalidate data-zones='${JSON.stringify(fallback)}'>
      <div class="panel-h"><h2>Convert a time</h2></div>
      <div class="fields">
        <div class="field"><label for="tzDate">Date</label><input class="in" id="tzDate" type="date" min="1970-01-01" max="2100-12-31"></div>
        <div class="field"><label for="tzTime">Time</label><input class="in" id="tzTime" type="time"></div>
      </div>
      <datalist id="tzZones"></datalist>
      <div class="fields">
        <div class="field"><label for="tzFrom">From time zone</label><input class="in" id="tzFrom" list="tzZones" value="Pacific/Auckland" maxlength="40" aria-describedby="tzHint"></div>
        <div class="field"><label for="tzTo">To time zone</label><input class="in" id="tzTo" list="tzZones" value="Australia/Sydney" maxlength="40"></div>
      </div>
      <p class="hint" id="tzHint" role="alert"></p>
      <div class="quick js-only" role="group" aria-label="Quick destinations"><span class="muted">Quick:</span>${presets.map(([zone, name]) => `<button type="button" class="btn btn-ghost btn-sm" data-zone="${zone}">${name}</button>`).join("")}</div>
      <div class="actions no-print"><button type="button" class="btn btn-ghost btn-sm" id="tzSwap">${icon("sort")}Swap zones</button></div>
    </form>`,
    results: `<div class="results">
        <div class="res"><div class="k">From<small id="vFromK">Pacific/Auckland (${formatOffset(offsetMinutes(Date.now(), "Pacific/Auckland"))})</small></div><div class="v long" id="vFrom">–</div></div>
        <div class="res key"><div class="k">To<small id="vToK">Australia/Sydney (${formatOffset(offsetMinutes(Date.now(), "Australia/Sydney"))})</small></div><div class="v long" id="vTo">–</div></div>
        <div class="res"><div class="k">Difference</div><div class="v" id="vDiff">–</div></div>
      </div>
      <p class="rounding" id="tzNote" hidden></p>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="tzCopy">${icon("copy")}Copy result</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    notice: `<aside class="notice" aria-label="Source">${icon("info")}<div><p><strong>New Zealand daylight saving starts at ${dst.rule.starts} and ends at ${dst.rule.ends}.</strong> Source: ${src("govt-daylight-saving")}, checked ${longDate(dst.checkedOn)}. Other countries' rules come from your browser's built-in time-zone data.</p></div></aside>`,
    body: `
        <h2>How it works</h2>
        <p>Every modern browser carries a copy of the international time-zone database, which records each region's offset from UTC and its daylight saving history. The converter asks your browser what offset applies in the first zone at the date and time you entered, turns that into a single moment, then asks what the clock reads at that moment in the second zone. Nothing is downloaded and nothing you enter leaves the page. Because the rules come from your browser, keep it up to date: if a country changes its daylight saving rules, browsers learn about it through updates.</p>

        <h2>New Zealand's two offsets</h2>
        <p>According to the government's daylight saving page, clocks in New Zealand go forward an hour at ${dst.rule.starts} and back at ${dst.rule.ends}. The next change dates it lists are ${longDate(p0.starts.slice(0, 10))} (forward) and ${longDate(p0.ends.slice(0, 10))} (back). That means the gap to other places changes during the year, and it changes twice when the other place has its own daylight saving on different dates.</p>
        <ul>
          <li>9am on ${longDate("2026-11-15")} in Auckland (${formatOffset(offsetMinutes(ex1.ms, z))}) is ${fmt(ex1.ms, "Europe/London")} in London and ${fmt(ex1.ms, "Australia/Sydney")} in Sydney.</li>
          <li>9am on ${longDate("2026-06-15")} in Auckland (${formatOffset(offsetMinutes(ex2.ms, z))}) is ${fmt(ex2.ms, "Europe/London")} in London and ${fmt(ex2.ms, "Australia/Sydney")} in Sydney.</li>
        </ul>
        <p>These examples are worked out with the same code the converter uses, by your build machine's copy of the time-zone data.</p>
        <!--@slot after-explainer-1-->
        <h2>The nights the clocks change</h2>
        <p>When daylight saving starts, the hour from 2am to 3am doesn't happen, so a time like 2:30am that night doesn't exist. The converter tells you and moves forward to a real time. When daylight saving ends, the hour before 3am happens twice, so 2:30am that night is ambiguous; the converter uses the first one and says so. If you're scheduling something at those hours, pick a different time.</p>

        <h2>Mistakes to avoid</h2>
        <ul>
          <li><strong>Assuming a fixed difference.</strong> "Sydney is two hours behind" is only true for part of the year.</li>
          <li><strong>Forgetting the date line.</strong> Morning in New Zealand is often the previous day in the Americas. Read the date in the result, not just the time.</li>
          <li><strong>Using abbreviations.</strong> Short names like CST or IST mean different things in different countries. Pick the place by city name instead.</li>
          <li><strong>The Chatham Islands</strong> are 45 minutes ahead of mainland New Zealand; choose Pacific/Chatham for them.</li>
        </ul>
        <p>Only the two zones you pick are kept in the page address after the # sign, never the time you type. To count down to an event in any zone, use the ${link("/countdown-timer", "countdown timer")}.</p>`,
    faq: [
      { q: "When does daylight saving start and end in New Zealand?", a: `<p>It starts at ${dst.rule.starts} and ends at ${dst.rule.ends}, according to the New Zealand Government's daylight saving page.</p>` },
      { q: "Why does the time difference to Australia change during the year?", a: "<p>New Zealand and Australia change their clocks on different dates, and not every Australian state changes at all. In the time-zone data, Sydney is ${syd[0]} in January and ${syd[1]} in July, while Brisbane is ${bne[0]} in January and ${bne[1]} in July. The converter applies each place's own rules for the date you choose.</p>" },
    ],
    related: [
      { href: "/countdown-timer", label: "Countdown timer" },
      { href: "/working-days-calculator", label: "Working days calculator" },
      { href: "/date-and-time-tools", label: "All date and time tools" },
    ],
  };
}
