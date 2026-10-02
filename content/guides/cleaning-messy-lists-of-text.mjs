// Guide: cleaning messy lists of text. Examples run through the site's own text engine at build time.
import { cleanText, sortLines } from "../../src/assets/lib/textclean.js";

export default function page(ctx) {
  const { link, esc } = ctx;
  const show = s => esc(s).replace(/ /g, "·");
  const files = ["photo 1.jpg", "photo 10.jpg", "photo 2.jpg", "photo 21.jpg", "photo 3.jpg"];
  const az = sortLines(files, "az"), nat = sortLines(files, "natural");
  const raw = ["Kererū Street", "kererū street ", "Tūī Road", "  Tūī Road", "Kōwhai Ave"];
  const strict = cleanText(raw.join("\n"), { dedupe: true, dedupeTrim: false });
  const loose = cleanText(raw.join("\n"), { dedupe: true, dedupeCase: false, trim: true });
  const ids = "A-1043\r\nA-0977\r\n\r\nA-1043\r\nA-2210\r\n";
  const sql = cleanText(ids, { trim: true, blanks: "whitespace", dedupe: true, prefix: "'", suffix: "'", join: ", " });
  const csv = cleanText("Aroha, Ben ,Mere,, Sione", { split: ",", trim: true, blanks: "empty" });
  return {
    path: "/guides/cleaning-messy-lists-of-text",
    type: "guide", pillar: "guides", topic: "Text", status: "published", reviewed: "2026-10-03", published: "2026-10-03",
    title: "Cleaning Messy Lists of Text: Duplicates, Sorting, Spaces",
    description: "Why duplicate lines survive, why sorting gives 1, 10, 2, what hidden spaces and line endings do, and how to turn a pasted list into CSV or a query.",
    crumbName: "Cleaning messy lists of text",
    h1: "Cleaning messy lists",
    h1Accent: "of text",
    sources: [], claims: [],
    intro: `<p>Lists copied out of spreadsheets, emails, PDFs and web pages rarely arrive clean. There are stray spaces, blank lines, repeats that don't look like repeats, and numbers that sort in a strange order. This guide explains what's usually hiding in a messy list, why the obvious fixes sometimes don't work, and the order of steps that turns a pasted jumble into something you can use in a spreadsheet, a mail merge or a database query.</p>`,
    body: `
        <p class="lede">Normalise line endings, trim spaces, drop blank lines, then remove duplicates, then sort, then add any wrapping. Doing it in that order avoids most of the surprises.</p>

        <h2>What's hiding in a pasted list</h2>
        <p>Text that looks tidy on screen can carry characters you can't see. The usual suspects are spaces at the start or end of a line, tabs where you expected spaces, and non-breaking spaces copied from web pages and word processors, which look identical to ordinary spaces but aren't the same character. Lists exported from Windows programs often end each line with two invisible characters, a carriage return and a line feed, where most other systems use just the line feed. And a list pasted from a PDF may break lines in the middle of an entry, wherever the original page ran out of width.</p>
        <p>None of this matters when you're reading the list. It matters as soon as a computer compares lines, because to a computer "Tūī Road" with a trailing space and "Tūī Road" without one are different.</p>

        <h2>Why some duplicates survive</h2>
        <p>Here's a short address list (dots stand in for spaces so you can see them):</p>
        <table><thead><tr><th scope="col">Pasted line</th></tr></thead><tbody>${raw.map(l => `<tr><td><code>${show(l)}</code></td></tr>`).join("")}</tbody></table>
        <p>A strict duplicate check, matching letter for letter, finds no repeats and keeps all ${strict.lines} lines, because each one differs from its near-twin by a capital letter or a space. Trim the spaces and ignore capitals, and only ${loose.lines} lines remain. Which is right depends on the job. For street names, "Kererū Street" and "kererū street" are clearly the same place. For case-sensitive codes or passwords, they aren't. Decide what counts as the same before you remove anything, and keep the original until you've checked the result.</p>
        <!--@slot after-intro-->
        <h2>Why sorting gives 1, 10, 2</h2>
        <p>Ordinary alphabetical sorting compares text one character at a time. "1" comes before "2", so "photo 10" lands before "photo 2", just as "ba" comes before "c". The result looks wrong to a person:</p>
        <table><thead><tr><th scope="col">Alphabetical</th><th scope="col">Natural</th></tr></thead><tbody>${az.map((l, i) => `<tr><td>${esc(l)}</td><td>${esc(nat[i])}</td></tr>`).join("")}</tbody></table>
        <p>Natural sorting reads runs of digits as whole numbers, so 2 comes before 10. It's what you want for file names, invoice numbers and street addresses. Another fix, common in spreadsheets, is padding numbers with leading zeros (002, 010), which makes alphabetical and number order agree. Accents can cause a similar surprise; a good sort keeps "Kōwhai" with the other words starting with K rather than pushing it to the end.</p>

        <h2>Line endings and blank lines</h2>
        <p>The carriage-return characters from Windows files are the reason a list can look fine yet refuse to match, or show odd symbols when opened in another program. Converting all line endings to one style before anything else fixes this. Blank lines come in two kinds: truly empty ones, and ones holding a space or a tab, which look empty but aren't. If "remove blank lines" leaves gaps behind, those gaps contain whitespace; removing whitespace-only lines as well clears them.</p>
        <!--@slot mid-content-->
        <h2>The order matters</h2>
        <p>The steps affect each other, so the sequence changes the result. Trim before removing duplicates, or entries that differ only by a trailing space survive. Remove blank lines before sorting, or a block of empties collects at the top. Add quotes and commas last, so they aren't counted as part of an entry when comparing or sorting. The ${link("/text-cleaner", "text cleaner")} always works in this order, which is why it can do several jobs in one pass.</p>

        <h2>From a list to a query or a CSV row</h2>
        <p>A common job is turning a column of IDs into something a database query can use. Starting from IDs copied out of a spreadsheet, with Windows line endings, a blank line and a repeat, trimming, removing the blank and the duplicate, wrapping each line in single quotes and joining with commas gives:</p>
        <table><thead><tr><th scope="col">Result</th></tr></thead><tbody><tr><td><code>${esc(sql.output)}</code></td></tr></tbody></table>
        <p>That's ready to drop inside the brackets of an <code>IN ( )</code> clause. Going the other way, a comma-separated row can be split into one entry per line: "Aroha, Ben ,Mere,, Sione" becomes ${csv.lines} clean lines once the spaces are trimmed and the empty entry between the two commas is dropped. If an entry might itself contain a comma, such as "Smith, J", a plain split will break it in two; for anything like that, use a spreadsheet's import tool, which understands quoted fields.</p>

        <h2>Good habits</h2>
        <ul>
          <li>Keep a copy of the original before cleaning, so you can start again.</li>
          <li>Count the lines before and after, and make sure the difference makes sense.</li>
          <li>Check a few entries by eye, especially ones with accents or macrons.</li>
          <li>Don't paste passwords or other private data into online tools that send text to a server; the tools here work entirely in your browser.</li>
        </ul>
        <p>For single jobs there are quicker pages: ${link("/remove-duplicate-lines", "remove duplicate lines")}, ${link("/remove-blank-lines", "remove blank lines")}, ${link("/sort-lines-alphabetically", "sort lines")} and ${link("/add-text-to-start-and-end-of-lines", "add text to each line")}. To check length limits afterwards, use the ${link("/word-and-character-counter", "word and character counter")}.</p>`,
    related: [
      { href: "/text-cleaner", label: "Text cleaner" },
      { href: "/remove-duplicate-lines", label: "Remove duplicate lines" },
      { href: "/text-tools", label: "All text tools" },
    ],
  };
}
