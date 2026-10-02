// Footer from the approved design: brand and trust badges, tool sections, learn and trust
// links (every trust page on every page), the hidden consent link and the copyright line.
import { esc } from "./util.mjs";
import { icon } from "../icons.mjs";
import { brand } from "./header.mjs";

export default function footer({ nav, site, year, isPublished }) {
  const tools = nav.pillars.filter(n => n.key !== "guides" && isPublished(n.href));
  const learn = [...nav.pillars.filter(n => n.key === "guides" && isPublished(n.href)), { href: "/sitemap", short: "All pages" }];
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        ${brand()}
        <p>Free, private tools for everyday jobs, run by ${esc(site.operatorName)} in New Zealand.</p>
        <div class="trust-badges"><span class="chip">${icon("lock")}Stays in your browser</span><span class="chip">${icon("file")}Sourced and dated</span></div>
      </div>
      ${tools.length ? `<nav class="foot-col" aria-labelledby="f-tools"><h2 id="f-tools">Tools</h2><ul>${tools.map(n => `<li><a href="${n.href}">${esc(n.short)}</a></li>`).join("")}</ul></nav>` : ""}
      <nav class="foot-col" aria-labelledby="f-learn"><h2 id="f-learn">Learn</h2><ul>${learn.map(n => `<li><a href="${n.href}">${esc(n.short)}</a></li>`).join("")}</ul></nav>
      <nav class="foot-col" aria-labelledby="f-trust"><h2 id="f-trust">Trust</h2><ul>${nav.legal.map(n => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join("")}
        <!-- CMP: the consent platform re-opens its settings from this link. Remove "hidden" when a CMP is wired in (docs/OWNER-TODO.md). -->
        <li><a href="#" id="privacy-settings-link" hidden>Privacy settings</a></li></ul></nav>
    </div>
    <div class="foot-bottom">
      <p>© ${year} ${esc(site.brand)}. Calculators give estimates for general information, not financial or tax advice. Not affiliated with Inland Revenue, ACC, MBIE or any government agency.</p>
    </div>
  </div>
</footer>
<div class="toast" id="toast" role="status" hidden></div>`;
}
