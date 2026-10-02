// /fancy-text-for-bios landing: the fancy text tool with a display-name preset, focused on social
// bios and the accessibility trade-offs. Generic wording only: no app or company is named.
import { decorate, lengths, styleById } from "../../src/assets/lib/fancy.js";
import { fancyTool, fancyResults } from "../../src/templates/partials/fancy-ui.mjs";

export default function page(ctx) {
  const { link, icon, esc } = ctx;
  const preset = { sample: "Kōwhai Studio", frame: "blossom" };
  const ex = ["plain", "bold", "script", "small-caps", "sans-bold"].map(id => {
    const text = decorate(preset.sample, id);
    return { id, name: styleById(id).name, text, ...lengths(text) };
  });
  const bold = ex.find(e => e.id === "bold");
  const caps = ex.find(e => e.id === "small-caps");
  return {
    path: "/fancy-text-for-bios",
    type: "landing",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Fancy Text for Bios and Display Names, Used Carefully",
    description: "Style a display name or a line of your bio in bold, script or small caps, with lengths, warnings and the accessibility trade-offs explained.",
    crumbName: "Fancy text for bios",
    h1: "Fancy text for bios",
    h1Accent: "and display names",
    appName: "Fancy text for bios",
    script: "fancy",
    calcClass: "wide",
    noscript: "The styler needs JavaScript to restyle a bio line. The advice below on when styled text helps or hurts works without it.",
    chips: [`<span class="chip">${icon("user")}Accessibility notes included</span>`],
    sources: [], claims: [],
    intro: `<p>Dress up a display name or one line of a profile bio with bold, script, small caps or a flower frame, and see at once what each choice costs. Rows show how long the result is and warn where it uses characters some apps refuse. Styled letters look decorative, but they often read badly aloud, drop out of search and break on older phones, so this page also sets out when to keep words plain. Nothing you type is sent, saved or put in the page address.</p>`,
    tool: fancyTool(ctx, { preset }),
    results: fancyResults({ preset }),
    body: `
        <h2>What a screen reader hears</h2>
        <p>Styled letters are separate characters, not formatting, and assistive software treats them as such. Depending on the reader and its settings, a script name may be read out letter by letter, announced with each character's full Unicode name, or passed over in silence. Someone using voice control can't say the name aloud to select it. Frames add noise of their own, since each flower or star may be described as it comes. None of this shows on screen, which is why it's so easy to miss.</p>

        <h2>Worked example: a studio name with a macron</h2>
        <p>The tool opens with “${esc(preset.sample)}”, which shows a snag that catches many New Zealand names.</p>
        <table class="fit"><thead><tr><th scope="col">Style</th><th scope="col">Result</th><th scope="col">Characters</th><th scope="col">UTF-16 units</th></tr></thead><tbody>${ex.map(e => `<tr><td>${esc(e.name)}</td><td>${esc(e.text)}</td><td>${e.codePoints}</td><td>${e.utf16}</td></tr>`).join("")}</tbody></table>
        <p>The mathematical alphabets behind bold and script have no letters with macrons, so the ō stays plain in the middle of a styled word: ${esc(bold.text)}. Small caps manages a little better, ${esc(caps.text)}, but only because capitals stay as typed there. If a name carries macrons or accents, check every row, and consider styling a tagline instead of the name. Notice too that bold more than doubles the count, from ${ex[0].utf16} UTF-16 units to ${bold.utf16}, which matters wherever a display name has a limit.</p>
        <!--@slot after-explainer-1-->
        <h2>Keep these parts plain</h2>
        <ul>
          <li><strong>The name people search for.</strong> Your own name or a business name, spelled the way someone would type it.</li>
          <li><strong>Links and handles.</strong> Link text that a reader or a translation tool can't read is a dead end.</li>
          <li><strong>Contact details.</strong> An email address or phone number in styled characters can't be copied into a form.</li>
          <li><strong>Anything important.</strong> Opening hours, prices, warnings: words that must reach everyone.</li>
        </ul>
        <p>A fair compromise is a plain name with one styled flourish beside it, a short framed tagline, or a single bold word. That keeps the profile findable and lets a screen reader say the part that matters.</p>

        <h2>Display names and limits</h2>
        <p>Display-name fields usually have a length limit, and the counter shows both ways it might be measured. If the two figures on a row differ, the style uses characters from outside the Basic Multilingual Plane; assume the larger number. Before saving, paste the result into the field, then view your profile from another device if you can, because fonts differ and a character one phone draws may be a blank box on the next. Gamer tags have tighter limits still; the ${link("/name-styler-for-games", "name styler for games")} is set up for those, and the ${link("/fancy-text-generator", "fancy text and name styler")} lists how every style is built.</p>`,
    faq: [
      { q: "Will styled text make my profile harder to find?", a: "<p>It can. Search in many apps matches the letters people type, and a styled name is made of different characters. Keep a plain version of anything people search for.</p>" },
      { q: "Is there an accessible way to style a bio?", a: "<p>Use the formatting the app itself offers, if it has any, which keeps the letters real. Otherwise keep styled text to short decorative parts and put the meaning in plain words.</p>" },
    ],
    related: [
      { href: "/fancy-text-generator", label: "Fancy text and name styler" },
      { href: "/name-styler-for-games", label: "Name styler for games" },
      { href: "/guides/unicode-fonts-and-fancy-text-explained", label: "Guide: Unicode fonts explained" },
      { href: "/word-and-character-counter", label: "Word and character counter" },
    ],
  };
}
