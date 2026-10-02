// /gst-calculator: add or remove NZ GST. Every rate and threshold comes from data/nz/gst.json;
// the worked examples are computed with the same library the tool uses.
import { addGst, removeGst, gstLines } from "../../src/assets/lib/gst.js";
import { toBasisPoints } from "../../src/assets/lib/money.js";

export default function page(ctx) {
  const { gst, pct, pctText, money, dollars, src, link } = ctx;
  const bp = toBasisPoints(gst.rate.value);
  const r = pct(gst.rate.value);
  const frac = `${gst.inclusiveFraction.numerator}/${gst.inclusiveFraction.denominator}`;
  const a = addGst(24000, bp);
  const b = removeGst(8999, bp);
  const wrong = 11500 - Math.round(11500 * gst.rate.value);
  const right = removeGst(11500, bp);
  const lines = gstLines([1999, 1999, 1999].map(cents => ({ cents, mode: "remove" })), bp);

  return {
    path: "/gst-calculator",
    type: "tool",
    pillar: "nz-calculators",
    status: "published",
    reviewed: "2026-10-02",
    title: `GST Calculator NZ: Add or Remove ${pctText(gst.rate.value)} GST`,
    description: `Add ${pctText(gst.rate.value)} GST to a price or take it out of a GST-inclusive one, with line items and cent-accurate rounding. Free, private, works in your browser.`,
    h1: "GST calculator",
    appName: "NZ GST calculator",
    appCategory: "FinanceApplication",
    script: "gst",
    sources: [gst.rate.sourceId, gst.registrationThreshold.sourceId, gst.zeroRatedSourceId, gst.exemptSourceId, gst.supplyInfoThreshold.sourceId].map(id => ctx.source(id)),
    claims: [
      { text: `GST rate ${pctText(gst.rate.value)}`, source: gst.rate.sourceId },
      { text: `GST share of an inclusive price is ${frac}`, source: gst.inclusiveFraction.sourceId },
      { text: `Registration required at ${dollars(gst.registrationThreshold.value)} turnover in 12 months`, source: gst.registrationThreshold.sourceId },
      { text: "Some exported services are zero-rated", source: gst.zeroRatedSourceId },
      { text: "Financial services and donated goods sold by non-profits are exempt", source: gst.exemptSourceId },
      { text: `Taxable supply information on request for supplies over ${dollars(gst.supplyInfoThreshold.value)}`, source: gst.supplyInfoThreshold.sourceId },
    ],
    intro: `<p>Work out New Zealand GST in either direction: add ${r} to a price that doesn't include it yet, or find the GST hidden inside a price that already does. Type an amount and the answer updates as you go, rounded to the cent. For a quote or an invoice with several items, use the line-item list to see GST for each line and the totals. The rate comes from Inland Revenue's own pages, and the date it was last checked is shown below the calculator.</p>`,
    tool: `<form class="tool-form" id="gstForm" data-rate-bp="${bp}" data-rate-pct="${pctText(gst.rate.value)}" autocomplete="off" novalidate>
          <fieldset>
            <legend>What does your price include?</legend>
            <div class="seg">
              <label><input type="radio" name="mode" value="add" checked> Add GST (price excludes GST)</label>
              <label><input type="radio" name="mode" value="remove"> Remove GST (price includes GST)</label>
            </div>
          </fieldset>
          <div class="field">
            <label for="gstAmount" id="gstAmountLabel">Price excluding GST ($)</label>
            <input id="gstAmount" type="text" inputmode="decimal" maxlength="16" placeholder="100.00" aria-describedby="gstAmountError">
            <p class="error" id="gstAmountError" aria-live="polite"></p>
          </div>
          <div class="result" id="gstResult" aria-live="polite"></div>
          <details class="advanced">
            <summary>Several amounts (line items)</summary>
            <p class="hint">Each line uses the choice above. Descriptions are optional and stay on this page.</p>
            <div class="lines" id="gstLines"></div>
            <div class="row"><button class="btn secondary small" type="button" id="gstAddLine">Add a line</button></div>
            <div class="result" id="gstLinesResult" aria-live="polite"></div>
          </details>
        </form>`,
    notice: ctx.taxNotice([gst.rate.sourceId, gst.registrationThreshold.sourceId], { taxYear: false }),
    body: `
        <h2>How the two directions work</h2>
        <p>Adding GST is simple multiplication. If a supplier quotes ${money(a.exclusive)} plus GST, the tax is ${r} of that, ${money(a.gst)}, and the customer pays ${money(a.inclusive)}. The calculator does exactly this, then rounds to the nearest cent.</p>
        <p>Removing GST is where people slip. The GST inside an inclusive price is not ${r} of that price, because the ${r} was charged on the smaller, pre-GST amount. The share that is tax works out to ${frac} of the inclusive price. Inland Revenue uses the same fraction in its own guidance. So a receipt for ${money(b.inclusive)} contains ${money(b.gst)} of GST, and the price before GST was ${money(b.exclusive)}. Dividing the inclusive price by ${(1 + gst.rate.value).toFixed(2)} gives the same answer from the other side.</p>

        <h2>Worked example: a three-item invoice</h2>
        <p>Here is a small invented example. A café orders three boxes of takeaway cups at ${money(1999)} each, GST included. Rounding the GST on each line separately gives ${money(lines.rows[0].gst)} per box and ${money(lines.totals.gst)} altogether. Working the GST out once on the ${money(lines.totals.inclusive)} total gives ${money(lines.gstOnTotal)}. Neither figure is wrong; the one-cent gap comes purely from rounding three times instead of once. The line-item list shows both so you can match whatever your accounting software does. If the numbers on an invoice are off by a cent or two, rounding is almost always the reason.</p>
        <!--@slot after-explainer-1-->
        <h2>Mistakes that cost money</h2>
        <ul>
          <li><strong>Taking ${r} off an inclusive price.</strong> Knocking ${r} off ${money(11500)} leaves ${money(wrong)}, but the real pre-GST price is ${money(right.exclusive)}. The error grows with the amount, and on a large invoice it adds up to real money.</li>
          <li><strong>Mixing inclusive and exclusive figures.</strong> A quote that lists some items "plus GST" and others "incl. GST" needs each line handled on its own basis before you total it. Convert everything to one basis first.</li>
          <li><strong>Assuming every sale carries GST.</strong> Some supplies are zero-rated, meaning GST is charged at a rate of zero; certain services supplied to people outside New Zealand are one example. Others are exempt altogether, such as most financial services and donated goods sold by a non-profit. Inland Revenue lists these on its pages about ${src(gst.zeroRatedSourceId).replace(/ \(Inland Revenue\)$/, "")} and ${src(gst.exemptSourceId).replace(/ \(Inland Revenue\)$/, "")}. This calculator always uses the standard rate, so don't use it for those supplies.</li>
          <li><strong>Adding GST when you aren't registered.</strong> Inland Revenue says you must register if your taxable turnover reached ${dollars(gst.registrationThreshold.value)} in the last ${gst.registrationThreshold.period} or you expect it to in the next ${gst.registrationThreshold.period}. Adding GST to your prices also means you have to register. If you are under the threshold and not registered, you don't charge GST at all.</li>
        </ul>

        <h2>Limits of this calculator</h2>
        <p>It handles the everyday case: one standard rate applied to ordinary goods and services. It does not deal with land transactions, second-hand goods, imported goods, or the special rules some businesses use. It also can't tell you what records you need to keep, though it helps to know that a GST-registered buyer can ask for taxable supply information on supplies over ${dollars(gst.supplyInfoThreshold.value)}. For anything beyond simple arithmetic, check Inland Revenue's guidance or ask an accountant.</p>
        <p>What you type stays in your browser. Amounts and descriptions are never sent anywhere or saved. Only the add-or-remove choice is remembered, in the page address after the # sign, so a bookmark opens the calculator in the same mode.</p>
        <p>Working out pay rather than prices? The ${link("/nz-paye-calculator", "take-home pay calculator")} covers PAYE, ACC and KiwiSaver. To understand the tax itself, read ${link("/guides/gst-in-new-zealand-adding-and-removing-15-percent", "the guide to adding and removing GST")}.</p>`,
    faq: [
      { q: `Why isn't the GST in an inclusive price just ${r} of it?`, a: `<p>Because the ${r} was charged on the price before GST. Once GST is added, the tax is a smaller share of the bigger total: ${frac}. For a ${money(11500)} price that is ${money(right.gst)}, not ${money(Math.round(11500 * gst.rate.value))}.</p>` },
      { q: "Can I use this for zero-rated or exempt sales?", a: `<p>No. Zero-rated supplies carry GST at a rate of zero and exempt supplies carry none, so the standard-rate answer would be wrong. Inland Revenue's pages list which supplies fall into each group.</p>` },
      { q: "Do I have to charge GST?", a: `<p>Only if you are GST-registered. Inland Revenue says registration is required once your turnover from a taxable activity reaches ${dollars(gst.registrationThreshold.value)} in ${gst.registrationThreshold.period} (past or expected), or if you add GST to your prices.</p>` },
    ],
    related: [
      { href: "/nz-calculators", label: "All NZ calculators" },
      ...(ctx.isPublished("/nz-paye-calculator") ? [{ href: "/nz-paye-calculator", label: "Take-home pay calculator" }] : []),
      ...(ctx.isPublished("/guides/gst-in-new-zealand-adding-and-removing-15-percent") ? [{ href: "/guides/gst-in-new-zealand-adding-and-removing-15-percent", label: "Guide: GST in New Zealand" }] : []),
      { href: "/guides", label: "All guides" },
    ],
  };
}
