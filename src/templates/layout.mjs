// Page layout, following the approved design in design/. Everything a crawler or a no-JS
// visitor needs (header, navigation, page text, footer links, structured data) is in this HTML;
// scripts only add interactivity.
import { esc } from "./partials/util.mjs";
import header from "./partials/header.mjs";
import footer from "./partials/footer.mjs";
import breadcrumbs from "./partials/breadcrumbs.mjs";
import jsonld from "./partials/jsonld.mjs";
import adSlot from "./partials/ad-slot.mjs";
import cmpSlot from "./partials/cmp-slot.mjs";
import adsenseSlot from "./partials/adsense-slot.mjs";
import { icon, sprite } from "./icons.mjs";

// The only inline script (its SHA-256 goes into the CSP). Applies the saved theme before first
// paint and marks that JavaScript is running.
export const HEAD_SCRIPT = `(function(d){try{var t=localStorage.getItem("et-theme");if(t==="light"||t==="dark")d.setAttribute("data-theme",t)}catch(e){}d.classList.add("js")})(document.documentElement);`;

export default function layout(page, ctx) {
  const { site, assets, ads } = ctx;
  const canonical = site.siteUrl + (page.path === "/" ? "/" : page.path);
  const slotsOn = ads.enabledFor(page);
  const slot = name => (slotsOn.includes(name) ? adSlot(name, { preview: ads.preview }) : "");
  const fill = html => String(html || "").replace(/<!--@slot ([a-z0-9-]+)-->/g, (_, n) => slot(n));

  const scripts = [`<script src="${assets["site.js"]}" defer></script>`];
  if (page.script) scripts.push(`<script src="${assets[`js/${page.script}.js`]}" defer></script>`);

  const h1 = `<h1>${esc(page.h1)}${page.h1Accent ? ` <span class="grad-text">${esc(page.h1Accent)}</span>` : ""}</h1>`;
  const chips = page.chips?.length ? `<div class="t-meta">${page.chips.join("")}</div>` : "";
  const faq = page.faq?.length ? `${slot("before-faq")}
      <section class="faq" aria-labelledby="faq-h">
        <h2 id="faq-h">Questions people ask</h2>
        ${page.faq.map(f => `<details><summary>${f.q}<span aria-hidden="true">${icon("chev")}</span></summary><div>${f.a}</div></details>`).join("\n        ")}
      </section>` : "";
  const related = page.related?.length ? `<aside class="aside-card" aria-labelledby="rel-h">
      <h2 id="rel-h">${esc(page.relatedTitle || "Related")}</h2>
      <ul>${page.related.map(r => `<li><a href="${r.href}">${esc(r.label)} ${icon("arrow")}</a></li>`).join("")}</ul>
    </aside>` : "";
  const reviewed = page.reviewed && page.type !== "home" ? `<p class="updated">${esc(page.reviewedLabel || "Last reviewed")}: <time datetime="${page.reviewed}">${ctx.longDate(page.reviewed)}</time></p>` : "";
  const explain = `<div class="explain${related ? "" : " single"}">
    <article class="prose">
      ${page.type === "tool" || page.type === "landing" ? "" : page.notice || ""}
      ${fill(page.body)}
      ${faq}
      ${reviewed}
    </article>
    ${related}
  </div>`;

  let main;
  if (page.type === "home") main = fill(page.main);
  else if (page.type === "tool" || page.type === "landing") main = `<section class="t-hero">
   <div class="wrap">
    ${breadcrumbs(page.crumbs)}
    ${chips}
    ${h1}
    <div class="intro">${page.intro}</div>
   </div>
  </section>
  <div class="wrap">
  <section class="calc" aria-label="${esc(page.toolLabel || page.crumbName || page.h1)}">
    <div class="panel">
      ${page.tool}
      <noscript><p class="noscript-msg">This calculator needs JavaScript to work out results. Everything below explains the method, so you can still follow it by hand.</p></noscript>
    </div>
    <div class="results-col">
      ${page.results || ""}
      ${page.notice || ""}
    </div>
  </section>
  ${explain}
  </div>`;
  else main = `<section class="t-hero doc-hero">
   <div class="wrap">
    ${breadcrumbs(page.crumbs)}
    ${chips}
    ${h1}
    ${page.intro ? `<div class="intro">${page.intro}</div>` : ""}
   </div>
  </section>
  <div class="wrap">
  ${page.top || ""}
  ${explain}
  </div>`;

  const bodyInner = `<a class="skip" href="#main">Skip to main content</a>
${header({ nav: ctx.nav, page, isPublished: ctx.isPublished })}
<main id="main">
  ${main}
</main>
${footer({ nav: ctx.nav, site, year: ctx.year, isPublished: ctx.isPublished })}`;

  return `<!doctype html>
<html lang="${site.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="author" content="${esc(site.authorName)}">
<meta name="color-scheme" content="light dark">
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
${sprite(bodyInner)}
${bodyInner}
</body>
</html>
`;
}
