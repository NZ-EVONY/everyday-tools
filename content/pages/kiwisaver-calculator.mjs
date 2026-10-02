// /kiwisaver-calculator: yearly contributions (you, employer after ESCT, government) and an
// illustrative projection from the visitor's own assumptions. Rules from the tax-year data file.
import { yearlyContributions, project } from "../../src/assets/lib/kiwisaver.js";

export default function page(ctx) {
  const { tax, pct, pctText, money, dollars, longDate, link, esc } = ctx;
  const ks = tax.kiwisaver, g = ks.government;
  const data = JSON.stringify({ taxYear: tax.taxYear, kiwisaver: ks, esct: tax.esct });
  const salary = 5500000;
  const ex = yearlyContributions(salary, { employeeRate: ks.defaultEmployeeRate, eligibleForGovernment: true }, tax);
  const low = yearlyContributions(2000000, { employeeRate: ks.defaultEmployeeRate, eligibleForGovernment: true }, tax);
  const exRet = 0.04, exYears = 20;
  const proj = project({ startCents: 1000000, yearlyCents: ex.total, years: exYears, returnRate: exRet });
  const projZero = project({ startCents: 1000000, yearlyCents: ex.total, years: exYears, returnRate: 0 });
  return {
    path: "/kiwisaver-calculator",
    type: "tool",
    pillar: "nz-calculators",
    status: "published",
    reviewed: "2026-10-02",
    title: `KiwiSaver Calculator NZ ${tax.taxYear}: Contributions`,
    description: "See what goes into your KiwiSaver each year from you, your employer and the government, and try an illustrative projection with your own assumptions.",
    crumbName: "KiwiSaver calculator",
    h1: "KiwiSaver calculator:",
    h1Accent: "who puts in what",
    appName: "KiwiSaver contributions calculator",
    appCategory: "FinanceApplication",
    script: "kiwisaver",
    chips: [`<span class="chip">${ctx.icon("sprout")}Tax year ${tax.taxYear}</span>`, `<span class="chip">Checked ${longDate(tax.checkedOn)}</span>`],
    sources: [ks.sourceId, ks.employerSourceId, ks.governmentSourceId, tax.esct.sourceId].map(ctx.source),
    claims: [
      { text: `Employee rates ${ks.employeeRates.map(pctText).join(", ")}; default ${pctText(ks.defaultEmployeeRate)}`, source: ks.sourceId },
      { text: `Employer minimum ${pctText(ks.employerMinimumRate)}, minus ESCT`, source: ks.employerSourceId },
      { text: `Government contribution ${g.perDollar * 100}c per $1 up to ${dollars(g.maxAnnual)}; income ${dollars(g.incomeLimit)} or less; age ${g.minAge} to ${g.maxAge}`, source: ks.governmentSourceId },
      { text: "ESCT bands", source: tax.esct.sourceId },
    ],
    intro: `<p>Find out how much goes into your KiwiSaver account in a year: your own contributions, your employer's after tax, and the government contribution if you qualify. Then, if you want, add your own assumptions about returns and fees to see an illustrative balance years from now. The contribution rules come from Inland Revenue and are dated below the results. The projection is a what-if, not a forecast.</p>`,
    tool: `<form id="ksForm" autocomplete="off" novalidate data-tax="${esc(data)}">
      <div class="panel-h"><h2>Contributions</h2><span class="chip">NZD</span></div>
      <div class="fields">
        <div class="field"><label for="ksSalary">Salary or wages per year</label><div class="money"><span aria-hidden="true">$</span><input class="in" id="ksSalary" type="text" inputmode="decimal" maxlength="14" placeholder="55,000" aria-describedby="ksHint"></div></div>
        <div class="field"><label for="ksRate">Your contribution rate</label><select class="in" id="ksRate" name="rate">${ks.employeeRates.map(r => `<option value="${r}"${r === ks.defaultEmployeeRate ? " selected" : ""}>${pctText(r)}${r === ks.defaultEmployeeRate ? " (default)" : ""}</option>`).join("")}</select></div>
        <div class="field"><label for="ksEmployer">Employer rate (%)</label><input class="in" id="ksEmployer" type="text" inputmode="decimal" maxlength="6" placeholder="${+(ks.employerMinimumRate * 100).toFixed(2)}"><span class="muted">Leave blank for the legal minimum.</span></div>
        <div class="field"><label for="ksVol">Extra you pay in yourself per year</label><div class="money"><span aria-hidden="true">$</span><input class="in" id="ksVol" type="text" inputmode="decimal" maxlength="14" placeholder="0.00"></div></div>
      </div>
      <label class="check"><input type="checkbox" id="ksGov" checked> I'm aged ${g.minAge} to ${g.maxAge} and meet Inland Revenue's other conditions for the government contribution</label>
      <p class="hint" id="ksHint" role="alert"></p>
      <div class="panel-h"><h2>Illustrative projection (optional)</h2></div>
      <div class="fields">
        <div class="field"><label for="ksStart">Balance now</label><div class="money"><span aria-hidden="true">$</span><input class="in" id="ksStart" type="text" inputmode="decimal" maxlength="14" placeholder="0.00"></div></div>
        <div class="field"><label for="ksYears">Years to project</label><input class="in" id="ksYears" type="text" inputmode="numeric" maxlength="2" placeholder="e.g. 20"></div>
        <div class="field"><label for="ksReturn">Yearly return after tax (%)</label><input class="in" id="ksReturn" type="text" inputmode="decimal" maxlength="6" placeholder="your assumption"></div>
        <div class="field"><label for="ksFee">Fees (% of balance per year)</label><input class="in" id="ksFee" type="text" inputmode="decimal" maxlength="6" placeholder="0"></div>
        <div class="field"><label for="ksFeeFixed">Fixed fees per year</label><div class="money"><span aria-hidden="true">$</span><input class="in" id="ksFeeFixed" type="text" inputmode="decimal" maxlength="10" placeholder="0.00"></div></div>
      </div>
    </form>`,
    results: `<div class="results">
        <div class="res"><div class="k">You put in<small>per year</small></div><div class="v" id="vYou">$0.00</div></div>
        <div class="res"><div class="k">Your employer adds<small id="vEmpK">after ESCT</small></div><div class="v" id="vEmp">$0.00</div></div>
        <div class="res"><div class="k">Government contribution<small id="vGovK">per year</small></div><div class="v" id="vGov">$0.00</div></div>
        <div class="res key"><div class="k">Total going in<small>per year</small></div><div class="v" id="vTotal">$0.00</div></div>
      </div>
      <p class="rounding" id="ksNoProj">Enter years and a yearly return to see an illustrative projection. No return is assumed for you.</p>
      <div id="ksProjection" hidden>
        <div class="results"><div class="res"><div class="k">Illustrative balance<small id="vEndK"></small></div><div class="v" id="vEnd"></div></div></div>
        <div class="breakdown"><table><caption>Illustrative, not a forecast</caption><thead><tr><th scope="col">Year</th><th scope="col" class="num">Paid in</th><th scope="col" class="num">Growth after fees</th><th scope="col" class="num">Balance</th></tr></thead><tbody></tbody></table></div>
      </div>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="ksCopy">${ctx.icon("copy")}Copy summary</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    notice: ctx.taxNotice([ks.sourceId, ks.employerSourceId, ks.governmentSourceId, tax.esct.sourceId]),
    body: `
        <h2>Three sources of money</h2>
        <p><strong>You.</strong> If you're an employee, your contribution is a percentage of your gross pay: ${ks.employeeRates.map(r => pct(r)).join(", ")}, with ${pct(ks.defaultEmployeeRate)} as the default. You can also pay extra straight to your provider or to Inland Revenue.</p>
        <p><strong>Your employer.</strong> Employers must add at least ${pct(ks.employerMinimumRate)} of your gross pay on top of your wages while you contribute. That contribution is taxed before it reaches your account, through employer superannuation contribution tax (ESCT). The ESCT rate depends on your pay plus the employer's contributions, using these bands: ${tax.esct.bands.map((b, i) => `${b.upTo ? `up to ${dollars(b.upTo)}` : "above that"} ${pct(b.rate)}`).join("; ")}.</p>
        <p><strong>The government.</strong> Each year from ${g.yearRuns}, the government adds ${g.perDollar * 100} cents for every dollar you contribute, up to ${dollars(g.maxAnnual)}. To get the maximum you need to put in ${dollars(g.contributionForMax)} of your own money in that year; employer contributions don't count towards it. You need to be aged ${g.minAge} to ${g.maxAge} with taxable income of ${dollars(g.incomeLimit)} or less, among other conditions, and your provider claims it for you after 30 June.</p>

        <h2>Worked example</h2>
        <p>On an invented salary of ${money(salary)} at the default rate, you put in ${money(ex.member)} a year. Your employer pays ${money(ex.employerGross)}, and after ESCT at ${pct(ex.esctRate)} ${money(ex.employerNet)} reaches your account. Your own contributions are well over ${dollars(g.contributionForMax)}, so the government adds the full ${money(ex.government)}. In total, ${money(ex.total)} goes in over the year. On ${money(2000000)} a year, you'd put in ${money(low.member)} and the government would add ${money(low.government)}.</p>
        <p>To show how assumptions change the picture: starting from ${money(1000000)} and adding ${money(ex.total)} a year for ${exYears} years, an assumed return of ${pct(exRet)} after tax and fees ends at ${money(proj.at(-1).balance)}, while a return of zero ends at ${money(projZero.at(-1).balance)}. Neither figure is a prediction. Returns go up and down, and pay usually changes over time.</p>
        <!--@slot after-explainer-1-->
        <h2>Mistakes to avoid</h2>
        <ul>
          <li><strong>Counting your employer's contribution twice.</strong> Payslips often show the gross employer amount. What reaches your account is less, after ESCT.</li>
          <li><strong>Missing the government contribution by a little.</strong> If your own contributions fall just short of ${dollars(g.contributionForMax)} by 30 June, a voluntary top-up before the deadline gets you the full amount.</li>
          <li><strong>Treating a projection as a promise.</strong> Projections depend completely on the return you assume. Try a few, including low ones.</li>
          <li><strong>Ignoring fees.</strong> A fee taken as a percentage of your balance grows with your balance. Over decades, a small difference in fees makes a large difference to the result.</li>
        </ul>

        <h2>Limits</h2>
        <p>The calculator assumes your salary, rates and contributions stay the same every year and that contributions arrive once a year. It doesn't model inflation, pay rises, contribution holidays, temporary rate reductions, first-home withdrawals or the tax rate your fund pays on returns, so enter a return that is already after tax and fees if you use the fee fields as zero. For your own situation, talk to your KiwiSaver provider or a licensed financial adviser. What you type stays in your browser. To see your pay after KiwiSaver, use the ${link("/nz-paye-calculator", "take-home pay calculator")}.</p>`,
    faq: [
      { q: "How much do I need to put in to get the full government contribution?", a: `<p>${dollars(g.contributionForMax)} of your own money between ${g.yearRuns.replace(" to ", " and ")}, which earns the maximum ${dollars(g.maxAnnual)}. Below that, you get ${g.perDollar * 100} cents per dollar.</p>` },
      { q: "Why does my employer's contribution look smaller in my account?", a: "<p>Employer contributions are taxed through employer superannuation contribution tax (ESCT) before they're paid into your account. The calculator shows the amount before and after ESCT.</p>" },
      { q: "What return should I use for the projection?", a: "<p>There's no right answer, which is why the calculator doesn't fill one in. Returns depend on your fund type and on markets, and past returns don't predict future ones. Try several, including low ones, to see the range.</p>" },
    ],
    related: [
      { href: "/nz-paye-calculator", label: "Take-home pay calculator" },
      { href: "/nz-calculators", label: "All NZ calculators" },
      { href: "/guides/kiwisaver-contributions-explained", label: "KiwiSaver contributions explained" },
    ],
  };
}
