// /add-subtract-days
import { addPeriod } from "../../src/assets/lib/dates.js";

export default function page(ctx) {
  const { link, icon } = ctx;
  const ex1 = addPeriod("2026-10-02", 90, "days");
  const ex2 = addPeriod("2026-01-31", 1, "months");
  const ex3 = addPeriod("2028-02-29", 1, "years");
  const ex4 = addPeriod("2026-10-02", -6, "weeks");
  const nice = iso => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1]} ${y}`; };
  return {
    path: "/add-subtract-days",
    type: "tool",
    pillar: "date-and-time-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Add or Subtract Days, Weeks or Months from a Date",
    description: "Find the date a number of days, weeks, months or years before or after any date, with month ends handled correctly. Free, private and instant.",
    crumbName: "Add or subtract days",
    h1: "Add or subtract",
    h1Accent: "days from a date",
    appName: "Add or subtract days calculator",
    script: "adddays",
    chips: [`<span class="chip">${icon("calplus")}Days, weeks, months, years</span>`],
    sources: [], claims: [],
    intro: `<p>Work out a date in the future or the past: 90 days from today, six weeks before an event, three months after a start date, or a year on from a deadline. Choose a starting date, a number and a unit, and pick whether to add or subtract. The answer shows the full date with the day of the week, and the calculator explains what happens when a month doesn't have the day you started on.</p>`,
    tool: `<form id="addForm" autocomplete="off" novalidate>
      <div class="panel-h"><h2>Starting point</h2></div>
      <div class="fields">
        <div class="field"><label for="adStart">Start date</label><input class="in" id="adStart" type="date" min="0001-01-01" max="9999-12-31"></div>
      </div>
      <fieldset><legend class="sr-only">Add or subtract</legend>
        <div class="seg"><label><input type="radio" name="dir" value="add" checked><span>Add</span></label><label><input type="radio" name="dir" value="sub"><span>Subtract</span></label></div>
      </fieldset>
      <div class="fields">
        <div class="field"><label for="adN">How many</label><input class="in" id="adN" type="text" inputmode="numeric" maxlength="7" placeholder="30" aria-describedby="adHint"></div>
        <div class="field"><label for="adUnit">Unit</label><select class="in" id="adUnit"><option value="days">days</option><option value="weeks">weeks</option><option value="months">months</option><option value="years">years</option></select></div>
      </div>
      <p class="hint" id="adHint" role="alert"></p>
    </form>`,
    results: `<div class="results">
        <div class="res key"><div class="k">Result</div><div class="v long" id="vResult">–</div></div>
      </div>
      <p class="rounding reserve" id="vSentence"></p>
      <p class="rounding" id="adClamp" hidden>The start date's day doesn't exist in that month, so the result is the last day of the month.</p>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="adCopy">${icon("copy")}Copy result</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    body: `
        <h2>Days and weeks are simple; months and years aren't</h2>
        <p>Adding days or weeks just moves along the calendar: 7 days is always a week, and the day of the week never changes when you add whole weeks. Months and years are trickier because they vary in length. One month after 15 March is clearly 15 April. But what is one month after 31 January, when February has no 31st? The calculator follows a common convention: keep the same day of the month if it exists, otherwise use the last day of the month. So one month after 31 January is 28 February, or 29 February in a leap year.</p>
        <p>Years work the same way. Adding a year to 29 February lands on 28 February in an ordinary year.</p>

        <h2>Worked examples</h2>
        <ul>
          <li>90 days after 2 October 2026 is ${nice(ex1)}.</li>
          <li>One month after 31 January 2026 is ${nice(ex2)}.</li>
          <li>One year after 29 February 2028 is ${nice(ex3)}.</li>
          <li>Six weeks before 2 October 2026 is ${nice(ex4)}, the same day of the week.</li>
        </ul>
        <!--@slot after-explainer-1-->
        <h2>Things to watch for</h2>
        <ul>
          <li><strong>"30 days" and "one month" aren't the same.</strong> A notice period of one month from 1 February ends on 1 March, which is 28 days later; 30 days lands on 3 March. If a document says one, don't use the other.</li>
          <li><strong>Adding months then subtracting them may not get you back.</strong> 31 January plus one month is 28 February, and 28 February minus one month is 28 January. That's a feature of uneven months, not a bug.</li>
          <li><strong>Business days are different.</strong> This tool counts every calendar day, including weekends and public holidays. For deadlines in working days, check the result with the ${link("/working-days-calculator", "working days calculator")}.</li>
          <li><strong>Whether the start day counts.</strong> "Within 10 days" can mean different things in different rules. This tool moves exactly the number you enter from the start date, so day 1 is the day after the start.</li>
        </ul>

        <h2>Privacy and limits</h2>
        <p>Calculations use whole calendar days, so time zones and daylight saving don't affect them. The range is years 1 to 9999. The dates and number you enter stay in your browser; only the unit and add-or-subtract choice are kept in the page address after the # sign, so a bookmark opens the tool set up the same way. To count the days between two dates instead, use ${link("/days-between-dates", "days between dates")}.</p>`,
    faq: [
      { q: "What is one month after 31 January?", a: "<p>28 February, or 29 February in a leap year. When the start day doesn't exist in the target month, the calculator uses the last day of that month.</p>" },
      { q: "Can I go backwards?", a: "<p>Yes. Choose Subtract, or enter the number and switch the direction. Weeks and days move back exactly; months and years follow the same month-end rule.</p>" },
    ],
    related: [
      { href: "/days-between-dates", label: "Days between dates" },
      { href: "/working-days-calculator", label: "Working days calculator" },
      { href: "/date-and-time-tools", label: "All date and time tools" },
    ],
  };
}
