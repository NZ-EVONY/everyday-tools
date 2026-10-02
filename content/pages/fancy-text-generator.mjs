// /fancy-text-generator: the fancy text and name styler. Example figures are computed at build
// time with the tool's own library, so the page can't disagree with the tool.
import { STYLES, FRAMES, decorate, lengths } from "../../src/assets/lib/fancy.js";
import { fancyTool, fancyResults } from "../../src/templates/partials/fancy-ui.mjs";

export default function page(ctx) {
  const { link, icon, esc, data, src } = ctx;
  const ub = data.unicodeBlocks;
  const math = ub.blocks.find(b => b.name === "Mathematical Alphanumeric Symbols");
  const preset = { sample: "Night Owl" };
  const ex = ["plain", "bold", "double-struck", "small-caps", "circled", "strike"].map(id => {
    const text = decorate(preset.sample, id);
    return { id, name: STYLES.find(s => s.id === id).name, text, ...lengths(text) };
  });
  const by = id => ex.find(e => e.id === id);
  const fit16 = ex.filter(e => e.utf16 <= 16).length;
  const count = STYLES.length - 1;
  return {
    path: "/fancy-text-generator",
    type: "tool",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Fancy Text Generator and Name Styler: Unicode Styles",
    description: `Type a name and see it in ${count} Unicode styles with frames, lengths in characters and UTF-16 units, and warnings for characters apps often refuse.`,
    crumbName: "Fancy text and name styler",
    h1: "Fancy text",
    h1Accent: "and name styler",
    appName: "Fancy text and name styler",
    script: "fancy",
    calcClass: "wide",
    noscript: "The styler needs JavaScript to restyle your text and copy it. Everything below explains how each style is made, and works without it.",
    chips: [`<span class="chip">${icon("star")}${count} styles, ${FRAMES.length - 1} frames</span>`],
    sources: ["unicode-blocks", "unicode-nameslist", "unicode-derived-age", "unicode-data"],
    claims: [
      { text: `Mathematical Alphanumeric Symbols block is ${math.first} to ${math.last}`, source: "unicode-blocks" },
      { text: "Unicode's names list says the block is for mathematical variables; general text should use ordinary letters with markup", source: "unicode-nameslist" },
      { text: `The block was added in Unicode ${ub.ages["U+1D400"].version}; the letterlike gap letters date from Unicode ${ub.ages["U+2102"].version}`, source: "unicode-derived-age" },
    ],
    intro: `<p>Type a name or a short line and see it in ${count} Unicode styles at once: bold, script, gothic, double-struck, circled, upside-down, struck through and more. Pick a frame, star the styles you like and copy the one that suits. Every row gives its length two ways, because a box that allows sixteen characters may count one styled letter as two. Use it for usernames, gamer tags, guild names, display names and short bios. Nothing you type leaves your browser, and nothing goes in the page address.</p>`,
    tool: fancyTool(ctx, { preset }),
    results: fancyResults({ preset }),
    body: `
        <h2>Worked example: one name, six lengths</h2>
        <p>Take “${preset.sample}”: eight letters and a space.</p>
        <table class="fit"><thead><tr><th scope="col">Style</th><th scope="col">Result</th><th scope="col">Characters</th><th scope="col">UTF-16 units</th></tr></thead><tbody>${ex.map(e => `<tr><td>${esc(e.name)}</td><td>${esc(e.text)}</td><td>${e.codePoints}</td><td>${e.utf16}</td></tr>`).join("")}</tbody></table>
        <p>Plain, it is ${by("plain").codePoints} characters and ${by("plain").utf16} units. In bold it still looks like ${by("bold").codePoints}, but each bold letter sits outside the Basic Multilingual Plane and takes two UTF-16 units, ${by("bold").utf16} in all. Double-struck comes to ${by("double-struck").utf16}, one fewer, because its N is the older ℕ, which fits in one unit. Small caps and circled stay level with the plain text. Strikethrough looks the same length yet doubles the count to ${by("strike").codePoints}, since every letter carries an invisible mark. Against a sixteen-unit limit, ${fit16} of these ${ex.length} rows fit. That gap between what you see and what gets counted is the reason the length filter exists.</p>

        <h2>How the styles are made</h2>
        <p>None of these is a font. Each style swaps your letters for other characters that Unicode encodes separately, which is why they survive a paste into a plain text box. The serif, sans-serif, script, gothic, double-struck and monospace styles come from the Mathematical Alphanumeric Symbols block, ${math.first} to ${math.last}, added in Unicode ${ub.ages["U+1D400"].version}. The Unicode names list is blunt about its purpose: the block is meant for mathematical variables, and ordinary text should use ordinary letters with formatting (${src("unicode-nameslist")}).</p>
        <p>Some letters are missing from those alphabets. The double-struck C, H, N, P, Q, R and Z, a handful of script capitals and the italic h were already in Unicode ${ub.ages["U+2102"].version}, in Letterlike Symbols, so the later block left reserved gaps where they would have gone. The styler fills each gap with the older character, so words come out whole.</p>
        <!--@slot after-explainer-1-->
        <p>Circled, squared and bracketed letters come from the enclosed alphanumeric blocks. Small caps, superscript and subscript borrow phonetic and modifier letters, so a few letters have no form and stay as typed: there is no small capital X, and subscripts exist for only seventeen letters. Strikethrough, slashed, underline and the wavy line add a combining mark after every character. Upside-down, mirrored, Warband, Warlord and rune-like swap in lookalikes from other alphabets, chosen by shape rather than meaning. The rune-like style is decoration, not a translation.</p>

        <h2>Limits and gotchas</h2>
        <ul>
          <li><strong>Length is counted in more than one way.</strong> Some systems count UTF-16 units, some count characters, some count bytes. Set “Count length as” to match the box you're filling in, or keep to the stricter UTF-16 figure.</li>
          <li><strong>Combining marks are fragile.</strong> A box may strip them, refuse the whole name or draw the line in the wrong place.</li>
          <li><strong>Fonts have holes.</strong> A device without the character shows an empty box instead. Phones, consoles and older computers differ, so check on the screen where people will actually see it.</li>
          <li><strong>Search and filters see different letters.</strong> Someone typing your name in plain letters may not find the styled one, and lookalike letters can trip impersonation filters.</li>
          <li><strong>The input stops at 100 characters.</strong> Styles are for names and short lines; long passages turn unreadable fast.</li>
        </ul>

        <h2>When to leave text plain</h2>
        <p>Screen readers handle these characters badly. Depending on the software, a bold name may be spelled out letter by letter, announced with each character's mathematical name, or skipped. So keep plain text wherever accessibility or being found matters: a business or legal name, contact details, the words of a link in a bio, anything someone needs to search for or retype. A styled accent beside a plain name is a fair compromise, and the Plain text row stays at the top so the original is always one tap away. The ${link("/fancy-text-for-bios", "guide to styled bios")} goes further into those trade-offs, the ${link("/name-styler-for-games", "name styler for games")} deals with tight name limits, and ${link("/guides/unicode-fonts-and-fancy-text-explained", "Unicode fonts and fancy text explained")} covers the characters themselves.</p>`,
    faq: [
      { q: "Is this a font I can install?", a: "<p>No. The results are ordinary Unicode characters, so they paste anywhere text goes, but how they look depends on the fonts on the device showing them.</p>" },
      { q: "Why was a name that fits here still refused?", a: "<p>The box may count length differently, accept only certain characters, or reject combining marks. Try the UTF-16 count, a row without a warning line, or plain text.</p>" },
      { q: "Do favourites keep a copy of my text?", a: "<p>No. Only the names of the styles you star are kept, in this browser's local storage, and “Clear favourites” deletes them.</p>" },
    ],
    related: [
      { href: "/name-styler-for-games", label: "Name styler for games" },
      { href: "/fancy-text-for-bios", label: "Fancy text for bios" },
      { href: "/guides/unicode-fonts-and-fancy-text-explained", label: "Guide: Unicode fonts explained" },
      { href: "/word-and-character-counter", label: "Word and character counter" },
      { href: "/text-tools", label: "All text tools" },
    ],
  };
}
