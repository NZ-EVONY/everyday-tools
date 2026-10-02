// /guides hub. Lists published guides automatically; describes the topics being written.
export default function page(ctx) {
  const { link } = ctx;
  return {
    path: "/guides",
    type: "hub",
    pillar: "guides",
    status: "published",
    reviewed: "2026-10-02",
    title: "Guides: NZ Tax, Dates, Printing and Text",
    description: "Plain-English guides to GST, PAYE, tax codes, KiwiSaver, public holidays, counting days, printing at home and cleaning up lists of text.",
    h1: "Guides",
    sources: [], claims: [],
    late: ({ pages }) => {
      const guides = pages.filter(p => p.type === "guide").sort((a, b) => a.h1.localeCompare(b.h1));
      return { published: guides.length };
    },
    body: `
        <p>The tools on this site give quick answers. These guides explain the ideas behind them, so you can check a result, spot a mistake on a pay slip or invoice, or explain it to someone else. Each guide teaches one topic with a worked example, links to the official source for any rule it states, and shows when it was last reviewed.</p>

        <h2>Money and tax in New Zealand</h2>
        <p>How PAYE is worked out from the tax brackets, what each tax code means and when to use a secondary code, how KiwiSaver contributions and the government contribution add up, and why removing GST from a price uses a fraction rather than a straight percentage. These guides sit alongside the ${link("/nz-calculators", "NZ calculators")} and use the same official figures.</p>

        <h2>Dates, holidays and time zones</h2>
        <p>Inclusive and exclusive day counts, leap years, how Mondayisation moves a public holiday that falls on a weekend, how regional anniversary days work, and how New Zealand daylight saving changes the gap to Australia, the UK and the US. These pair with the ${link("/date-and-time-tools", "date and time tools")}.</p>

        <h2>Printing and paper</h2>
        <p>Choosing between A4 and US Letter, getting margins and scaling right so a calendar fits on one page, and printing on both sides without the back coming out upside down. See the ${link("/printables", "printables")} for the tools themselves.</p>

        <h2>Cleaning up text</h2>
        <p>Why "duplicate" lines sometimes aren't, why sorted numbers come out as 1, 10, 2, what hidden line endings do when you paste from a spreadsheet or PDF, and how to tidy a list for a CSV file or a database query. The ${link("/text-tools", "text tools")} do the work.</p>

        <h2>How guides are kept accurate</h2>
        <p>Rules and rates in guides come from official pages and are dated. When a rate changes at the start of a tax year, the guide is reviewed along with the calculators. If you spot something out of date, the ${link("/contact", "contact page")} explains how to report it.</p>
        <p>Guides are published one at a time as each is written and checked, so this section is still growing.</p>`,
  };
}
