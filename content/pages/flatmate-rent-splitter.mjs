// /flatmate-rent-splitter: splits rent and bills four ways, always adding up to the cent.
import { splitFlat } from "../../src/assets/lib/split.js";

export default function page(ctx) {
  const { money, link } = ctx;
  const flat = [{ name: "Aroha", room: 14, income: 0, days: 28 }, { name: "Ben", room: 10, income: 0, days: 28 }, { name: "Mere", room: 10, income: 0, days: 28 }];
  const rent = 216000, power = 28650, net = 8999;
  const byRoom = splitFlat({ rentCents: rent, billCents: power + net, people: flat, method: "room", billsEqual: true });
  const equal = splitFlat({ rentCents: 100000, people: flat, method: "equal" });
  const daysFlat = flat.map((p, i) => ({ ...p, days: i === 2 ? 10 : 28 }));
  const byDays = splitFlat({ rentCents: 0, billCents: power, people: daysFlat, method: "days" });
  const person = (n, name = "", w = "") => `<li class="line"><input class="in pname" type="text" maxlength="40" placeholder="Name" value="${name}" aria-label="Name, person ${n}"><input class="in pw" type="text" inputmode="decimal" maxlength="12" value="${w}" aria-label="Weight, person ${n}"><button class="rm" type="button" aria-label="Remove person ${n}">${ctx.icon("trash")}</button></li>`;
  const bill = (n, name = "", amt = "") => `<li class="line"><input class="in bname" type="text" maxlength="40" placeholder="Bill (power, internet…)" value="${name}" aria-label="Bill ${n} name"><div class="money"><span aria-hidden="true">$</span><input class="in bamt" type="text" inputmode="decimal" maxlength="14" placeholder="0.00" value="${amt}" aria-label="Bill ${n} amount"></div><button class="rm" type="button" aria-label="Remove bill ${n}">${ctx.icon("trash")}</button></li>`;
  return {
    path: "/flatmate-rent-splitter",
    type: "tool",
    pillar: "nz-calculators",
    status: "published",
    reviewed: "2026-10-02",
    title: "Flatmate Rent and Bills Splitter: Split It Fairly",
    description: "Split rent and shared bills between flatmates equally, by room size, by income or by days present. Every share adds up to the total, to the cent.",
    crumbName: "Flatmate rent and bills splitter",
    h1: "Flatmate rent splitter:",
    h1Accent: "fair to the cent",
    appName: "Flatmate rent and bills splitter",
    script: "split",
    chips: [`<span class="chip">${ctx.icon("home")}Four ways to split</span>`, `<span class="chip">Adds up exactly</span>`],
    sources: [], claims: [],
    intro: `<p>Work out who pays what in a shared house. Enter the rent and any shared bills, add everyone in the flat, and choose how to split: equally, by the size of each room, by income, or by the days each person was there. Every share is rounded to the cent and the shares always add up to exactly the total, so nobody is left covering a stray cent. Copy the summary straight into the flat group chat.</p>`,
    tool: `<form id="splitForm" autocomplete="off" novalidate>
      <div class="panel-h"><h2>Your flat</h2><span class="chip">NZD</span></div>
      <div class="fields">
        <div class="field"><label for="rent">Rent</label><div class="money"><span aria-hidden="true">$</span><input class="in" id="rent" type="text" inputmode="decimal" maxlength="14" placeholder="0.00" aria-describedby="splitHint"></div></div>
        <div class="field"><label for="per">Every amount is per</label><select class="in" id="per"><option value="week" selected>week</option><option value="fortnight">fortnight</option><option value="month">month</option></select></div>
      </div>
      <h3 class="field-label">Shared bills (optional)</h3>
      <ol class="lines" id="bills">${bill(1)}</ol>
      <template id="billTpl">${bill(0)}</template>
      <div class="actions no-print"><button type="button" class="btn btn-ghost btn-sm" id="addBill">${ctx.icon("plus")}Add bill</button></div>
      <fieldset>
        <legend class="field-label">How to split</legend>
        <div class="seg four">
          <label><input type="radio" name="method" value="equal" checked><span>Equally</span></label>
          <label><input type="radio" name="method" value="room"><span>Room size</span></label>
          <label><input type="radio" name="method" value="income"><span>Income</span></label>
          <label><input type="radio" name="method" value="days"><span>Days present</span></label>
        </div>
      </fieldset>
      <label class="check"><input type="checkbox" id="billsEqual" checked> Split bills equally whatever the rent split</label>
      <div class="lines-head" aria-hidden="true"><span>Flatmate</span><span id="wHead"></span><span></span></div>
      <ol class="lines" id="people">${person(1)}${person(2)}${person(3)}</ol>
      <template id="personTpl">${person(0)}</template>
      <p class="hint" id="splitHint" role="alert"></p>
      <div class="actions no-print"><button type="button" class="btn btn-ghost btn-sm" id="addPerson">${ctx.icon("plus")}Add person</button></div>
    </form>`,
    results: `<div class="results">
        <div class="res"><div class="k">Total to share<small id="perLabel">per week</small></div><div class="v" id="vTotal">$0.00</div></div>
        <div class="res key"><div class="k">If split equally<small>each, before any weighting</small></div><div class="v" id="vEach">$0.00</div></div>
      </div>
      <div class="breakdown"><table id="splitTable"><caption>Who pays what</caption>
        <thead><tr><th scope="col">Flatmate</th><th scope="col" class="num">Rent</th><th scope="col" class="num">Bills</th><th scope="col" class="num">Total</th></tr></thead>
        <tbody></tbody>
        <tfoot><tr class="total"><th scope="row">Total</th><td class="num" id="tRent"></td><td class="num" id="tBills"></td><td class="num" id="tTotal"></td></tr></tfoot></table></div>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="splitCopy">${ctx.icon("copy")}Copy summary</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    body: `
        <h2>Four ways to split, and when each is fair</h2>
        <ul>
          <li><strong>Equally.</strong> Everyone pays the same. Simple, and fair when the rooms are similar and everyone is home about the same amount.</li>
          <li><strong>By room size.</strong> Enter each bedroom's floor area (or any relative number, such as 3 for a big room and 2 for a small one). Rent is shared in proportion. Useful when one person has the master bedroom with an ensuite.</li>
          <li><strong>By income.</strong> Each person pays the same share of their income. Some couples and close friends prefer this; it needs everyone to be comfortable sharing what they earn.</li>
          <li><strong>By days present.</strong> For someone moving in or out partway through, or away for a few weeks. Enter the days each person lived there during the period and both rent and bills are weighted by days.</li>
        </ul>
        <p>Bills such as power and internet are often shared equally even when rent isn't, because everyone uses them about the same. Leave "split bills equally" ticked for that, or untick it to split bills the same way as the rent.</p>

        <h2>Worked example</h2>
        <p>An invented three-bedroom flat pays ${money(rent)} rent a month, plus ${money(power)} for power and ${money(net)} for internet. Aroha's room is 14 square metres; Ben's and Mere's are 10 each. Split by room size with bills shared equally:</p>
        <ul>${byRoom.map(p => `<li>${p.name}: ${money(p.rent)} rent + ${money(p.bills)} bills = <strong>${money(p.total)}</strong></li>`).join("")}</ul>
        <p>The three totals add up to ${money(byRoom.reduce((a, p) => a + p.total, 0))}, exactly the rent plus the bills. Splitting ${money(100000)} three ways equally gives ${equal.map(p => money(p.rent)).join(", ")}: someone has to take the extra cent, and the calculator gives it to the first person in the list, so the shares never fall short of the bill. If Mere had moved in with only 10 days of a 28-day period left, splitting the power bill by days present would give ${byDays.map(p => `${p.name} ${money(p.bills)}`).join(", ")}.</p>
        <!--@slot after-explainer-1-->
        <h2>Common mistakes</h2>
        <ul>
          <li><strong>Mixing periods.</strong> Rent is often weekly while power is monthly. Convert everything to the same period first, or the split will be wrong. A monthly bill is roughly 12 ÷ 52 of that amount per week.</li>
          <li><strong>Rounding each share up.</strong> If everyone rounds up to the nearest dollar, the flat overpays; round down and the account goes short. Keeping the cents avoids both.</li>
          <li><strong>Forgetting shared spaces.</strong> Weighting by bedroom size only shares out the bedrooms. Kitchens, lounges and bathrooms are used by everyone, so some flats split part of the rent equally and only the rest by room. You can do that by running the calculator twice.</li>
          <li><strong>Not agreeing first.</strong> The fairest method is the one everyone agreed to before the first bill arrived.</li>
        </ul>

        <h2>Limits and privacy</h2>
        <p>This is a calculator, not tenancy advice. It doesn't cover bonds, who is named on the tenancy agreement or what happens when someone leaves; for those questions, start with the government's Tenancy Services website, tenancy.govt.nz. Names, incomes and amounts stay in your browser and are never sent or saved. Only the split method is kept in the page address after the # sign. To add GST to a shared invoice, use the ${link("/gst-calculator", "GST calculator")}.</p>`,
    faq: [
      { q: "Who gets the extra cent when the rent doesn't divide evenly?", a: "<p>Each person first gets the whole cents of their exact share. Any cents left over go, one each, to the people whose exact share had the biggest fraction of a cent left, and on a tie, to whoever is higher in the list. The shares always add up to the total.</p>" },
      { q: "What if one room is much bigger?", a: "<p>Choose \"Room size\" and enter each bedroom's area. Rent is then shared in proportion to the areas. If shared spaces matter too, split part of the rent equally and part by room.</p>" },
    ],
    related: [
      { href: "/nz-calculators", label: "All NZ calculators" },
      { href: "/nz-paye-calculator", label: "Take-home pay calculator" },
    ],
  };
}
