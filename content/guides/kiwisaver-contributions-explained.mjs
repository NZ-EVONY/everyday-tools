// Guide: KiwiSaver contributions explained.
import { yearlyContributions } from "../../src/assets/lib/kiwisaver.js";
import { takeHome } from "../../src/assets/lib/paye.js";

export default function page(ctx) {
  const { tax, pct, pctText, money, dollars, link, src } = ctx;
  const ks = tax.kiwisaver, g = ks.government;
  const salary = 6200000;
  const rates = ks.employeeRates.map(r => ({ r, y: yearlyContributions(salary, { employeeRate: r, eligibleForGovernment: true }, tax), net: takeHome(Math.round(salary / 26), { period: "fortnightly", kiwisaverRate: r }, tax).net }));
  const rows = rates.map(x => `<tr><td>${pct(x.r)}</td><td class="num">${money(x.y.member)}</td><td class="num">${money(x.y.employerNet)}</td><td class="num">${money(x.y.government)}</td><td class="num">${money(x.net)}</td></tr>`).join("");
  const part = Math.round(800 * 100);
  const slip = takeHome(Math.round(salary / 26), { period: "fortnightly", kiwisaverRate: ks.defaultEmployeeRate }, tax);
  const e = slip.employer;
  return {
    path: "/guides/kiwisaver-contributions-explained",
    type: "guide", pillar: "guides", topic: "KiwiSaver", status: "published", reviewed: "2026-10-03", published: "2026-10-03",
    title: "KiwiSaver Contributions Explained: You, Employer, Government",
    description: "How KiwiSaver contributions work in New Zealand: your rate, your employer's contribution and ESCT, and getting the full government contribution.",
    crumbName: "KiwiSaver contributions explained",
    h1: "KiwiSaver contributions",
    h1Accent: "explained",
    sources: [ks.sourceId, ks.employerSourceId, ks.governmentSourceId, tax.esct.sourceId].map(ctx.source),
    claims: [
      { text: "Employee rates and default", source: ks.sourceId },
      { text: "Employer minimum and ESCT", source: ks.employerSourceId },
      { text: "Government contribution rules", source: ks.governmentSourceId },
      { text: "Temporary rate reduction exists", source: ks.sourceId },
    ],
    notice: ctx.taxNotice([ks.sourceId, ks.employerSourceId, ks.governmentSourceId]),
    intro: `<p>KiwiSaver money comes from up to three places: you, your employer and the government. Each follows its own rule, and the amounts that reach your account aren't always the ones on your pay slip. This guide explains each part, compares the contribution rates side by side, and shows how to make sure you don't miss out on the government's share.</p>`,
    body: `
        <p class="lede">Employees choose a contribution rate, employers add at least ${pct(ks.employerMinimumRate)} on top of pay (taxed before it reaches you), and the government adds ${g.perDollar * 100} cents per dollar you contribute, up to ${dollars(g.maxAnnual)} a year.</p>

        <h2>Your contribution</h2>
        <p>As an employee you contribute a percentage of your gross pay, taken out each payday after tax has been worked out. Inland Revenue lists the choices as ${ks.employeeRates.map(r => pct(r)).join(", ")}, with ${pct(ks.defaultEmployeeRate)} as the default if you don't choose. You change rate by telling your employer. If money is tight, you can apply for a temporary rate reduction, which Inland Revenue handles; outside employment, you can pay your provider directly.</p>

        <h2>Your employer's contribution</h2>
        <p>While you contribute from pay, your employer generally must add at least ${pct(ks.employerMinimumRate)} of your gross pay on top of your wages, not taken out of them. Some employers pay more. Before it reaches your account, the employer's contribution is taxed through employer superannuation contribution tax (ESCT), at a rate that depends on your pay plus the employer's contributions:</p>
        <table><thead><tr><th scope="col">Salary plus employer contributions</th><th scope="col" class="num">ESCT rate</th></tr></thead><tbody>${tax.esct.bands.map((b, i) => `<tr><td>${i === 0 ? "$0" : dollars(tax.esct.bands[i - 1].upTo + 1)} to ${b.upTo ? dollars(b.upTo) : "and over"}</td><td class="num">${pct(b.rate)}</td></tr>`).join("")}</tbody></table>
        <!--@slot after-intro-->
        <h2>The government contribution</h2>
        <p>Between ${g.yearRuns}, the government adds ${g.perDollar * 100} cents for each dollar you put in, up to ${dollars(g.maxAnnual)}. You reach the maximum by contributing ${dollars(g.contributionForMax)} of your own money in that year; employer contributions don't count towards it. You need to be aged ${g.minAge} to ${g.maxAge} with taxable income of ${dollars(g.incomeLimit)} or less, among other conditions. Your provider claims it after 30 June, so it appears in your account some weeks later.</p>
        <p>If you're short, a voluntary top-up before 30 June counts. Someone who has contributed ${money(part)} by June could pay ${money(Math.round(g.contributionForMax * 100) - part)} more and earn an extra ${money(Math.round((Math.round(g.contributionForMax * 100) - part) * g.perDollar))} from the government.</p>

        <h2>Comparing rates on one salary</h2>
        <p>For an invented salary of ${money(salary)}, paid fortnightly, here's a year at each rate. Employer figures assume the minimum ${pct(ks.employerMinimumRate)}; take-home pay is per fortnight after PAYE and KiwiSaver, with no student loan:</p>
        <table><thead><tr><th scope="col">Your rate</th><th scope="col" class="num">You put in a year</th><th scope="col" class="num">Employer (after ESCT)</th><th scope="col" class="num">Government</th><th scope="col" class="num">Take-home a fortnight</th></tr></thead><tbody>${rows}</tbody></table>
        <p>On this salary, even the lowest rate earns the full government contribution, because ${pct(ks.employeeRates[0])} of ${money(salary)} is more than ${dollars(g.contributionForMax)}. The employer's minimum stays the same whatever rate you pick; a higher rate is your own money working for you.</p>
        <!--@slot mid-content-->
        <h2>Reading the KiwiSaver lines on a pay slip</h2>
        <p>Pay slips lay these figures out in different ways, but the numbers behind them can be checked by hand. Take the same ${money(salary)} salary at the default ${pct(ks.defaultEmployeeRate)} rate. Each fortnight the gross pay is ${money(slip.gross)}, so:</p>
        <table><thead><tr><th scope="col">Line</th><th scope="col">How it's worked out</th><th scope="col" class="num">Each fortnight</th></tr></thead><tbody>
          <tr><td>Your deduction</td><td>${pct(ks.defaultEmployeeRate)} of gross pay, part cents dropped</td><td class="num">${money(slip.kiwisaver)}</td></tr>
          <tr><td>Employer contribution</td><td>${pct(e.rate)} of gross pay, added on top</td><td class="num">${money(e.gross)}</td></tr>
          <tr><td>ESCT</td><td>${pct(e.esctRate)} of the employer contribution in whole dollars</td><td class="num">${money(e.esct)}</td></tr>
          <tr><td>Employer amount that reaches your account</td><td>contribution minus ESCT</td><td class="num">${money(e.net)}</td></tr>
        </tbody></table>
        <p>Your deduction appears among the amounts taken from pay, next to PAYE. The employer contribution often sits in a separate section, because it isn't part of your wages. If the employer figure on your slip is lower than the rate suggests, check whether you agreed to a total remuneration package, and if the ESCT rate looks wrong, ask payroll which band they've used. After you change your rate, check the next slip to make sure the new rate has been applied.</p>

        <h2>Common misunderstandings</h2>
        <ul>
          <li><strong>"My employer pays my KiwiSaver out of my pay."</strong> The compulsory employer contribution is meant to be on top of pay, unless you agreed to a total remuneration package.</li>
          <li><strong>"The employer amount on my pay slip is what I get."</strong> ESCT comes off first, so less reaches your account.</li>
          <li><strong>"I'll get the government money automatically, whatever I put in."</strong> It's ${g.perDollar * 100} cents per dollar you contribute, so it depends on your contributions in each 1 July to 30 June year.</li>
          <li><strong>"KiwiSaver reduces my tax."</strong> It doesn't: contributions come out after PAYE has been worked out.</li>
        </ul>

        <h2>A yearly check</h2>
        <p>Once a year is enough for most people. In May or early June, add up what you've contributed since 1 July, using your pay slips or your provider's online account, and compare it with the ${dollars(g.contributionForMax)} needed for the full government contribution. After the year ends, look for the government amount arriving in your account. While you're there, check that employer contributions have been turning up regularly, because a gap usually means a payroll mistake that's easier to fix early than after several months.</p>

        <h2>Try your own numbers</h2>
        <p>The ${link("/kiwisaver-calculator", "KiwiSaver calculator")} shows the three contributions for your salary and, if you enter your own assumptions, an illustrative projection. To see the effect on your pay, use the ${link("/nz-paye-calculator", "take-home pay calculator")}. The page ${src(ks.governmentSourceId)} explains the government contribution rules in full. For advice about which fund suits you, talk to your provider or a licensed financial adviser.</p>`,
    related: [
      { href: "/kiwisaver-calculator", label: "KiwiSaver calculator" },
      { href: "/nz-paye-calculator", label: "Take-home pay calculator" },
      { href: "/guides/how-nz-paye-is-worked-out", label: "How NZ PAYE is worked out" },
    ],
  };
}
