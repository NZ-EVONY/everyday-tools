// /sitemap: the HTML list of every published page, grouped by section. Built last.
export default function page(ctx) {
  return {
    path: "/sitemap",
    type: "sitemap",
    status: "published",
    reviewed: "2026-10-02",
    title: "All Pages | Everyday Tools",
    description: "Every page on Everyday Tools in one list: calculators, date tools, printables, text tools, guides and site information.",
    h1: "All pages",
    sources: [], claims: [],
    body: "",
    late: ({ pages, nav, esc }) => {
      const groups = [
        ...nav.pillars.map(n => ({ label: n.label, items: pages.filter(p => p.pillar === n.key) })),
        { label: "About this site", items: pages.filter(p => p.type === "trust" || p.type === "home") },
      ].filter(g => g.items.length);
      return { body: groups.map(g => `<h2>${esc(g.label)}</h2>\n<ul>${g.items.sort((a, b) => (a.type === "hub" ? -1 : b.type === "hub" ? 1 : a.h1.localeCompare(b.h1))).map(p => `<li><a href="${p.path}">${esc(p.h1)}</a></li>`).join("")}</ul>`).join("\n") };
    },
  };
}
