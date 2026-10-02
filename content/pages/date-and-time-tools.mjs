// /date-and-time-tools hub
export default function page(ctx) {
  const { link, holidays } = ctx;
  const years = Object.keys(holidays.years).sort();
  return {
    path: "/date-and-time-tools",
    type: "hub",
    pillar: "date-and-time-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Date and Time Tools: Days, Ages, Time Zones",
    description: "Free date and time tools for New Zealand: days between dates, age, adding days, working days with public holidays, time zones and countdowns.",
    h1: "Date and time",
    h1Accent: "tools",
    intro: `<p>Six tools for the date and time questions that are easy to get wrong in your head: how many days until something, exactly how old someone is, what date falls 90 days from now, how many working days a deadline really leaves, what time it is in Sydney or London, and how long until an event.</p>`,
    top: `<section class="hub-tools" aria-labelledby="hub-tools-h"><h2 class="sec-title" id="hub-tools-h">The tools</h2>${ctx.toolGrid("date-and-time-tools", ctx.isPublished)}</section>`,
    sources: [], claims: [],
    body: `
        <h2>Which tool for which question?</h2>
        <p><strong>"How long until…" or "how long since…"</strong> is the ${link("/days-between-dates", "days between dates")} calculator. It answers in days, weeks, and calendar months, and lets you decide whether the end date counts. <strong>"How old is…"</strong> is the ${link("/age-calculator", "age calculator")}, which gives years, months and days on any date, not just today. <strong>"What date is…"</strong> 30 days, six weeks or three months from a given day is ${link("/add-subtract-days", "add or subtract days")}, which also explains what happens at the end of short months.</p>
        <p>If a deadline is in working days, the ${link("/working-days-calculator", "working days calculator")} leaves out weekends and New Zealand public holidays (on the day a Monday-to-Friday worker gets them off), plus your regional anniversary day if you choose one. Holiday data is included for ${years.join(" and ")}. For meetings and calls across borders, the ${link("/time-zone-converter", "time zone converter")} handles daylight saving at both ends, and the ${link("/countdown-timer", "countdown timer")} counts down to a moment in any zone and can be shared by link.</p>

        <h2>How these tools treat dates</h2>
        <p>Date arithmetic is done in whole calendar days, so daylight saving and time zones never shift a day count. Leap years follow the Gregorian rules. Time-zone tools use the time-zone database built into your browser, so nothing is looked up online. Where a result depends on a choice, such as whether a range is inclusive or what a 29 February birthday counts as in other years, the tool asks rather than assuming, and its page explains the difference.</p>

        <h2>Privacy</h2>
        <p>Everything runs in your browser. Dates and times you type aren't sent anywhere or saved; at most, settings such as the time zones you picked are kept in the page address after the # sign so a bookmark opens the tool the same way. For printing a month or a year with holidays marked, see the ${link("/printables", "printables")}. For the reasoning behind the answers, read the guides on ${link("/guides/how-to-count-days-between-two-dates", "counting days between two dates")}, ${link("/guides/working-days-and-public-holidays-in-nz", "working days and public holidays")} and ${link("/guides/new-zealand-time-zones-and-daylight-saving", "time zones and daylight saving")}.</p>`,
  };
}
