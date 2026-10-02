// Guide: printing calendars and planners for the New Zealand year. Holiday dates come from the
// MBIE data file; school term dates are from the Ministry of Education page (moe-school-terms),
// read 3 October 2026. Paper sizes are the ISO 216 and US Letter dimensions.
import { weekday } from "../../src/assets/lib/dates.js";

export default function page(ctx) {
  const { link, longDate, holidays, esc, src } = ctx;
  // Ministry of Education, 2027 state and state-integrated school terms (term 1 start is a range).
  const terms2027 = [
    ["Term 1", "starts between 28 January and 3 February", "2027-04-09"],
    ["Term 2", longDate("2027-04-27"), "2027-07-02"],
    ["Term 3", longDate("2027-07-19"), "2027-09-24"],
    ["Term 4", longDate("2027-10-11"), "2027-12-17"],
  ];
  const y = "2027";
  const ready = !!holidays.years[y]; // copy and tables are written for 2027; without its data the page stays draft
  const nat = (holidays.years[y]?.holidays || []).filter(h => h.scope === "national");
  const day = iso => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekday(iso)];
  const moved = nat.filter(h => h.observedForMonFri !== h.date);
  return {
    path: "/guides/printing-calendars-and-planners-at-home",
    type: "guide", pillar: "guides", topic: "Printing", status: ready ? "published" : "draft", reviewed: "2026-10-03", published: "2026-10-03",
    title: "Printing a Calendar for the NZ Year: Holidays and Terms",
    description: "Print calendars and planners for the New Zealand year: A4 settings, which holidays to mark, school terms, and fitting the page on a home printer.",
    crumbName: "Printing calendars for the NZ year",
    h1: "Printing calendars and planners",
    h1Accent: "for the New Zealand year",
    sources: ["mbie-public-holidays", "moe-school-terms"].map(ctx.source),
    claims: [
      { text: `${y} national holidays and Monday-to-Friday days off`, source: "mbie-public-holidays" },
      { text: "2027 school term dates; term 1 start range; terms set for state and state-integrated schools", source: "moe-school-terms" },
      { text: "Easter Tuesday is a school holiday, not a public holiday", source: "moe-school-terms" },
      { text: "Schools choose their own start and end dates within the range", source: "moe-school-terms" },
    ],
    intro: `<p>A printed calendar on the fridge still does a job that a phone doesn't: everyone in the house can see the term dates, the long weekends and the rubbish days at a glance. Getting a New Zealand year onto paper has its own quirks, though. Holidays move when they fall on a weekend, school terms don't line up with months, and templates made overseas assume US Letter paper. This guide covers what to mark, where the official dates come from, and how to make it print cleanly on A4.</p>`,
    body: `
        <p class="lede">Print on A4 at 100 per cent, mark public holidays on the day people actually get off, take school terms from the Ministry of Education rather than from memory, and check your own school's first and last days.</p>

        <h2>A4 is the standard here</h2>
        <p>New Zealand uses the international A series, so home printers, stationery shops and offices stock A4 (${"210 × 297 mm"}) as the default. Many free calendar templates online are made in the US for Letter paper (8.5 × 11 inches, or 215.9 × 279.4 mm), which is slightly wider and noticeably shorter. Printed on A4, a Letter layout either loses its bottom row or gets shrunk with an uneven margin. Pick A4 in the page settings and in the print dialog, and choose 100 per cent (sometimes called actual size) rather than "fit to page". If you want a wall planner bigger than a home printer can manage, save the page as an A3 PDF and print it at a library or copy shop; because A sizes keep the same shape, the layout scales up without changing.</p>

        <h2>Which public holidays to mark</h2>
        <p>The ${y} national holidays, from Employment New Zealand's table, with the day a Monday-to-Friday worker gets off:</p>
        <table><thead><tr><th scope="col">Holiday</th><th scope="col">Date</th><th scope="col">Day off (Mon to Fri)</th></tr></thead><tbody>${nat.map(h => `<tr><td>${esc(h.name)}</td><td>${day(h.date)} ${longDate(h.date)}</td><td>${h.observedForMonFri === h.date ? "same day" : `${day(h.observedForMonFri)} ${longDate(h.observedForMonFri)}`}</td></tr>`).join("")}</tbody></table>
        <p>${y} is a year to watch: ${moved.map(h => esc(h.name)).join(", ")} all fall on a weekend, so for most office workers the day off moves to the following Monday, or Tuesday for Boxing Day. A household calendar is most useful if it shows the day people are actually off, which is what the ${link("/printable-calendar", "printable calendar")} marks. Add your regional anniversary day by hand; the guide to ${link("/guides/working-days-and-public-holidays-in-nz", "working days and public holidays")} lists them by region.</p>
        <!--@slot after-intro-->
        <h2>School terms</h2>
        <p>For families, term dates matter as much as public holidays. The Ministry of Education publishes them for state and state-integrated schools and kura. For ${y} they are:</p>
        <table><thead><tr><th scope="col">Term</th><th scope="col">Starts</th><th scope="col">Ends</th></tr></thead><tbody>${terms2027.map(t => `<tr><td>${t[0]}</td><td>${t[1]}</td><td>${t[0] === "Term 4" ? "no later than " : ""}${longDate(t[2])}</td></tr>`).join("")}</tbody></table>
        <p>Two details catch people out. First, schools choose their own first day of the year within the Ministry's range, and their own last day up to the latest allowed date, so check your school's newsletter for those two dates before you write them in. Second, the Tuesday after Easter is a school holiday but not a public holiday, so parents who work may still be at work that day. Private schools and early childhood services can set different dates. The Ministry's page on ${src("moe-school-terms")} also offers calendar files you can import into a phone, which pairs well with a paper copy on the fridge.</p>

        <h2>Choosing the right printable</h2>
        <ul>
          <li><strong>A year on one sheet</strong> for the fridge or a noticeboard, with term breaks shaded in by hand: the year view of the ${link("/printable-calendar", "printable calendar")}.</li>
          <li><strong>A page per month</strong> with room to write sports days, birthdays and rubbish collection: the monthly view, in landscape for wider boxes.</li>
          <li><strong>A school timetable</strong> or a shift roster by the hour: the ${link("/weekly-planner-and-timetable", "weekly planner and timetable")}.</li>
          <li><strong>Lists for the first week of term</strong>, such as stationery or uniforms: the ${link("/printable-checklist", "printable checklist")}.</li>
        </ul>
        <!--@slot mid-content-->
        <h2>Getting it onto paper</h2>
        <p>Open the print dialog and check four things: paper size (A4), scale (100 per cent), headers and footers (off, so the page address and date don't print in the margins) and background graphics (on, if you want the shading). Before printing for the whole whānau, choose "Save as PDF" and open the file; if the PDF fits on one page, the printout will too. Home printers leave a few millimetres unprinted at each edge, and the printables keep everything inside that. If you hole-punch pages for a ring binder, the monthly view in portrait leaves the most room on the binding edge.</p>
        <p>For a double-sided month-per-page calendar, choose "flip on long edge" for portrait and "flip on short edge" for landscape, or the backs come out upside down. Test with two sheets first. Heavier paper of around 120 gsm or more lasts a whole year on the fridge better than ordinary copy paper, and a clear plastic sleeve lets you mark the week with a whiteboard marker.</p>

        <h2>When the next year's dates aren't out yet</h2>
        <p>The calendar only marks holidays for years whose dates Employment New Zealand has published and this site has checked, currently ${Object.keys(holidays.years).sort().join(" and ")}. For a later year it prints an accurate grid without holiday marks, rather than guessing. Matariki in particular changes date each year, so wait for the official date before printing a calendar you'll rely on.</p>`,
    related: [
      { href: "/printable-calendar", label: "Printable calendar" },
      { href: "/weekly-planner-and-timetable", label: "Weekly planner and timetable" },
      { href: "/guides/working-days-and-public-holidays-in-nz", label: "Working days and public holidays" },
    ],
  };
}
