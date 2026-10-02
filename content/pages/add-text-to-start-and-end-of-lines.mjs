// /add-text-to-start-and-end-of-lines landing.
import { cleanText } from "../../src/assets/lib/textclean.js";
import { cleanerTool, cleanerResults } from "../../src/templates/partials/cleaner-ui.mjs";

const show = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");

export default function page(ctx) {
  const { link, icon } = ctx;
  const ids = "1042\n1077\n1090";
  const sql = cleanText(ids, { prefix: "'", suffix: "'", join: ", " }).output;
  const bullets = cleanText("Milk\nBread\n\nEggs", { prefix: "• " }).output;
  const urls = cleanText("about\ncontact\nprivacy-policy", { prefix: "https://example.nz/" }).output;
  const tricky = "O'Brien";
  return {
    path: "/add-text-to-start-and-end-of-lines",
    type: "landing",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Add Text to the Start and End of Every Line",
    description: "Add a prefix and suffix to every line at once: quotes and commas for SQL or CSV, bullets, full URLs, or any wrapper. Optionally join into one line.",
    crumbName: "Add text to start and end of lines",
    h1: "Add text to the start",
    h1Accent: "and end of every line",
    appName: "Add prefix and suffix to lines",
    script: "cleaner",
    chips: [`<span class="chip">${icon("brackets")}Prefix, suffix, join</span>`],
    sources: [], claims: [],
    intro: `<p>Wrap every line of a list in the same text: quotes and a comma for a database query, a bullet for a document, a web address for a list of page names, or HTML tags for a menu. Type what goes before and after, and every line gets it. Blank lines are left alone unless you say otherwise, and you can join the result into a single line with any separator.</p>`,
    tool: cleanerTool(ctx, { preset: { prefix: "'", suffix: "'," }, focus: ["affix", "split"], label: "Your lines", placeholder: "Paste the lines to wrap" }),
    results: cleanerResults(),
    body: `
        <h2>Three common jobs</h2>
        <h3>A list of values for a query or a CSV row</h3>
        <p>Say you have three order numbers on separate lines and need them inside an SQL <code>IN (…)</code> clause. Put a single quote at the start and end, and type ", " in "Join all lines with". The three lines become:</p>
        <pre class="formula">${show(sql)}</pre>
        <p>Paste that between the brackets. Leave "Join" empty and use a suffix of "'," instead if you want one value per line with trailing commas.</p>
        <h3>Bullets for a document or chat message</h3>
        <p>A prefix of "• " (bullet and space) turns a plain list into bullet points. Blank lines stay blank by default, so groups stay separated:</p>
        <pre class="formula">${show(bullets)}</pre>
        <h3>Full web addresses from page names</h3>
        <p>A prefix of a site's address turns page names into links you can check:</p>
        <pre class="formula">${show(urls)}</pre>
        <!--@slot after-explainer-1-->
        <h2>Escaping pitfalls</h2>
        <p>Wrapping is plain text substitution: the cleaner doesn't know about SQL, CSV or HTML rules. If a value already contains the character you're wrapping with, the result can break. A name like <code>${tricky}</code> wrapped in single quotes gives <code>'${tricky}'</code>, which ends the quote early in SQL; databases expect the inner quote doubled. In CSV, values containing commas or double quotes need double quotes around them, and inner double quotes doubled. In HTML, an ampersand or angle bracket inside a value should be escaped. For anything going into a live database, use your database tool's own parameters rather than pasted values.</p>

        <h2>More ideas</h2>
        <p>A prefix of "&lt;li&gt;" and a suffix of "&lt;/li&gt;" turns lines into HTML list items. A prefix of "#" turns words into hashtags. A suffix of ";" closes lines of code or configuration. A prefix of "- [ ] " makes a task list for apps that understand that format, and a prefix of "> " quotes each line in an email reply.</p>

        <h2>Other things to know</h2>
        <ul>
          <li><strong>Spaces count.</strong> If you want a space between a bullet and the text, include it in the prefix. Trailing spaces on your lines will sit inside the suffix, so turn on trimming if needed.</li>
          <li><strong>Blank lines.</strong> Tick "Add it to blank lines too" if every line, even empty ones, needs the wrapper.</li>
          <li><strong>Order of steps.</strong> Prefixes and suffixes are added after trimming, blank-line removal, duplicate removal and sorting, so sorting isn't affected by what you add.</li>
          <li><strong>Tabs as separators.</strong> Type <code>\\t</code> in "Join all lines with" to join with tabs, which pastes neatly into spreadsheet columns.</li>
        </ul>
        <p>Your text and the prefix and suffix you type stay in your browser and are never put in the page address. Pair this with ${link("/remove-duplicate-lines", "removing duplicate lines")} for clean lists of IDs, or use the full ${link("/text-cleaner", "text cleaner")}.</p>`,
    faq: [
      { q: "How do I make a comma-separated list on one line?", a: "<p>Type \", \" (comma and space) in \"Join all lines with\". Add quotes as a prefix and suffix if each value needs them.</p>" },
      { q: "Does the tool escape quotes inside my values?", a: "<p>No. It adds exactly the text you type. Check values that contain quotes, commas or ampersands, and escape them for the format you're using.</p>" },
    ],
    related: [
      { href: "/text-cleaner", label: "Text cleaner (all options)" },
      { href: "/remove-duplicate-lines", label: "Remove duplicate lines" },
      { href: "/sort-lines-alphabetically", label: "Sort lines alphabetically" },
    ],
  };
}
