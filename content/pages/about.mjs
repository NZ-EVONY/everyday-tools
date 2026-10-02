// /about. No invented people, team or credentials.
export default function page(ctx) {
  const { site, tax, gst, longDate, link } = ctx;
  return {
    path: "/about",
    type: "trust",
    status: "published",
    reviewed: "2026-10-02",
    title: "About Everyday Tools",
    description: "Who runs Everyday Tools, what the site is for, where its rates and dates come from, and how to report a mistake.",
    h1: "About Everyday Tools",
    sources: [], claims: [],
    body: `
        <p>Free, single-purpose tools for everyday jobs are what ${site.brand} offers: working out take-home pay or GST, counting days between dates, printing a calendar, cleaning up a messy list. It is run by ${site.operatorName} in New Zealand, so New Zealand rates, holidays, spelling and paper sizes come first, but most tools work for anyone.</p>

        <h2>What the site is, and isn't</h2>
        <p>Each tool does one job and explains how it does it. Pages are written to be read: the method, a worked example, the mistakes people commonly make, and the limits of the tool. There are no accounts, no paid tiers and no downloads to install. The site is not a bank, an accountant, a law firm or a government service, and nothing here is personal advice.</p>

        <h2>Where the numbers come from</h2>
        <p>Tax rates, levies, KiwiSaver rules, GST and public holiday dates are taken only from official sources, mainly Inland Revenue and Employment New Zealand. Each figure is stored once, with the address of the page it came from and the date it was checked, and every calculator page shows that date and links to the source. The current pay calculators use rates for the ${tax.taxYear} tax year, checked on ${longDate(tax.checkedOn)}; GST figures were checked on ${longDate(gst.checkedOn)}.</p>
        <p>If a figure can't be confirmed from an official page, it isn't published. The feature that needs it waits until it can be checked. Each tax year has its own data file, and the site refuses to build once a tax year has ended without the next year's rates being added, so out-of-date rates can't quietly linger.</p>
        <p>Unit conversion factors use the exact definitions published by standards bodies. Date tools use your browser's built-in calendar and time-zone data and never contact another server.</p>

        <h2>Privacy by design</h2>
        <p>Every tool runs in your browser. What you type isn't sent anywhere or stored, and pages load nothing from other companies. The ${link("/privacy-policy", "privacy policy")} explains the details, including how advertising will work if it's switched on.</p>

        <h2>How the pages are written</h2>
        <p>Every page shows when it was last reviewed. Worked examples use round, invented figures and are calculated by the same code the tool uses, so the example and the tool can't disagree.</p>

        <h2>Found a mistake?</h2>
        <p>Corrections are welcome, especially about rates and dates. Email <a href="mailto:${site.contactEmail}">${site.contactEmail}</a> with the page address, what looks wrong and, if you can, a link to the official source. The ${link("/contact", "contact page")} has more on what to include.</p>`,
  };
}
