// Home page, laid out like design/home.html: hero with tool search, trust strip, the tools by
// section (cards link once a tool is published), why panel and guides.
import { addGst, removeGst } from "../../src/assets/lib/gst.js";
import { toBasisPoints } from "../../src/assets/lib/money.js";

export default function page(ctx) {
  const { link, tax, gst, pct, money, icon, tools, nav, esc, isPublished } = ctx;
  const bp = toBasisPoints(gst.rate.value);
  const pv = removeGst(11500, bp);
  const live = tools.filter(t => isPublished(t.path)).length;
  const days = Math.round((Date.UTC(2026, 11, 25) - Date.UTC(2026, 9, 2)) / 86400000);
  const pillar = (n, i) => {
    const hub = isPublished(n.href);
    return `<section class="pillar" id="${n.key}" aria-labelledby="p${i}">
        <div class="p-head"><div><div class="p-title"><span class="p-num" aria-hidden="true">0${i}</span><h2 id="p${i}">${esc(n.label)}</h2></div><p>${esc(nav.pillarIntro[n.key])}</p></div>${hub ? `<a class="p-more" href="${n.href}">All ${esc(n.label.toLowerCase())} ${icon("arrow")}</a>` : ""}</div>
        ${ctx.toolGrid(n.key, isPublished)}
      </section>`;
  };
  return {
    path: "/",
    type: "home",
    status: "published",
    reviewed: "2026-10-02",
    title: "Everyday Tools: Free NZ Calculators and Handy Tools",
    description: "Free, private tools for everyday jobs in New Zealand: GST and pay calculators, date and time tools, printable calendars and text cleaners.",
    h1: "Everyday tools, done properly.",
    sources: [], claims: [],
    late: ({ pages }) => ({ guidesHtml: pages.filter(p => p.type === "guide").map(ctx.guideLink).join("") }),
    get main() {
      return `<section class="hero" aria-labelledby="h1">
    <div class="hero-bg" aria-hidden="true"></div>
    <div class="wrap hero-grid">
      <div>
        <p class="eyebrow"><i aria-hidden="true"></i>Free · No sign-up · Made for New Zealand</p>
        <h1 id="h1">Everyday tools, <span class="grad-text">done properly.</span></h1>
        <p class="lede">Calculators, date tools, printables and text cleaners that are quick, sourced and private. Whatever you type stays in your browser.</p>
        <form class="search js-only" role="search" id="search-form" action="#" autocomplete="off">
          <label class="sr-only" for="q">Search tools</label>
          ${icon("search")}
          <input id="q" name="q" type="search" placeholder="Search tools: try GST, days, duplicate…" aria-describedby="count" enterkeyhint="search" spellcheck="false" maxlength="60">
          <kbd aria-hidden="true">/</kbd>
        </form>
        <div class="quick js-only" role="group" aria-label="Quick searches"><span>Popular</span><button type="button" data-q="gst">GST</button><button type="button" data-q="pay">Take-home pay</button><button type="button" data-q="days">Days between</button><button type="button" data-q="print">Printables</button><button type="button" data-q="duplicate">Remove duplicates</button></div>
        <p class="count" id="count" role="status" aria-live="polite">${live} of ${tools.length} tools ready, more on the way</p>
      </div>
      <div class="preview" aria-hidden="true">
        <div class="pv-card pv-back"><small>Days between dates</small><div class="big">${days} days</div><small>2 October to 25 December 2026</small></div>
        <div class="pv-card pv-front">
          <div class="pv-head"><span class="pv-ic">${icon("percent")}</span>GST calculator<span class="chip">${pct(gst.rate.value)}</span></div>
          <div class="pv-seg"><span class="on">Remove GST</span><span>Add GST</span></div>
          <div class="pv-field"><small>Price including GST</small><b>${money(pv.inclusive)}</b></div>
          <div class="pv-bar"><i></i><i></i></div>
          <div class="pv-rows"><div><span>Excluding GST</span><b>${money(pv.exclusive)}</b></div><div><span>GST</span><b>${money(pv.gst)}</b></div></div>
        </div>
        <div class="pv-float">${icon("shield")}Nothing leaves your browser</div>
      </div>
    </div>
  </section>

  <section class="strip" aria-label="Why you can trust these tools">
    <div class="wrap"><ul>
      <li>${icon("lock")}No accounts, no trackers</li>
      <li>${icon("file")}NZ figures cite their source</li>
      <li>${icon("bolt")}Light pages, instant results</li>
      <li>${icon("shield")}Your input never leaves the page</li>
    </ul></div>
  </section>

  <section class="tools" aria-label="All tools">
    <div class="wrap">
      <div class="empty" id="empty" data-show="false" role="status">
        <h2>No tools match “<span id="empty-q"></span>”</h2>
        <p>Try a shorter word, like “tax”, “date” or “list”.</p>
        <button type="button" class="btn btn-ghost" id="clear">Show all tools</button>
      </div>
      ${nav.pillars.filter(n => n.key !== "guides").map((n, i) => pillar(n, i + 1)).join("\n      ")}
      <!--@slot mid-content-->
    </div>
  </section>

  <section class="why" aria-labelledby="why-h">
    <div class="wrap">
      <div class="why-card">
        <h2 id="why-h">Quiet, quick and <em>correct.</em></h2>
        <div class="why-grid">
          <div><div class="ic">${icon("shield")}</div><h3>Private by design</h3><p>Everything is worked out in your browser. There are no accounts, no tracking scripts and nothing to sign up for, so what you type about your pay or your flat stays with you.</p></div>
          <div><div class="ic">${icon("file")}</div><h3>Numbers you can trace</h3><p>Tax rates and public holidays come only from government pages. The pay tools use the ${tax.taxYear} tax year, and every money page links to its source with the date it was checked.</p></div>
          <div><div class="ic">${icon("bolt")}</div><h3>Explained, not just answered</h3><p>Each tool page walks through the method, a worked example made by the same code, and the mistakes people commonly make. No frameworks or third-party scripts, so pages open fast on a slow connection.</p></div>
        </div>
      </div>
    </div>
  </section>

  <section class="guides" aria-labelledby="g-h">
    <div class="wrap">
      <h2 class="sec-title" id="g-h">Plain-English guides</h2>
      <p class="sec-sub">Short explainers behind the calculators, with worked examples. A tool only goes live once its figures are checked against an official source, and guides follow the same rule, so this section is still filling up. Start with the ${link("/guides", "guides page")}, or read ${link("/about", "how the site works")}. Everyday Tools is run by an independent publisher in New Zealand.</p>
      <div class="guide-list">${this.guidesHtml || ""}</div>
    </div>
  </section>`;
    },
  };
}
