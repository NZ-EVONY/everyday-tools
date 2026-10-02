// Fancy text: every style mapping is checked against the Unicode Character Database (names,
// compatibility decompositions and NamesList cross-references in tests/fixtures/unicode-names.json)
// and, independently, against Node's own Unicode normalisation (NFKC).
import test from "node:test";
import assert from "node:assert/strict";
import { readJson } from "../helpers.mjs";
import {
  STYLES, GROUPS, MATH_GAPS, FRAMES, FRAME_GROUPS, styleText, unstyle, applyFrame, decorate, lengths, fits,
  clampInput, clusters, allRows, listText, charRisk, frameRisk, textRisk, MAX_INPUT, styleById, frameById,
} from "../../src/assets/lib/fancy.js";

const ucd = readJson("tests/fixtures/unicode-names.json");
const hex = n => n.toString(16).toUpperCase().padStart(4, "0");
const nameOf = ch => ucd.names[hex(ch.codePointAt(0))];
const decompOf = ch => ucd.decomposition[hex(ch.codePointAt(0))];
const UPPER = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"], LOWER = [..."abcdefghijklmnopqrstuvwxyz"], DIGITS = [..."0123456789"];
const DIGIT_NAMES = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
const one = (id, ch) => styleText(ch, id);

test("the fixture comes from a Unicode release and covers every output character", () => {
  assert.match(ucd.unicodeVersion, /^\d+\.\d+\.\d+$/);
  assert.match(ucd.mathBlockNote, /For general text, use standard Latin and Greek letters with markup/);
  for (const s of STYLES) {
    const chars = s.kind === "mark" ? [String.fromCodePoint(s.mark)] : Object.values(s.map).flatMap(v => [...v]);
    for (const ch of chars) assert.ok(nameOf(ch), `${s.id}: U+${hex(ch.codePointAt(0))} is not an assigned character`);
  }
  for (const fr of FRAMES) for (const ch of fr.prefix + fr.suffix) assert.ok(nameOf(ch), `frame ${fr.id}: ${ch}`);
});

// Mathematical Alphanumeric Symbols: name pattern, code point range, <font> decomposition, NFKC.
const MATH = [
  ["bold", "BOLD", 0x1D400, 0x1D41A, 0x1D7CE, {}],
  ["italic", "ITALIC", 0x1D434, 0x1D44E, null, MATH_GAPS.italic],
  ["bold-italic", "BOLD ITALIC", 0x1D468, 0x1D482, null, {}],
  ["script", "SCRIPT", 0x1D49C, 0x1D4B6, null, MATH_GAPS.script],
  ["bold-script", "BOLD SCRIPT", 0x1D4D0, 0x1D4EA, null, {}],
  ["gothic", "FRAKTUR", 0x1D504, 0x1D51E, null, MATH_GAPS.fraktur],
  ["double-struck", "DOUBLE-STRUCK", 0x1D538, 0x1D552, 0x1D7D8, MATH_GAPS.doubleStruck],
  ["bold-gothic", "BOLD FRAKTUR", 0x1D56C, 0x1D586, null, {}],
  ["sans", "SANS-SERIF", 0x1D5A0, 0x1D5BA, 0x1D7E2, {}],
  ["sans-bold", "SANS-SERIF BOLD", 0x1D5D4, 0x1D5EE, 0x1D7EC, {}],
  ["sans-italic", "SANS-SERIF ITALIC", 0x1D608, 0x1D622, null, {}],
  ["sans-bold-italic", "SANS-SERIF BOLD ITALIC", 0x1D63C, 0x1D656, null, {}],
  ["mono", "MONOSPACE", 0x1D670, 0x1D68A, 0x1D7F6, {}],
];

test("math styles: every letter and digit has the right Unicode name, block and <font> decomposition", () => {
  for (const [id, word, upper, lower, digit, gaps] of MATH) {
    const check = (ch, i, base, kind) => {
      const out = one(id, ch), c = out.codePointAt(0);
      assert.equal([...out].length, 1, `${id} ${ch}`);
      assert.equal(decompOf(out), `<font> ${hex(ch.codePointAt(0))}`, `${id} ${ch}: decomposition`);
      if (gaps[ch]) {
        assert.ok(c >= 0x2100 && c <= 0x214F, `${id} ${ch}: gap letter should come from Letterlike Symbols`);
      } else {
        assert.equal(c, base + i, `${id} ${ch}: code point`);
        assert.ok(c >= 0x1D400 && c <= 0x1D7FF, `${id} ${ch}: outside the math block`);
        assert.equal(nameOf(out), `MATHEMATICAL ${word} ${kind}`, `${id} ${ch}: name`);
      }
    };
    UPPER.forEach((ch, i) => check(ch, i, upper, `CAPITAL ${ch}`));
    LOWER.forEach((ch, i) => check(ch, i, lower, `SMALL ${ch.toUpperCase()}`));
    if (digit) DIGITS.forEach((ch, i) => check(ch, i, digit, `DIGIT ${DIGIT_NAMES[i]}`));
    else for (const d of DIGITS) assert.equal(one(id, d), d, `${id} leaves digits alone`);
  }
});

test("math gaps: exactly the reserved slots NamesList points to Letterlike Symbols, and nothing else", () => {
  const seen = new Set();
  for (const [id, , upper, lower, , gaps] of MATH) {
    for (const [letter, target] of Object.entries(gaps)) {
      const naive = hex((letter === letter.toUpperCase() ? upper : lower) + (letter.toLowerCase().charCodeAt(0) - 97));
      assert.ok(naive in ucd.reservedInMathBlock, `${id} ${letter}: U+${naive} should be reserved`);
      assert.equal(ucd.reservedInMathBlock[naive], hex(target), `${id} ${letter}: NamesList cross-reference`);
      assert.equal(one(id, letter), String.fromCodePoint(target));
      seen.add(naive);
    }
  }
  const pointed = Object.entries(ucd.reservedInMathBlock).filter(([, x]) => x).map(([k]) => k);
  assert.deepEqual([...seen].sort(), pointed.sort(), "every cross-referenced reserved slot is handled");
  // The well-known gaps, spelled out.
  assert.equal(styleText("CHNPQRZ", "double-struck"), "ℂℍℕℙℚℝℤ");
  assert.equal(styleText("BEFHILMR", "script"), "ℬℰℱℋℐℒℳℛ");
  assert.equal(styleText("ego", "script"), "ℯℊℴ");
  assert.equal(styleText("CHIRZ", "gothic"), "ℭℌℑℜℨ");
  assert.equal(nameOf(one("italic", "h")), "PLANCK CONSTANT");
});

test("NFKC (Node's own Unicode data) turns compatibility styles back into the plain text", () => {
  const sample = "The Quick Brown Fox 0123456789";
  for (const [id] of MATH) {
    const hasDigits = MATH.find(m => m[0] === id)[4];
    const out = styleText(sample, id);
    assert.equal(out.normalize("NFKC"), sample, id);
    if (!hasDigits) assert.ok(out.endsWith("0123456789"));
  }
  assert.equal(styleText("Kia Ora 2026", "wide").normalize("NFKC"), "Kia Ora 2026");
  assert.equal(styleText("Kia Ora 2026", "circled").normalize("NFKC"), "Kia Ora 2026");
  assert.equal(styleText("abc 123", "parenthesised").normalize("NFKC"), "(a)(b)(c) (1)(2)(3)");
  assert.equal(styleText("Kia", "squared").normalize("NFKC"), "KIA");
  assert.equal(styleText("tone 2", "superscript").normalize("NFKC"), "tone 2");
  assert.equal(styleText("hex 2", "subscript").normalize("NFKC"), "hex 2");
});

test("enclosed and full-width styles use the named Unicode letters and digits", () => {
  for (const [i, L] of UPPER.entries()) {
    const l = LOWER[i];
    assert.equal(nameOf(one("circled", L)), `CIRCLED LATIN CAPITAL LETTER ${L}`);
    assert.equal(nameOf(one("circled", l)), `CIRCLED LATIN SMALL LETTER ${L}`);
    assert.equal(nameOf(one("circled-filled", L)), `NEGATIVE CIRCLED LATIN CAPITAL LETTER ${L}`);
    assert.equal(one("circled-filled", l), one("circled-filled", L));
    assert.equal(nameOf(one("squared", L)), `SQUARED LATIN CAPITAL LETTER ${L}`);
    assert.equal(nameOf(one("squared-filled", L)), `NEGATIVE SQUARED LATIN CAPITAL LETTER ${L}`);
    assert.equal(nameOf(one("parenthesised", L)), `PARENTHESIZED LATIN CAPITAL LETTER ${L}`);
    assert.equal(nameOf(one("parenthesised", l)), `PARENTHESIZED LATIN SMALL LETTER ${L}`);
    assert.equal(nameOf(one("wide", L)), `FULLWIDTH LATIN CAPITAL LETTER ${L}`);
    assert.equal(nameOf(one("wide", l)), `FULLWIDTH LATIN SMALL LETTER ${L}`);
  }
  DIGITS.forEach((d, i) => {
    assert.equal(nameOf(one("circled", d)), `CIRCLED DIGIT ${DIGIT_NAMES[i]}`);
    assert.equal(nameOf(one("circled-filled", d)), i ? `DINGBAT NEGATIVE CIRCLED DIGIT ${DIGIT_NAMES[i]}` : "NEGATIVE CIRCLED DIGIT ZERO");
    assert.equal(nameOf(one("wide", d)), `FULLWIDTH DIGIT ${DIGIT_NAMES[i]}`);
    if (i) assert.equal(nameOf(one("parenthesised", d)), `PARENTHESIZED DIGIT ${DIGIT_NAMES[i]}`);
    else assert.equal(one("parenthesised", d), "0", "Unicode has no parenthesised zero");
  });
});

test("small caps, superscript and subscript map to the named letters; gaps stay as typed", () => {
  for (const [i, l] of LOWER.entries()) {
    const L = UPPER[i];
    if (l === "x") assert.equal(one("small-caps", l), "x", "Unicode has no small capital X");
    else assert.equal(nameOf(one("small-caps", l)), `LATIN LETTER SMALL CAPITAL ${L}`);
    assert.equal(one("small-caps", L), L, "capitals stay capitals");
    assert.match(nameOf(one("superscript", l)), new RegExp(`^(MODIFIER LETTER SMALL|SUPERSCRIPT LATIN SMALL LETTER) ${L}$`));
    assert.match(nameOf(one("superscript", L)), new RegExp(`^MODIFIER LETTER (CAPITAL|SMALL) ${L}$`));
    const sub = one("subscript", l);
    if (sub === l) assert.ok(!"aehijklmnoprstuvx".includes(l));
    else assert.equal(nameOf(sub), `LATIN SUBSCRIPT SMALL LETTER ${L}`);
  }
  // capitals with no modifier capital fall back to the small superscript
  for (const L of "CFQSXYZ") assert.equal(one("superscript", L), one("superscript", L.toLowerCase()));
  DIGITS.forEach((d, i) => {
    assert.equal(nameOf(one("superscript", d)), `SUPERSCRIPT ${DIGIT_NAMES[i]}`);
    assert.equal(nameOf(one("subscript", d)), `SUBSCRIPT ${DIGIT_NAMES[i]}`);
  });
});

test("line styles add one combining mark after each character cluster", () => {
  const marks = { strike: "COMBINING LONG STROKE OVERLAY", slash: "COMBINING LONG SOLIDUS OVERLAY", underline: "COMBINING LOW LINE", "double-underline": "COMBINING DOUBLE LOW LINE", tilde: "COMBINING TILDE OVERLAY" };
  for (const [id, name] of Object.entries(marks)) {
    const m = String.fromCodePoint(styleById(id).mark);
    assert.equal(nameOf(m), name);
    assert.equal(styleText("ab c", id), `a${m}b${m} ${m}c${m}`);
    assert.equal(styleText("a\nb", id), `a${m}\nb${m}`, "line breaks get no mark");
    assert.equal(styleText("é", id), `é${m}`, "mark goes after the whole cluster");
    assert.equal(lengths(styleText("abc", id)).codePoints, 6);
    assert.equal(lengths(styleText("abc", id)).combining, true);
  }
});

// Lookalike and flipped letters have no rule to derive them from, so each pick is pinned to the
// Unicode name it was chosen for.
const NAMED = {
  "upside-down": { a: "LATIN SMALL LETTER TURNED A", c: "LATIN SMALL LETTER OPEN O", e: "LATIN SMALL LETTER TURNED E", f: "LATIN SMALL LETTER DOTLESS J WITH STROKE", g: "LATIN SMALL LETTER B WITH TOPBAR", h: "LATIN SMALL LETTER TURNED H", i: "LATIN SMALL LETTER TURNED I", j: "LATIN SMALL LETTER R WITH FISHHOOK", k: "LATIN SMALL LETTER TURNED K", m: "LATIN SMALL LETTER TURNED M", r: "LATIN SMALL LETTER TURNED R", t: "LATIN SMALL LETTER TURNED T", v: "LATIN SMALL LETTER TURNED V", w: "LATIN SMALL LETTER TURNED W", y: "LATIN SMALL LETTER TURNED Y", A: "LATIN CAPITAL LETTER TURNED A", B: "LISU LETTER GHA", C: "LATIN CAPITAL LETTER OPEN O", D: "LISU LETTER OE", E: "LATIN CAPITAL LETTER REVERSED E", F: "TURNED CAPITAL F", G: "TURNED SANS-SERIF CAPITAL G", J: "LATIN SMALL LETTER LONG S", K: "LATIN CAPITAL LETTER TURNED K", L: "LATIN CAPITAL LETTER TURNED L", P: "CYRILLIC CAPITAL LETTER KOMI DE", Q: "GREEK CAPITAL LETTER OMICRON WITH TONOS", R: "LATIN LETTER SMALL CAPITAL TURNED R", T: "UP TACK", U: "INTERSECTION", V: "GREEK CAPITAL LETTER LAMDA", Y: "TURNED SANS-SERIF CAPITAL Y", 1: "LATIN CAPITAL LETTER IOTA", 2: "TURNED DIGIT TWO", 3: "TURNED DIGIT THREE", 4: "BOPOMOFO LETTER EN", 5: "GREEK SMALL LETTER STIGMA", 7: "BOPOMOFO LETTER ENG", "&": "TURNED AMPERSAND", "?": "INVERTED QUESTION MARK", "!": "INVERTED EXCLAMATION MARK" },
  mirrored: { a: "LATIN SMALL LETTER TURNED ALPHA", e: "LATIN SMALL LETTER REVERSED E", g: "GREEK RHO SYMBOL", r: "LATIN SMALL LETTER REVERSED R WITH FISHHOOK", s: "CYRILLIC SMALL LETTER REVERSED DZE", z: "LATIN SMALL LETTER EZH REVERSED", B: "CANADIAN SYLLABICS CARRIER TSA", D: "CANADIAN SYLLABICS CARRIER THA", E: "LATIN CAPITAL LETTER REVERSED E", F: "LATIN EPIGRAPHIC LETTER REVERSED F", G: "CHEROKEE LETTER HE", J: "GEORGIAN CAPITAL LETTER SAN", K: "LISU LETTER KHA", L: "REVERSED SANS-SERIF CAPITAL L", N: "CYRILLIC CAPITAL LETTER I", P: "LATIN EPIGRAPHIC LETTER REVERSED P", Q: "GREEK LETTER ARCHAIC KOPPA", R: "CYRILLIC CAPITAL LETTER YA", S: "CYRILLIC CAPITAL LETTER REVERSED DZE", Z: "LATIN CAPITAL LETTER EZH REVERSED", "?": "REVERSED QUESTION MARK" },
  warlord: { A: "GREEK CAPITAL LETTER LAMDA", B: "LATIN SMALL LETTER SHARP S", C: "GREEK CAPITAL DOTTED LUNATE SIGMA SYMBOL", D: "LATIN CAPITAL LETTER ETH", E: "GREEK CAPITAL LETTER SIGMA", F: "LATIN CAPITAL LETTER F WITH HOOK", G: "LATIN CAPITAL LETTER G WITH STROKE", H: "LATIN CAPITAL LETTER H WITH STROKE", I: "LATIN CAPITAL LETTER I WITH STROKE", J: "CYRILLIC CAPITAL LETTER JE", K: "CYRILLIC CAPITAL LETTER KA WITH VERTICAL STROKE", L: "LATIN CAPITAL LETTER L WITH STROKE", M: "CYRILLIC CAPITAL LETTER EM WITH TAIL", N: "GREEK CAPITAL LETTER PI", O: "GREEK CAPITAL LETTER THETA", P: "LATIN CAPITAL LETTER P WITH HOOK", Q: "LATIN CAPITAL LETTER O WITH OGONEK", R: "CYRILLIC CAPITAL LETTER YA", S: "LATIN CAPITAL LETTER TONE TWO", T: "LATIN CAPITAL LETTER T WITH HOOK", U: "LATIN CAPITAL LETTER UPSILON", V: "CYRILLIC CAPITAL LETTER IZHITSA", W: "CYRILLIC CAPITAL LETTER SHA", X: "CYRILLIC CAPITAL LETTER ZHE", Y: "CYRILLIC CAPITAL LETTER STRAIGHT U WITH STROKE", Z: "LATIN CAPITAL LETTER Z WITH STROKE" },
};

test("flipped and Warlord letters are the characters named in the pinned tables", () => {
  for (const [id, table] of Object.entries(NAMED)) for (const [ch, name] of Object.entries(table)) assert.equal(nameOf(one(id, ch)), name, `${id} ${ch}`);
  for (const ch of "bdnpqu") assert.equal(one("upside-down", ch), { b: "q", d: "p", n: "u", p: "d", q: "b", u: "n" }[ch]);
  for (const ch of "HIOSXZlosxz08") assert.equal(one("upside-down", ch), ch, `${ch} looks the same turned`);
  for (const ch of "AHIMOTUVWXY") assert.equal(one("mirrored", ch), ch, `${ch} is symmetric`);
  for (const l of LOWER) assert.equal(one("warlord", l), one("warlord", l.toUpperCase()), "Warlord is all capitals");
});

test("Warband uses the stroked or hooked form of the same letter; rune-like uses Runic letters", () => {
  for (const [i, L] of UPPER.entries()) {
    const l = LOWER[i];
    for (const [ch, kase] of [[L, "CAPITAL"], [l, "SMALL"]]) {
      const n = nameOf(one("warband", ch));
      if (L === "X") assert.equal(n, `CYRILLIC ${kase} LETTER HA WITH STROKE`);
      else assert.match(n, new RegExp(`^LATIN ${kase} LETTER ${L} (WITH (STROKE|HOOK|OBLIQUE STROKE|DIAGONAL STROKE|STROKE THROUGH DESCENDER)|BAR)$`), `warband ${ch}`);
    }
    const r = one("runes", L);
    assert.ok(r.codePointAt(0) >= 0x16A0 && r.codePointAt(0) <= 0x16FF, `rune ${L} in the Runic block`);
    assert.match(nameOf(r), /^RUNIC LETTER /);
    if (!"CYZ".includes(L)) assert.match(nameOf(r), new RegExp(` ${L}$`), `rune ${L} is the rune Unicode names for ${L}`);
    assert.equal(one("runes", l), r);
  }
  assert.equal(nameOf(one("runes", "C")), "RUNIC LETTER KAUNA");
  assert.equal(nameOf(one("runes", "Y")), "RUNIC LETTER LONG-BRANCH-YR");
  assert.equal(nameOf(one("runes", "Z")), "RUNIC LETTER ALGIZ EOLHX");
});

test("flips reverse the order and keep combining marks with their letter", () => {
  assert.equal(styleText("Hello, World!", "upside-down"), "¡plɹoM 'ollǝH");
  assert.equal(styleText("abc", "mirrored"), "ɔdɒ");
  assert.deepEqual(clusters("éa"), ["é", "a"]);
  assert.equal(styleText("éa", "upside-down"), "ɐǝ́");
});

test("round trips: reversible styles undo exactly on mixed input", () => {
  const mixed = "Kia ora, Ōtautahi 2026! 🙂 é (test) #42";
  const notOneToOne = new Set(["plain", "circled-filled", "squared", "squared-filled", "superscript", "subscript", "warlord", "runes"]);
  for (const s of STYLES.filter(s => s.kind !== "mark" && !notOneToOne.has(s.id))) {
    const vals = Object.values(s.map);
    assert.equal(new Set(vals).size, vals.length, `${s.id} is one-to-one`);
    assert.equal(unstyle(styleText(mixed, s.id), s.id), mixed, s.id);
  }
  // many-to-one styles come back in capitals (or not at all) by design
  assert.equal(unstyle(styleText("Kia 2026", "squared"), "squared"), "KIA 2026");
  assert.equal(unstyle(styleText("Kia", "warlord"), "warlord"), "KIA");
});

test("mixed input: anything a style has no form for is left exactly as typed", () => {
  assert.equal(styleText("Ōtautahi 🙂 ½", "bold"), "Ō𝐭𝐚𝐮𝐭𝐚𝐡𝐢 🙂 ½");
  assert.equal(styleText("Ō", "bold"), "𝐎̄", "a decomposed macron stays on its letter");
  assert.equal(styleText("A-1 b_2", "sans-bold"), "𝗔-𝟭 𝗯_𝟮");
  assert.equal(styleText("", "gothic"), "");
  assert.equal(styleText("x", "plain"), "x");
  assert.throws(() => styleText("x", "nope"));
});

test("length counters: code points versus UTF-16 code units, combining and astral flags", () => {
  assert.deepEqual(lengths(""), { codePoints: 0, utf16: 0, combining: false, astral: false });
  assert.deepEqual(lengths("Kai"), { codePoints: 3, utf16: 3, combining: false, astral: false });
  assert.deepEqual(lengths("𝐊𝐚𝐢"), { codePoints: 3, utf16: 6, combining: false, astral: true });
  assert.deepEqual(lengths("Ⓚⓐⓘ"), { codePoints: 3, utf16: 3, combining: false, astral: false });
  assert.deepEqual(lengths("K̶"), { codePoints: 2, utf16: 2, combining: true, astral: false });
  assert.deepEqual(lengths("🙂"), { codePoints: 1, utf16: 2, combining: false, astral: true });
  for (const s of STYLES) {
    const out = styleText("Name 12", s.id), l = lengths(out);
    assert.equal(l.utf16, out.length);
    assert.equal(l.codePoints, [...out].length);
    assert.ok(l.utf16 >= l.codePoints);
  }
  assert.equal(fits("𝐊𝐚𝐢", 4), false, "6 UTF-16 units do not fit 4");
  assert.equal(fits("𝐊𝐚𝐢", 4, "codePoints"), true);
  assert.equal(fits("anything", 0), true, "no limit");
});

test("input limit: clampInput keeps the first 100 code points", () => {
  assert.equal(MAX_INPUT, 100);
  assert.equal([...clampInput("𝐀".repeat(150))].length, 100);
  assert.equal(clampInput("abc"), "abc");
  assert.equal(clampInput(null), "");
  assert.equal(allRows("a".repeat(150))[0].codePoints, 100);
});

test("frames: at least 25 in seven groups, common BMP characters only, with a computed risk", () => {
  const real = FRAMES.filter(f => f.id !== "none");
  assert.ok(real.length >= 25, `${real.length} frames`);
  assert.equal(new Set(FRAMES.map(f => f.id)).size, FRAMES.length);
  for (const g of FRAME_GROUPS) assert.ok(real.filter(f => f.group === g.id).length >= 3, `group ${g.id}`);
  for (const f of real) {
    assert.ok(FRAME_GROUPS.some(g => g.id === f.group));
    for (const ch of f.prefix + f.suffix) {
      assert.ok(ch.codePointAt(0) <= 0xFFFF, `${f.id}: outside the BMP`);
      assert.ok(!/\p{M}|\p{Emoji_Presentation}/u.test(ch), `${f.id}: combining mark or emoji`);
    }
  }
  assert.equal(frameRisk(frameById("square")), 0);
  assert.equal(frameRisk(frameById("guillemets")), 0);
  assert.equal(frameRisk(frameById("stars")), 1);
  assert.equal(frameRisk(frameById("swords")), 1);
  assert.equal(frameRisk(frameById("lenticular")), 2, "CJK brackets are often refused");
  assert.equal(charRisk("̶"), 2);
  assert.equal(charRisk("😀"), 2);
  assert.equal(charRisk("𝐀"), 2);
  assert.equal(textRisk("Kai"), 0);
  assert.ok(real.some(f => frameRisk(f) === 2) && real.some(f => frameRisk(f) === 0));
});

test("frame stacking: style first, then frame; frame characters are never restyled", () => {
  assert.equal(decorate("Kai", "bold", "stars"), "★ 𝐊𝐚𝐢 ★");
  assert.equal(decorate("Kai", "bold", "stars", { gap: false }), "★𝐊𝐚𝐢★");
  assert.equal(decorate("Kai", "plain", "arrowhead"), "➤ Kai", "prefix-only frame has no trailing gap");
  assert.equal(decorate("Kai", "plain", "none"), "Kai");
  assert.equal(decorate("ab", "upside-down", "chevrons"), "» qɐ «", "the frame is not flipped");
  assert.equal(decorate("ab", "strike", "square"), "[ a̶b̶ ]", "no marks on the frame");
  assert.equal(applyFrame("x", "hedera"), "❧ x ☙");
  for (const f of FRAMES) for (const s of ["plain", "bold", "circled", "strike"]) {
    const styled = styleText("Kai 7", s), framed = decorate("Kai 7", s, f.id);
    const gaps = (f.prefix ? 1 : 0) + (f.suffix ? 1 : 0);
    assert.equal(framed.length, styled.length + f.prefix.length + f.suffix.length + gaps, `${f.id}+${s}`);
    assert.ok(framed.includes(styled));
  }
  assert.throws(() => applyFrame("x", "nope"));
});

test("styles: unique ids, known groups, plain row first, and the rows/list helpers", () => {
  assert.ok(STYLES.length >= 30, `${STYLES.length} styles`);
  assert.equal(new Set(STYLES.map(s => s.id)).size, STYLES.length);
  for (const s of STYLES) assert.ok(GROUPS.some(g => g.id === s.group), s.id);
  assert.equal(STYLES[0].id, "plain");
  const rows = allRows("Kai", "dots");
  assert.equal(rows.length, STYLES.length);
  assert.equal(rows[0].text, "• Kai •");
  assert.equal(rows.find(r => r.id === "bold").utf16, 2 + 6 + 2, "two bullets, two spaces, three astral letters");
  assert.equal(listText(rows.slice(0, 2)), "Plain text: • Kai •\nBold: • 𝐊𝐚𝐢 •");
});
