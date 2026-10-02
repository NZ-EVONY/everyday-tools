// Guide: NZ tax codes explained.
import { payeMain, payeSecondary, takeHome } from "../../src/assets/lib/paye.js";

export default function page(ctx) {
  const { tax, pct, money, dollars, link, src } = ctx;
  const sec = tax.secondaryCodes.codes;
  const second = 30000; // second job pay per year (invented)
  const main = 48000;
  const sPer = Math.round(second * 100 / 26), mPer = Math.round(main * 100 / 26);
  const sCodeRight = sec.find(c => c.incomeUpTo === null || main + second <= c.incomeUpTo);
  const paidRight = payeSecondary(sPer, sCodeRight.code, tax) * 26;
  const paidWrongM = payeMain(sPer, "fortnightly", tax) * 26;
  const rows = sec.map((c, i) => `<tr><td>${c.code}</td><td>${i === 0 ? "$0" : dollars(sec[i - 1].incomeUpTo + 1)} to ${c.incomeUpTo ? dollars(c.incomeUpTo) : "and over"}</td><td class="num">${pct(c.rate)}</td></tr>`).join("");
  return {
    path: "/guides/nz-tax-codes-explained",
    type: "guide", pillar: "guides", topic: "Tax", status: "published", reviewed: "2026-10-03", published: "2026-10-03",
    title: "NZ Tax Codes Explained: M, ME, SL and Second Jobs",
    description: "What New Zealand tax codes mean, how to pick one for your main job or a second job, when to add SL, and what happens if you choose the wrong code.",
    crumbName: "NZ tax codes explained",
    h1: "NZ tax codes",
    h1Accent: "explained",
    sources: ["ird-about-tax-codes", "ird-what-tax-code", "ird-secondary-codes", "ird-tax-rates-individuals", "ird-ietc"].map(ctx.source),
    claims: [
      { text: "One main income; other income uses secondary codes", source: "ird-what-tax-code" },
      { text: "Secondary code thresholds and rates", source: tax.secondaryCodes.sourceId },
      { text: "SL added for student loan; change code when loan is paid off", source: "ird-what-tax-code" },
      { text: "IETC eligibility for ME", source: tax.ietc.sourceId },
      { text: "Tax code declaration IR330; payers don't need IRD to confirm", source: "ird-secondary-codes" },
      { text: "WT for schedular payments, CAE, NSW, EDW codes", source: "ird-what-tax-code" },
    ],
    notice: ctx.taxNotice([tax.secondaryCodes.sourceId, "ird-what-tax-code", tax.ietc.sourceId]),
    intro: `<p>Your tax code tells an employer or other payer how much tax to take from each payment. Pick the wrong one and you either get a bill after the end of the tax year or lend Inland Revenue money until it refunds you. This guide covers the codes most people need, how to choose one for a second job, and the less common codes you might meet.</p>`,
    body: `
        <p class="lede">Most people need one of a handful of codes: M for their main job, ME if they qualify for the independent earner tax credit, a secondary code for any other job, and SL added to any of them if they have a student loan.</p>

        <h2>Main income: M and ME</h2>
        <p>Inland Revenue's rule is that you have one main income, your highest source, and everything else is secondary. For pay from that main job you use <strong>M</strong>. Payroll then applies the full set of tax bands to that pay, starting at the lowest rate.</p>
        <p><strong>ME</strong> is M plus the independent earner tax credit, worth up to ${dollars(tax.ietc.amount)} a year. Inland Revenue says it's for New Zealand tax residents earning between ${dollars(tax.ietc.lower)} and ${dollars(tax.ietc.upper)} who don't get Working for Families, an income-tested benefit, NZ Super or a Veteran's Pension. Above ${dollars(tax.ietc.abatementStart)} the credit shrinks, reaching nothing at ${dollars(tax.ietc.upper)}. If your income ends up outside the range, using ME means too little tax was taken, which is recovered after the year ends.</p>

        <h2>Second jobs: secondary codes</h2>
        <p>Your main job already uses up the lower tax bands, so a second job would be under-taxed if it started from the bottom again. Secondary codes fix that by taxing every dollar of the extra job at one flat rate, chosen to match where your <em>total</em> income falls:</p>
        <table><thead><tr><th scope="col">Code</th><th scope="col">Expected total income from all sources</th><th scope="col" class="num">Rate (before ACC levy)</th></tr></thead><tbody>${rows}</tbody></table>
        <p>The ACC levy is added on top of each rate, as it is for main income.</p>
        <!--@slot after-intro-->
        <h2>Worked example: picking the code for a second job</h2>
        <p>Take an invented worker earning ${dollars(main)} a year in their main job and ${dollars(second)} in a second job, both paid fortnightly. Their total is ${dollars(main + second)}, so the right code for the second job is <strong>${sCodeRight.code}</strong>. Over a year that job's PAYE comes to about ${money(paidRight)}.</p>
        <p>If they wrongly gave the second employer code M, payroll would treat ${dollars(second)} as their only income and take about ${money(paidWrongM)}. That's roughly ${money(paidRight - paidWrongM)} too little, which Inland Revenue would ask for after 31 March. The ${link("/nz-paye-calculator", "take-home pay calculator")} lets you try each code.</p>

        <h2>Student loans: adding SL</h2>
        <p>If you have a student loan and earn salary or wages, add <strong>SL</strong> to your code (M SL, ME SL, S SL and so on). That tells the employer to take repayments as well as tax. On your main job, repayments are ${pct(tax.studentLoan.rate)} of pay above the repayment threshold; on secondary jobs there's no threshold, so it's ${pct(tax.studentLoan.secondaryRate)} of every dollar. Inland Revenue reminds borrowers to change back to a code without SL once the loan is paid off.</p>
        <!--@slot mid-content-->
        <h2>Less common codes</h2>
        <ul>
          <li><strong>WT</strong> for schedular payments, a set of contractor-type payments where tax is taken at a chosen rate.</li>
          <li><strong>CAE</strong> for casual agricultural workers, such as shearers and shed-hands working day to day.</li>
          <li><strong>NSW</strong> for recognised seasonal workers and some foreign crew of fishing vessels.</li>
          <li><strong>EDW</strong> for temporary work during a general election.</li>
          <li><strong>Tailored codes</strong>, which Inland Revenue can issue when none of the standard codes fit your situation.</li>
        </ul>
        <p>The page ${src("ird-what-tax-code")} has a tool and the full list. Interest and dividends don't need a code at all; the payer deducts resident withholding tax instead.</p>

        <h2>Telling your employer</h2>
        <p>You choose a code by filling in the tax code declaration (IR330) for each new job or payer. According to Inland Revenue, payers don't need it to confirm your choice, so getting it right is up to you. Review your code when things change: taking out or paying off a student loan, a big change in expected income, starting a second job, or moving between jobs.</p>

        <h2>Mistakes to avoid</h2>
        <ul>
          <li>Using M for two jobs at once. Only one income can be main.</li>
          <li>Choosing the secondary code from the second job's pay alone, rather than total income.</li>
          <li>Forgetting SL, or forgetting to remove it once the loan is repaid.</li>
          <li>Using ME after income rises above the range, or while receiving Working for Families.</li>
        </ul>
        <p>For how the deductions themselves are calculated, read ${link("/guides/how-nz-paye-is-worked-out", "how NZ PAYE is worked out")}.</p>`,
    faq: [
      { q: "Which job is my main job?", a: "<p>The one that pays you the most. Inland Revenue treats your highest source of income as main and everything else as secondary.</p>" },
      { q: "What happens if I use the wrong code?", a: "<p>Too little or too much tax is taken during the year. Inland Revenue squares it up after the tax year ends on 31 March, with either a bill or a refund.</p>" },
    ],
    related: [
      { href: "/nz-paye-calculator", label: "Take-home pay calculator" },
      { href: "/guides/how-nz-paye-is-worked-out", label: "How NZ PAYE is worked out" },
      { href: "/guides", label: "All guides" },
    ],
  };
}
