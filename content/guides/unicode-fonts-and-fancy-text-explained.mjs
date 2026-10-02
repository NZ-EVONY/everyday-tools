// Guide: Unicode "fonts" and fancy text. Block ranges and character ages come from
// data/unicode-blocks.json (Blocks.txt and DerivedAge.txt); every example runs through the
// fancy text tool's own library at build time.
import { decorate, lengths, styleText } from "../../src/assets/lib/fancy.js";

const hex = ch => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;

export default function page(ctx) {
  const { link, esc, data, src } = ctx;
  const ub = data.unicodeBlocks;
  const block = n => ub.blocks.find(b => b.name === n);
  const math = block("Mathematical Alphanumeric Symbols");
  const shown = ["Mathematical Alphanumeric Symbols", "Letterlike Symbols", "Enclosed Alphanumerics", "Enclosed Alphanumeric Supplement", "Halfwidth and Fullwidth Forms", "Phonetic Extensions", "Combining Diacritical Marks", "Runic"].map(block);
  const boldA = styleText("A", "bold"), ds = styleText("CHQ", "double-struck");
  const word = "Tui", bold = decorate(word, "bold"), bl = lengths(bold);
  const strike = decorate(word, "strike"), sl = lengths(strike);
  const age = k => ub.ages[k].version;
  return {
    path: "/guides/unicode-fonts-and-fancy-text-explained",
    type: "guide", pillar: "guides", topic: "Text", status: "published", reviewed: "2026-10-02", published: "2026-10-02",
    title: "Unicode Fonts and Fancy Text Explained",
    description: "Why fancy text isn't a font: where bold and script letters live in Unicode, why they count double, and what screen readers and search make of them.",
    crumbName: "Unicode fonts and fancy text explained",
    h1: "Unicode fonts and fancy text",
    h1Accent: "explained",
    sources: ["unicode-blocks", "unicode-data", "unicode-nameslist", "unicode-derived-age", "unicode-chart-math", "unicode-standard"],
    claims: [
      { text: `Mathematical Alphanumeric Symbols is ${math.first} to ${math.last}`, source: "unicode-blocks" },
      { text: `Added in Unicode ${age("U+1D400")}; DOUBLE-STRUCK CAPITAL C from ${age("U+2102")}; script small l added in ${age("U+1D4C1")}`, source: "unicode-derived-age" },
      { text: "Styled math letters carry a <font> compatibility decomposition to the plain letter", source: "unicode-data" },
      { text: "The block is for mathematical variables; general text should use ordinary letters with markup", source: "unicode-nameslist" },
    ],
    intro: `<p>Sites that offer “fonts” to copy and paste aren't handing out fonts at all. They swap each letter for a different character that happens to look bold, curly or boxed. This guide explains where those characters come from, why Unicode has them, why a styled name can count as twice its length, and what assistive software and search engines make of the result.</p>`,
    body: `
        <p class="lede">A real font changes how a letter is drawn. Fancy text changes which letter it is, and everything that reads text afterwards notices the difference.</p>

        <h2>Characters, not fonts</h2>
        <p>Unicode gives every character a number and a name. The capital A you type is ${hex("A")}, LATIN CAPITAL LETTER A. Make it bold in a word processor and it is still that character; only the drawing changes, and the bold vanishes when you paste into a box that ignores formatting. The bold-looking ${boldA} produced by a fancy text tool is a different character entirely, ${hex(boldA)}, MATHEMATICAL BOLD CAPITAL A. It survives a paste because the boldness lives in the character, not in the formatting. That is the whole trick, and the source of every snag that follows.</p>

        <h2>Where the bold and script letters come from</h2>
        <p>Most styled alphabets sit in one block, Mathematical Alphanumeric Symbols, ${math.first} to ${math.last}, added in Unicode ${age("U+1D400")}. Mathematicians use letter style to carry meaning: a bold v and an italic v can name different things in one formula, so the styles needed to survive in plain text. Unicode's own names list says the block is for mathematical variables where style matters, and that general text should use standard letters with markup (${src("unicode-nameslist")}).</p>
        <p>The alphabets have holes. A few styled letters, such as the double-struck ${esc(ds)}, were already encoded in Unicode ${age("U+2102")}, in the Letterlike Symbols block, so the newer block leaves reserved slots where they would otherwise go. A careful tool fills each slot with the older character; a careless one leaves a gap or an empty box. The script small l is a later oddity, added in Unicode ${age("U+1D4C1")}.</p>
        <table class="fit"><thead><tr><th scope="col">Block</th><th scope="col">Range</th><th scope="col">Used for</th></tr></thead><tbody>${shown.map(b => `<tr><td>${esc(b.name)}</td><td>${b.first} to ${b.last}</td><td>${{
          "Mathematical Alphanumeric Symbols": "bold, italic, script, gothic, double-struck, sans-serif, monospace",
          "Letterlike Symbols": "the letters missing from those alphabets",
          "Enclosed Alphanumerics": "circled letters and digits, parenthesised small letters",
          "Enclosed Alphanumeric Supplement": "squared, filled and parenthesised capitals",
          "Halfwidth and Fullwidth Forms": "wide letters",
          "Phonetic Extensions": "most small capitals and some superscripts",
          "Combining Diacritical Marks": "strikethrough, underline and slash",
          "Runic": "the rune-like style",
        }[b.name]}</td></tr>`).join("")}</tbody></table>
        <p>Ranges come from Blocks.txt in the Unicode Character Database, version ${ub.unicodeVersion} (${src("unicode-blocks")}).</p>
        <!--@slot after-intro-->
        <h2>Unicode remembers the plain letter</h2>
        <p>Each styled letter in the database carries a note tying it back to the plain one: ${hex(boldA)} is marked as a “font” variant of ${hex("A")} (${src("unicode-data")}). Software that applies compatibility normalisation, known as NFKC, folds the styled text back into ordinary letters, so a search or a filter built that way sees the plain name. Software that skips normalisation treats the two as unrelated, so a styled name won't match its plain spelling. You can't tell from outside which approach a given app takes.</p>

        <h2>Why styled names count double</h2>
        <p>Unicode is divided into planes of 65,536 code points. The first, the Basic Multilingual Plane, holds nearly every everyday letter. The mathematical letters live in the second. UTF-16, a common way of storing text inside programs, fits a first-plane character into one unit but needs two for anything beyond. So “${word}” is three units plain, while ${esc(bold)} is ${bl.codePoints} characters and ${bl.utf16} units. A length check written in JavaScript, and in many other languages, counts those units, which is how a name that looks short gets refused.</p>

        <h2>Marks, circles and lookalikes</h2>
        <p>Strikethrough and underline styles use combining marks, characters that draw over or under the one before. ${esc(strike)} looks like three letters but is ${sl.codePoints} characters, and marks are among the first things a name box strips or refuses. Circled, squared and wide letters are their own characters in the enclosed and full-width blocks. Upside-down, mirrored and rune-like styles borrow from other alphabets by shape alone, so a reader or translator meets Cyrillic, Greek or runic letters standing in for Latin ones. A name that mixes alphabets like this can look like an attempt to imitate someone else's, and may be refused for that reason.</p>

        <h2>What screen readers and search make of it</h2>
        <p>A screen reader may spell styled words letter by letter, read each character's full name, or skip them. Search may or may not normalise. Neither outcome can be fixed by the person writing the text, so styled characters belong in decoration, not in names people search for, links or anything that must be understood.</p>

        <h2>What this guide could not check</h2>
        <p>Character names, ranges and versions here were read from the Unicode Character Database files for version ${ub.unicodeVersion}; the code chart for the block (${src("unicode-chart-math")}) and the full text of ${src("unicode-standard")} are the places to read further. How each character looks depends on the fonts on a device, and that couldn't be checked on every phone, console and computer. To try the styles yourself, open the ${link("/fancy-text-generator", "fancy text and name styler")}.</p>`,
    related: [
      { href: "/fancy-text-generator", label: "Fancy text and name styler" },
      { href: "/name-styler-for-games", label: "Name styler for games" },
      { href: "/fancy-text-for-bios", label: "Fancy text for bios" },
      { href: "/guides/cleaning-messy-lists-of-text", label: "Guide: cleaning messy lists" },
    ],
  };
}
