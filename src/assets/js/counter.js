// Word and character counter. Counting is in lib/count.js; texts over 200,000 characters are counted
// in the Web Worker. Nothing typed is stored or put in the URL.
import { makeRunner, WORKER_THRESHOLD } from "../lib/runner.js";
import { formatDuration } from "../lib/count.js";

const { $, copyText } = window.ET;
const form = $("#countForm");
const runner = makeRunner(form.dataset.worker);
const n = x => x.toLocaleString("en-NZ");
let timer = null, last = null;
function schedule() { clearTimeout(timer); timer = setTimeout(update, $("#cnIn").value.length > WORKER_THRESHOLD ? 250 : 0); }
async function update() {
  const wpm = (id, d) => { const v = Math.trunc(Number($(id).value)); const ok = v >= 50 && v <= 1000; $(id).toggleAttribute("aria-invalid", !ok && $(id).value !== ""); return ok ? v : d; };
  const readingWpm = wpm("#cnRead", 200), speakingWpm = wpm("#cnSpeak", 130);
  const job = await runner.run("count", $("#cnIn").value, { readingWpm, speakingWpm });
  if (!job.latest()) return;
  const r = last = job.result;
  for (const [id, v] of [["#vWords", r.words], ["#vChars", r.chars], ["#vNoSp", r.noSpaces], ["#vSent", r.sentences], ["#vPara", r.paragraphs], ["#vLines", r.lines]]) $(id).textContent = n(v);
  $("#vRead").textContent = formatDuration(r.readingSeconds);
  $("#vSpeak").textContent = formatDuration(r.speakingSeconds);
  $("#vReadK").textContent = `at ${readingWpm} words a minute`;
  $("#vSpeakK").textContent = `at ${speakingWpm} words a minute`;
  $("#sr").textContent = `${n(r.words)} words, ${n(r.chars)} characters.`;
}
$("#cnCopy").addEventListener("click", () => last && copyText(`Words: ${n(last.words)}\nCharacters: ${n(last.chars)}\nCharacters without spaces: ${n(last.noSpaces)}\nSentences: ${n(last.sentences)}\nParagraphs: ${n(last.paragraphs)}\nLines: ${n(last.lines)}`));
$("#cnClear").addEventListener("click", () => { $("#cnIn").value = ""; schedule(); $("#cnIn").focus(); });
form.addEventListener("input", schedule);
form.addEventListener("submit", e => e.preventDefault());
update();
