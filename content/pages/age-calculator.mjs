// /age-calculator
import { age } from "../../src/assets/lib/dates.js";

export default function page(ctx) {
  const { link, icon } = ctx;
  const a = age("1990-06-15", "2026-10-02");
  const l1 = age("2008-02-29", "2026-02-28"), l2 = age("2008-02-29", "2026-02-28", { leapRule: "mar1" });
  const kid = age("2019-11-03", "2026-10-02");
  return {
    path: "/age-calculator",
    type: "tool",
    pillar: "date-and-time-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Age Calculator: Exact Age in Years, Months and Days",
    description: "Work out an exact age in years, months and days on any date, the days until the next birthday, and days alive. Handles 29 February birthdays.",
    crumbName: "Age calculator",
    h1: "Age calculator:",
    h1Accent: "years, months and days",
    appName: "Age calculator",
    script: "age",
    chips: [`<span class="chip">${icon("hourglass")}29 February handled</span>`],
    sources: [], claims: [],
    intro: `<p>Find an exact age on any date, not just today. Enter a date of birth and the calculator gives the age in whole years plus months and days, how long until the next birthday and which day of the week it falls on, and the total number of days lived so far. It's handy for forms that ask for age on a particular date, school and sports age groups, or simply settling who is older.</p>`,
    tool: `<form id="ageForm" autocomplete="off" novalidate>
      <div class="panel-h"><h2>Dates</h2></div>
      <div class="fields">
        <div class="field"><label for="aBirth">Date of birth</label><input class="in" id="aBirth" type="date" min="0001-01-01" max="9999-12-31" aria-describedby="aHint"></div>
        <div class="field"><label for="aOn">Age on</label><input class="in" id="aOn" type="date" min="0001-01-01" max="9999-12-31"></div>
      </div>
      <fieldset id="leapRow" hidden>
        <legend class="field-label">Born on 29 February: in other years, count the birthday on</legend>
        <div class="seg"><label><input type="radio" name="leap" value="feb28" checked><span>28 February</span></label><label><input type="radio" name="leap" value="mar1"><span>1 March</span></label></div>
      </fieldset>
      <p class="hint" id="aHint" role="alert"></p>
    </form>`,
    results: `<div class="results">
        <div class="res key"><div class="k">Age<small id="vAgeK"></small></div><div class="v" id="vAge">–</div></div>
        <div class="res"><div class="k">Next birthday<small id="vNextK"></small></div><div class="v long" id="vNext">–</div></div>
        <div class="res"><div class="k">Days alive<small>including leap days</small></div><div class="v" id="vAlive">–</div></div>
      </div>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="aCopy">${icon("copy")}Copy result</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    body: `
        <h2>How an age is counted</h2>
        <p>Age in years goes up by one on each birthday, so the calculator first finds the most recent birthday on or before the "age on" date. The months and days are then counted from that birthday: whole calendar months first, then the days left over. If a month would land on a date that doesn't exist, such as the 31st of a 30-day month, it uses the last day of that month, the same rule used when adding months to a date.</p>
        <p>The days-alive figure is a straight count of calendar days between the two dates, so it includes every leap day that has passed.</p>

        <h2>Worked examples</h2>
        <ul>
          <li>Someone born on 15 June 1990 is ${a.years} years, ${a.months} months and ${a.days} days old on 2 October 2026, and has lived ${a.totalDays.toLocaleString("en-NZ")} days. They turn ${a.nextAge} in ${a.daysToNext} days.</li>
          <li>A child born on 3 November 2019 is ${kid.years} on 2 October 2026, with ${kid.daysToNext} days to go until turning ${kid.nextAge}, useful for sports or school groups that set age by a cut-off date.</li>
          <li>Someone born on 29 February 2008 is ${l1.years} on 28 February 2026 if birthdays in ordinary years are counted on 28 February, or ${l2.years} if they're counted on 1 March.</li>
        </ul>
        <!--@slot after-explainer-1-->
        <h2>The 29 February question</h2>
        <p>People born on a leap day have a real birthday only once every four years, so in other years they pick a day to celebrate. Some choose 28 February, which keeps the birthday in the same month; others choose 1 March, the day after 28 February. The answer can matter for official purposes such as the date someone becomes old enough to do something, and different countries and organisations have their own rules. The calculator lets you choose, and shows the choice only when the date of birth is 29 February. For anything with legal weight, check the rule that applies to you rather than relying on this tool.</p>

        <h2>Mistakes to avoid</h2>
        <ul>
          <li><strong>Subtracting years only.</strong> 2026 minus 1990 is 36, but someone born late in the year might still be 35. The birthday has to have passed.</li>
          <li><strong>Using today's date when a form asks for age on a set date</strong>, such as 1 January for an age group or the date of an event. Change the "age on" date.</li>
          <li><strong>Treating months as equal lengths.</strong> "Six months old" means six calendar months, not 180 days.</li>
        </ul>
        <p>The dates you enter stay in your browser and aren't saved or added to the page address. To count the days between any two dates, use the ${link("/days-between-dates", "days between dates calculator")}; to see a date in another time zone, try the ${link("/time-zone-converter", "time zone converter")}.</p>`,
    faq: [
      { q: "How do I work out an age on a past or future date?", a: "<p>Change the \"Age on\" date. It starts at today but can be any date after the date of birth.</p>" },
      { q: "Why does my age in days not equal years times 365?", a: "<p>Leap years add a day roughly every four years, and the partial year since the last birthday adds more. The calculator counts actual calendar days.</p>" },
    ],
    related: [
      { href: "/days-between-dates", label: "Days between dates" },
      { href: "/countdown-timer", label: "Countdown timer" },
      { href: "/date-and-time-tools", label: "All date and time tools" },
    ],
  };
}
