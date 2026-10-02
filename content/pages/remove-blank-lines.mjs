// /remove-blank-lines landing.
import { cleanText } from "../../src/assets/lib/textclean.js";
import { cleanerTool, cleanerResults } from "../../src/templates/partials/cleaner-ui.mjs";

const vis = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/ /g, "·").replace(/\t/g, "→").replace(/\n/g, "<br>");

export default function page(ctx) {
  const { link, icon } = ctx;
  const pdf = "Dear Mere,\n\nThanks for the quote.\n \nWe'd like to go ahead\n\t\nfrom 1 March.\n\n\nKind regards";
  const emptyOnly = cleanText(pdf, { blanks: "empty" });
  const all = cleanText(pdf, { blanks: "whitespace" });
  const crlf = "one\r\n\r\ntwo\r\n";
  const crlfOut = cleanText(crlf, { blanks: "empty" });
  return {
    path: "/remove-blank-lines",
    type: "landing",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Remove Blank Lines: Delete Empty Lines from Text",
    description: "Delete empty lines from pasted text, including lines that only look empty because they hold spaces or tabs. Works with Windows and Mac line breaks.",
    crumbName: "Remove blank lines",
    h1: "Remove blank lines",
    h1Accent: "from any text",
    appName: "Remove blank lines",
    script: "cleaner",
    chips: [`<span class="chip">${icon("blank")}Empty or whitespace-only</span>`],
    sources: [], claims: [],
    intro: `<p>Strip out the empty lines that appear when you paste from an email, a PDF or a web page. Choose whether to remove only truly empty lines or also the ones that look empty but contain spaces or tabs. Windows and Mac line breaks are both understood, so text from any system cleans up the same way. The rest of each line is left exactly as it was.</p>`,
    tool: cleanerTool(ctx, { preset: { blanks: "whitespace" }, focus: ["tidy"], label: "Your text", placeholder: "Paste text with gaps between the lines" }),
    results: cleanerResults(),
    body: `
        <h2>Empty lines and lines that only look empty</h2>
        <p>A truly empty line has nothing on it at all. But many "blank" lines aren't empty: they hold a space, a few spaces, or a tab, which you can't see on screen. They come from people pressing the space bar before Enter, from documents that indent empty paragraphs, and from PDFs that pad lines to line up columns.</p>
        <p>The option "Remove empty lines" deletes only lines with nothing on them. "Remove empty and whitespace-only lines" also deletes lines made of spaces and tabs. The second is what most people want; the first is useful when a stray space on a line is meaningful, for example in some data formats.</p>

        <h2>Worked example: text pasted from a PDF</h2>
        <p>Below, a dot stands for a space and an arrow for a tab, so you can see what's hiding on the "blank" lines:</p>
        <pre class="formula">${vis(pdf)}</pre>
        <p>Removing only empty lines leaves ${emptyOnly.lines} lines, because two of the gaps contain a space or a tab. Removing whitespace-only lines as well leaves ${all.lines}:</p>
        <pre class="formula">${vis(all.output)}</pre>
        <p>The words inside each line, including the comma after "Dear Mere", are untouched.</p>

        <h2>Line-ending quirks</h2>
        <p>Windows ends each line with two invisible characters (carriage return and line feed, CRLF), while macOS, Linux and the web use one (LF). Very old Mac files used a lone carriage return. Some tools treat a stray carriage return as text, so a line that looks blank isn't removed. This cleaner converts every kind of line break to one standard before looking for blank lines. For example, the Windows text "one, blank, two" comes out as ${crlfOut.lines} lines. If you're pasting the result back into a Windows program that expects CRLF, choose it under "Split, join and line endings".</p>
        <!--@slot after-explainer-1-->
        <h2>Mistakes to avoid</h2>
        <ul>
          <li><strong>Removing paragraph breaks you wanted.</strong> In an email or a story, blank lines separate paragraphs. Removing them all runs the paragraphs together. If you only want to tidy double gaps, remove blank lines, then add them back where they belong.</li>
          <li><strong>Forgetting trailing spaces on text lines.</strong> Removing blank lines doesn't trim the lines that have words on them. Turn on "Trim spaces" too if they matter.</li>
          <li><strong>Expecting the last line break to count.</strong> A newline at the very end of a pasted text isn't treated as an extra blank line.</li>
        </ul>
        <p>The tool reports how many blank lines it removed. Everything stays in your browser. For other tidying in the same pass, open the ${link("/text-cleaner", "text cleaner")}; to get rid of repeated lines too, see ${link("/remove-duplicate-lines", "remove duplicate lines")}.</p>`,
    faq: [
      { q: "Why are some blank lines not removed?", a: "<p>They probably contain spaces or tabs. Choose \"Remove empty and whitespace-only lines\" and they'll go too.</p>" },
      { q: "Will this join my paragraphs together?", a: "<p>Removing blank lines leaves each line as it is, but paragraphs that were separated by a blank line will now sit directly on top of each other. Keep a copy if you need the gaps.</p>" },
    ],
    related: [
      { href: "/text-cleaner", label: "Text cleaner (all options)" },
      { href: "/remove-duplicate-lines", label: "Remove duplicate lines" },
      { href: "/word-and-character-counter", label: "Word and character counter" },
    ],
  };
}
