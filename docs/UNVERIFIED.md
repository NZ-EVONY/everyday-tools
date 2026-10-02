# Unverified and could-not-do

Items here are NOT VERIFIED. Anything a page would need from this list stays unpublished
(`status: "draft"`) until it is confirmed.

## Data
- **Matariki dates from the Act.** legislation.govt.nz serves a JavaScript bot check (AWS WAF) to
  the build session, and the headless browser can't pass this session's TLS proxy without
  disabling certificate checks (not allowed). The Matariki dates (10 July 2026, 25 June 2027) come
  from MBIE's table, which cites the Act. The Ministry of Education's term-dates page (read 3 October
  2026) lists the same two Matariki dates. The owner should still compare them with the Act's schedule.
- **2027 public holidays.** Taken from MBIE's second table, which has no year heading. All dates
  match 2027 and MBIE's own rules (checked by code), but MBIE labels 25 April as "Saturday"
  (25 April 2027 is a Sunday; the Mondayised Monday 26 April is correct). Re-check once MBIE
  labels the table. Independent support: the Ministry of Education's 2027 term dates list Waitangi
  Day observed on Monday 8 February, Good Friday 26 March, Easter Monday 29 March, King's Birthday
  7 June, Matariki 25 June and Labour Day 25 October 2027, all matching.
- **MBIE regional anniversary dates.** MBIE itself says its regional table "may contain
  unintentional errors" and to check with local councils. Used as published.

- **US volume units and the knot.** NIST's appendix lists rounded factors for the US gallon, cup,
  fluid ounce, teaspoon, tablespoon and the knot; the converter uses those and marks them "rounded".
  Exact definitions (for example the US gallon as 231 cubic inches) weren't found on the pages fetched.
- **KiwiSaver government contribution conditions.** IRD's page says "There are conditions" beyond age
  and income; the calculator asks the visitor to confirm they meet them rather than listing them all.

## Fancy text (Phase 7)
- **unicode.org pages not opened.** The code chart PDF (U1D400.pdf) and the Unicode Standard 18.0 text are cited as further reading but couldn't be fetched (blocked by the session's network policy). The URLs follow unicode.org's published patterns; the owner should click each one. Every fact on the pages comes from the UCD data files (read from the Consortium's GitHub mirror) or was checked by code.
- **Glyph rendering on real devices.** Headless Chromium here drew all 1,324 output characters (`npm run check:glyphs`, control detected), but this machine has GNU Unifont as a last-resort font, so that result is optimistic. Not checked on any phone, console or other OS. The newest characters, likeliest to show as boxes on older devices: U+107A5 𐞥 (14.0, superscript q), U+A7AF ꞯ (11.0, small-caps q), U+218A ↊ and U+218B ↋ (8.0, upside-down 2 and 3), U+A7B0 Ʞ (7.0, upside-down K), U+A798 Ꞙ / U+A799 ꞙ (7.0, Warband F), U+2E38 ⸸ (6.1, turned-dagger frame), and the 6.0 enclosed capitals U+1F130-1F189 (squared, filled circled, filled squared rows).
- **Filled squared letters may show as colour emoji.** 🅰 🅱 🅾 🅿 (U+1F170, 1F171, 1F17E, 1F17F) are emoji with text presentation by default; some systems draw them as emoji anyway. Not verified on devices.
- **How screen readers announce styled text.** The pages say readers "may" spell letters out, read character names or skip them. Not tested with a real screen reader.
- **How any game, app or site counts or filters names.** Deliberately not claimed; the pages tell visitors to paste into the target box first.

## Cannot be verified from this session
- Real Cloudflare behaviour (custom domains, `_headers` application at the edge, compression,
  managed `robots.txt`). Checked only with `wrangler dev --local`.
- Google indexing, rich results, AdSense review and approval.
- Real devices, screen readers, other browsers (only Chromium was used), field Core Web Vitals.
- Printing on real printers and in Firefox and Safari. Page size and page count were checked only
  with Chromium's PDF output (`page.pdf` with preferCSSPageSize). Firefox supports named pages from
  version 110; Safari's support for `page` is limited, so it relies on the CSSOM @page fallback.
- Text tool behaviour in Firefox and Safari (Intl.Segmenter availability and textarea performance differ by browser); timings were measured only in headless Chromium on the build machine.
- How the calculators compare with IRD's own online PAYE calculator (not scraped; the owner can compare by hand).
- Later changes to official pages after 2 October 2026.
- The owner's search spot-check (`docs/SEARCH-SPOTCHECK.md`); search engines are not scraped.

## Phase 5 and 6 guide notes
- 2027 school term dates in the printing guide are typed into the guide from the Ministry of Education
  page (read 3 October 2026), not held in `data/`. Schools set their own first and last days within
  the Ministry's range; the guide says so. Review when the 2028 calendar is printed.
- The Chatham Islands changing clocks on the mainland's dates is from the time-zone database, not an official page (the guide says so).
- The printing guide's paper weights (about 80 gsm for copy paper, 120 to 160 gsm for sturdier sheets) and the unprintable edge "of a few millimetres" are general guidance, not from a source.
- The Employment Leave Act date (August 2028) is time-sensitive; the holidays guide needs a review before then.
- Matariki dates in the holidays guide come from MBIE's table; the legislation itself still couldn't be read (see Data).

## Claims flagged in content
<!-- generated:claims:start -->
_Generated by `npm run report:claims`. Do not edit by hand._

- No unverified claims in content modules.
<!-- generated:claims:end -->
