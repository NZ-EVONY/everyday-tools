// /days-between-dates
import { daysBetween, ymd } from "../../src/assets/lib/dates.js";

export default function page(ctx) {
  const { link, icon } = ctx;
  const xmas = daysBetween("2026-10-02", "2026-12-25");
  const xmasIncl = daysBetween("2026-10-02", "2026-12-25", { inclusive: true });
  const leap = daysBetween("2028-02-01", "2028-03-01");
  const plain = daysBetween("2027-02-01", "2027-03-01");
  const c = ymd("2026-01-31", "2026-03-01");
  return {
    path: "/days-between-dates",
    type: "tool",
    pillar: "date-and-time-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Days Between Dates Calculator: Count Days and Weeks",
    description: "Count the days between two dates, with or without the end date, plus weeks and calendar months. Handles leap years. Free and private.",
    crumbName: "Days between dates",
    h1: "Days between",
    h1Accent: "two dates",
    appName: "Days between dates calculator",
    script: "days",
    chips: [`<span class="chip">${icon("range")}Leap years handled</span>`],
    sources: [], claims: [],
    intro: `<p>Count how many days lie between two dates: until a holiday, since a start date, or across a contract or notice period. Pick the two dates and the answer appears at once, along with the same gap in weeks and in calendar months and days. A single switch decides whether the end date counts too, which is the question that trips most people up. Leap years are handled automatically.</p>`,
    tool: `<form id="daysForm" autocomplete="off" novalidate>
      <div class="panel-h"><h2>Your dates</h2></div>
      <div class="fields">
        <div class="field"><label for="dFrom">Start date</label><input class="in" id="dFrom" type="date" min="0001-01-01" max="9999-12-31" aria-describedby="dHint"></div>
        <div class="field"><label for="dTo">End date</label><input class="in" id="dTo" type="date" min="0001-01-01" max="9999-12-31"></div>
      </div>
      <label class="check"><input type="checkbox" id="dIncl"> Count both the start and end dates (inclusive)</label>
      <p class="hint" id="dHint" role="alert"></p>
      <div class="actions no-print"><button type="button" class="btn btn-ghost btn-sm" id="dToday">${icon("cal")}Start from today</button></div>
    </form>`,
    results: `<div class="results">
        <div class="res key"><div class="k">Days<small id="vDaysK">not counting the start date</small></div><div class="v" id="vDays">–</div></div>
        <div class="res"><div class="k">In weeks</div><div class="v long" id="vWeeks">–</div></div>
        <div class="res"><div class="k">In calendar terms</div><div class="v long" id="vCal">–</div></div>
      </div>
      <p class="rounding reserve" id="vRange"></p>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="dCopy">${icon("copy")}Copy result</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    body: `
        <h2>Inclusive or exclusive?</h2>
        <p>Ask "how many days from Monday to Friday?" and some people say four, others five. Both are right; they're answering different questions. Counting the gap between the dates (exclusive) gives four: that's how many nights pass, or how many times you'd turn the page on a calendar. Counting every day touched (inclusive) gives five: that's how many days you'd be at a conference that runs Monday to Friday.</p>
        <p>By default the calculator gives the gap, so the start date isn't counted and the end date is. Tick the box to count both. Leases, hire periods, event lengths and "days present" usually want the inclusive count; time until something and time since something usually want the gap. If a contract or law sets a deadline, read how it defines the count, because some phrase it as "clear days", which leaves out both the first and the last day.</p>

        <h2>Worked examples</h2>
        <ul>
          <li>From 2 October to Christmas Day 2026 is ${xmas} days, or ${xmasIncl} counting both days.</li>
          <li>February 2028 has 29 days because 2028 is a leap year, so 1 February to 1 March 2028 is ${leap} days; the same dates in 2027 give ${plain}.</li>
          <li>From 31 January to 1 March 2026 is ${c.months} month and ${c.days} day in calendar terms: one month after 31 January lands on the last day of February, and the extra day takes you to 1 March.</li>
        </ul>
        <p>All three come from the same code as the calculator.</p>
        <!--@slot after-explainer-1-->
        <h2>How it counts</h2>
        <p>Each date is turned into a plain count of days on the calendar, then one is subtracted from the other. Times of day and time zones play no part, so a daylight saving change in between can't add or lose a day. The weeks figure is simply the day count divided by seven with the remainder shown as days. The calendar figure counts whole months first, using the rule that a month after the 31st lands on the last day of a shorter month, then shows the days left over. Because months differ in length, the same number of days can be a different number of months depending on where it falls in the year.</p>
        <p>Years run from 1 to 9999, using the Gregorian calendar throughout. That rule applies leap years every four years, except century years that can't be divided by 400 (so 1900 and 2100 aren't leap years and 2000 was). Historical records from before a country switched to the Gregorian calendar may use the older Julian calendar, so very old dates may not match them.</p>

        <h2>Common mistakes</h2>
        <ul>
          <li><strong>Counting on your fingers across a month end.</strong> It's easy to assume 30 days in every month. Over a few months that drifts by days.</li>
          <li><strong>Forgetting leap years</strong> when a range crosses the end of February.</li>
          <li><strong>Mixing up working days and calendar days.</strong> This tool counts every day. For Monday-to-Friday days with public holidays taken out, use the ${link("/working-days-calculator", "working days calculator")}.</li>
        </ul>
        <p>Your dates stay in your browser and aren't saved. Only the inclusive setting is remembered in the page address after the # sign. To find the date a set number of days away, use ${link("/add-subtract-days", "add or subtract days")}.</p>`,
    faq: [
      { q: "Does the calculator include the end date?", a: "<p>By default it counts the gap: the end date is counted and the start date isn't. Tick \"count both\" to include the start date as well, which adds one day.</p>" },
      { q: "How many days are there in a year?", a: "<p>365, or 366 in a leap year. A year is a leap year if it divides by 4, except century years, which must also divide by 400.</p>" },
    ],
    related: [
      { href: "/working-days-calculator", label: "Working days calculator" },
      { href: "/add-subtract-days", label: "Add or subtract days" },
      { href: "/date-and-time-tools", label: "All date and time tools" },
      { href: "/guides/how-to-count-days-between-two-dates", label: "Guide: counting days between dates" },
    ],
  };
}
