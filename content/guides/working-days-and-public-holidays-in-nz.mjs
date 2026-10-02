// Guide: working days and public holidays in New Zealand. Dates come from the MBIE data file; rules from Employment New Zealand.
import { workingDays, weekday } from "../../src/assets/lib/dates.js";

export default function page(ctx) {
  const { holidays, longDate, esc, link, src } = ctx;
  const years = Object.keys(holidays.years).sort();
  const all = y => holidays.years[y].holidays;
  const nat = y => all(y).filter(h => h.scope === "national");
  const moved = years.flatMap(y => nat(y).filter(h => h.observedForMonFri !== h.date));
  const day = iso => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][weekday(iso)];
  const movedRows = moved.map(h => `<tr><td>${esc(h.name)}</td><td>${day(h.date)} ${longDate(h.date)}</td><td>${day(h.observedForMonFri)} ${longDate(h.observedForMonFri)}</td></tr>`).join("");
  const regional = holidays.regions.map(r => {
    const d = years.map(y => all(y).find(h => h.scope === r.key));
    return `<tr><td>${esc(r.name)}</td>${d.map(h => `<td>${h ? longDate(h.observedForMonFri) : "not listed"}</td>`).join("")}</tr>`;
  }).join("");
  const mat = years.map(y => nat(y).find(h => /Matariki/.test(h.name)));
  const ready = !!holidays.years["2027"]; // worked examples use 2027 dates; without its data the page stays draft
  const xmas = workingDays("2027-12-20", "2028-01-07", holidays, {});
  const dec = workingDays("2027-12-20", "2027-12-31", holidays);
  const akl = workingDays("2027-01-25", "2027-02-12", holidays, { region: "auckland" });
  const wgtn = workingDays("2027-01-25", "2027-02-12", holidays, { region: "wellington" });
  return {
    path: "/guides/working-days-and-public-holidays-in-nz",
    type: "guide", pillar: "guides", topic: "Public holidays", status: ready ? "published" : "draft", reviewed: "2026-10-03", published: "2026-10-03",
    title: "Working Days and Public Holidays in NZ: How They Count",
    description: "How New Zealand public holidays affect working-day counts: Mondayisation, regional anniversary days, Matariki, and holidays that fall on a weekend.",
    crumbName: "Working days and public holidays",
    h1: "Working days and public holidays",
    h1Accent: "in New Zealand",
    sources: ["mbie-public-holidays", "emp-weekend-holidays", "emp-holiday-rights"].map(ctx.source),
    claims: [
      { text: "Holiday and anniversary dates for " + years.join(" and "), source: "mbie-public-holidays" },
      { text: "Weekend holiday stays on the weekend for weekend workers; moves to Monday or Tuesday otherwise", source: "emp-weekend-holidays" },
      { text: "Mondayisation: weekend day treated as a normal day", source: "emp-weekend-holidays" },
      { text: "No double claim for a Mondayised holiday; at most 4 over Christmas and New Year; one anniversary day a year", source: "emp-holiday-rights" },
      { text: "Working a public holiday: at least time and a half, plus an alternative holiday on an otherwise working day", source: "emp-holiday-rights" },
      { text: "Employment Leave Act to replace the Holidays Act in August 2028", source: "emp-holiday-rights" },
      { text: "Anniversary days set by local custom; table may contain errors", source: "mbie-public-holidays" },
    ],
    intro: `<p>Counting working days sounds like counting weekdays, until a public holiday lands on a Saturday or a deadline straddles your region's anniversary day. This guide explains how New Zealand's public holidays move when they fall on a weekend, how regional anniversary days work, where Matariki fits, and how to count working days for a deadline without being caught out.</p>`,
    body: `
        <p class="lede">For a Monday-to-Friday worker, a public holiday on a weekend usually moves to the Monday or Tuesday, anniversary days depend on the region you work in, and Matariki's date changes each year. Count from the dates Employment New Zealand publishes, not from memory.</p>

        <h2>What counts as a working day</h2>
        <p>In everyday use, a working day is a weekday that isn't a public holiday. That's the definition the ${link("/working-days-calculator", "working days calculator")} uses. But "working day" can mean something narrower in a contract, a lease or a piece of legislation, which may exclude extra days such as the period between Christmas and early January. When a deadline matters, find the definition the document uses first, then count. A day count is only as good as the definition behind it.</p>

        <h2>Holidays that fall on a weekend</h2>
        <p>Employment New Zealand explains that when a public holiday falls on a Saturday or Sunday, what happens depends on whether that day is one the person would normally work. For someone who usually works that weekend day, the holiday stays where it is. For someone who doesn't, it moves to the Monday, or sometimes the Tuesday. This is what people call Mondayisation, and the weekend day then counts as an ordinary day. These are the holidays in the published data that move for a Monday-to-Friday worker:</p>
        <table><thead><tr><th scope="col">Holiday</th><th scope="col">Actual date</th><th scope="col">Monday-to-Friday day off</th></tr></thead><tbody>${movedRows}</tbody></table>
        <p>The Tuesday cases happen at Christmas and New Year, when two holidays fall on the same weekend: Christmas Day takes the Monday and Boxing Day the Tuesday. A person can't claim both the actual date and the moved date as separate holidays, and Employment New Zealand says no one is entitled to more than four public holidays over the Christmas and New Year period, whatever their work pattern.</p>
        <!--@slot after-intro-->
        <h2>Regional anniversary days</h2>
        <p>Each region also has an anniversary day. Employment New Zealand notes that these are set by local custom and practice, and that some regions observe them on a different day from the actual anniversary, sometimes weeks away. Canterbury's is observed as Show Day in November, for instance, even though the anniversary itself is in December. Here are the days observed for Monday-to-Friday workers in each region:</p>
        <table><thead><tr><th scope="col">Region</th>${years.map(y => `<th scope="col">${y}</th>`).join("")}</tr></thead><tbody>${regional}</tbody></table>
        <p>You get one anniversary day a year, normally the one for the region you usually work in. Employment New Zealand says that if someone is temporarily based elsewhere, they and their employer should agree which one applies. It also warns that its table may contain errors and suggests checking with the local council, which is worth doing before you plan a long weekend around one.</p>

        <h2>Matariki</h2>
        <p>Matariki is a national public holiday, but unlike Labour Day or King's Birthday it doesn't follow a simple weekday rule, so its date has to be looked up for each year. Employment New Zealand lists ${mat.map(h => longDate(h.date)).join(" and ")}, both Fridays. Because it's on a weekday in both years, it doesn't move. If you're planning work or school dates further ahead, check the date for that year once it's published rather than assuming it repeats.</p>
        <!--@slot mid-content-->
        <h2>Worked examples</h2>
        <ul>
          <li><strong>The Christmas fortnight.</strong> From Monday 20 December 2027 to Friday 7 January 2028 there are ${xmas.weekdays} weekdays. Christmas Day and Boxing Day 2027 fall on the weekend, so their days off are Monday 27 and Tuesday 28 December. In December alone that leaves ${dec.days} working days out of ${dec.weekdays} weekdays. The calculator only has data for ${years.join(" and ")}, so it will tell you it can't check January 2028 rather than guess.</li>
          <li><strong>A three-week deadline in summer.</strong> From Monday 25 January to Friday 12 February 2027 there are ${akl.weekdays} weekdays. Waitangi Day falls on a Saturday that year, so Monday 8 February is a day off for both Auckland and Wellington workers. Each region then loses a different Monday: Wellington's anniversary day on 25 January and Auckland's on 1 February. Both end up with ${akl.days} working days${akl.days === wgtn.days ? "" : ` and ${wgtn.days}`}, but someone who counts only the national holidays would get one more than that.</li>
        </ul>

        <h2>If you work on a public holiday</h2>
        <p>Pay rules aren't what this site calculates, but they explain why the dates matter. Employment New Zealand says someone who works on a public holiday must be paid at least time and a half, and gets an alternative holiday (a paid day off later) if it was a day they'd normally work. It also notes that the Employment Leave Act is due to replace the Holidays Act in August 2028, so these rules may change. Its page on ${src("emp-holiday-rights")} sets out the detail, and ${src("emp-weekend-holidays")} covers the weekend cases.</p>

        <h2>Tips for counting</h2>
        <ul>
          <li>Write down whether the first and last days count before you start.</li>
          <li>Use the Monday-to-Friday day off, not the actual date, when a holiday lands on a weekend.</li>
          <li>Add your anniversary day only if the count is for one region.</li>
          <li>Remember workplace shutdowns aren't public holidays; remove them yourself if they apply.</li>
        </ul>
        <p>For plain calendar days, see ${link("/days-between-dates", "days between dates")} or the guide on ${link("/guides/how-to-count-days-between-two-dates", "counting days between two dates")}. To see the year at a glance with holidays marked, print the ${link("/printable-calendar", "printable calendar")}.</p>`,
    faq: [
      { q: "Why do I get Monday off when Anzac Day is on a Saturday?", a: "<p>If you don't normally work Saturdays, Employment New Zealand explains that the holiday moves to the Monday for you. If you do normally work Saturdays, it stays on the Saturday.</p>" },
      { q: "Can I have two anniversary days if I move region?", a: "<p>No. Employment New Zealand says you can claim only one regional anniversary day a year; if you're temporarily based elsewhere, agree with your employer which one applies.</p>" },
    ],
    related: [
      { href: "/working-days-calculator", label: "Working days calculator" },
      { href: "/printable-calendar", label: "Printable calendar" },
      { href: "/guides/how-to-count-days-between-two-dates", label: "How to count days between two dates" },
    ],
  };
}
