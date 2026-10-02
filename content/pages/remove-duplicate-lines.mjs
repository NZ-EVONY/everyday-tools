// /remove-duplicate-lines landing.
import { cleanText } from "../../src/assets/lib/textclean.js";
import { cleanerTool, cleanerResults } from "../../src/templates/partials/cleaner-ui.mjs";

const show = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");

export default function page(ctx) {
  const { link, icon } = ctx;
  const emails = "jo@example.nz\nsam@example.nz\nJo@Example.nz\nlee@example.nz\nsam@example.nz \njo@example.nz";
  const strict = cleanText(emails, { dedupe: true, dedupeCase: true, dedupeTrim: false });
  const loose = cleanText(emails, { dedupe: true, dedupeCase: false, dedupeTrim: true });
  const versions = "v1 draft\nfinal copy\nv1 draft\nnotes\nfinal copy";
  const first = cleanText(versions, { dedupe: true }).output, last = cleanText(versions, { dedupe: true, keep: "last" }).output;
  return {
    path: "/remove-duplicate-lines",
    type: "landing",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Remove Duplicate Lines: Keep Unique Lines in Order",
    description: "Remove duplicate lines from a list and keep the original order. Choose whether case and stray spaces count, and keep the first or last copy.",
    crumbName: "Remove duplicate lines",
    h1: "Remove duplicate lines",
    h1Accent: "and keep the order",
    appName: "Remove duplicate lines",
    script: "cleaner",
    chips: [`<span class="chip">${icon("copy")}Order preserved</span>`],
    sources: [], claims: [],
    intro: `<p>Paste a list and every repeated line disappears, leaving one copy of each in the order they first appeared. Decide whether "Apple" and "apple" count as the same, whether a trailing space makes a line different, and whether to keep the first or the last copy when something repeats. It handles mailing lists, product codes, log lines and survey answers, from a handful of lines to hundreds of thousands.</p>`,
    tool: cleanerTool(ctx, { preset: { dedupe: true }, focus: ["dedupe"], label: "Your list", placeholder: "Paste a list with repeated lines" }),
    results: cleanerResults(),
    body: `
        <h2>What counts as a duplicate?</h2>
        <p>Two lines are duplicates when they match character for character. That sounds simple, but real lists are full of near-matches: an email typed with capitals, a code copied with a space on the end, a name with an accent typed two different ways. Two switches decide how strict the match is.</p>
        <ul>
          <li><strong>Match case.</strong> On means "Jo@Example.nz" and "jo@example.nz" are different lines. Off treats them as the same. For email addresses and most names, off is usually what you want; for codes where case matters, leave it on.</li>
          <li><strong>Ignore spaces at the start and end.</strong> On means a line with a stray trailing space still matches its clean twin. The space itself is kept in whichever copy survives, unless you also trim.</li>
        </ul>
        <p>Accented letters are compared in a standard form, so "é" typed as one character and "é" built from "e" plus an accent mark are treated as the same.</p>

        <h2>Worked example: a mailing list</h2>
        <p>Here are six addresses collected from two sign-up sheets:</p>
        <pre class="formula">${show(emails)}</pre>
        <p>With "match case" on and spaces counted, only exact repeats go, leaving ${strict.lines} lines. With "match case" off and surrounding spaces ignored, the capitalised and space-padded versions are recognised as repeats too, leaving ${loose.lines}:</p>
        <pre class="formula">${show(loose.output)}</pre>

        <h2>Keep the first copy or the last?</h2>
        <p>Order is always preserved; the question is which copy stays. Keeping the first suits lists built over time, where the earliest entry is the original. Keeping the last suits logs and exports where later lines are more up to date. With the lines "v1 draft, final copy, v1 draft, notes, final copy", keeping the first gives <code>${first.replace(/\n/g, ", ")}</code>, while keeping the last gives <code>${last.replace(/\n/g, ", ")}</code>.</p>
        <!--@slot after-explainer-1-->
        <h2>Mistakes that leave duplicates behind</h2>
        <ul>
          <li><strong>Invisible characters.</strong> Text copied from web pages can contain non-breaking spaces or tabs. Turn on trimming and collapsing (under "Tidy spaces") so they don't make a line look unique.</li>
          <li><strong>Sorting first, by hand.</strong> You don't need to sort before removing duplicates; the cleaner finds repeats anywhere in the list. Sort afterwards if you want alphabetical order.</li>
          <li><strong>Different spellings.</strong> "St Heliers" and "Saint Heliers" aren't duplicates to a computer. The cleaner removes exact matches only.</li>
        </ul>

        <h2>Big lists</h2>
        <p>Lists of hundreds of thousands of lines are fine; anything over 200,000 characters is processed in the background so the page doesn't freeze. The tool counts how many duplicate lines it removed. Your list stays in your browser and is never uploaded. For more cleaning options in one pass, open the full ${link("/text-cleaner", "text cleaner")}; to put the unique lines in order, see ${link("/sort-lines-alphabetically", "sorting lines alphabetically")}.</p>`,
    faq: [
      { q: "Does removing duplicates change the order?", a: "<p>No. The remaining lines stay in the order they first appeared (or last appeared, if you choose to keep the last copy). Sorting only happens if you turn it on.</p>" },
      { q: "Are blank lines treated as duplicates?", a: "<p>Yes: the second and later blank lines count as repeats of the first. To remove every blank line, use the blank-line option as well.</p>" },
    ],
    related: [
      { href: "/text-cleaner", label: "Text cleaner (all options)" },
      { href: "/remove-blank-lines", label: "Remove blank lines" },
      { href: "/sort-lines-alphabetically", label: "Sort lines alphabetically" },
      { href: "/guides/cleaning-messy-lists-of-text", label: "Guide: cleaning messy lists" },
    ],
  };
}
