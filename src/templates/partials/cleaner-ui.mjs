// The text cleaner's form and results, shared by /text-cleaner and its four landing pages.
// `preset` sets the starting options; `focus` lists the option groups opened first.
import { esc } from "./util.mjs";
import { icon } from "../icons.mjs";

const sel = (id, opts, value) => `<select class="in" id="${id}">${opts.map(([v, l]) => `<option value="${v}"${v === value ? " selected" : ""}>${l}</option>`).join("")}</select>`;
const chk = (id, label, on) => `<label class="check"><input type="checkbox" id="${id}"${on ? " checked" : ""}> ${label}</label>`;

export function cleanerTool(ctx, { preset = {}, focus = [], label = "Your text", placeholder = "Paste your text here, one item per line" } = {}) {
  const p = { trim: false, collapse: false, blanks: "keep", dedupe: false, dedupeCase: true, dedupeTrim: true, keep: "first", sort: "none", sortCase: false, prefix: "", suffix: "", affixBlank: false, split: "", join: "", eol: "lf", ...preset };
  const open = g => (focus.includes(g) ? " open" : "");
  return `<form id="cleanForm" autocomplete="off" novalidate data-worker="${ctx.assets["worker.js"]}" data-preset="${esc(JSON.stringify(p))}">
      <div class="panel-h"><h2>${esc(label)}</h2><span class="chip" id="inCount">0 lines</span></div>
      <label class="sr-only" for="ctIn">${esc(label)}</label>
      <textarea class="in ta" id="ctIn" rows="10" maxlength="2000000" spellcheck="false" placeholder="${esc(placeholder)}" aria-describedby="ctHint"></textarea>
      <p class="hint" id="ctHint" role="alert"></p>
      <details class="opt"${open("tidy")}><summary>Tidy spaces and blank lines</summary>
        ${chk("oTrim", "Trim spaces at the start and end of each line", p.trim)}
        ${chk("oCollapse", "Collapse repeated spaces and tabs into one space", p.collapse)}
        <div class="field"><label for="oBlanks">Blank lines</label>${sel("oBlanks", [["keep", "Keep them"], ["empty", "Remove empty lines"], ["whitespace", "Remove empty and whitespace-only lines"]], p.blanks)}</div>
      </details>
      <details class="opt"${open("dedupe")}><summary>Remove duplicates</summary>
        ${chk("oDedupe", "Remove duplicate lines", p.dedupe)}
        ${chk("oDedupeCase", "Match case (\"Apple\" and \"apple\" are different)", p.dedupeCase)}
        ${chk("oDedupeTrim", "Ignore spaces at the start and end when comparing", p.dedupeTrim)}
        <div class="field"><label for="oKeep">When a line repeats, keep</label>${sel("oKeep", [["first", "the first copy"], ["last", "the last copy"]], p.keep)}</div>
      </details>
      <details class="opt"${open("sort")}><summary>Sort</summary>
        <div class="field"><label for="oSort">Order</label>${sel("oSort", [["none", "Keep the original order"], ["az", "A to Z"], ["za", "Z to A"], ["natural", "Natural (2 before 10)"], ["natural-desc", "Natural, descending"], ["length", "Shortest first"], ["length-desc", "Longest first"], ["reverse", "Reverse the order"]], p.sort)}</div>
        ${chk("oSortCase", "Upper case before lower case when letters tie", p.sortCase)}
      </details>
      <details class="opt"${open("affix")}><summary>Add text to each line</summary>
        <div class="fields">
          <div class="field"><label for="oPrefix">At the start</label><input class="in" id="oPrefix" type="text" maxlength="100" value="${esc(p.prefix)}"></div>
          <div class="field"><label for="oSuffix">At the end</label><input class="in" id="oSuffix" type="text" maxlength="100" value="${esc(p.suffix)}"></div>
        </div>
        ${chk("oAffixBlank", "Add it to blank lines too", p.affixBlank)}
      </details>
      <details class="opt"${open("split")}><summary>Split, join and line endings</summary>
        <div class="fields">
          <div class="field"><label for="oSplit">Split lines at</label><input class="in" id="oSplit" type="text" maxlength="10" placeholder="e.g. , or \\t" value="${esc(p.split)}"></div>
          <div class="field"><label for="oJoin">Join all lines with</label><input class="in" id="oJoin" type="text" maxlength="10" placeholder="leave blank to keep lines" value="${esc(p.join)}"></div>
          <div class="field"><label for="oEol">Line endings</label>${sel("oEol", [["lf", "LF (Mac, Linux, web)"], ["crlf", "CRLF (Windows)"]], p.eol)}</div>
        </div>
      </details>
      <div class="actions no-print"><button type="button" class="btn btn-ghost btn-sm" id="ctReset">${icon("reset")}Clear</button><button type="button" class="btn btn-ghost btn-sm" id="ctSample">${icon("file")}Try an example</button></div>
    </form>`;
}

export function cleanerResults() {
  return `<div class="results">
        <div class="res key"><div class="k">Lines out<small id="rIn">0 lines in</small></div><div class="v" id="rOut">0</div></div>
        <div class="res"><div class="k">Removed<small id="rRemovedK">blank and duplicate lines</small></div><div class="v" id="rRemoved">0</div></div>
      </div>
      <label class="field-label" for="ctOut">Result</label>
      <textarea class="in ta" id="ctOut" rows="10" readonly spellcheck="false"></textarea>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="ctCopy">${icon("copy")}Copy result</button><button type="button" class="btn btn-ghost btn-sm" id="ctUse">${icon("sort")}Use result as input</button></div>
      <p class="rounding" id="ctWorker" hidden></p>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`;
}
