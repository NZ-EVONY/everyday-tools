// Guide: New Zealand time zones and daylight saving. Rules from govt.nz; offsets from the time-zone database.
import { offsetMinutes, formatOffset } from "../../src/assets/lib/tz.js";

export default function page(ctx) {
  const { dstData: dst, longDate, link, src } = ctx;
  const dates = [["2026-10-01", "Early October"], ["2026-10-15", "Mid October"], ["2027-01-15", "Mid January"], ["2027-03-20", "Late March"], ["2027-06-15", "Mid June"]];
  const at = iso => Date.parse(iso + "T00:00:00Z");
  const off = (iso, z) => offsetMinutes(at(iso), z);
  const hrs = m => { const h = m / 60; return `${Number.isInteger(h) ? h : h.toFixed(2).replace(/0$/, "")} hours`; };
  const rows = dates.map(([iso, label]) => {
    const nz = off(iso, "Pacific/Auckland");
    return `<tr><td>${label}</td><td>${formatOffset(nz)}</td><td class="num">${hrs(nz - off(iso, "Europe/London"))}</td><td class="num">${hrs(nz - off(iso, "America/Los_Angeles"))}</td><td class="num">${hrs(nz - off(iso, "Australia/Sydney"))}</td><td class="num">${hrs(nz - off(iso, "Australia/Brisbane"))}</td></tr>`;
  }).join("");
  const chat = [off("2027-01-15", "Pacific/Chatham") - off("2027-01-15", "Pacific/Auckland"), off("2027-06-15", "Pacific/Chatham") - off("2027-06-15", "Pacific/Auckland")];
  const p = dst.periods;
  return {
    path: "/guides/new-zealand-time-zones-and-daylight-saving",
    type: "guide", pillar: "guides", topic: "Time zones", status: "published", reviewed: "2026-10-03", published: "2026-10-03",
    title: "New Zealand Time Zones and Daylight Saving Explained",
    description: "NZST and NZDT, when the clocks change, the Chatham Islands, why the gap to the UK, US and Australia shifts, and working through a clock change.",
    crumbName: "NZ time zones and daylight saving",
    h1: "New Zealand time zones",
    h1Accent: "and daylight saving",
    sources: [dst.sourceId, "govt-dst-legislation"].map(ctx.source),
    claims: [
      { text: "Clocks forward/back one hour; NZDT and NZST names; start and end rule and dates", source: dst.sourceId },
      { text: "Daylight saving first introduced 1927; current times fixed since 2007", source: dst.sourceId },
      { text: "NZST is 12 hours ahead of UTC; Chatham Islands 45 minutes ahead of NZST (Time Act 1974)", source: "govt-dst-legislation" },
      { text: "Time Act defines time in laws and documents", source: "govt-dst-legislation" },
      { text: "Pay when working through a clock change", source: "govt-dst-legislation" },
      { text: "Last reviewed 2007, period extended by one week", source: "govt-dst-legislation" },
    ],
    intro: `<p>New Zealand runs on one time zone for the main islands, plus a separate one for the Chatham Islands, and moves its clocks twice a year. That sounds simple until you're arranging a call with London or Los Angeles and the gap is an hour different from last month. This guide explains the two New Zealand offsets, when they apply, why the difference to other countries keeps shifting, and what the law says if you're at work when the clocks change.</p>`,
    body: `
        <p class="lede">New Zealand Standard Time is UTC+12. From the last Sunday in September to the first Sunday in April the clocks go forward an hour to New Zealand Daylight Time, UTC+13. The Chatham Islands are 45 minutes ahead of the mainland all year.</p>

        <h2>Standard time and daylight time</h2>
        <p>The government's daylight saving pages explain that the Time Act 1974 sets New Zealand Standard Time (NZST) at 12 hours ahead of Coordinated Universal Time, the world's reference clock. In spring the clocks move forward an hour to New Zealand Daylight Time (NZDT), and in autumn they move back. Daylight saving starts at ${dst.rule.starts} and ends at ${dst.rule.ends}. The upcoming changes are:</p>
        <table><thead><tr><th scope="col">Clocks go forward</th><th scope="col">Clocks go back</th></tr></thead><tbody>${p.map(x => `<tr><td>${longDate(x.starts.slice(0, 10))}</td><td>${longDate(x.ends.slice(0, 10))}</td></tr>`).join("")}</tbody></table>
        <p>New Zealand first introduced daylight saving in 1927, and the current start and end times have been fixed since 2007, when a review extended the daylight saving period by a week. The government says there are no current plans to review it again.</p>
        <!--@slot after-intro-->
        <h2>The Chatham Islands</h2>
        <p>The Chatham Islands keep their own time, 45 minutes ahead of the mainland under the same Act. In the time-zone database they change their clocks on the same dates as the mainland, so the gap is ${chat[0]} minutes in January and ${chat[1]} minutes in June. In software and calendar apps, choose the zone called Pacific/Chatham, because picking "New Zealand" will be 45 minutes out.</p>

        <h2>Why the gap to other countries keeps changing</h2>
        <p>The southern and northern hemispheres run daylight saving in opposite halves of the year. When New Zealand moves its clocks forward in September, the UK and most of the US are still on summer time, and they move theirs back a few weeks later. In March and April it happens the other way round. So for a few weeks each spring and autumn, both countries or neither are on daylight time, and the gap changes twice a year, not once. Australia adds another twist: some states change their clocks and others don't, and in the time-zone data Sydney moves its clocks forward a week after New Zealand does, which is why the gap is briefly three hours in early October. Here's how far Auckland is ahead at different times of year, worked out from the international time-zone database:</p>
        <table><thead><tr><th scope="col">Date</th><th scope="col">Auckland offset</th><th scope="col" class="num">Ahead of London</th><th scope="col" class="num">Ahead of Los Angeles</th><th scope="col" class="num">Ahead of Sydney</th><th scope="col" class="num">Ahead of Brisbane</th></tr></thead><tbody>${rows}</tbody></table>
        <p>A standing 9am call from Auckland with a colleague in London can drift between their evening and late night across the year. If you set up a repeating meeting, set it in one person's time zone in your calendar app and let the app do the conversion, rather than writing a fixed difference into the invite.</p>
        <!--@slot mid-content-->
        <h2>The night the clocks change</h2>
        <p>The changeover happens early on a Sunday morning because, according to the government, fewer people are working then. When daylight saving starts, the clock jumps from 2am to 3am, so that hour never happens; anything scheduled for 2:30am that night needs a new time. When it ends, the clock goes from 3am back to 2am, and the hour from 2am to 3am happens twice. Many phones and computers change automatically, but ovens, car clocks and some heating timers don't. The government's tip is to change manual clocks the night before.</p>

        <h2>Working through a clock change</h2>
        <p>The Time Act also covers pay. If you're working an overnight shift when the clocks go forward, you work an hour less but are entitled to be paid for your normal hours. If you're working when the clocks go back, you're entitled to be paid for the extra hour you actually work. The Act also defines what time means whenever a law or a document such as a contract mentions one. The details are on the government's page about ${src("govt-dst-legislation")}.</p>

        <h2>Practical tips</h2>
        <ul>
          <li>Name places, not abbreviations: "Auckland time" can't be misread, but a short code may be taken to mean standard time when daylight time applies.</li>
          <li>Check the date as well as the time; mornings in New Zealand are often yesterday in the Americas.</li>
          <li>For the Chathams, always allow the extra 45 minutes.</li>
          <li>Avoid scheduling anything between 2am and 3am on changeover nights.</li>
        </ul>
        <p>The ${link("/time-zone-converter", "time zone converter")} applies the right offset for both places on any date, and the ${link("/countdown-timer", "countdown timer")} counts down to an event in a chosen zone.</p>`,
    faq: [
      { q: "Is New Zealand UTC+12 or UTC+13?", a: "<p>Both, at different times of year: UTC+12 during standard time and UTC+13 during daylight saving, from the last Sunday in September to the first Sunday in April.</p>" },
      { q: "Do the Chatham Islands have daylight saving?", a: "<p>Yes. In the international time-zone database they change on the same dates as the mainland, so they stay 45 minutes ahead all year.</p>" },
    ],
    related: [
      { href: "/time-zone-converter", label: "Time zone converter" },
      { href: "/countdown-timer", label: "Countdown timer" },
      { href: "/date-and-time-tools", label: "All date and time tools" },
    ],
  };
}
