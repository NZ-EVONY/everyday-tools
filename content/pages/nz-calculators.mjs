// /nz-calculators hub: which calculator for which job. Tools appear as links once published.
export default function page(ctx) {
  const { link, tax, gst, pct, longDate, dollars } = ctx;
  const item = (href, name, text) => `<li>${link(href, name)}${ctx.isPublished(href) ? "" : ' <span class="soon">(coming soon)</span>'}<p>${text}</p></li>`;
  return {
    path: "/nz-calculators",
    type: "hub",
    pillar: "nz-calculators",
    status: "published",
    reviewed: "2026-10-02",
    title: "NZ Calculators: GST, PAYE, KiwiSaver and More",
    description: "Free New Zealand calculators for GST, take-home pay, KiwiSaver, splitting rent and unit conversions, using official rates with the date they were checked.",
    h1: "New Zealand calculators",
    sources: [], claims: [],
    body: `
        <p>These calculators handle the money and measurement questions that come up in New Zealand: how much GST is in a price, what a pay rise means after tax, how KiwiSaver contributions add up, or how to split the power bill fairly. They all run in your browser, so nothing you enter is sent anywhere.</p>

        <h2>Which calculator do you need?</h2>
        <ul class="cards">
          ${item("/gst-calculator", "GST calculator", `For prices, quotes and invoices. Adds ${pct(gst.rate.value)} GST or takes it out of a GST-inclusive price, line by line if you need it.`)}
          ${item("/nz-paye-calculator", "Take-home pay calculator", "For pay slips and job offers. Works out PAYE, ACC earners' levy, student loan and KiwiSaver deductions for each pay period.")}
          ${item("/kiwisaver-calculator", "KiwiSaver calculator", "For contributions and an illustrative projection: your share, your employer's, and the government contribution if you qualify.")}
          ${item("/flatmate-rent-splitter", "Flatmate rent and bills splitter", "For shared houses. Splits rent and bills equally, by room size, by income or by days present, to the exact cent.")}
          ${item("/unit-converter", "Unit converter", "For recipes, DIY and old measurements. Metric and imperial lengths, areas, weights, volumes, temperatures and fuel economy.")}
        </ul>

        <h2>Where the rates come from</h2>
        <p>Every rate and threshold these calculators use is read from Inland Revenue's or another government agency's own pages, stored once with its source and the date it was checked, and shown on each page. Pay figures are for the ${tax.taxYear} tax year, which runs from ${longDate(tax.periodStart)} to ${longDate(tax.periodEnd)}. GST figures were last checked on ${longDate(gst.checkedOn)}. When a new tax year starts, its rates are added as a separate set, so you always know which year a result belongs to.</p>
        <p>A calculator only goes live once its figures have been checked against an official page. If a rule can't be confirmed, the feature that depends on it waits rather than guessing.</p>
        <!--@slot mid-content-->
        <h2>Estimates, not advice</h2>
        <p>Results are estimates for general information. Real pay slips can differ because of tailored tax codes, one-off payments, or an employer's payroll rounding. Each calculator explains why its answer might not match yours, and links to the official source so you can check. For decisions about your own tax or KiwiSaver, talk to Inland Revenue, your provider or a qualified adviser.</p>

        <h2>Learn the rules behind the numbers</h2>
        <p>If you want to understand the tax as well as get an answer, the ${link("/guides", "guides")} explain how GST, PAYE, tax codes and KiwiSaver work, with examples. A GST-registered business that charges ${dollars(gst.registrationThreshold.value)} or more a year will find the GST guide especially useful.</p>`,
  };
}
