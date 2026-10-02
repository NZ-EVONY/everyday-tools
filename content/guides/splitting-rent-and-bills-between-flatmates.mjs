// Guide: splitting rent and bills between flatmates. No official figures; the arithmetic uses the splitter's own code.
import { splitFlat } from "../../src/assets/lib/split.js";

export default function page(ctx) {
  const { money, link } = ctx;
  const rooms = [{ name: "Big room", room: 16 }, { name: "Middle room", room: 12 }, { name: "Small room", room: 11 }];
  const rent = 78000;
  const byRoom = splitFlat({ rentCents: rent, people: rooms, method: "room" });
  const equal = splitFlat({ rentCents: rent, people: rooms, method: "equal" });
  const power = 24317;
  const days = splitFlat({ rentCents: 0, billCents: power, people: [{ name: "Tama", days: 31 }, { name: "Lucy", days: 31 }, { name: "Sione", days: 21 }], method: "days" });
  const even = splitFlat({ rentCents: 0, billCents: power, people: [{}, {}, {}], method: "equal" });
  const couple = splitFlat({ rentCents: 0, billCents: 16000, people: [{ room: 2 }, { room: 1 }, { room: 1 }], method: "room" });
  const rows = rooms.map((r, i) => `<tr><td>${r.name}, ${r.room} m²</td><td class="num">${money(equal[i].rent)}</td><td class="num">${money(byRoom[i].rent)}</td></tr>`).join("");
  return {
    path: "/guides/splitting-rent-and-bills-between-flatmates",
    type: "guide", pillar: "guides", topic: "Flatting", status: "published", reviewed: "2026-10-03", published: "2026-10-03",
    title: "Splitting Rent and Bills Between Flatmates Fairly",
    description: "How to split rent and bills in a shared house: room size, income or days present, couples, flatmates who leave, and shares that add up to the cent.",
    crumbName: "Splitting rent and bills",
    h1: "Splitting rent and bills",
    h1Accent: "between flatmates",
    sources: [], claims: [],
    intro: `<p>Money is one of the most common reasons flats fall out, and it's rarely about large sums. It's the feeling that a split is unfair, or that one person always covers the odd few dollars. This guide covers how to agree a method before anyone moves in, which costs to share and how, and what to do when someone is away, leaves part-way through a bill, or shares a room with a partner.</p>`,
    body: `
        <p class="lede">Agree the method in writing first, split rent by something everyone can see (usually room size), split most bills equally or by days present, and make sure the shares add up to the exact total.</p>

        <h2>Agree the rules before the first bill arrives</h2>
        <p>The easiest time to settle how money works is before anyone has unpacked. Once people have lived somewhere for a month, every proposal looks like it favours the person suggesting it. Sit down together and write a short note covering four things: how rent is divided, which bills are shared, who pays the landlord and the power company, and when everyone transfers their share. Keep it in the flat's group chat or a shared document so new flatmates can read it too.</p>
        <p>It also helps to decide who holds each account. One person usually pays the landlord and collects from everyone else, which is simpler for the landlord but puts that person out of pocket if anyone pays late. Some flats rotate who looks after the power or internet account so the job doesn't always land on the same person.</p>

        <h2>Splitting the rent</h2>
        <p>Equal rent is simple and works when the rooms are much the same. When they aren't, room size is the measure most people accept, because anyone can check it with a tape measure. Here's a ${money(rent)} weekly rent for three rooms of different sizes (an invented flat):</p>
        <table><thead><tr><th scope="col">Room</th><th scope="col" class="num">Equal split</th><th scope="col" class="num">By floor area</th></tr></thead><tbody>${rows}</tbody></table>
        <p>The person in the big room pays ${money(byRoom[0].rent - equal[0].rent)} a week more than they would under an equal split, and that money comes off the other two rooms. Some flats prefer a fixed premium instead, such as an agreed extra amount for the room with an ensuite or a garage, which is fine as long as everyone signs up to it. Splitting by income is less common: it suits partners or close friends, but it means sharing what each person earns, and it needs revisiting whenever someone's pay changes.</p>
        <!--@slot after-intro-->
        <h2>Splitting the bills</h2>
        <p>Most shared bills, like power and internet, don't depend much on room size, so many flats split those equally even when rent is weighted. The ${link("/flatmate-rent-splitter", "flatmate splitter")} has a box for exactly that. Decide early which costs are shared and which aren't. A streaming subscription only some people use, a big grocery shop one person cooks from, or a heater someone runs all night are the usual arguments. A simple rule is that anything everyone uses is shared, and anything only some people use is split between them.</p>

        <h2>When someone is away or leaves part-way through</h2>
        <p>If a flatmate is away for a long stretch, or moves out before the bill period ends, splitting by days present is fairer. Suppose a ${money(power)} power bill covers 31 days, and one of three flatmates moved out after 21 of them. Split equally, two people pay ${money(even[0].bills)} and one pays ${money(even[2].bills)}, because the spare cent has to go to someone. Split by days, the two who stayed pay ${money(days[0].bills)} each and the one who left pays ${money(days[2].bills)}. Agree a threshold, such as a week away, so a single weekend trip doesn't turn into a calculation. Rent is usually different: a room that's kept is normally still paid for, even while its occupant is on holiday.</p>
        <!--@slot mid-content-->
        <h2>Couples sharing a room</h2>
        <p>Two people in one room raises a fair question: should rent be split per room or per person? A common answer is that the room's rent is shared by the couple, so the room pays its normal share, while bills are split per person, because two people use more power and hot water than one. On a ${money(16000)} bill in a flat of a couple and two singles, weighting the couple as two people gives them ${money(couple[0].bills)} together and each single ${money(couple[1].bills)}. Whatever you choose, agree it before the partner moves in, not after the first big bill.</p>

        <h2>Every share should add up to the total</h2>
        <p>Dividing by three rarely comes out to whole cents. If each person rounds their own share, the total collected can be a cent or two short of the bill, and the person who pays the account quietly covers the gap every time. The splitter avoids this by giving each person the whole cents of their exact share, then handing any leftover cents one at a time to the shares that were rounded down the most. The result always adds up to the bill exactly. It's a small thing, but it removes a regular source of irritation.</p>

        <h2>Common pitfalls</h2>
        <ul>
          <li><strong>Mixing periods.</strong> Rent is usually weekly; power is often monthly. Convert to one period before splitting, or split each bill on its own.</li>
          <li><strong>Forgetting setup costs.</strong> Connection fees and equipment hire count as shared costs too; agree how they're split, including when someone leaves.</li>
          <li><strong>Letting debts build up.</strong> Settle every bill when it arrives, so nobody is owed a large sum when they move out.</li>
          <li><strong>Changing the method mid-tenancy without everyone agreeing.</strong> If the rule needs to change, change it from the next bill, in writing.</li>
        </ul>
        <p>The ${link("/flatmate-rent-splitter", "splitter")} runs in your browser and never sends what you type anywhere, so names and amounts stay private. For a short list of jobs or a shared cleaning roster, the ${link("/printable-checklist", "printable checklist")} is handy too.</p>`,
    related: [
      { href: "/flatmate-rent-splitter", label: "Flatmate rent and bills splitter" },
      { href: "/printable-checklist", label: "Printable checklist" },
      { href: "/nz-calculators", label: "All NZ calculators" },
    ],
  };
}
