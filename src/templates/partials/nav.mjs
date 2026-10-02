// Main navigation: the pillar hubs (only those already published). Plain links in the HTML; on small screens the
// list is hidden behind the menu button, and stays visible when JavaScript is off.
import { esc } from "./util.mjs";

export default function nav({ nav, page, isPublished = () => true }) {
  const cur = n => (n.key === page.pillar || n.href === page.path ? ' aria-current="page"' : "");
  return `<nav class="navbar" id="navbar" aria-label="Main">
  <ul class="wrap">
    ${nav.pillars.filter(n => isPublished(n.href)).map(n => `<li><a href="${n.href}"${cur(n)}>${esc(n.label)}</a></li>`).join("\n    ")}
  </ul>
</nav>`;
}
