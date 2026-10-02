// /text-tools hub
export default function page(ctx) {
  const { link } = ctx;
  return {
    path: "/text-tools",
    type: "hub",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Text Tools: Clean, Sort, Dedupe and Count Text",
    description: "Free text tools: remove duplicate or blank lines, sort lists, add text to every line, clean up pasted text, and count words and characters.",
    h1: "Text",
    h1Accent: "tools",
    intro: `<p>Tools for the small text jobs that eat time: tidying a list pasted from a spreadsheet, removing repeated email addresses, putting names in order, wrapping values in quotes for a database query, and checking a word count.</p>`,
    top: `<section class="hub-tools" aria-labelledby="hub-tools-h"><h2 class="sec-title" id="hub-tools-h">The tools</h2>${ctx.toolGrid("text-tools", ctx.isPublished)}</section>`,
    sources: [], claims: [],
    body: `
        <h2>One engine, several doors</h2>
        <p>The ${link("/text-cleaner", "text cleaner")} does everything in one pass: trims spaces, collapses double spaces, removes blank and duplicate lines, sorts, adds a prefix and suffix to every line, and splits or joins lines. The four single-job pages open the same cleaner with one job already switched on, and explain that job in detail: ${link("/remove-duplicate-lines", "remove duplicate lines")} (case, stray spaces, keeping the first or last copy), ${link("/remove-blank-lines", "remove blank lines")} (empty versus whitespace-only lines, line-ending quirks), ${link("/sort-lines-alphabetically", "sort lines alphabetically")} (natural number order, macrons and accents), and ${link("/add-text-to-start-and-end-of-lines", "add text to the start and end of lines")} (quotes for SQL and CSV, bullets, escaping pitfalls). Start with whichever matches your job; every option is still there underneath.</p>
        <p>The ${link("/word-and-character-counter", "word and character counter")} is separate. It counts words, characters with and without spaces, sentences, paragraphs and lines, and estimates reading and speaking time at speeds you can change.</p>

        <h2>Built for big pastes</h2>
        <p>Each tool accepts up to two million characters. Anything over 200,000 characters is processed in a background thread of your browser, so the page stays responsive. Results update as you change options, and the original text stays in the input box until you clear it or choose to use the result as the new input.</p>

        <h2>Private by design</h2>
        <p>Nothing you paste leaves your device. There's no upload, no account and no history. Option switches are kept in the page address after the # sign so a bookmark reopens a tool set up the same way, but your text, and any prefix, suffix or separator you type, never goes there. For printing a cleaned-up list with tick boxes, try the ${link("/printable-checklist", "printable checklist")}.</p>`,
  };
}
