// Home page: the umbrella, four pillars, the tools and guides available so far.
export default function page(ctx) {
  const { link, tax, pct } = ctx;
  const card = (href, label) => `${link(href, label)}${ctx.isPublished(href) ? "" : ' <span class="soon">(coming soon)</span>'}`;
  return {
    path: "/",
    type: "home",
    status: "published",
    reviewed: "2026-10-02",
    title: "Everyday Tools: Free NZ Calculators and Handy Tools",
    description: "Free, private tools for everyday jobs in New Zealand: GST and pay calculators, date and time tools, printable calendars and text cleaners.",
    h1: "Free tools for everyday jobs",
    sources: [], claims: [],
    body: `
        <p class="lede">Quick, private tools for the small jobs that come up at work and at home in New Zealand. Each one does a single thing well, shows its working, and runs entirely in your browser.</p>

        <h2>Four kinds of tools</h2>
        <ul class="cards">
          <li>${card("/nz-calculators", "NZ calculators")}<p>GST, take-home pay, KiwiSaver, splitting rent between flatmates, and unit conversions. Rates come from Inland Revenue and show the date they were checked.</p></li>
          <li>${card("/date-and-time-tools", "Dates and time")}<p>Days between dates, ages, adding days or months, working days with NZ public holidays, time zones and countdowns.</p></li>
          <li>${card("/printables", "Printables")}<p>Calendars for any year, weekly planners and timetables, and checklists that print cleanly on A4 or US Letter.</p></li>
          <li>${card("/text-tools", "Text tools")}<p>Remove duplicate or blank lines, sort lists, add text to every line, and count words and characters.</p></li>
        </ul>

        <h2>Start here</h2>
        <p>The ${link("/gst-calculator", "GST calculator")} adds or removes GST at the current rate, with line items for invoices and quotes. It shows when the rate was last checked against Inland Revenue's own pages, and the worked example on the page comes from the same code you are using.</p>
        <p>More tools are being added section by section. A tool only goes live once its figures have been checked against an official source and its page explains the method properly, so some sections are still filling up. The ${link("/guides", "guides")} explain the ideas behind the tools, such as how PAYE is worked out or why the GST in a price isn't simply ${pct(ctx.gst.rate.value)} of it.</p>
        <!--@slot mid-content-->
        <h2>Why these tools are different</h2>
        <p><strong>Nothing you type leaves your device.</strong> Calculations happen in your browser. There are no accounts, no tracking scripts and no fonts or widgets loaded from other companies, so the pages are fast even on a slow connection.</p>
        <p><strong>Official numbers, dated.</strong> Tax rates and public holidays come only from government sources. The pay tools use the ${tax.taxYear} tax year, and every money page tells you when its figures were checked and links to where they came from.</p>
        <p><strong>Explained, not just answered.</strong> Each page walks through the method, a worked example and the mistakes people commonly make, so you can check the answer yourself or explain it to someone else.</p>

        <h2>About the site</h2>
        <p>Everyday Tools is run by an independent publisher in New Zealand. Read more ${link("/about", "about how the site works")}, or see the ${link("/privacy-policy", "privacy policy")}.</p>`,
  };
}
