// Guide: GST in New Zealand, adding and removing it. (Slug fixed by the brief; the rate in copy comes from data.)
import { addGst, removeGst, gstLines } from "../../src/assets/lib/gst.js";
import { toBasisPoints } from "../../src/assets/lib/money.js";

export default function page(ctx) {
  const { gst, pct, pctText, money, dollars, link, src } = ctx;
  const bp = toBasisPoints(gst.rate.value);
  const r = pct(gst.rate.value);
  const n = gst.inclusiveFraction.numerator, d = gst.inclusiveFraction.denominator;
  const quote = addGst(480000, bp), receipt = removeGst(34500, bp), coffee = removeGst(550, bp);
  const inv = [1999, 2499, 1249, 899, 4551];
  const lines = gstLines(inv, "remove", bp);
  const wrong = 34500 - Math.round(34500 * gst.rate.value);
  return {
    path: "/guides/gst-in-new-zealand-adding-and-removing-15-percent",
    type: "guide", pillar: "guides", topic: "GST", status: "published", reviewed: "2026-10-03", published: "2026-10-03",
    title: `GST in New Zealand: Adding and Removing ${pctText(gst.rate.value)}`,
    description: `How New Zealand GST works, why removing it uses ${n}/${d} rather than ${pctText(gst.rate.value)}, when GST isn't charged, and when a business must register.`,
    crumbName: "GST in New Zealand",
    h1: "GST in New Zealand:",
    h1Accent: `adding and removing ${pctText(gst.rate.value)}`,
    sources: [gst.rate.sourceId, gst.registrationThreshold.sourceId, gst.zeroRatedSourceId, gst.exemptSourceId, gst.supplyInfoThreshold.sourceId].map(ctx.source),
    claims: [
      { text: "GST rate and inclusive fraction", source: gst.rate.sourceId },
      { text: "Registration threshold and rule", source: gst.registrationThreshold.sourceId },
      { text: "Zero-rated exported services examples", source: gst.zeroRatedSourceId },
      { text: "Exempt supplies examples", source: gst.exemptSourceId },
      { text: "Taxable supply information over $200 within 28 days on request", source: gst.supplyInfoThreshold.sourceId },
      { text: "GST returns: output tax less input tax", source: gst.registrationThreshold.sourceId },
    ],
    notice: ctx.taxNotice([gst.rate.sourceId, gst.registrationThreshold.sourceId], { taxYear: false }),
    intro: `<p>Goods and services tax is added to most things sold in New Zealand. For shoppers it's simply part of the price; for businesses it's a tax they collect and pass on. This guide explains the arithmetic in both directions, why removing GST from a price isn't the same as taking ${r} off, which sales carry no GST, and when a business has to register.</p>`,
    body: `
        <p class="lede">GST is ${r} of the price before tax. Adding it means multiplying by ${(1 + gst.rate.value).toFixed(2)}; removing it means taking ${n}/${d} of the GST-inclusive price.</p>

        <h2>Who pays and who collects</h2>
        <p>GST-registered businesses add GST to their prices, collect it from customers, and pay it to Inland Revenue. They can also claim back the GST they paid on things they bought for the business. Each GST return works out the difference: GST collected on sales minus GST paid on purchases. If a business collected more than it paid, it pays the balance; if it paid more, it gets a refund. The final consumer, who can't claim it back, carries the cost.</p>

        <h2>Adding GST</h2>
        <p>A builder quotes ${money(quote.exclusive)} plus GST for a deck (an invented figure). The GST is ${r} of that, ${money(quote.gst)}, so the customer pays ${money(quote.inclusive)}. Prices "plus GST" are common in business-to-business quotes; prices shown to the public usually include GST already.</p>
        <!--@slot after-intro-->
        <h2>Removing GST, and why it's ${n}/${d}</h2>
        <p>Suppose a receipt shows ${money(receipt.inclusive)} including GST, and you need the GST part for your records. The tempting shortcut is to take ${r} off, which gives ${money(wrong)}. That's wrong, because the ${r} was charged on the smaller, pre-GST price, not on the total.</p>
        <p>Think of the pre-GST price as 100 parts. GST adds ${Math.round(gst.rate.value * 100)} parts, so the total is ${100 + Math.round(gst.rate.value * 100)} parts, and GST is ${Math.round(gst.rate.value * 100)} of those ${100 + Math.round(gst.rate.value * 100)}. That fraction simplifies to ${n}/${d}, the figure Inland Revenue uses. So the GST in ${money(receipt.inclusive)} is ${money(receipt.gst)}, and the price before GST is ${money(receipt.exclusive)}. For a ${money(coffee.inclusive)} coffee it's ${money(coffee.gst)}.</p>
        <table><thead><tr><th scope="col">Task</th><th scope="col">Do this</th></tr></thead><tbody>
          <tr><td>Add GST to a price</td><td>multiply by ${(1 + gst.rate.value).toFixed(2)}</td></tr>
          <tr><td>Find the GST to add</td><td>multiply the price by ${gst.rate.value}</td></tr>
          <tr><td>Find the GST inside a price</td><td>multiply by ${n}, divide by ${d}</td></tr>
          <tr><td>Find the price before GST</td><td>divide by ${(1 + gst.rate.value).toFixed(2)}</td></tr>
        </tbody></table>

        <h2>Rounding</h2>
        <p>GST is worked out to the cent, and rounding can be done on each line of an invoice or once on the total. The two can differ by a cent or two on a long invoice. Neither is a mistake, but it helps to be consistent with your accounting software. The ${link("/gst-calculator", "GST calculator")} shows both when you enter several lines.</p>
        <h2>A worked invoice</h2>
        <p>Here are five invented items from one shop receipt, each priced with GST included. Working out the GST line by line, then adding up, gives one answer; adding the prices first and taking ${n}/${d} of the total gives another:</p>
        <table><thead><tr><th scope="col">Item price</th><th scope="col" class="num">GST in it</th></tr></thead><tbody>${inv.map((c, i) => `<tr><td>${money(c)}</td><td class="num">${money(lines.rows[i].gst)}</td></tr>`).join("")}
          <tr><td>Sum of the line amounts</td><td class="num">${money(lines.perLine.gst)}</td></tr>
          <tr><td>${n}/${d} of the ${money(lines.total.inclusive)} total</td><td class="num">${money(lines.total.gst)}</td></tr>
        </tbody></table>
        <p>${lines.roundingDifference ? `The gap of ${money(Math.abs(lines.roundingDifference))} comes from rounding each line to the cent.` : "Here the two methods happen to agree, but on other receipts they can differ by a cent or more."} Whichever method your records use, use it every time, and when you check a supplier's invoice, work out the GST the same way they did before deciding it's wrong.</p>
        <!--@slot mid-content-->
        <h2>When GST isn't charged</h2>
        <p>Not every sale carries GST at the standard rate. Some supplies are <strong>zero-rated</strong>: GST applies, but at a rate of zero. Inland Revenue gives certain services supplied to people outside New Zealand as examples. Others are <strong>exempt</strong> and outside GST altogether; Inland Revenue lists financial services, such as interest and bank fees, and donated goods sold by a non-profit body. The pages ${src(gst.zeroRatedSourceId)} and ${src(gst.exemptSourceId)} set out the details, including conditions.</p>

        <h2>When a business must register</h2>
        <p>Inland Revenue says a business must register for GST when its turnover from a taxable activity reached ${dollars(gst.registrationThreshold.value)} in the last ${gst.registrationThreshold.period}, or is expected to in the next ${gst.registrationThreshold.period}. A business that adds GST to its prices must register too. Below the threshold, registering is optional; an unregistered business doesn't charge GST and can't claim it back.</p>
        <p>Registered buyers can ask for taxable supply information for purchases over ${dollars(gst.supplyInfoThreshold.value)}, and the seller must provide it within 28 days of the request. Many businesses simply include the details on every invoice.</p>

        <h2>Mistakes to avoid</h2>
        <ul>
          <li>Taking ${r} off a GST-inclusive price instead of using ${n}/${d}.</li>
          <li>Adding GST to a quote when you aren't registered.</li>
          <li>Mixing GST-inclusive and exclusive figures on one invoice without converting them first.</li>
          <li>Assuming every sale carries GST; check zero-rated and exempt supplies.</li>
        </ul>
        <p>This guide is general information. For your own GST obligations, check Inland Revenue's guidance or ask an accountant.</p>`,
    faq: [
      { q: `Why isn't the GST in a price just ${r} of it?`, a: `<p>Because the ${r} is charged on the price before GST. Once added, the GST is ${n}/${d} of the total, which is a smaller share.</p>` },
      { q: "Do I have to register for GST?", a: `<p>If your turnover from a taxable activity reaches ${dollars(gst.registrationThreshold.value)} in ${gst.registrationThreshold.period} (past or expected), or you add GST to your prices, Inland Revenue says you must register.</p>` },
    ],
    related: [
      { href: "/gst-calculator", label: "GST calculator" },
      { href: "/nz-calculators", label: "All NZ calculators" },
      { href: "/guides/how-nz-paye-is-worked-out", label: "How NZ PAYE is worked out" },
    ],
  };
}
