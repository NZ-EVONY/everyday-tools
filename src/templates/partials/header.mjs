// Sticky site header from the approved design: brand, pillar navigation (published hubs only),
// theme toggle and a <details> menu for small screens (works without JavaScript).
import { esc } from "./util.mjs";
import { icon } from "../icons.mjs";

export const brand = (cls = "brand") => `<a class="${cls}" href="/" aria-label="Everyday Tools, home"><span class="mark" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2.6"/><rect x="13" y="3" width="8" height="8" rx="2.6" opacity=".55"/><rect x="3" y="13" width="8" height="8" rx="2.6" opacity=".55"/><rect x="13" y="13" width="8" height="8" rx="2.6"/></svg></span><span>Everyday <span class="tool">Tools</span></span></a>`;

export default function header({ nav, page, isPublished }) {
  const items = nav.pillars.filter(n => isPublished(n.href));
  const cur = n => (n.key === page.pillar || n.href === page.path ? ' aria-current="page"' : "");
  return `<header class="site-header">
  <div class="wrap bar">
    ${brand()}
    <nav class="nav" aria-label="Main"><ul>${items.map(n => `<li><a href="${n.href}"${cur(n)}>${esc(n.short)}</a></li>`).join("")}</ul></nav>
    <div class="bar-actions">
      <button class="icon-btn theme-toggle" id="themeToggle" type="button" aria-label="Dark theme" aria-pressed="false">${icon("moon", "i-moon")}${icon("sun", "i-sun")}</button>
      <details class="menu" id="menu">
        <summary class="icon-btn" aria-label="Menu">${icon("menu")}</summary>
        <nav class="menu-panel" aria-label="Main (menu)"><ul>${items.map(n => `<li><a href="${n.href}"${cur(n)}>${esc(n.short)}${icon("arrow")}</a></li>`).join("")}</ul></nav>
      </details>
    </div>
  </div>
</header>`;
}
