// One JSON-LD @graph per page, built from the same data as the visible content.
// Author and publisher are always the Organization, never a person.
import { textOf } from "./util.mjs";

export default function jsonld({ page, site }) {
  const abs = p => site.siteUrl + (p === "/" ? "/" : p);
  const org = { "@type": "Organization", name: site.publisherName };
  const graph = [];
  if (page.path === "/") {
    graph.push({ "@type": "WebSite", "@id": abs("/") + "#website", name: site.brand, url: abs("/"), inLanguage: site.language, publisher: { "@id": abs("/") + "#organization" } });
    graph.push({ ...org, "@id": abs("/") + "#organization", url: abs("/") });
  }
  if (page.type === "tool" || page.type === "landing") {
    graph.push({
      "@type": "WebApplication", name: page.appName || page.h1, url: abs(page.path), description: page.description,
      applicationCategory: page.appCategory || "UtilitiesApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript",
      inLanguage: site.language, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "NZD" }, publisher: org,
    });
  }
  if (page.type === "guide") {
    graph.push({
      "@type": "Article", headline: page.h1, description: page.description, datePublished: page.published || page.reviewed, dateModified: page.reviewed,
      inLanguage: site.language, author: org, publisher: org, mainEntityOfPage: abs(page.path),
    });
  }
  if (page.faq?.length) {
    graph.push({ "@type": "FAQPage", mainEntity: page.faq.map(f => ({ "@type": "Question", name: textOf(f.q), acceptedAnswer: { "@type": "Answer", text: textOf(f.a) } })) });
  }
  if (page.crumbs?.length > 1) {
    graph.push({ "@type": "BreadcrumbList", itemListElement: page.crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })) });
  }
  if (!graph.length) return "";
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
}
