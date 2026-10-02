// Guide: how to count days between two dates. Examples are worked out with the site's date code.
import { daysBetween, addPeriod, ymd, dayNumber } from "../../src/assets/lib/dates.js";

export default function page(ctx) {
  const { longDate, link } = ctx;
  const doy = iso => dayNumber(iso) - dayNumber(iso.slice(0, 4) + "-01-01") + 1;
  const a = "2026-03-14", b = "2026-08-02";
  const gap = daysBetween(a, b), incl = daysBetween(a, b, { inclusive: true });
  const trip = daysBetween("2026-12-19", "2027-01-04");
  const notice = addPeriod("2026-10-05", 28, "days");
  const month = addPeriod("2026-10-05", 1, "months");
  const baby = daysBetween("2026-05-20", "2026-10-03");
  const span = ymd("2025-11-18", "2027-02-03");
  const pl = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const months = [["January", 31], ["February", "28 or 29"], ["March", 31], ["April", 30], ["May", 31], ["June", 30], ["July", 31], ["August", 31], ["September", 30], ["October", 31], ["November", 30], ["December", 31]];
  return {
    path: "/guides/how-to-count-days-between-two-dates",
    type: "guide", pillar: "guides", topic: "Dates", status: "published", reviewed: "2026-10-03", published: "2026-10-03",
    title: "How to Count Days Between Two Dates (By Hand Too)",
    description: "Count the days between two dates correctly: the off-by-one trap, counting by hand with day-of-year numbers, weeks and months, and notice periods.",
    crumbName: "Counting days between dates",
    h1: "How to count days",
    h1Accent: "between two dates",
    sources: [], claims: [],
    intro: `<p>Working out how many days lie between two dates is the kind of sum that's easy to get slightly wrong. The answer is often one day out, or a few days out after crossing several months. This guide explains where those errors come from, gives a reliable way to count by hand when you don't have a calculator, and shows how to turn a day count into weeks or months without fooling yourself.</p>`,
    body: `
        <p class="lede">Turn each date into a day number, subtract, then decide whether the first day counts. Most mistakes come from skipping that last decision or from assuming every month has 30 days.</p>

        <h2>The off-by-one trap</h2>
        <p>Picture a fence ten metres long with a post every metre. It has ten gaps but eleven posts. Dates work the same way. Between 1 and 10 March there are nine gaps from one day to the next, but ten days if you count each square on the calendar. Neither answer is wrong. The question decides which one you need.</p>
        <p>Ask yourself which you're measuring: time passing, or days occupied. Time passing (how long until a birthday, how many nights in a motel) counts the gaps. Days occupied (how many days a festival runs, how many days a person was on site) counts the squares, which is the gap plus one. A summer trip from ${longDate("2026-12-19")} to ${longDate("2027-01-04")} is ${trip} nights away, but ${trip + 1} days if both travel days count.</p>

        <h2>Counting by hand with day-of-year numbers</h2>
        <p>For two dates in the same year, the most reliable manual method is to give each date its position in the year and subtract. Add up the lengths of the months before the date, then add the day of the month. Here are the month lengths:</p>
        <table><thead><tr><th scope="col">Month</th><th scope="col" class="num">Days</th></tr></thead><tbody>${months.map(([m, d]) => `<tr><td>${m}</td><td class="num">${d}</td></tr>`).join("")}</tbody></table>
        <p>Take ${longDate(a)} and ${longDate(b)}. Before March come January and February, 31 plus 28 in a common year, so ${longDate(a)} is day ${doy(a)}. Before August come seven months totalling 212 days, so ${longDate(b)} is day ${doy(b)}. Subtracting gives ${gap} days between them, or ${incl} counting both. If the dates are in different years, count to the end of the first year, add any whole years in between (365 or 366 each), then add the day number in the last year.</p>
        <!--@slot after-intro-->
        <h2>Remembering the month lengths</h2>
        <p>The rhyme "thirty days has September, April, June and November" covers the short months, and February is the odd one out. Another trick is the knuckle method: make a fist and run along your knuckles and the dips between them, starting with January on the first knuckle. Knuckles are the 31-day months; dips are the shorter ones. When you reach July on the last knuckle, start again on the first for August, so July and August both land on knuckles, matching their 31 days.</p>

        <h2>Weeks are easy, months aren't</h2>
        <p>Converting days to weeks is plain division: divide by seven and the remainder is extra days. A baby born on ${longDate("2026-05-20")} is ${baby} days old on ${longDate("2026-10-03")}, which is ${Math.floor(baby / 7)} weeks and ${baby % 7} days.</p>
        <p>Months are harder because they're different lengths. Counting calendar months means stepping forward month by month, then counting the days left over. From ${longDate("2025-11-18")} to ${longDate("2027-02-03")} is ${pl(span.years, "year")}, ${pl(span.months, "month")} and ${pl(span.days, "day")} in calendar terms, and ${daysBetween("2025-11-18", "2027-02-03")} days in total. When a month step starts on a day that doesn't exist in the shorter month, like the 31st, it lands on that month's last day instead. Dividing a day count by 30 or 30.4 gives a rough month figure, but don't use it where a month needs to be exact.</p>
        <!--@slot mid-content-->
        <h2>"28 days" and "one month" aren't the same</h2>
        <p>Notice periods, trial periods and return windows are written in different units, and they don't line up. Starting on ${longDate("2026-10-05")}, 28 days later is ${longDate(notice)}, while one calendar month later is ${longDate(month)}. Twelve four-week periods come to 336 days, nearly a month short of a year. When you're working out a deadline, use the unit the document uses, and check whether it says the period starts on the day of the event or the day after.</p>

        <h2>Leap years and time zones</h2>
        <p>Any range that includes the end of February in a leap year has one extra day, so a count that crosses 29 February 2028 is a day longer than the same dates in 2027. Time zones matter less than people fear. If you're counting calendar dates, as most day counts do, daylight saving and time differences don't change the answer. They only matter when the question is about hours or the exact moment something starts, such as an online sale that opens at midnight in another country.</p>

        <h2>A quick checklist</h2>
        <ul>
          <li>Decide first: gap between the dates, or every day including both ends?</li>
          <li>Use real month lengths, never an average, for an exact answer.</li>
          <li>Check for 29 February in the range.</li>
          <li>For deadlines, use the document's own unit and starting rule.</li>
        </ul>
        <p>The ${link("/days-between-dates", "days between dates calculator")} does all of this and shows the count in weeks and calendar months as well. To find the date a number of days away, use ${link("/add-subtract-days", "add or subtract days")}; for business days, see the guide to ${link("/guides/working-days-and-public-holidays-in-nz", "working days and public holidays")}.</p>`,
    related: [
      { href: "/days-between-dates", label: "Days between dates" },
      { href: "/add-subtract-days", label: "Add or subtract days" },
      { href: "/age-calculator", label: "Age calculator" },
    ],
  };
}
