// Footer: pillar links, trust pages (on every page), the hidden consent link, copyright.
import { esc } from "./util.mjs";

export default function footer({ nav, site, year, isPublished = () => true }) {
  return `<footer class="footer">
  <div class="wrap">
    <nav aria-label="Tool sections"><ul class="links">${nav.pillars.filter(n => isPublished(n.href)).map(n => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join("")}<li><a href="/sitemap">All pages</a></li></ul></nav>
    <nav aria-label="About this site"><ul class="links">${nav.legal.map(n => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join("")}
      <!-- CMP: the consent platform re-opens its settings from this link. Remove "hidden" when a CMP is wired in (docs/OWNER-TODO.md). -->
      <li><a href="#" id="privacy-settings-link" hidden>Privacy settings</a></li></ul></nav>
    <p>${esc(site.brand)} is run by ${esc(site.operatorName)} in New Zealand. Calculators give estimates for general information, not financial or tax advice. Not affiliated with Inland Revenue, ACC, MBIE or any government agency.</p>
    <p class="fine">© ${year} ${esc(site.brand)}</p>
  </div>
</footer>
<div class="toast" id="toast" role="status" hidden></div>`;
}
