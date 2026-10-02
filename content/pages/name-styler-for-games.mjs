// /name-styler-for-games landing: the fancy text tool with a guild-name preset, focused on name
// boxes and their length limits. Generic wording only: no game or company is named.
import { STYLES, decorate, lengths } from "../../src/assets/lib/fancy.js";
import { fancyTool, fancyResults } from "../../src/templates/partials/fancy-ui.mjs";

export default function page(ctx) {
  const { link, icon, esc } = ctx;
  const preset = { sample: "Iron Kea", frame: "double-dagger", limit: 12, by: "utf16" };
  const rows = STYLES.map(s => { const text = decorate(preset.sample, s.id, preset.frame); return { id: s.id, name: s.name, text, ...lengths(text) }; });
  const by = id => rows.find(r => r.id === id);
  const fitU = rows.filter(r => r.utf16 <= preset.limit), fitC = rows.filter(r => r.codePoints <= preset.limit);
  const shown = ["plain", "bold", "small-caps", "circled", "warband", "strike"].map(by);
  const tag = decorate("WOLF", "bold"), tagL = lengths(tag);
  return {
    path: "/name-styler-for-games",
    type: "landing",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Name Styler for Games: Gamer Tags That Fit the Limit",
    description: "Style a gamer tag, character or guild name and show only the styles that fit the name box, counted in characters or UTF-16 units.",
    crumbName: "Name styler for games",
    h1: "Name styler",
    h1Accent: "for games",
    appName: "Name styler for games",
    script: "fancy",
    calcClass: "wide",
    noscript: "The styler needs JavaScript to restyle a name and check its length. The explanation below works without it.",
    chips: [`<span class="chip">${icon("flag")}Length filter set to ${preset.limit}</span>`],
    sources: [], claims: [],
    intro: `<p>Style a gamer tag, character name, clan tag or guild name, then check it against the name box's limit before you commit to it. Set the limit, choose how it counts, and the list shrinks to the styles that fit. Each row shows the length in characters and in UTF-16 units, flags characters that name boxes commonly refuse, and copies in one tap. Daggers, crossed swords, brackets and other frames can go around any style. Nothing you type is sent or saved.</p>`,
    tool: fancyTool(ctx, { preset }),
    results: fancyResults({ preset }),
    body: `
        <h2>The character-limit problem</h2>
        <p>A name box that promises sixteen characters seldom says what it means by a character. Many systems measure text in UTF-16 units, the figure a JavaScript string reports as its length, and there a bold or script letter is two units because it sits outside Unicode's Basic Multilingual Plane. Other boxes count bytes, where the same letter takes four. A name that looks ten letters long can therefore measure twenty, and the box either refuses it or chops it off mid-word. You rarely find out until you press save, sometimes after spending a name change.</p>

        <h2>Worked example: a guild name at ${preset.limit}</h2>
        <p>The tool above opens with “${preset.sample}” inside a double-dagger frame and the filter at ${preset.limit} UTF-16 units. The frame adds four: a dagger and a space on each side.</p>
        <table class="fit"><thead><tr><th scope="col">Style</th><th scope="col">Result</th><th scope="col">Characters</th><th scope="col">UTF-16 units</th></tr></thead><tbody>${shown.map(r => `<tr><td>${esc(r.name)}</td><td>${esc(r.text)}</td><td>${r.codePoints}</td><td>${r.utf16}</td></tr>`).join("")}</tbody></table>
        <p>Counted in UTF-16 units, ${fitU.length} of the ${rows.length} rows fit. Counted as characters, ${fitC.length} do. Bold reaches ${by("bold").utf16} units with the same ${by("bold").codePoints} visible characters, so a box that counts units turns it away. Small caps, circled and Warband letters all live in the Basic Multilingual Plane and stay at ${by("small-caps").utf16}. Strikethrough is the trap in the other direction: it looks identical in length but carries a hidden mark after every letter, which pushes it to ${by("strike").codePoints} characters.</p>
        <!--@slot after-explainer-1-->
        <h2>Reading the two counts</h2>
        <p>When a row's two figures match, double counting can't catch it out. When they differ, plan for the larger number unless the game's own counter tells you otherwise. Short fields leave the least room: a four-letter clan tag in bold, ${esc(tag)}, is ${tagL.codePoints} characters but ${tagL.utf16} units. The warning line on a row marks combining marks too, which some boxes strip without a word, leaving a plain name you never chose.</p>

        <h2>Before you commit a name</h2>
        <ul>
          <li><strong>Paste it into the name box first.</strong> Look at it where other players will see it; a missing glyph shows as an empty box, and only that screen can tell you.</li>
          <li><strong>Keep the plain spelling handy.</strong> Friends searching for you will type ordinary letters, and a styled name may not come up.</li>
          <li><strong>Expect filters.</strong> Lookalike letters can be read as an attempt to copy another player's name, and some boxes allow only letters, numbers and a few symbols.</li>
          <li><strong>Pick frames with care.</strong> Frames marked “often rejected” use CJK brackets and similar characters outside the common set. Plain brackets, daggers and lines are the safest bets.</li>
        </ul>
        <p>The full ${link("/fancy-text-generator", "fancy text and name styler")} explains how every style is built, and ${link("/guides/unicode-fonts-and-fancy-text-explained", "the guide to Unicode fonts")} shows why some letters count double. To count an ordinary sentence, the ${link("/word-and-character-counter", "word and character counter")} handles emoji and macrons.</p>`,
    faq: [
      { q: "Which styles are least likely to be refused?", a: "<p>Rows without a warning line, whose character and UTF-16 counts match. They avoid the two commonest causes of trouble, but a box that accepts only plain letters will still refuse them.</p>" },
      { q: "Will a styled name work in my game?", a: "<p>No tool can promise that. Each game decides which characters it accepts and how it counts them; pasting into its own name box is the only reliable test.</p>" },
    ],
    related: [
      { href: "/fancy-text-generator", label: "Fancy text and name styler" },
      { href: "/fancy-text-for-bios", label: "Fancy text for bios" },
      { href: "/guides/unicode-fonts-and-fancy-text-explained", label: "Guide: Unicode fonts explained" },
      { href: "/text-tools", label: "All text tools" },
    ],
  };
}
