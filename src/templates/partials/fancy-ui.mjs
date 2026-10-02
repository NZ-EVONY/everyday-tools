// The fancy text tool's form and style rows, shared by /fancy-text-generator and its two landing
// pages. Rows are rendered at build time with the page's example text, so nothing moves when the
// script takes over; `preset` sets the starting example, frame, group and length limit.
// The full frame list waits in a <template> (inert, so the browser doesn't measure 45 symbol labels
// while the page loads); the script moves it into the select when idle or on first use.
import { esc } from "./util.mjs";
import { icon } from "../icons.mjs";
import { STYLES, GROUPS, FRAMES, FRAME_GROUPS, MAX_INPUT, decorate, lengths, fits, frameRisk, frameNote, rowWarning, lenText } from "../../assets/lib/fancy.js";

const opt = (v, label, sel) => `<option value="${esc(v)}"${v === sel ? " selected" : ""}>${esc(label)}</option>`;

export function frameLabel(f) {
  if (f.id === "none") return "No frame";
  const risk = frameRisk(f);
  return `${decorate("name", "plain", f.id)}${risk === 2 ? " (often rejected)" : ""}`;
}

export function fancyTool(ctx, { preset = {} } = {}) {
  const p = { sample: "Night Owl", frame: "none", group: "all", limit: "", by: "utf16", gap: true, ...preset };
  const frames = FRAME_GROUPS.map(g => `<optgroup label="${esc(g.label)}">${FRAMES.filter(f => f.group === g.id).map(f => opt(f.id, frameLabel(f), p.frame)).join("")}</optgroup>`).join("");
  const groups = [opt("all", "All styles", p.group), opt("favourites", "Favourites only", p.group), ...GROUPS.filter(g => g.id !== "plain").map(g => opt(g.id, g.label, p.group))].join("");
  return `<form id="fxForm" autocomplete="off" novalidate data-preset="${esc(JSON.stringify(p))}">
      <div class="panel-h"><h2>Your text</h2><span class="chip" id="fxCount">0 / ${MAX_INPUT}</span></div>
      <label class="sr-only" for="fxIn">Your text (up to ${MAX_INPUT} characters)</label>
      <input class="in fx-in" id="fxIn" type="text" maxlength="${MAX_INPUT}" spellcheck="false" placeholder="Type a name or short text" aria-describedby="fxHint">
      <p class="muted fx-hint" id="fxHint">Until you type, the rows show the example “${esc(p.sample)}”.</p>
      <div class="fields">
        <div class="field"><label for="fxFrame">Frame</label><select class="in" id="fxFrame">${opt("none", "No frame", p.frame)}${p.frame === "none" ? "" : opt(p.frame, frameLabel(FRAMES.find(f => f.id === p.frame)), p.frame)}</select><template id="fxFrameOpts">${opt("none", "No frame", p.frame)}${frames}</template></div>
        <div class="field"><label for="fxGroup">Show</label><select class="in" id="fxGroup">${groups}</select></div>
        <div class="field"><label for="fxLimit">Only styles that fit</label><input class="in" id="fxLimit" type="text" inputmode="numeric" maxlength="3" placeholder="No limit" value="${esc(String(p.limit))}" aria-describedby="fxLimitHint"></div>
        <div class="field"><label for="fxBy">Count length as</label><select class="in" id="fxBy">${opt("utf16", "UTF-16 units (stricter)", p.by)}${opt("codePoints", "Characters (code points)", p.by)}</select></div>
      </div>
      <p class="err" id="fxLimitHint" role="alert"></p>
      <label class="check"><input type="checkbox" id="fxGap"${p.gap ? " checked" : ""}> Put a space between the frame and the text</label>
      <p class="muted" id="fxFrameNote">${esc(frameNote(FRAMES.find(f => f.id === p.frame)))}</p>
      <div class="actions no-print">
        <button type="button" class="btn btn-ghost btn-sm" id="fxClear">${icon("reset")}Clear</button>
        <button type="button" class="btn btn-primary btn-sm" id="fxAll">${icon("copy")}Copy all as a list</button>
        <button type="button" class="btn btn-ghost btn-sm" id="fxFavClear">${icon("trash")}Clear favourites</button>
      </div>
      <p class="muted fx-fav-note">Favourites are the names of styles you star, kept in this browser's local storage under <code>et-fancy-favourites</code>. Your text is never stored. “Clear favourites” deletes that entry.</p>
    </form>`;
}

export function fancyResults({ preset = {} } = {}) {
  const p = { sample: "Night Owl", frame: "none", gap: true, group: "all", limit: "", by: "utf16", ...preset };
  let shown = 0;
  const rows = STYLES.map(s => {
    const out = decorate(p.sample, s.id, p.frame, { gap: p.gap });
    const l = lengths(out), warn = rowWarning(l);
    // the preset's filter is applied here too, so the script has nothing to change on load
    const show = s.id === "plain" || ((p.group === "all" || p.group === s.group) && fits(out, Number(p.limit) || 0, p.by));
    if (show) shown++;
    return `<li class="fx-row is-sample" data-id="${s.id}" data-group="${s.group}"${show ? "" : " hidden"}>
          <div class="fx-head"><h3 id="n-${s.id}">${esc(s.name)}</h3><span class="fx-len">${lenText(l)}</span></div>
          <p class="fx-out">${esc(out)}</p>
          <p class="fx-warn"${warn ? "" : " hidden"}>${esc(warn)}</p>
          <div class="fx-act"><button type="button" class="btn btn-ghost btn-sm" data-copy aria-label="Copy ${esc(s.name)}">${icon("copy")}<span>Copy</span></button>${s.id === "plain" ? "" : `<button type="button" class="btn btn-ghost btn-sm fx-fav" aria-pressed="false" aria-label="Favourite: ${esc(s.name)}">${icon("star")}</button>`}</div>
        </li>`;
  }).join("\n        ");
  return `<div class="fx-results">
      <div class="panel-h fx-results-h"><h2>Styles</h2><span class="chip" id="fxShown">${shown} shown</span></div>
      <p class="note">${icon("info")}<span>Paste a result into the box you're filling in before you rely on it: games, apps and sites each decide which characters they accept and how they count them. Screen readers may read styled letters one by one, as maths symbols, or skip them.</span></p>
      <p class="fx-empty" id="fxEmpty" role="status" hidden></p>
      <ul class="fx-list" id="fxList">
        ${rows}
      </ul>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>
    </div>`;
}
