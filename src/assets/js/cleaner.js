// Text cleaner pages. The engine (lib/textclean.js) runs here for normal input and in a Web Worker
// over 200,000 characters (lib/runner.js). Text, prefixes, suffixes and separators are never stored
// or put in the URL; only on/off options and choices go in the fragment.
import { makeRunner, WORKER_THRESHOLD } from "../lib/runner.js";
import { MAX_CHARS } from "../lib/textclean.js";

const { $, copyText } = window.ET;
const form = $("#cleanForm");
const preset = JSON.parse(form.dataset.preset);
const runner = makeRunner(form.dataset.worker);
const input = $("#ctIn"), output = $("#ctOut");
const CHECKS = { trim: "#oTrim", collapse: "#oCollapse", dedupe: "#oDedupe", dedupeCase: "#oDedupeCase", dedupeTrim: "#oDedupeTrim", sortCase: "#oSortCase", affixBlank: "#oAffixBlank" };
const SELECTS = { blanks: "#oBlanks", keep: "#oKeep", sort: "#oSort", eol: "#oEol" };
const SAMPLE = form.dataset.sample || "Kiwi\n  kiwi  \nTūī\n\nfantail\nKiwi\nkererū\n   \nfantail\nItem 10\nItem 2";

function options() {
  const o = {};
  for (const [k, id] of Object.entries(CHECKS)) o[k] = $(id).checked;
  for (const [k, id] of Object.entries(SELECTS)) o[k] = $(id).value;
  o.prefix = $("#oPrefix").value; o.suffix = $("#oSuffix").value; o.split = $("#oSplit").value;
  o.join = $("#oJoin").value === "" ? null : $("#oJoin").value;
  return o;
}
const lineCount = t => (t === "" ? 0 : t.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").length);

let timer = null;
function schedule() { clearTimeout(timer); timer = setTimeout(update, input.value.length > WORKER_THRESHOLD ? 250 : 0); }

async function update() {
  const text = input.value;
  $("#ctHint").textContent = text.length >= MAX_CHARS ? `Only the first ${MAX_CHARS.toLocaleString("en-NZ")} characters are used.` : "";
  if (text.length <= WORKER_THRESHOLD) $("#inCount").textContent = `${lineCount(text).toLocaleString("en-NZ")} lines`;
  const o = options();
  const job = await runner.run("clean", text, o);
  if (!job.latest()) return;
  const r = job.result;
  output.value = r.output;
  $("#inCount").textContent = `${r.linesIn.toLocaleString("en-NZ")} lines`;
  $("#rOut").textContent = r.lines.toLocaleString("en-NZ");
  $("#rIn").textContent = `${r.linesIn.toLocaleString("en-NZ")} lines in`;
  $("#rRemoved").textContent = (r.blanksRemoved + r.duplicatesRemoved).toLocaleString("en-NZ");
  $("#rRemovedK").textContent = `${r.blanksRemoved.toLocaleString("en-NZ")} blank, ${r.duplicatesRemoved.toLocaleString("en-NZ")} duplicate`;
  $("#ctWorker").hidden = !runner.usedWorker;
  $("#ctWorker").textContent = runner.usedWorker ? "Large text: processed in the background so the page stays responsive." : "";
  $("#sr").textContent = text ? `${r.lines} lines out of ${r.linesIn}.` : "";
  const frag = {};
  for (const k of Object.keys(CHECKS)) if (o[k] !== preset[k]) frag[k] = o[k] ? "1" : "0";
  for (const k of Object.keys(SELECTS)) if (o[k] !== preset[k]) frag[k] = o[k];
  const f = new URLSearchParams(frag).toString();
  history.replaceState(null, "", f ? `#${f}` : location.pathname);
}

const p = new URLSearchParams(location.hash.slice(1));
for (const [k, id] of Object.entries(CHECKS)) if (p.has(k)) $(id).checked = p.get(k) === "1";
for (const [k, id] of Object.entries(SELECTS)) if (p.has(k) && [...$(id).options].some(x => x.value === p.get(k))) $(id).value = p.get(k);
$("#ctCopy").addEventListener("click", () => copyText(output.value));
$("#ctUse").addEventListener("click", () => { input.value = output.value; schedule(); input.focus(); });
$("#ctReset").addEventListener("click", () => { input.value = ""; schedule(); input.focus(); });
$("#ctSample").addEventListener("click", () => { input.value = SAMPLE; schedule(); });
form.addEventListener("input", schedule);
form.addEventListener("submit", e => e.preventDefault());
update();
