// /word-and-character-counter
import { countText, formatDuration } from "../../src/assets/lib/count.js";

export default function page(ctx) {
  const { link, icon, esc } = ctx;
  const sample = "Kia ora! Don't forget: the 2026-27 tax year started on 1 April.\n\nSee you at Ōtautahi's café 🙂";
  const c = countText(sample);
  const essay = countText("word ".repeat(1500));
  return {
    path: "/word-and-character-counter",
    type: "tool",
    pillar: "text-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Word and Character Counter: Words, Characters, Time",
    description: "Count words, characters with and without spaces, sentences, paragraphs and lines, with reading and speaking time. Emoji and macrons count correctly.",
    crumbName: "Word and character counter",
    h1: "Word and character",
    h1Accent: "counter",
    appName: "Word and character counter",
    script: "counter",
    chips: [`<span class="chip">${icon("type")}Emoji and macrons counted once</span>`],
    sources: [], claims: [],
    intro: `<p>Paste or type text to count its words, characters (with and without spaces), sentences, paragraphs and lines, and to estimate how long it takes to read or say out loud. Counts update as you type. It's useful for essays with a word limit, social posts and text messages with character limits, speeches, and forms that cap how much you can write. Emoji, macrons and accents are counted the way people see them.</p>`,
    tool: `<form id="countForm" autocomplete="off" novalidate data-worker="${ctx.assets["worker.js"]}">
      <div class="panel-h"><h2>Your text</h2></div>
      <label class="sr-only" for="cnIn">Your text</label>
      <textarea class="in ta" id="cnIn" rows="12" maxlength="2000000" placeholder="Start typing or paste your text"></textarea>
      <div class="fields">
        <div class="field"><label for="cnRead">Reading speed (words a minute)</label><input class="in" id="cnRead" type="text" inputmode="numeric" maxlength="4" value="200"></div>
        <div class="field"><label for="cnSpeak">Speaking speed (words a minute)</label><input class="in" id="cnSpeak" type="text" inputmode="numeric" maxlength="4" value="130"></div>
      </div>
      <div class="actions no-print"><button type="button" class="btn btn-ghost btn-sm" id="cnClear">${icon("reset")}Clear</button></div>
    </form>`,
    results: `<div class="results">
        <div class="res key"><div class="k">Words</div><div class="v" id="vWords">0</div></div>
      </div>
      <div class="counts">
        <div class="res"><div class="k">Characters</div><div class="v" id="vChars">0</div></div>
        <div class="res"><div class="k">Without spaces</div><div class="v" id="vNoSp">0</div></div>
        <div class="res"><div class="k">Sentences</div><div class="v" id="vSent">0</div></div>
        <div class="res"><div class="k">Paragraphs</div><div class="v" id="vPara">0</div></div>
        <div class="res"><div class="k">Lines</div><div class="v" id="vLines">0</div></div>
        <div class="res"><div class="k">Reading time<small id="vReadK"></small></div><div class="v" id="vRead">0 sec</div></div>
        <div class="res"><div class="k">Speaking time<small id="vSpeakK"></small></div><div class="v" id="vSpeak">0 sec</div></div>
      </div>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="cnCopy">${icon("copy")}Copy counts</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    body: `
        <h2>What counts as a word</h2>
        <p>A word here is a run of letters or numbers. An apostrophe, hyphen or full stop inside a word keeps it together, so "don't", "well-known" and "2026-27" each count as one word, while punctuation around words is ignored. Macrons and accents are part of the letter, so "Ōtautahi" is one word, not two. This is close to how word processors count, though every program has its own edge cases with things like web addresses, so a count may differ by a few words from another tool.</p>

        <h2>What counts as a character</h2>
        <p>Computers store some characters as several pieces: an emoji with a skin tone, a flag, or a letter with a separate accent mark. Counting the pieces would make "🙂" or "é" count as two or more. This counter counts what you see on screen, one per visible character, using your browser's text segmentation. If your browser can't do that, it falls back to counting Unicode code points, which still counts most letters correctly. Note that some sites with character limits count differently, so leave a little room.</p>

        <h2>Worked example</h2>
        <p>For this short message:</p>
        <pre class="formula">${esc(sample).replace(/\n/g, "<br>")}</pre>
        <p>the counter finds ${c.words} words, ${c.chars} characters (${c.noSpaces} without spaces), ${c.sentences} sentences and ${c.paragraphs} paragraphs. The smiling face counts as one character, and "Don't", "2026-27" and "Ōtautahi's" are one word each.</p>
        <!--@slot after-explainer-1-->
        <h2>Reading and speaking time</h2>
        <p>The times are estimates: word count divided by a speed in words per minute. The starting values of 200 words a minute for reading and 130 for speaking are rough working assumptions, not measured averages. People vary a lot, and technical or unfamiliar text slows everyone down. Change either number to match yourself; time a minute of your normal reading or speaking and count the words. At the starting values, a 1,500-word essay takes about ${formatDuration(essay.readingSeconds)} to read and ${formatDuration(essay.speakingSeconds)} to say.</p>

        <h2>Common mistakes</h2>
        <ul>
          <li><strong>Counting the title and references.</strong> Many word limits exclude them. Paste only the part that counts.</li>
          <li><strong>Confusing characters with bytes.</strong> Some systems limit bytes, where a macron or emoji takes more than one. This tool counts characters.</li>
          <li><strong>Assuming lines are sentences.</strong> A line ends where you pressed Enter; a sentence ends with a full stop, question mark or exclamation mark.</li>
        </ul>
        <p>Your text stays in your browser and isn't saved or sent anywhere. Very long texts (over 200,000 characters) are counted in the background so typing stays smooth. To tidy text before counting, use the ${link("/text-cleaner", "text cleaner")}.</p>`,
    faq: [
      { q: "Does the counter include spaces?", a: "<p>Both figures are shown: characters including spaces and line breaks, and characters without any whitespace.</p>" },
      { q: "Why does another site give a different word count?", a: "<p>Tools disagree on things like hyphenated words, numbers, web addresses and symbols. This counter treats a hyphenated word as one word and ignores punctuation standing on its own.</p>" },
    ],
    related: [
      { href: "/text-cleaner", label: "Text cleaner" },
      { href: "/remove-blank-lines", label: "Remove blank lines" },
      { href: "/text-tools", label: "All text tools" },
    ],
  };
}
