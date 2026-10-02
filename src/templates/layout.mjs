// Page layout. Everything a crawler or a no-JS visitor needs (header, navigation, page text,
// footer links, structured data) is in this HTML; scripts only add interactivity.
import { esc } from "./partials/util.mjs";
import header from "./partials/header.mjs";
import nav from "./partials/nav.mjs";
import footer from "./partials/footer.mjs";
import breadcrumbs from "./partials/breadcrumbs.mjs";
import jsonld from "./partials/jsonld.mjs";
import adSlot from "./partials/ad-slot.mjs";
import cmpSlot from "./partials/cmp-slot.mjs";
import adsenseSlot from "./partials/adsense-slot.mjs";

// The only inline script (its SHA-256 goes into the CSP). Applies the saved theme before first paint.
export const HEAD_SCRIPT = `(function(d){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")d.dataset.theme=t}catch(e){}d.classList.add("js")})(document.documentElement);`;

export default function layout(page, ctx) {
  const { site, assets, ads } = ctx;
  const canonical = site.siteUrl + (page.path === "/" ? "/" : page.path);
  const slotsOn = ads.enabledFor(page);
  const slot = name => (slotsOn.includes(name) ? adSlot(name, { preview: ads.preview }) : "");
  // Ad slots are placed in copy with <!--@slot NAME--> markers; unused markers vanish.
  const fill = html => String(html || "").replace(/<!--@slot ([a-z0-9-]+)-->/g, (_, n) => slot(n));

  const scripts = [`<script src="${assets["site.js"]}" defer></script>`];
  if (page.script) scripts.push(`<script src="${assets[`js/${page.script}.js`]}" defer></script>`);

  const faq = page.faq?.length ? `${slot("before-faq")}
      <section class="faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Questions people ask</h2>
        ${page.faq.map(f => `<details class="faq-item"><summary>${f.q}</summary><div class="faq-a">${f.a}</div></details>`).join("\n        ")}
      </section>` : "";
  const related = page.related?.length ? `${slot("before-related")}<section class="related" aria-labelledby="related-title">
        <h2 id="related-title">${esc(page.relatedTitle || "Related tools and guides")}</h2>
        <ul class="related-list">${page.related.map(r => `<li><a href="${r.href}">${esc(r.label)}</a>${r.note ? ` <span class="hint">${r.note}</span>` : ""}</li>`).join("")}</ul>
      </section>` : "";
  const reviewed = page.reviewed ? `<p class="updated">${esc(page.reviewedLabel || "Last reviewed")}: <time datetime="${page.reviewed}">${ctx.longDate(page.reviewed)}</time></p>` : "";
  const isTool = page.type === "tool" || page.type === "landing";
  const body = isTool
    ? `<header class="page-head">
        <h1>${esc(page.h1)}</h1>
        <div class="intro">${page.intro}</div>
      </header>
      <section class="tool-card" aria-label="${esc(page.toolLabel || page.h1)}">
        ${page.tool}
        <noscript><p class="noscript">This calculator needs JavaScript to work out results. Everything on this page explains how it works, so you can still follow the method by hand.</p></noscript>
      </section>
      ${page.notice || ""}
      <article class="prose">
        ${fill(page.body)}
        ${faq}
        ${related}
        ${reviewed}
      </article>`
    : `<article class="prose">
        <h1>${esc(page.h1)}</h1>
        ${page.notice || ""}
        ${fill(page.body)}
        ${faq}
        ${related}
        ${reviewed}
      </article>`;

  return `<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="author" content="${esc(site.authorName)}">
<link rel="canonical" href="${canonical}">
${page.noindex ? `<meta name="robots" content="noindex">\n` : ""}<meta property="og:type" content="${page.type === "guide" ? "article" : "website"}">
<meta property="og:site_name" content="${esc(site.brand)}">
<meta property="og:locale" content="en_NZ">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="theme-color" content="${site.themeColorLight}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${site.themeColorDark}" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>${HEAD_SCRIPT}</script>
<link rel="stylesheet" href="${assets["style.css"]}">
${cmpSlot()}
${adsenseSlot()}
${jsonld({ page, site })}
${scripts.join("\n")}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${header({ site })}
${nav({ nav: ctx.nav, page, isPublished: ctx.isPublished })}
<main class="wrap main" id="main">
  ${breadcrumbs(page.crumbs)}
  ${body}
</main>
${footer({ nav: ctx.nav, site, year: ctx.year, isPublished: ctx.isPublished })}
</body>
</html>
`;
}
