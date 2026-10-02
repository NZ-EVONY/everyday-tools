// /text-cleaner: the full engine with every option.
import { cleanText } from "../../src/assets/lib/textclean.js";
import { cleanerTool, cleanerResults } from "../../src/templates/partials/cleaner-ui.mjs";

const show = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export default function page(ctx) {
  const { link, icon } = ctx;
  const raw = "  Wellington\nauckland\n\nWellington  \nChristchurch\n   \nAuckland\nDunedin";
  const r = cleanText(raw, { trim: true, blanks: "whitespace", dedupe: true, dedupeCase: false, sort: "az" });
  return {
    path: "/text-cleaner",
    type: "tool",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Text Cleaner: Trim, Dedupe, Sort and Tidy Lines",
    description: "Clean up a list in one pass: trim spaces, remove blank and duplicate lines, sort, add text to every line, split or join. Private, in your browser.",
    crumbName: "Text cleaner",
    h1: "Text cleaner:",
    h1Accent: "tidy any list in one pass",
    appName: "Text cleaner",
    script: "cleaner",
    chips: [`<span class="chip">${icon("sparkles")}Up to 2 million characters</span>`],
    sources: [], claims: [],
    intro: `<p>Paste a messy list and tidy it in one go: trim stray spaces, squash double spaces, drop blank lines, remove duplicates, sort it properly, wrap every line in quotes or bullets, or split and join it. Every option can be combined, and the result updates as you change them. It copes with huge pastes from spreadsheets, emails and PDFs, and nothing you paste ever leaves your browser.</p>`,
    tool: cleanerTool(ctx, { focus: ["tidy", "dedupe"] }),
    results: cleanerResults(),
    body: `
        <h2>The order things happen in</h2>
        <p>When several options are on, the order changes the result, so the cleaner always works through them in the same sequence:</p>
        <ol>
          <li>Line endings are normalised, so Windows (CRLF), old Mac (CR) and Unix (LF) breaks all count as one kind of line break.</li>
          <li>If you gave a separator, each line is split at it.</li>
          <li>Spaces are trimmed from the start and end of each line.</li>
          <li>Runs of spaces and tabs inside a line become one space.</li>
          <li>Blank lines are removed.</li>
          <li>Duplicate lines are removed.</li>
          <li>Lines are sorted or reversed.</li>
          <li>Your text is added to the start and end of each line.</li>
          <li>Lines are joined into one, if you asked.</li>
        </ol>
        <p>Because trimming comes before duplicate removal, "&nbsp;Wellington" and "Wellington&nbsp;" become the same line before duplicates are checked. Because prefixes come last, a sort isn't thrown off by the quotes or bullets you add.</p>

        <h2>A worked example</h2>
        <p>This list of cities has stray spaces, two blank-looking lines and repeats that differ in case:</p>
        <pre class="formula">${show(raw).replace(/\n/g, "<br>")}</pre>
        <p>With trim, "remove empty and whitespace-only lines", duplicates ignoring case, and A to Z sorting, the cleaner returns ${r.lines} lines and reports ${r.blanksRemoved} blank and ${r.duplicatesRemoved} duplicate lines removed:</p>
        <pre class="formula">${show(r.output).replace(/\n/g, "<br>")}</pre>
        <p>Notice that the first spelling of each city is kept. That's what "keep the first copy" means; choose "the last copy" to keep later versions instead.</p>
        <!--@slot after-explainer-1-->
        <h2>Pages for single jobs</h2>
        <p>If you only need one thing done, these pages open the same cleaner with the right options already set, and explain the details of that job: ${link("/remove-duplicate-lines", "removing duplicate lines")}, ${link("/remove-blank-lines", "removing blank lines")}, ${link("/sort-lines-alphabetically", "sorting lines alphabetically")}, and ${link("/add-text-to-start-and-end-of-lines", "adding text to the start and end of lines")}. To count words and characters instead, use the ${link("/word-and-character-counter", "word and character counter")}.</p>

        <h2>Where messy lists come from</h2>
        <p>Columns copied out of a spreadsheet often carry trailing spaces and empty cells. Lists pasted from an email pick up blank lines between every item. Text copied from a PDF can have tabs, double spaces and lines broken in odd places. Exports from different systems repeat the same entries with different capitals. Each of these is one or two switches here, and the counts at the top of the results show how many lines each run removed, so you can see the effect before copying.</p>

        <h2>Limits and privacy</h2>
        <p>The cleaner accepts up to 2,000,000 characters, which is around a million very short lines. Text over 200,000 characters is processed in a background thread of your browser, so the page stays responsive while it works. Everything happens on your device: your text, prefixes and separators aren't sent anywhere, saved, or added to the page address. Only your on/off choices are kept after the # sign, so a bookmark reopens the cleaner set up the same way. Copy the result before you close the tab.</p>`,
    faq: [
      { q: "Does the cleaner change the text inside a line?", a: "<p>Only if you ask: trimming touches the ends of lines, and collapsing turns runs of spaces or tabs into one space. Letters, punctuation and case are never changed.</p>" },
      { q: "Can I undo a step?", a: "<p>Your original text stays in the input box, so turning an option off brings the result back. \"Use result as input\" replaces the original, so copy it first if you need it.</p>" },
    ],
    related: [
      { href: "/remove-duplicate-lines", label: "Remove duplicate lines" },
      { href: "/sort-lines-alphabetically", label: "Sort lines alphabetically" },
      { href: "/word-and-character-counter", label: "Word and character counter" },
      { href: "/text-tools", label: "All text tools" },
    ],
  };
}
