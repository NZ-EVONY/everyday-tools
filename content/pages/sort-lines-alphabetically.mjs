// /sort-lines-alphabetically landing.
import { sortLines } from "../../src/assets/lib/textclean.js";
import { cleanerTool, cleanerResults } from "../../src/templates/partials/cleaner-ui.mjs";

export default function page(ctx) {
  const { link, icon } = ctx;
  const files = ["chapter 10", "chapter 2", "Chapter 3", "chapter 21", "chapter 1"];
  const places = ["Whangārei", "Wellington", "Ōamaru", "Otorohanga", "Arrowtown", "ōpōtiki"];
  const plain = files.slice().sort();
  const az = sortLines(files, "az"), nat = sortLines(files, "natural"), pl = sortLines(places, "az");
  const list = a => a.map(x => `<code>${x}</code>`).join(", ");
  return {
    path: "/sort-lines-alphabetically",
    type: "landing",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Sort Lines Alphabetically: A to Z, Natural or by Length",
    description: "Sort a list alphabetically, Z to A, with numbers in natural order (2 before 10), or by length. Accents and macrons sort with their letters.",
    crumbName: "Sort lines alphabetically",
    h1: "Sort lines",
    h1Accent: "alphabetically",
    appName: "Sort lines alphabetically",
    script: "cleaner",
    chips: [`<span class="chip">${icon("sort")}Macrons sorted properly</span>`],
    sources: [], claims: [],
    intro: `<p>Put any list in order: A to Z, Z to A, with numbers in their natural order so that 2 comes before 10, by length, or simply reversed. Letters with macrons and accents sort alongside their plain versions, so Ōamaru files with the O names rather than at the end. Equal lines keep their original order, so sorting twice never shuffles them. Paste, choose an order, copy the result.</p>`,
    tool: cleanerTool(ctx, { preset: { sort: "az" }, focus: ["sort"], label: "Your list", placeholder: "Paste the lines you want sorted" }),
    results: cleanerResults(),
    body: `
        <h2>Why simple sorting goes wrong</h2>
        <p>Many programs sort text by the code number of each character. That puts every capital letter before every lower-case one, sends letters with macrons or accents to the very end, and treats numbers as strings of characters. This tool uses proper language-aware ordering for New Zealand English instead, which compares letters the way a dictionary or phone book does.</p>

        <h2>Numbers inside text: alphabetical versus natural</h2>
        <p>Take these chapter names: ${list(files)}. Sorting by character codes gives ${list(plain)}: capitals first, and "10" before "2" because the character "1" comes before "2". Alphabetical (A to Z) sorting fixes the capitals but still compares digits one at a time: ${list(az)}. Natural sorting reads each run of digits as a number, giving ${list(nat)}. Use natural order for file names, versions, invoice numbers and anything numbered.</p>

        <h2>Macrons and accents</h2>
        <p>Place names in Aotearoa often carry macrons. A naive sort puts "Ōamaru" after "Wellington" because "Ō" has a higher character code than any plain letter. Sorting with language rules treats Ō as a form of O: ${list(pl)}. Lower-case and capital letters are also compared as the same letter first, with case only used to break a tie when you tick "upper case before lower case".</p>
        <!--@slot after-explainer-1-->
        <h2>Other orders</h2>
        <ul>
          <li><strong>Z to A</strong> and <strong>natural, descending</strong> give the same rules backwards.</li>
          <li><strong>Shortest first</strong> and <strong>longest first</strong> count characters as you see them, so an emoji or an accented letter counts once. Lines of the same length keep their original order.</li>
          <li><strong>Reverse the order</strong> doesn't compare anything; it flips the list upside down, which is handy for logs where the newest line is at the bottom.</li>
        </ul>

        <h2>Mistakes to avoid</h2>
        <ul>
          <li><strong>Leading spaces.</strong> A space sorts before letters, so " zebra" with a space jumps to the top. Turn on "Trim spaces" first.</li>
          <li><strong>Numbers with different formats.</strong> "1,000" and "999" sort by their digits, and natural order reads "1,000" as 1 then 000. Remove thousands separators if exact numeric order matters.</li>
          <li><strong>Expecting dates to sort.</strong> "2/10/2026" style dates don't sort chronologically as text. Year-month-day dates like 2026-10-02 do.</li>
        </ul>
        <p>Your list stays in your browser. To remove repeats before sorting, see ${link("/remove-duplicate-lines", "remove duplicate lines")}; for every option at once, use the ${link("/text-cleaner", "text cleaner")}.</p>`,
    faq: [
      { q: "Why does 10 come before 2?", a: "<p>Alphabetical order compares one character at a time, and \"1\" comes before \"2\". Choose \"Natural (2 before 10)\" to compare whole numbers by value.</p>" },
      { q: "Is the sort case-sensitive?", a: "<p>Not by default: \"apple\" and \"Apple\" are treated as the same word and keep their original order. Tick \"upper case before lower case\" to break ties by case.</p>" },
    ],
    related: [
      { href: "/text-cleaner", label: "Text cleaner (all options)" },
      { href: "/remove-duplicate-lines", label: "Remove duplicate lines" },
      { href: "/add-text-to-start-and-end-of-lines", label: "Add text to start and end of lines" },
    ],
  };
}
