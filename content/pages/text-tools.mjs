// /text-tools hub
export default function page(ctx) {
  const { link } = ctx;
  return {
    path: "/text-tools",
    type: "hub",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Text Tools: Clean, Sort, Count and Style Text",
    description: "Free text tools: remove duplicate or blank lines, sort lists, add text to lines, count words and characters, and style names in Unicode.",
    h1: "Text",
    h1Accent: "tools",
    intro: `<p>Tools for the small text jobs that eat time: tidying a list pasted from a spreadsheet, removing repeated email addresses, putting names in order, wrapping values in quotes for a database query, checking a word count, and giving a username some flair without going over its limit.</p>`,
    top: `<section class="hub-tools" aria-labelledby="hub-tools-h"><h2 class="sec-title" id="hub-tools-h">The tools</h2>${ctx.toolGrid("text-tools", ctx.isPublished)}</section>`,
    sources: [], claims: [],
    body: `
        <h2>One engine, several doors</h2>
        <p>The ${link("/text-cleaner", "text cleaner")} does everything in one pass: trims spaces, collapses double spaces, removes blank and duplicate lines, sorts, adds a prefix and suffix to every line, and splits or joins lines. The four single-job pages open the same cleaner with one job already switched on, and explain that job in detail: ${link("/remove-duplicate-lines", "remove duplicate lines")} (case, stray spaces, keeping the first or last copy), ${link("/remove-blank-lines", "remove blank lines")} (empty versus whitespace-only lines, line-ending quirks), ${link("/sort-lines-alphabetically", "sort lines alphabetically")} (natural number order, macrons and accents), and ${link("/add-text-to-start-and-end-of-lines", "add text to the start and end of lines")} (quotes for SQL and CSV, bullets, escaping pitfalls). Start with whichever matches your job; every option is still there underneath.</p>
        <p>The ${link("/word-and-character-counter", "word and character counter")} is separate. It counts words, characters with and without spaces, sentences, paragraphs and lines, and estimates reading and speaking time at speeds you can change.</p>

        <h2>Styled names that still fit</h2>
        <p>The ${link("/fancy-text-generator", "fancy text and name styler")} turns a name or short line into more than thirty Unicode styles, from bold and gothic to circled and upside-down, with frames such as stars, daggers and brackets. Because a styled letter can count as two in a name box, every row shows its length in characters and in UTF-16 units, and a filter hides the styles that won't fit. Two pages open it set up for a particular job: the ${link("/name-styler-for-games", "name styler for games")} starts with a length limit for gamer tags and guild names, and ${link("/fancy-text-for-bios", "fancy text for bios")} weighs looks against screen readers and search. ${link("/guides/unicode-fonts-and-fancy-text-explained", "Unicode fonts and fancy text explained")} covers where the characters come from.</p>

        <h2>Built for big pastes</h2>
        <p>Each tool accepts up to two million characters. Anything over 200,000 characters is processed in a background thread of your browser, so the page stays responsive. Results update as you change options, and the original text stays in the input box until you clear it or choose to use the result as the new input.</p>

        <h2>Private by design</h2>
        <p>Nothing you paste leaves your device. There's no upload, no account and no history. Option switches are kept in the page address after the # sign so a bookmark reopens a tool set up the same way, but your text, and any prefix, suffix or separator you type, never goes there. For printing a cleaned-up list with tick boxes, try the ${link("/printable-checklist", "printable checklist")}. The guide to ${link("/guides/cleaning-messy-lists-of-text", "cleaning messy lists of text")} explains why some duplicates survive and why numbers can sort as 1, 10, 2.</p>`,
  };
}
