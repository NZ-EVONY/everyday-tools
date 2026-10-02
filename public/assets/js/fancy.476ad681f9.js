(function () {
"use strict";
// fancy.js
// Fancy text: Unicode style mappings, decoration frames and length counters. Pure functions,
// no DOM. Every mapping is checked in tests/unit/fancy.test.mjs against the character names in
// tests/fixtures/unicode-names.json (from the Unicode Character Database) and, where Unicode
// defines one, against the compatibility decomposition (NFKC) back to the plain letter.

const MAX_INPUT = 100;

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const cp = n => String.fromCodePoint(n);

// Letters missing from a Mathematical Alphanumeric Symbols alphabet were encoded earlier in
// Letterlike Symbols (U+2100-214F); the matching slots in U+1D400-1D7FF are reserved.
const MATH_GAPS = {
  italic: { h: 0x210E },
  script: { B: 0x212C, E: 0x2130, F: 0x2131, H: 0x210B, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211B, e: 0x212F, g: 0x210A, o: 0x2134 },
  fraktur: { C: 0x212D, H: 0x210C, I: 0x2111, R: 0x211C, Z: 0x2128 },
  doubleStruck: { C: 0x2102, H: 0x210D, N: 0x2115, P: 0x2119, Q: 0x211A, R: 0x211D, Z: 0x2124 },
};

// A-Z starts at `upper`, a-z at `lower`, 0-9 at `digit` (null = no digits in this alphabet).
function mathMap(upper, lower, digit, gaps = {}) {
  const m = {};
  [...UPPER].forEach((c, i) => { m[c] = cp(gaps[c] ?? upper + i); });
  [...LOWER].forEach((c, i) => { m[c] = cp(gaps[c] ?? lower + i); });
  if (digit) [...DIGITS].forEach((c, i) => { m[c] = cp(digit + i); });
  return m;
}
// Map built from two parallel strings of the same length in code points.
function zip(from, to) {
  const a = [...from], b = [...to];
  if (a.length !== b.length) throw new Error(`mapping length mismatch: ${a.length} vs ${b.length}`);
  return Object.fromEntries(a.map((c, i) => [c, b[i]]));
}
const range = (start, chars) => Object.fromEntries([...chars].map((c, i) => [c, cp(start + i)]));

const smallCaps = zip(LOWER, "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘꞯʀꜱᴛᴜᴠᴡxʏᴢ"); // no small capital X exists; x stays x
const superSmall = zip(LOWER, "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖ𐞥ʳˢᵗᵘᵛʷˣʸᶻ");
// Capitals without a modifier capital (C F Q S X Y Z) use the small superscript instead.
const superCaps = zip(UPPER, "ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾ𐞥ᴿˢᵀᵁⱽᵂˣʸᶻ");
const superDigits = zip(DIGITS, "⁰¹²³⁴⁵⁶⁷⁸⁹");
// Unicode has subscripts for 17 Latin letters only; the rest stay as typed.
const subSmall = zip("aehijklmnoprstuvx", "ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ");
const subCaps = Object.fromEntries(Object.entries(subSmall).map(([k, v]) => [k.toUpperCase(), v]));
const subDigits = range(0x2080, DIGITS);

const circledDigits = { 0: "⓪", ...range(0x2460, "123456789") };
const negCircledDigits = { 0: "⓿", ...range(0x2776, "123456789") };
const parenDigits = range(0x2474, "123456789"); // there is no parenthesised zero

const turned = {
  ...zip(LOWER, "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz"),
  ...zip(UPPER, "ⱯꓭƆꓷƎℲ⅁HIſꞰꞀWNOԀΌᴚS⊥∩ΛMX⅄Z"),
  ...zip(DIGITS, "0Ɩ↊↋ㄣϛ9ㄥ86"),
  ...zip(".,?!'\"()[]{}<>_&", "˙'¿¡,„)(][}{><‾⅋"),
};
const mirrored = {
  ...zip("abcdegpqrsz", "ɒdɔbɘϱqpɿꙅƹ"),
  ...zip("BCDEFGJKLNPQRSZ", "ᙠƆᗡƎꟻᎮႱꓘ⅃ИꟼϘЯꙄƸ"),
  ...zip("3?()[]{}<>", "Ɛ⸮)(][}{><"),
};

const warband = {
  ...zip(UPPER, "ȺɃȻĐɆꞘǤĦƗɈꝀŁⱮꞤØⱣꝖɌꞨŦɄꝞⱲӾɎƵ"),
  ...zip(LOWER, "ⱥƀȼđɇꞙǥħɨɉꝁłɱꞥøᵽꝗɍꞩŧʉꝟⱳӿɏƶ"),
};
const warlordUpper = zip(UPPER, "ΛßϾÐΣƑǤĦƗЈҜŁӍΠΘƤǪЯƧƬƱѴШЖҰƵ");
const warlord = { ...warlordUpper, ...Object.fromEntries(Object.entries(warlordUpper).map(([k, v]) => [k.toLowerCase(), v])) };
const runesUpper = zip(UPPER, "ᚨᛒᚲᛞᛖᚠᚷᚺᛁᛃᚴᛚᛗᚾᛟᛈᛩᚱᛋᛏᚢᚡᚹᛪᛦᛉ");
const runes = { ...runesUpper, ...Object.fromEntries(Object.entries(runesUpper).map(([k, v]) => [k.toLowerCase(), v])) };

const capsOnly = (start) => { const m = range(start, UPPER); for (const c of LOWER) m[c] = m[c.toUpperCase()]; return m; };

const GROUPS = [
  { id: "plain", label: "Plain text" },
  { id: "serif", label: "Bold and italic" },
  { id: "sans", label: "Sans-serif and monospace" },
  { id: "script", label: "Script, gothic and double-struck" },
  { id: "enclosed", label: "Circled, squared and bracketed" },
  { id: "size", label: "Small caps, wide, superscript and subscript" },
  { id: "flip", label: "Upside-down and mirrored" },
  { id: "lines", label: "Lines through and under" },
  { id: "lookalike", label: "Lookalike letters" },
];

// kind: "map" (character table), "flip" (table, then reverse), "mark" (combining mark after each character).
// covers: what the style changes; anything else is left as typed.
const STYLES = [
  { id: "plain", name: "Plain text", group: "plain", kind: "map", map: {}, covers: "nothing: your text as typed" },
  { id: "bold", name: "Bold", group: "serif", kind: "map", map: mathMap(0x1D400, 0x1D41A, 0x1D7CE), covers: "A-Z, a-z, 0-9" },
  { id: "italic", name: "Italic", group: "serif", kind: "map", map: mathMap(0x1D434, 0x1D44E, null, MATH_GAPS.italic), covers: "A-Z, a-z" },
  { id: "bold-italic", name: "Bold italic", group: "serif", kind: "map", map: mathMap(0x1D468, 0x1D482, null), covers: "A-Z, a-z" },
  { id: "sans", name: "Sans-serif", group: "sans", kind: "map", map: mathMap(0x1D5A0, 0x1D5BA, 0x1D7E2), covers: "A-Z, a-z, 0-9" },
  { id: "sans-bold", name: "Sans-serif bold", group: "sans", kind: "map", map: mathMap(0x1D5D4, 0x1D5EE, 0x1D7EC), covers: "A-Z, a-z, 0-9" },
  { id: "sans-italic", name: "Sans-serif italic", group: "sans", kind: "map", map: mathMap(0x1D608, 0x1D622, null), covers: "A-Z, a-z" },
  { id: "sans-bold-italic", name: "Sans-serif bold italic", group: "sans", kind: "map", map: mathMap(0x1D63C, 0x1D656, null), covers: "A-Z, a-z" },
  { id: "mono", name: "Monospace", group: "sans", kind: "map", map: mathMap(0x1D670, 0x1D68A, 0x1D7F6), covers: "A-Z, a-z, 0-9" },
  { id: "script", name: "Script", group: "script", kind: "map", map: mathMap(0x1D49C, 0x1D4B6, null, MATH_GAPS.script), covers: "A-Z, a-z" },
  { id: "bold-script", name: "Bold script", group: "script", kind: "map", map: mathMap(0x1D4D0, 0x1D4EA, null), covers: "A-Z, a-z" },
  { id: "gothic", name: "Gothic (blackletter)", group: "script", kind: "map", map: mathMap(0x1D504, 0x1D51E, null, MATH_GAPS.fraktur), covers: "A-Z, a-z" },
  { id: "bold-gothic", name: "Bold gothic", group: "script", kind: "map", map: mathMap(0x1D56C, 0x1D586, null), covers: "A-Z, a-z" },
  { id: "double-struck", name: "Double-struck", group: "script", kind: "map", map: mathMap(0x1D538, 0x1D552, 0x1D7D8, MATH_GAPS.doubleStruck), covers: "A-Z, a-z, 0-9" },
  { id: "circled", name: "Circled (bubble)", group: "enclosed", kind: "map", map: { ...range(0x24B6, UPPER), ...range(0x24D0, LOWER), ...circledDigits }, covers: "A-Z, a-z, 0-9" },
  { id: "circled-filled", name: "Circled, filled", group: "enclosed", kind: "map", map: { ...capsOnly(0x1F150), ...negCircledDigits }, covers: "A-Z (small letters become capitals), 0-9" },
  { id: "squared", name: "Squared", group: "enclosed", kind: "map", map: capsOnly(0x1F130), covers: "A-Z (small letters become capitals)" },
  { id: "squared-filled", name: "Squared, filled", group: "enclosed", kind: "map", map: capsOnly(0x1F170), covers: "A-Z (small letters become capitals)" },
  { id: "parenthesised", name: "Parenthesised", group: "enclosed", kind: "map", map: { ...range(0x1F110, UPPER), ...range(0x249C, LOWER), ...parenDigits }, covers: "A-Z, a-z, 1-9" },
  { id: "small-caps", name: "Small caps", group: "size", kind: "map", map: smallCaps, covers: "a-z except x (capitals stay as typed)" },
  { id: "wide", name: "Wide (full-width)", group: "size", kind: "map", map: { ...range(0xFF21, UPPER), ...range(0xFF41, LOWER), ...range(0xFF10, DIGITS) }, covers: "A-Z, a-z, 0-9" },
  { id: "superscript", name: "Superscript", group: "size", kind: "map", map: { ...superCaps, ...superSmall, ...superDigits }, covers: "a-z, 0-9; capitals where Unicode has them" },
  { id: "subscript", name: "Subscript", group: "size", kind: "map", map: { ...subCaps, ...subSmall, ...subDigits }, covers: "17 letters, 0-9" },
  { id: "upside-down", name: "Upside-down", group: "flip", kind: "flip", map: turned, covers: "A-Z, a-z, 0-9, common punctuation" },
  { id: "mirrored", name: "Mirrored", group: "flip", kind: "flip", map: mirrored, covers: "letters with a reversed form; symmetric letters stay" },
  { id: "strike", name: "Strikethrough", group: "lines", kind: "mark", mark: 0x0336, covers: "every character" },
  { id: "slash", name: "Slashed", group: "lines", kind: "mark", mark: 0x0338, covers: "every character" },
  { id: "underline", name: "Underline", group: "lines", kind: "mark", mark: 0x0332, covers: "every character" },
  { id: "double-underline", name: "Double underline", group: "lines", kind: "mark", mark: 0x0333, covers: "every character" },
  { id: "tilde", name: "Wavy line through", group: "lines", kind: "mark", mark: 0x0334, covers: "every character" },
  { id: "warband", name: "Warband (stroked letters)", group: "lookalike", kind: "map", map: warband, covers: "A-Z, a-z" },
  { id: "warlord", name: "Warlord (Greek and Cyrillic lookalikes)", group: "lookalike", kind: "map", map: warlord, covers: "A-Z (all capitals)" },
  { id: "runes", name: "Rune-like", group: "lookalike", kind: "map", map: runes, covers: "A-Z (all capitals)" },
];
const styleById = id => STYLES.find(s => s.id === id);

const MARK = /\p{M}/u;
/** Split into clusters: a character plus any combining marks that follow it. */
function clusters(text) {
  const out = [];
  for (const ch of text) {
    if (MARK.test(ch) && out.length) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}

/** Cut text to `max` code points (the input box limit). */
function clampInput(text, max = MAX_INPUT) {
  const a = Array.from(String(text ?? ""));
  return a.length > max ? a.slice(0, max).join("") : a.join("");
}

/** Apply one style. Characters a style has no form for are returned unchanged. */
function styleText(text, id) {
  const s = typeof id === "string" ? styleById(id) : id;
  if (!s) throw new Error(`unknown style ${id}`);
  const str = String(text ?? "");
  if (s.kind === "mark") {
    const m = cp(s.mark);
    // after every character cluster (a letter plus any marks it already has), except line breaks
    return clusters(str).map(c => (/[\r\n]/.test(c) ? c : c + m)).join("");
  }
  const mapped = clusters(str).map(c => {
    const base = String.fromCodePoint(c.codePointAt(0));
    return (s.map[base] ?? base) + c.slice(base.length);
  });
  return (s.kind === "flip" ? mapped.reverse() : mapped).join("");
}

/** Undo a "map" style where its table is one-to-one (used by tests for round trips). */
function unstyle(text, id) {
  const s = styleById(id);
  const back = {};
  for (const [k, v] of Object.entries(s.map)) if (!(v in back)) back[v] = k;
  const chars = clusters(String(text));
  const out = (s.kind === "flip" ? chars.reverse() : chars).map(c => {
    const base = String.fromCodePoint(c.codePointAt(0));
    return (back[base] ?? base) + c.slice(base.length);
  });
  return out.join("");
}

// ---------- frames ----------

const FRAME_GROUPS = [
  { id: "symbols", label: "Symbols" },
  { id: "brackets", label: "Brackets" },
  { id: "stars", label: "Stars" },
  { id: "swords", label: "Swords and daggers" },
  { id: "flowers", label: "Flowers" },
  { id: "lines", label: "Lines" },
  { id: "arrows", label: "Arrows" },
];
const f = (id, group, prefix, suffix) => ({ id, group, prefix, suffix });
const FRAMES = [
  f("none", null, "", ""),
  f("dots", "symbols", "•", "•"), f("diamonds", "symbols", "◆", "◆"), f("diamonds-outline", "symbols", "◇", "◇"),
  f("crowns", "symbols", "♛", "♛"), f("skulls", "symbols", "☠", "☠"), f("spades", "symbols", "♠", "♠"),
  f("square", "brackets", "[", "]"), f("curly", "brackets", "{", "}"), f("guillemets", "brackets", "«", "»"),
  f("lenticular", "brackets", "【", "】"), f("white-lenticular", "brackets", "〖", "〗"), f("corner", "brackets", "「", "」"),
  f("white-corner", "brackets", "『", "』"), f("double-angle", "brackets", "《", "》"), f("white-square", "brackets", "⟦", "⟧"),
  f("stars", "stars", "★", "★"), f("stars-outline", "stars", "☆", "☆"), f("four-point", "stars", "✦", "✦"),
  f("four-point-outline", "stars", "✧", "✧"), f("circled-star", "stars", "✪", "✪"), f("small-star", "stars", "⋆", "⋆"),
  f("pinwheel-star", "stars", "✯", "✯"),
  f("swords", "swords", "⚔", "⚔"), f("dagger", "swords", "†", "†"), f("double-dagger", "swords", "‡", "‡"),
  f("turned-dagger", "swords", "⸸", "⸸"),
  f("blossom", "flowers", "✿", "✿"), f("florette", "flowers", "❀", "❀"), f("rosette", "flowers", "❁", "❁"),
  f("floral-heart", "flowers", "❦", "❦"), f("hedera", "flowers", "❧", "☙"), f("flower", "flowers", "⚘", "⚘"),
  f("dashes", "lines", "—", "—"), f("double-line", "lines", "═", "═"), f("tildes", "lines", "~", "~"),
  f("bars", "lines", "|", "|"), f("equals", "lines", "-=", "=-"), f("thick-bar", "lines", "▬", "▬"),
  f("box-ends", "lines", "═╡", "╞═"),
  f("chevrons", "arrows", "»", "«"), f("arrows-in", "arrows", "→", "←"), f("arrowhead", "arrows", "➤", ""),
  f("squiggle-arrows", "arrows", "⇝", "⇜"), f("zigzag", "arrows", "↯", "↯"), f("pointers", "arrows", "►", "◄"),
];
const frameById = id => FRAMES.find(x => x.id === id);

/** Put a frame around text that may already be styled. `gap` adds one space on each framed side. */
function applyFrame(text, id, { gap = true } = {}) {
  const fr = typeof id === "string" ? frameById(id) : id;
  if (!fr) throw new Error(`unknown frame ${id}`);
  const sp = gap ? " " : "";
  return (fr.prefix ? fr.prefix + sp : "") + text + (fr.suffix ? sp + fr.suffix : "");
}

/** Style first, then frame: the frame's own characters are never restyled. */
const decorate = (text, styleId, frameId = "none", opts) => applyFrame(styleText(text, styleId), frameId, opts);

// ---------- lengths and risk ----------

const ASTRAL = /[\u{10000}-\u{10FFFF}]/u;
/** Code points, UTF-16 code units, and the two things that most often get text rejected. */
function lengths(text) {
  const s = String(text ?? "");
  return { codePoints: Array.from(s).length, utf16: s.length, combining: MARK.test(s), astral: ASTRAL.test(s) };
}

/**
 * How likely a character is to be refused or mangled by a name box:
 * 0 = basic Latin and Latin-1; 1 = common symbols in the Basic Multilingual Plane
 * (U+2000-2BFF punctuation, arrows, shapes, dingbats; U+2E00-2E7F); 2 = everything else
 * (other scripts, CJK punctuation, full-width forms, characters outside the BMP, combining
 * marks, and anything shown as a colour emoji by default).
 */
function charRisk(ch) {
  const c = ch.codePointAt(0);
  if (MARK.test(ch) || /\p{Emoji_Presentation}/u.test(ch)) return 2;
  if ((c >= 0x20 && c <= 0x7E) || (c >= 0xA0 && c <= 0xFF)) return 0;
  if ((c >= 0x2000 && c <= 0x2BFF) || (c >= 0x2E00 && c <= 0x2E7F)) return 1;
  return 2;
}
const textRisk = s => Array.from(String(s)).reduce((m, ch) => Math.max(m, charRisk(ch)), 0);
const frameRisk = fr => textRisk(fr.prefix + fr.suffix);
const RISK_LABEL = ["basic characters", "common symbols", "often rejected"];

/** Does `text` fit a limit? `by` is "utf16" (stricter, the default) or "codePoints". */
function fits(text, limit, by = "utf16") {
  if (!limit) return true;
  const l = lengths(text);
  return (by === "codePoints" ? l.codePoints : l.utf16) <= limit;
}

/** Every style applied to one input, with lengths: the rows the page shows. */
function allRows(text, frameId = "none", opts) {
  const input = clampInput(text);
  return STYLES.map(s => {
    const out = decorate(input, s.id, frameId, opts);
    return { id: s.id, name: s.name, group: s.group, text: out, ...lengths(out) };
  });
}

/** The note under the frame picker. */
function frameNote(fr) {
  if (!fr || fr.id === "none") return "Frames use common symbols. Ones marked “often rejected” use characters many name boxes refuse.";
  const r = frameRisk(fr);
  return `This frame uses ${RISK_LABEL[r]}${r === 2 ? ": many name boxes refuse them" : ""}.`;
}

/** Warning shown on a row, from its lengths; empty when there is nothing to warn about. */
function rowWarning(l) {
  const w = [];
  if (l.astral) w.push("Outside the Basic Multilingual Plane: often counted as two each, or refused.");
  if (l.combining) w.push("Combining marks: often stripped, refused or misdrawn.");
  return w.join(" ");
}
const lenText = l => `${l.codePoints} characters · ${l.utf16} UTF-16 units`;

/** "Copy all as a list": one line per style. */
const listText = rows => rows.map(r => `${r.name}: ${r.text}`).join("\n");

// fancy.js
// Fancy text and name styler. All styling is in lib/fancy.js. Typed text is never stored, sent
// or put in the URL; only the ids of starred styles are kept, in localStorage (et-fancy-favourites).

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

})();
