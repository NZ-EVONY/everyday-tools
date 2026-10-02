// Fancy text and name styler. All styling is in lib/fancy.js. Typed text is never stored, sent
// or put in the URL; only the ids of starred styles are kept, in localStorage (et-fancy-favourites).
import { STYLES, FRAMES, MAX_INPUT, clampInput, decorate, lengths, fits, frameNote, rowWarning, lenText, listText } from "../lib/fancy.js";

const { $, $$, toast } = window.ET;
const form = $("#fxForm");
const preset = JSON.parse(form.dataset.preset);
const KEY = "et-fancy-favourites";
const rows = new Map($$(".fx-row").map(li => [li.dataset.id, li]));
let current = [];

// Fill the frame list from its <template> when the browser is idle, or as soon as someone reaches for it.
const frameSel = $("#fxFrame");
let framesFilled = false;
function fillFrames() {
  if (framesFilled) return;
  framesFilled = true;
  const v = frameSel.value;
  frameSel.replaceChildren($("#fxFrameOpts").content.cloneNode(true));
  frameSel.value = v;
}
for (const ev of ["focus", "pointerdown", "keydown"]) frameSel.addEventListener(ev, fillFrames, { once: true });
if ("requestIdleCallback" in window) requestIdleCallback(fillFrames, { timeout: 3000 }); else setTimeout(fillFrames, 1500);

function loadFavs() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); return new Set(Array.isArray(v) ? v.filter(id => rows.has(id)) : []); }
  catch (e) { return new Set(); }
}
let favs = loadFavs();
function saveFavs() {
  try { if (favs.size) localStorage.setItem(KEY, JSON.stringify([...favs])); else localStorage.removeItem(KEY); }
  catch (e) { toast("This browser isn't saving favourites, so they last until you leave the page"); }
}

function limitValue() {
  const raw = $("#fxLimit").value.trim();
  const ok = raw === "" || /^\d{1,3}$/.test(raw) && +raw > 0;
  $("#fxLimit").toggleAttribute("aria-invalid", !ok);
  $("#fxLimitHint").textContent = ok ? "" : "Enter a whole number, such as 16, or leave it empty.";
  return ok && raw ? +raw : 0;
}

function update() {
  const typed = clampInput($("#fxIn").value);
  const text = typed || preset.sample;
  const frame = $("#fxFrame").value, gap = $("#fxGap").checked;
  const group = $("#fxGroup").value, by = $("#fxBy").value, limit = limitValue();
  $("#fxCount").textContent = `${[...typed].length} / ${MAX_INPUT}`;
  $("#fxHint").hidden = !!typed;
  $("#fxFrameNote").textContent = frameNote(FRAMES.find(f => f.id === frame));
  current = [];
  for (const s of STYLES) {
    const li = rows.get(s.id);
    const out = decorate(text, s.id, frame, { gap });
    const l = lengths(out), warn = rowWarning(l);
    li.querySelector(".fx-out").textContent = out;
    li.querySelector(".fx-len").textContent = lenText(l);
    const w = li.querySelector(".fx-warn");
    w.textContent = warn;
    w.hidden = !warn;
    li.classList.toggle("is-sample", !typed);
    const fav = favs.has(s.id);
    li.querySelector(".fx-fav")?.setAttribute("aria-pressed", String(fav));
    const show = s.id === "plain" || ((group === "all" || group === s.group || (group === "favourites" && fav)) && fits(out, limit, by));
    li.hidden = !show;
    if (show) current.push({ name: s.name, text: out });
  }
  const shown = current.length;
  $("#fxShown").textContent = `${shown} shown`;
  const empty = $("#fxEmpty");
  empty.hidden = shown > 1;
  empty.textContent = group === "favourites" && !favs.size
    ? "You haven't starred any styles yet. Use the star on a row to keep it here."
    : "No other style fits. Raise the limit, count length as characters, or remove the frame.";
}

async function copy(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    if (btn) {
      const label = btn.querySelector("span");
      btn.classList.add("is-copied");
      if (label) label.textContent = "Copied";
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { btn.classList.remove("is-copied"); if (label) label.textContent = "Copy"; }, 2000);
    }
    $("#sr").textContent = "Copied to the clipboard.";
    return true;
  } catch (e) {
    toast("Couldn't copy: select the text and copy it yourself");
    return false;
  }
}

$("#fxList").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const li = btn.closest(".fx-row");
  if (btn.hasAttribute("data-copy")) copy(li.querySelector(".fx-out").textContent, btn);
  else if (btn.classList.contains("fx-fav")) {
    const id = li.dataset.id;
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    saveFavs();
    update();
    $("#sr").textContent = favs.has(id) ? "Added to favourites." : "Removed from favourites.";
  }
});
$("#fxAll").addEventListener("click", () => { update(); return copy(listText(current), null).then(ok => {
  if (!ok) return;
  const b = $("#fxAll");
  b.classList.add("is-copied");
  setTimeout(() => b.classList.remove("is-copied"), 2000);
  toast(`Copied ${current.length} styles`);
}); });
$("#fxFavClear").addEventListener("click", () => {
  favs = new Set();
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing was stored */ }
  update();
  $("#sr").textContent = "Favourites cleared.";
  toast("Favourites cleared");
});
$("#fxClear").addEventListener("click", () => { $("#fxIn").value = ""; update(); $("#fxIn").focus(); });
form.addEventListener("input", update);
form.addEventListener("change", update);
form.addEventListener("submit", e => e.preventDefault());
// The build already drew the rows for the preset. Redraw on load only if something differs:
// favourites, or form values the browser restored (for example after going back).
const restored = $("#fxIn").value || favs.size || $("#fxFrame").value !== preset.frame || $("#fxGroup").value !== preset.group
  || $("#fxLimit").value !== String(preset.limit) || $("#fxBy").value !== preset.by || $("#fxGap").checked !== preset.gap;
if (restored) update();
