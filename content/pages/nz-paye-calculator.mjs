// /nz-paye-calculator: take-home pay for one pay period, IRD's payroll method. Every rate comes
// from the tax-year data file; worked examples are computed with the tool's own library.
import { takeHome, payeMain, annualTax } from "../../src/assets/lib/paye.js";

export default function page(ctx) {
  const { tax, pct, pctText, money, dollars, longDate, link, esc, src } = ctx;
  const data = JSON.stringify({ taxYear: tax.taxYear, incomeTax: tax.incomeTax, secondaryCodes: tax.secondaryCodes, acc: tax.acc, studentLoan: tax.studentLoan, kiwisaver: tax.kiwisaver, esct: tax.esct, ietc: tax.ietc });
  const b = tax.incomeTax.brackets;
  // Worked example: an invented salary, paid fortnightly, with KiwiSaver at the default rate and a student loan.
  const salary = 65000;
  const fortnight = Math.round((salary * 100) / 26);
  const ex = takeHome(fortnight, { period: "fortnightly", code: "M", studentLoan: true, kiwisaverRate: tax.kiwisaver.defaultEmployeeRate }, tax);
  const exAnnualTax = annualTax(Math.floor(fortnight * 26 / 100), b);
  const ksOptions = tax.kiwisaver.employeeRates.map(r => `<option value="${r}"${r === tax.kiwisaver.defaultEmployeeRate ? " selected" : ""}>${pctText(r)}${r === tax.kiwisaver.defaultEmployeeRate ? " (default)" : ""}</option>`).join("");
  const sec = tax.secondaryCodes.codes;
  const secLabel = c => `${c.code}: total income ${c.incomeUpTo ? `up to ${dollars(c.incomeUpTo)}` : `over ${dollars(sec.at(-2).incomeUpTo)}`}`;
  const bracketRows = b.map((x, i) => `<tr><td>${i === 0 ? "$0" : dollars(b[i - 1].upTo + 1)} to ${x.upTo ? dollars(x.upTo) : "and over"}</td><td class="num">${pct(x.rate)}</td></tr>`).join("");
  const weekly1000 = payeMain(100000, "weekly", tax);

  return {
    path: "/nz-paye-calculator",
    type: "tool",
    pillar: "nz-calculators",
    status: "published",
    reviewed: "2026-10-02",
    title: `PAYE Calculator NZ ${tax.taxYear}: Take-Home Pay`,
    description: `Work out take-home pay in New Zealand for ${tax.taxYear}: PAYE, ACC levy, student loan and KiwiSaver for any pay period, using Inland Revenue's own method.`,
    crumbName: "Take-home pay calculator",
    h1: "Take-home pay calculator",
    h1Accent: `NZ ${tax.taxYear}`,
    appName: "NZ take-home pay (PAYE) calculator",
    appCategory: "FinanceApplication",
    script: "paye",
    chips: [`<span class="chip">${ctx.icon("wallet")}Tax year ${tax.taxYear}</span>`, `<span class="chip">Checked ${longDate(tax.checkedOn)}</span>`],
    sources: ["ird-tax-rates-individuals", "ird-acc-levy-rates", "ird-student-loan-salary", "ird-ks-employee", "ird-ks-employer", "ird-ir340-apr-2026", "ird-ir341-apr-2026", "ird-payroll-spec-2026-27", "ird-ietc"].map(ctx.source),
    claims: [
      { text: "Income tax brackets", source: tax.incomeTax.sourceId },
      { text: `ACC earners' levy ${pctText(tax.acc.rate)} up to ${dollars(tax.acc.maxEarnings)}`, source: tax.acc.sourceId },
      { text: `Student loan ${pctText(tax.studentLoan.rate)} over ${dollars(tax.studentLoan.annualThreshold)}`, source: tax.studentLoan.specSourceId },
      { text: "KiwiSaver employee rates and employer minimum", source: tax.kiwisaver.sourceId },
      { text: "PAYE method: annualise, truncate, divide by 52, convert to the pay period", source: tax.paye.sourceId },
      { text: "Independent earner tax credit amounts and eligibility", source: tax.ietc.sourceId },
      { text: "ESCT bands", source: tax.esct.sourceId },
    ],
    intro: `<p>See what lands in your bank account each payday. Enter your pay before tax, choose how often you're paid, and the calculator works out PAYE (which includes the ACC earners' levy), student loan repayments and KiwiSaver, the same way Inland Revenue's payroll rules do. Every figure updates as you type, per pay period and for the year. It's a quick way to compare job offers, check a pay slip or see what a pay rise is really worth.</p>`,
    tool: `<form id="payForm" autocomplete="off" novalidate data-tax="${esc(data)}">
      <div class="panel-h"><h2>Your pay</h2><span class="chip">NZD</span></div>
      <div class="fields">
        <div class="field">
          <label for="payAmount">Pay before tax</label>
          <div class="money"><span aria-hidden="true">$</span><input class="in" id="payAmount" type="text" inputmode="decimal" maxlength="16" placeholder="65,000" aria-describedby="payHint"></div>
        </div>
        <div class="field">
          <label for="per">Per</label>
          <select class="in" id="per" name="per"><option value="year" selected>year</option><option value="week">week</option><option value="fortnight">fortnight</option><option value="fourWeeks">four weeks</option><option value="month">month</option></select>
        </div>
      </div>
      <p class="hint" id="payHint" role="alert"></p>
      <fieldset>
        <legend class="field-label">How often you're paid</legend>
        <div class="seg four">
          <label><input type="radio" name="period" value="weekly"><span>Weekly</span></label>
          <label><input type="radio" name="period" value="fortnightly" checked><span>Fortnightly</span></label>
          <label><input type="radio" name="period" value="fourWeekly"><span>4-weekly</span></label>
          <label><input type="radio" name="period" value="monthly"><span>Monthly</span></label>
        </div>
      </fieldset>
      <div class="fields">
        <div class="field">
          <label for="code">Tax code</label>
          <select class="in" id="code" name="code" aria-describedby="codeHelp">
            <option value="M" selected>M: main job</option>
            <option value="ME">ME: main job, with independent earner tax credit</option>
            ${sec.map(c => `<option value="${c.code}">${esc(secLabel(c))} (second job)</option>`).join("")}
          </select>
          <span class="muted" id="codeHelp">Not sure? Most people with one job use M.</span>
        </div>
        <div class="field">
          <label for="ks">KiwiSaver</label>
          <select class="in" id="ks" name="ks"><option value="0">Not a member</option>${ksOptions}</select>
        </div>
      </div>
      <label class="check"><input type="checkbox" name="sl" id="sl"> I have a student loan (SL tax code)</label>
    </form>`,
    results: `<div class="results" aria-label="Results per pay period">
        <div class="res"><div class="k">Gross pay<small id="rGrossK">Before tax</small></div><div class="v" id="rGross">$0.00</div></div>
        <div class="res"><div class="k">PAYE<small id="rPayeK">Income tax + ACC levy</small></div><div class="v" id="rPaye">$0.00</div></div>
        <div class="res" id="rowSl" hidden><div class="k">Student loan<small>${pct(tax.studentLoan.rate)} over the threshold</small></div><div class="v" id="rSl">$0.00</div></div>
        <div class="res" id="rowKs"><div class="k">KiwiSaver<small id="rKsK">Your contribution</small></div><div class="v" id="rKs">$0.00</div></div>
        <div class="res key"><div class="k">Take-home pay<small id="rNetK">Per pay period</small></div><div class="v" id="rNet">$0.00</div></div>
      </div>
      <div class="breakdown"><table><caption>Per pay period and per year</caption>
        <thead><tr><th scope="col"></th><th scope="col" class="num" id="tPer">Per fortnight</th><th scope="col" class="num">Per year</th></tr></thead>
        <tbody>
          <tr><th scope="row">Gross pay</th><td class="num" id="pGross"></td><td class="num" id="aGross"></td></tr>
          <tr><th scope="row">PAYE incl. ACC</th><td class="num" id="pPaye"></td><td class="num" id="aPaye"></td></tr>
          <tr><th scope="row">Student loan</th><td class="num" id="pSl"></td><td class="num" id="aSl"></td></tr>
          <tr><th scope="row">KiwiSaver</th><td class="num" id="pKs"></td><td class="num" id="aKs"></td></tr>
          <tr class="total"><th scope="row">Take-home pay</th><td class="num" id="pNet"></td><td class="num" id="aNet"></td></tr>
        </tbody></table></div>
      <p class="rounding" id="effRate"></p>
      <p class="rounding" id="employer" hidden><span id="employerText"></span></p>
      <p class="rounding" id="meNote" hidden>ME is only for New Zealand tax residents earning ${dollars(tax.ietc.lower)} to ${dollars(tax.ietc.upper)} a year who don't get Working for Families, an income-tested benefit, NZ Super or a Veteran's Pension.</p>
      <p class="rounding" id="secNote" hidden>Secondary codes tax every dollar of this job at one flat rate, because your main job has already used the lower brackets. Pick the code that matches your total income from all jobs.</p>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="payCopy">${ctx.icon("copy")}Copy summary</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    notice: ctx.taxNotice([tax.incomeTax.sourceId, tax.acc.sourceId, tax.studentLoan.sourceId, tax.kiwisaver.sourceId, tax.paye.sourceId]),
    body: `
        <h2>How the calculator works it out</h2>
        <p>New Zealand taxes income in bands. For the ${tax.taxYear} tax year the bands are:</p>
        <table><thead><tr><th scope="col">Annual income</th><th scope="col" class="num">Rate on each dollar in the band</th></tr></thead><tbody>${bracketRows}</tbody></table>
        <p>Employers don't wait until the end of the year, though. Each payday, payroll software follows Inland Revenue's published method: it multiplies your pay for the period up to a yearly figure and drops the cents, works out the tax on that yearly figure, adds the ACC earners' levy (${pct(tax.acc.rate)} of earnings, up to ${dollars(tax.acc.maxEarnings)} a year), divides by 52, then converts that weekly amount to your pay period, cutting off fractions of a cent at each step. This calculator does exactly the same, which is why it matches the amounts in Inland Revenue's printed PAYE tables to the cent.</p>
        <p>Student loan repayments are ${pct(tax.studentLoan.rate)} of what you earn above the repayment threshold for each pay period (${dollars(tax.studentLoan.periodThresholds.fortnightly)} a fortnight, which is ${dollars(tax.studentLoan.annualThreshold)} a year spread evenly). KiwiSaver is your chosen percentage of gross pay, and your employer must add at least ${pct(tax.kiwisaver.employerMinimumRate)} on top.</p>

        <h2>Worked example</h2>
        <p>Take an invented salary of ${dollars(salary)} a year, paid fortnightly, with KiwiSaver at the default ${pct(tax.kiwisaver.defaultEmployeeRate)} and a student loan. Each fortnight's gross pay is ${money(ex.gross)}. Over a full year that comes to about ${money(Math.round(exAnnualTax * 100))} of income tax before ACC. The calculator gives:</p>
        <ul>
          <li>PAYE of ${money(ex.paye)} a fortnight, of which about ${money(ex.acc)} is the ACC levy</li>
          <li>a student loan repayment of ${money(ex.studentLoan)}</li>
          <li>a KiwiSaver contribution of ${money(ex.kiwisaver)}</li>
          <li>take-home pay of <strong>${money(ex.net)} a fortnight</strong>, or ${money(ex.annual.net)} over 26 pays</li>
        </ul>
        <p>As a check against the official tables: Inland Revenue's weekly table shows ${money(weekly1000)} of PAYE on ${money(100000)} a week under code M, and so does this calculator.</p>
        <!--@slot after-explainer-1-->
        <h2>Why your pay slip might be different</h2>
        <ul>
          <li><strong>A different tax code.</strong> Tailored tax codes, special deduction rates and the non-notified rate change the deduction. The calculator covers M, ME and the secondary codes.</li>
          <li><strong>Extra pays.</strong> Bonuses, back pay and holiday pay paid as a lump sum are taxed with a separate method, so the payday they arrive on looks different.</li>
          <li><strong>What counts as pay.</strong> Taxable allowances add to gross pay; salary sacrifice or unpaid leave reduce it.</li>
          <li><strong>Rounding.</strong> Payroll systems may round your gross pay differently when converting an annual salary into pay periods, which can move the answer by a cent or two.</li>
          <li><strong>A temporary KiwiSaver rate reduction</strong>, or deductions such as child support, union fees or payroll giving, which this calculator doesn't model.</li>
        </ul>

        <h2>Choosing a tax code</h2>
        <p>Use M for your only job or your highest-paying one. ME is the same but includes the independent earner tax credit, worth up to ${dollars(tax.ietc.amount)} a year if you're a New Zealand tax resident earning between ${dollars(tax.ietc.lower)} and ${dollars(tax.ietc.upper)} and don't get Working for Families, an income-tested benefit or NZ Super. For a second job, pick the secondary code that matches your expected total income from every job: ${sec.map(c => c.code).join(", ")}, from lowest to highest. Add SL if you have a student loan. The page ${src("ird-about-tax-codes")} explains the full list.</p>

        <h2>Limits</h2>
        <p>This is an estimate for ordinary salary or wages in the ${tax.taxYear} tax year. It doesn't handle lump sums, schedular payments, tailored codes, child support, or the end-of-year square-up when Inland Revenue checks whether the right amount of tax was taken. ${link("/gst-calculator", "GST")} is a separate tax on prices and doesn't come out of wages. What you type stays in your browser: the pay amount is never saved or sent, and only your settings, such as pay frequency and tax code, are kept in the page address after the # sign.</p>`,
    faq: [
      { q: "Does PAYE include the ACC levy?", a: `<p>Yes. Employers deduct the ACC earners' levy (${pct(tax.acc.rate)} of pay, up to ${dollars(tax.acc.maxEarnings)} a year) together with income tax as one PAYE amount. The calculator shows the split so you can see both.</p>` },
      { q: "Why do weekly and monthly pay give slightly different yearly totals?", a: "<p>Inland Revenue's method works out a weekly amount, cuts off fractions of a cent, then converts it to other pay periods. Those small cut-offs add up differently over 12 monthly pays than over 52 weekly ones, so yearly totals can differ by a few cents.</p>" },
      { q: "Is KiwiSaver taken before or after tax?", a: `<p>Your KiwiSaver contribution is a percentage of your gross pay, but it's deducted from your pay after tax has been worked out. It doesn't reduce your PAYE. Your employer's contribution of at least ${pct(tax.kiwisaver.employerMinimumRate)} is paid on top of your pay, minus employer superannuation contribution tax.</p>` },
    ],
    related: [
      { href: "/gst-calculator", label: "GST calculator" },
      { href: "/nz-calculators", label: "All NZ calculators" },
      { href: "/guides", label: "Guides" },
      { href: "/guides/how-nz-paye-is-worked-out", label: "How NZ PAYE is worked out" },
      { href: "/guides/nz-tax-codes-explained", label: "NZ tax codes explained" },
    ],
  };
}
