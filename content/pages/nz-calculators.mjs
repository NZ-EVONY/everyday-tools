// /nz-calculators hub: which calculator for which job. Tools appear as links once published.
export default function page(ctx) {
  const { link, tax, gst, pct, longDate, dollars } = ctx;
  return {
    path: "/nz-calculators",
    type: "hub",
    pillar: "nz-calculators",
    status: "published",
    reviewed: "2026-10-02",
    title: "NZ Calculators: GST, PAYE, KiwiSaver and More",
    description: "Free New Zealand calculators for GST, take-home pay, KiwiSaver, splitting rent and unit conversions, using official rates with the date they were checked.",
    h1: "New Zealand",
    h1Accent: "calculators",
    intro: `<p>These calculators handle the money and measurement questions that come up in New Zealand: how much GST is in a price, what a pay rise means after tax, how KiwiSaver contributions add up, or how to split the power bill fairly. They all run in your browser, so nothing you enter is sent anywhere.</p>`,
    top: `<section class="hub-tools" aria-labelledby="hub-tools-h"><h2 class="sec-title" id="hub-tools-h">The calculators</h2><p class="sec-sub">Each card opens a calculator; ones marked "coming soon" are still being checked against official sources.</p>${ctx.toolGrid("nz-calculators", ctx.isPublished)}</section>`,
    sources: [], claims: [],
    body: `
        <h2>Where the rates come from</h2>
        <p>Every rate and threshold these calculators use is read from Inland Revenue's or another government agency's own pages, stored once with its source and the date it was checked, and shown on each page. Pay figures are for the ${tax.taxYear} tax year, which runs from ${longDate(tax.periodStart)} to ${longDate(tax.periodEnd)}. GST figures were last checked on ${longDate(gst.checkedOn)}. When a new tax year starts, its rates are added as a separate set, so you always know which year a result belongs to.</p>
        <p>A calculator only goes live once its figures have been checked against an official page. If a rule can't be confirmed, the feature that depends on it waits rather than guessing. That is why some cards above still say "coming soon".</p>

        <h2>Which one for which job?</h2>
        <p>Pricing a job or checking an invoice: the GST calculator, which works in both directions and handles several lines at once. Comparing job offers or checking a pay slip: the take-home pay calculator, which shows every deduction per pay period. Thinking about retirement savings: the KiwiSaver calculator, which separates what you, your employer and the government put in. Sharing a house: the rent and bills splitter, which makes sure the shares add up to the bill exactly. Following an old recipe or a DIY plan in feet and inches: the unit converter.</p>
        <!--@slot mid-content-->
        <h2>Estimates, not advice</h2>
        <p>Results are estimates for general information. Real pay slips can differ because of tailored tax codes, one-off payments, or an employer's payroll rounding. Each calculator explains why its answer might not match yours, and links to the official source so you can check. For decisions about your own tax or KiwiSaver, talk to Inland Revenue, your provider or a qualified adviser.</p>

        <h2>Learn the rules behind the numbers</h2>
        <p>If you want to understand the tax as well as get an answer, the guides explain how ${link("/guides/gst-in-new-zealand-adding-and-removing-15-percent", "GST")}, ${link("/guides/how-nz-paye-is-worked-out", "PAYE")}, ${link("/guides/nz-tax-codes-explained", "tax codes")} and ${link("/guides/kiwisaver-contributions-explained", "KiwiSaver")} work, with examples. For sharing a house, see ${link("/guides/splitting-rent-and-bills-between-flatmates", "splitting rent and bills")}. A GST-registered business that charges ${dollars(gst.registrationThreshold.value)} or more a year will find the GST guide especially useful.</p>`,
  };
}
