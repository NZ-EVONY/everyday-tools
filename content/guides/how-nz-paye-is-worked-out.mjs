// Guide: how NZ PAYE is worked out.
import { takeHome, annualTax, payeMain } from "../../src/assets/lib/paye.js";

export default function page(ctx) {
  const { tax, pct, pctText, money, dollars, link, src, esc } = ctx;
  const b = tax.incomeTax.brackets;
  const salary = 70000;
  const layers = b.map((x, i) => { const lo = i ? b[i - 1].upTo : 0, hi = x.upTo ?? Infinity; const amt = Math.max(0, Math.min(salary, hi) - lo); return { lo, hi: x.upTo, rate: x.rate, amt, tax: amt * x.rate }; }).filter(l => l.amt > 0);
  const totalTax = annualTax(salary, b);
  const acc = salary * tax.acc.rate;
  const weekly = payeMain(Math.round(salary * 100 / 52), "weekly", tax);
  const monthly = payeMain(Math.round(salary * 100 / 12), "monthly", tax);
  const w = takeHome(Math.round(salary * 100 / 52), { period: "weekly" }, tax);
  const m = takeHome(Math.round(salary * 100 / 12), { period: "monthly" }, tax);
  const second = 300, total = salary + second * 52;
  const code = tax.secondaryCodes.codes.find(c => c.incomeUpTo === null || total <= c.incomeUpTo);
  const j1 = takeHome(Math.round(salary * 100 / 52), { period: "weekly", studentLoan: true }, tax);
  const j2 = takeHome(second * 100, { period: "weekly", code: code.code, studentLoan: true }, tax);
  const rows = layers.map(l => `<tr><td>${dollars(l.lo === 0 ? 0 : l.lo + 1)} to ${l.hi && l.hi < salary ? dollars(l.hi) : dollars(salary)}</td><td class="num">${pct(l.rate)}</td><td class="num">${money(Math.round(l.tax * 100))}</td></tr>`).join("");
  return {
    path: "/guides/how-nz-paye-is-worked-out",
    type: "guide",
    pillar: "guides",
    topic: "Tax",
    status: "published",
    reviewed: "2026-10-03",
    published: "2026-10-03",
    title: `How NZ PAYE Is Worked Out (${tax.taxYear})`,
    description: "How NZ employers work out PAYE each payday: tax brackets, the ACC levy, rounding by pay period, and a second job with a student loan.",
    crumbName: "How NZ PAYE is worked out",
    h1: "How NZ PAYE",
    h1Accent: "is worked out",
    sources: ["ird-tax-rates-individuals", "ird-acc-levy-rates", "ird-payroll-spec-2026-27", "ird-ir340-apr-2026", "ird-student-loan-salary"].map(ctx.source),
    claims: [
      { text: "Income tax brackets for the year", source: tax.incomeTax.sourceId },
      { text: `ACC earners' levy ${pctText(tax.acc.rate)} to ${dollars(tax.acc.maxEarnings)}`, source: tax.acc.sourceId },
      { text: "Payroll method: annualise, truncate, ÷52, convert", source: tax.paye.sourceId },
      { text: "Secondary code chosen by expected total income; flat rate plus ACC on whole dollars", source: tax.secondaryCodes.sourceId },
      { text: "Student loan: 12% over the period threshold on main income; 12% of all secondary income", source: tax.paye.sourceId },
    ],
    notice: ctx.taxNotice([tax.incomeTax.sourceId, tax.acc.sourceId, tax.paye.sourceId]),
    intro: `<p>PAYE stands for "pay as you earn": your employer takes income tax and the ACC earners' levy out of each pay and passes it to Inland Revenue, so you don't face one large bill at the end of the year. This guide explains the bands, how a yearly tax bill is turned into a payday deduction, and why the numbers on a pay slip sometimes look a few cents off.</p>`,
    body: `
        <p class="lede">In short: tax is charged in layers on your yearly income, the ACC levy is added on top, and payroll divides that across pay periods using a published method that cuts off fractions of a cent.</p>

        <h2>Tax comes in layers, not one rate</h2>
        <p>New Zealand uses progressive tax rates. Each band of income is taxed at its own rate, and moving into a higher band only affects the dollars above that band's threshold. A pay rise can't make you worse off in tax terms; the extra dollars are simply taxed at the higher rate. For ${tax.taxYear}, someone earning an invented ${dollars(salary)} a year is taxed like this:</p>
        <table><thead><tr><th scope="col">Slice of income</th><th scope="col" class="num">Rate</th><th scope="col" class="num">Tax on that slice</th></tr></thead><tbody>${rows}<tr><th scope="row">Total income tax</th><td></td><td class="num"><strong>${money(Math.round(totalTax * 100))}</strong></td></tr></tbody></table>
        <p>That works out at about ${pct(Math.round(totalTax / salary * 1000) / 1000)} of the whole salary, even though the top slice is taxed at ${pct(layers.at(-1).rate)}. The difference between the rate on your last dollar (your marginal rate) and the share of your whole income that goes in tax (your average rate) is the most misunderstood part of the system.</p>

        <h2>The ACC earners' levy</h2>
        <p>On top of income tax, employees pay the ACC earners' levy, which funds cover for injuries outside work. It's a flat ${pct(tax.acc.rate)} of earnings up to a yearly maximum of ${dollars(tax.acc.maxEarnings)}, so the most anyone pays is ${money(Math.round(tax.acc.maxLevy * 100))} a year. Employers deduct it together with income tax as a single PAYE amount, which is why pay slips rarely show it separately. On ${dollars(salary)}, the levy is about ${money(Math.round(acc * 100))} a year.</p>
        <!--@slot after-intro-->
        <h2>From a yearly bill to a payday deduction</h2>
        <p>Payroll doesn't know what you'll earn over the whole year, so it assumes each pay is typical. Inland Revenue publishes the exact steps software must follow:</p>
        <ol>
          <li>Multiply the pay for the period up to a year (×52 for weekly, ×26 fortnightly, ×13 four-weekly, ×12 monthly) and drop the cents.</li>
          <li>Work out the yearly income tax on that figure, plus the yearly ACC levy.</li>
          <li>Divide by 52 to get a weekly amount and cut it to whole cents.</li>
          <li>For other pay periods, multiply that weekly amount by 52, divide by the number of pays in a year, and cut to whole cents again.</li>
        </ol>
        <p>Because the method always starts from a weekly figure, weekly, fortnightly and monthly pays on the same salary give very slightly different yearly totals. On ${dollars(salary)}, weekly PAYE is ${money(weekly)} (${money(weekly * 52)} over 52 weeks) and monthly PAYE is ${money(monthly)} (${money(monthly * 12)} over 12 months). Inland Revenue's printed tables, such as the ${src("ird-ir340-apr-2026")}, follow the same steps, and the site's ${link("/nz-paye-calculator", "take-home pay calculator")} reproduces them to the cent.</p>

        <h2>Worked example: two pay frequencies</h2>
        <p>For the ${dollars(salary)} salary, with no student loan or KiwiSaver:</p>
        <table><thead><tr><th scope="col"></th><th scope="col" class="num">Weekly</th><th scope="col" class="num">Monthly</th></tr></thead><tbody>
          <tr><th scope="row">Gross pay</th><td class="num">${money(w.gross)}</td><td class="num">${money(m.gross)}</td></tr>
          <tr><th scope="row">PAYE (tax and ACC)</th><td class="num">${money(w.paye)}</td><td class="num">${money(m.paye)}</td></tr>
          <tr><th scope="row">Take-home pay</th><td class="num">${money(w.net)}</td><td class="num">${money(m.net)}</td></tr>
        </tbody></table>
        <p>Student loan repayments and KiwiSaver come out after this and are worked out separately; both are percentages of gross pay rather than of what's left after tax.</p>
        <h2>Worked example: a second job and a student loan</h2>
        <p>Now suppose the same person also works a weekend job paying ${dollars(second)} a week, and has a student loan. Their expected income from both jobs is about ${dollars(total)} a year, so the second job uses the secondary code that covers that total: ${code.code}${code.incomeUpTo ? `, for total income up to ${dollars(code.incomeUpTo)}` : ""}. A secondary code doesn't use the bands at all. Every whole dollar is taxed at one flat rate, ${pct(code.rate)} for ${code.code}, plus the ACC levy, because the main job has already used the lower bands.</p>
        <p>The student loan works differently on each job too. On the main job, ${pct(tax.studentLoan.rate)} is taken from pay above the weekly threshold of ${money(Math.round(tax.studentLoan.periodThresholds.weekly * 100))}. On the second job there's no threshold: ${pct(tax.studentLoan.secondaryRate)} comes off every dollar, because the threshold has already been used by the main job. Add SL to both tax codes so each employer knows to deduct it.</p>
        <table><thead><tr><th scope="col">Each week</th><th scope="col" class="num">Main job (M SL)</th><th scope="col" class="num">Second job (${code.code} SL)</th></tr></thead><tbody>
          <tr><th scope="row">Gross pay</th><td class="num">${money(j1.gross)}</td><td class="num">${money(j2.gross)}</td></tr>
          <tr><th scope="row">PAYE (tax and ACC)</th><td class="num">${money(j1.paye)}</td><td class="num">${money(j2.paye)}</td></tr>
          <tr><th scope="row">Student loan</th><td class="num">${money(j1.studentLoan)}</td><td class="num">${money(j2.studentLoan)}</td></tr>
          <tr><th scope="row">Take-home pay</th><td class="num">${money(j1.net)}</td><td class="num">${money(j2.net)}</td></tr>
        </tbody></table>
        <p>The second job keeps ${money(j2.net)} of its ${money(j2.gross)}, which can feel harsh, but it's simply the top slice of an income of ${dollars(total)} being taxed at the rate that slice would attract anyway. If the code is right, the year should square up close to zero. If you'll earn less in total than the code assumes, a lower secondary code or a tailored code from Inland Revenue avoids paying too much during the year.</p>
        <!--@slot mid-content-->
        <h2>Why a pay slip can differ</h2>
        <ul>
          <li><strong>Irregular pay.</strong> If one pay includes overtime, the method treats it as if you earned that much every week, so more tax comes out of that pay. It usually evens out over the year.</li>
          <li><strong>Lump sums.</strong> Bonuses and back pay use a separate method designed for one-off payments.</li>
          <li><strong>The wrong tax code.</strong> Too low a code means too little tax and a bill later; too high means a refund. See ${link("/guides/nz-tax-codes-explained", "NZ tax codes explained")}.</li>
          <li><strong>Changes during the year.</strong> Starting or leaving a job partway through the year can mean you've paid more tax than your actual yearly income needs, which is sorted out after 31 March.</li>
        </ul>

        <h2>The end-of-year square-up</h2>
        <p>Because PAYE is an estimate made one pay at a time, Inland Revenue checks the total after the tax year ends on 31 March. If too much was taken you get a refund; if too little, you'll be asked to pay the difference. Using the right tax code and telling your employer when your situation changes keeps that difference small. The page ${src("ird-tax-rates-individuals")} has the current bands.</p>`,
    faq: [
      { q: "Does a pay rise push all my income into a higher tax bracket?", a: "<p>No. Only the dollars above each threshold are taxed at the higher rate. Everything below it is taxed exactly as before.</p>" },
      { q: "Is the ACC levy part of PAYE?", a: `<p>Yes. Employers deduct the ACC earners' levy (${pct(tax.acc.rate)} of earnings up to ${dollars(tax.acc.maxEarnings)} a year) together with income tax.</p>` },
    ],
    related: [
      { href: "/nz-paye-calculator", label: "Take-home pay calculator" },
      { href: "/guides/nz-tax-codes-explained", label: "NZ tax codes explained" },
      { href: "/guides/kiwisaver-contributions-explained", label: "KiwiSaver contributions explained" },
    ],
  };
}
