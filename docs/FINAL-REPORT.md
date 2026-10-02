# Final report

Build branch `build/everyday-tools`, six phases, finished 3 October 2026 (NZ). **Nothing has been
deployed.** `main` was never committed to; there's no pull request, tag or force-push. Every commit
is by `NZ-EVONY <221470641+NZ-EVONY@users.noreply.github.com>` with no trailers.

Honesty buckets: **VERIFIED** (ran it; output quoted), **IMPLEMENTED, NOT TESTED**, **NOT VERIFIED**
(with the reason).

## 1. What exists

- **42 HTML pages** (the brief said about 41): home, 5 hubs, 16 tools, 4 text landings, 10 guides,
  4 trust pages (About, Contact, Privacy, Terms), `/sitemap` and the 404 page. That's 40 indexable
  pages in `sitemap.xml`, plus the noindex 404. There are 67 files in `public/`.
- **Tools (20 in the registry, all published):** take-home pay (PAYE), KiwiSaver, GST, flatmate
  splitter, unit converter; days between dates, age, add or subtract days, working days, time
  zones, countdown; printable calendar, weekly planner and timetable, checklist; text cleaner and
  word counter, plus the four text landings.
- **Data:** `data/nz/tax-2026-27.json`, `gst.json`, `public-holidays.json` (2026 and 2027),
  `daylight-saving.json`, `units.json`; 28 sources in `data/sources.json`, each with its URL and
  retrieval date. Expiry checks stop the build when the tax year ends or the current holiday year
  is missing.
- **Docs:** STATUS, DECISIONS, UNVERIFIED, OWNER-TODO, DESIGN, DEPLOY, DATA-SOURCES, CONTENT-LOG,
  SEARCH-SPOTCHECK, this report, and an empty `deploy-log.md`; plus README, THIRD_PARTY and CLAUDE.md
  (40 lines).

## 2. Test results (VERIFIED, run 3 October 2026 on the final commit's content)

| Command | Result |
|---|---|
| `npm test` (build, unit, build output, content) | tests 84, **pass 83, fail 0**, 1 skipped: the personal-name scan, which needs `NAME_DENYLIST` set on the owner's machine |
| `npm run regression` | tests 5, **pass 5, fail 0** |
| `npm run test:e2e` (headless Chromium) | tests 24, **pass 24, fail 0**, about 249 s |
| `npm run check:links` | "42 pages; 0 broken links; 0 orphans." |
| `npm run check:deploy` | "OK: 67 files in public/; manifest current; no placeholders, ad code or private files; data in date." |
| `npm run dry-run` (Wrangler 4.145.0) | "Read 70 files from the assets directory", "No bindings found.", "--dry-run: exiting now." Wrangler doesn't list the files. `public/` was checked directly: 67 files in three subfolders (`assets`, `assets/js`, `guides`), and 70 = 67 + 3 is the likely explanation. `.assetsignore` keeps `_headers` and similar files from being served. |
| `wrangler dev --local` | `/` 200; `/gst-calculator.html` and `/gst-calculator/` 307 to `/gst-calculator`; `/no-such-page` 404; CSP and `nosniff` headers present |
| e2e: same-origin requests | every request on every page is same-origin |
| e2e: axe | no serious or critical issues on any page, light and dark |
| e2e: layout | no horizontal scroll at 360 px; CLS under 0.02 on every page |
| `npm run report:content` | every page in range; highest similarity 0.067 (limit 0.2); opener diversity 100%; 0 repeated 8+ word sentences |

There's no `.only` and no skipped test apart from the owner-only name scan. The PAYE fixtures
match all 27 IR340/IR341 rows (21 PAYE table rows and 6 secondary-code rows), plus 4 IRD worked
examples; 3 further rows are labelled "hand-computed (not from IRD)".

## 3. Lighthouse and budgets (VERIFIED, lab data)

`npm run lighthouse`: mobile emulation, simulated throttling, local server.

| URL | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| / | 100 | 100 | 100 | 100 | 1.4 s | 0 | 0 ms |
| /nz-paye-calculator | 100 | 100 | 100 | 100 | 1.3 s | 0 | 0 ms |
| /kiwisaver-calculator | 100 | 100 | 100 | 100 | 1.5 s | 0 | 0 ms |
| /working-days-calculator | 100 | 100 | 100 | 100 | 1.4 s | 0 | 0 ms |
| /printable-calendar | 100 | 100 | 100 | 100 | 1.5 s | 0 | 0 ms |
| /text-cleaner | 100 | 100 | 100 | 100 | 1.3 s | 0 | 0 ms |
| /guides/working-days-and-public-holidays-in-nz | 100 | 100 | 100 | 100 | 1.4 s | 0 | 0 ms |
| /privacy-policy | 100 | 100 | 100 | 100 | 1.2 s | 0 | 0 ms |
| /guides/how-nz-paye-is-worked-out | 100 | 100 | 100 | 100 | 1.4 s | 0 | 10 ms |
| /guides/printing-calendars-and-planners-at-home | 100 | 100 | 100 | 100 | 1.4 s | 0 | 0 ms |
| /sort-lines-alphabetically | 100 | 100 | 100 | 100 | 1.3 s | 0 | 0 ms |

The local server doesn't compress responses (Cloudflare does), has no network latency and no
edge cache, so production LCP may differ. Field data will only exist after launch.

| Budget | Limit | Measured (largest) |
|---|---|---|
| HTML per page, gzip | 60 KB | 8.6 KB (`/nz-paye-calculator`) |
| CSS, gzip | 12 KB | 10.9 KB (one stylesheet) |
| JS per page, gzip | 15 KB | 6.2 KB (site 1.4 KB + KiwiSaver 4.8 KB); the text Worker (2.6 KB) loads only for large input |
| Web fonts | none | none |

## 4. Page inventory (prose words from `report:content`)

| Page | Type | Words |
|---|---|---|
| / | home | 356 |
| /add-subtract-days | tool | 504 |
| /age-calculator | tool | 543 |
| /countdown-timer | tool | 515 |
| /days-between-dates | tool | 639 |
| /flatmate-rent-splitter | tool | 656 |
| /gst-calculator | tool | 726 |
| /kiwisaver-calculator | tool | 644 |
| /nz-paye-calculator | tool | 768 |
| /printable-calendar | tool | 523 |
| /printable-checklist | tool | 506 |
| /text-cleaner | tool | 576 |
| /time-zone-converter | tool | 580 |
| /unit-converter | tool | 575 |
| /weekly-planner-and-timetable | tool | 518 |
| /word-and-character-counter | tool | 524 |
| /working-days-calculator | tool | 524 |
| /add-text-to-start-and-end-of-lines | landing | 512 |
| /remove-blank-lines | landing | 524 |
| /remove-duplicate-lines | landing | 532 |
| /sort-lines-alphabetically | landing | 671 |
| /guides/cleaning-messy-lists-of-text | guide | 831 |
| /guides/gst-in-new-zealand-adding-and-removing-15-percent | guide | 727 |
| /guides/how-nz-paye-is-worked-out | guide | 944 |
| /guides/how-to-count-days-between-two-dates | guide | 844 |
| /guides/kiwisaver-contributions-explained | guide | 762 |
| /guides/new-zealand-time-zones-and-daylight-saving | guide | 814 |
| /guides/nz-tax-codes-explained | guide | 749 |
| /guides/printing-calendars-and-planners-at-home | guide | 802 |
| /guides/splitting-rent-and-bills-between-flatmates | guide | 903 |
| /guides/working-days-and-public-holidays-in-nz | guide | 942 |
| /date-and-time-tools | hub | 374 |
| /guides | hub | 366 |
| /nz-calculators | hub | 401 |
| /printables | hub | 334 |
| /text-tools | hub | 318 |
| /about | trust | 388 |
| /contact | trust | 350 |
| /privacy-policy | trust | 635 |
| /terms | trust | 401 |

`/sitemap` (a list page) and the 404 page aren't counted.

## 5. Not verified

- **Matariki dates against the Act.** legislation.govt.nz couldn't be read from this session (a bot
  check). The dates come from MBIE, and the Ministry of Education's term-dates page lists the same
  dates.
- **MBIE's 2027 table has no year label.** The dates match MBIE's rules and the Ministry of
  Education's 2027 term page.
- **Real Cloudflare behaviour**: custom domains, DNS records created, edge headers, compression,
  managed `robots.txt`, and the effect on Email Routing. Only `dev --local` and `--dry-run` were run.
- **Other browsers and devices**: Firefox and Safari printing and text performance, real phones,
  screen readers, 200% zoom by hand. Only headless Chromium was used.
- **Real printers.** Page size and page count were checked only in Chromium's PDF output.
- **IRD's online PAYE calculator** wasn't compared; the IR340/IR341 tables were.
- **Search**: indexing, rich results, the search spot-check (`docs/SEARCH-SPOTCHECK.md`, yours to
  fill in), AdSense review.
- **The personal-name scan** runs only where `NAME_DENYLIST` is set (your machine).
- **Legal review** of Privacy and Terms (they are templates).
- **Changes to official pages** after 3 October 2026.

Full list with reasons: `docs/UNVERIFIED.md`.

## 6. Known weaknesses

- **Several tool pages are close to the 500-word floor**: add-subtract-days (504), printable
  checklist (506), the add-text landing (512) and weekly planner (518). They're accurate, but would
  benefit from one more real example each.
- **The guides use 2027 dates in their examples.** They go draft automatically if the 2027 holiday
  data is removed, but they need a manual review each year (`docs/DEPLOY.md` section 8).
- **School term dates are typed into the printing guide**, not held in `data/`, so they aren't
  covered by the expiry checks.
- **No analytics.** You won't know which pages are used until Search Console data arrives. This is
  deliberate, to match the privacy policy.
- **The KiwiSaver projection** is illustrative only and depends on the visitor's own return
  assumption. It's correct, but it's the tool most likely to be misread.
- **The About page no longer carries the AI-assistance line.** It was removed in Phase 2 at your
  request; the checklist's item 5 assumed it would be there.

## 7. Review checklist, mirrored

| Checklist item | State |
|---|---|
| 0. Branch, identity, no trailers, no PR, tags or force-push | VERIFIED: 7 commits, all `NZ-EVONY` noreply, 0 "Co-authored-by" |
| 0. Docs set complete, CLAUDE.md < 60 lines | VERIFIED (40 lines) |
| 0. Nothing deployed, no CI workflow | VERIFIED: no `.github/workflows`; only `dev --local` and `--dry-run` |
| 0. No secrets | VERIFIED: the grep finds only test strings named "secret" in e2e tests; `.wrangler/`, `.dev.vars`, `reports/` gitignored |
| 0b. Organization-only JSON-LD, no `TODO-OWNER` in `public/` | VERIFIED: 0 `Person`, 0 `TODO-OWNER` in `public/` |
| 0b. Personal-name scan | NOT VERIFIED here (needs your `NAME_DENYLIST`) |
| 2. Every figure has a `sourceId`, official hosts only | VERIFIED by `tests/unit/data.test.mjs` |
| 2. Money pages show tax year, checked date, source and the not-advice note above the explainer | VERIFIED by build tests |
| 2. Expiry checks fail the build | VERIFIED by `tests/build/rebuild.test.mjs` (injected dates) |
| 2. IR340/IR341 fixtures | VERIFIED: 27 of 27 rows match |
| 3. Same-origin only, CSP without third parties, one inline script, no inline styles | VERIFIED (e2e and build tests) |
| 4. Tools behave as described | VERIFIED in e2e for the main paths; your hands-on check is still on the list |
| 5. Word ranges, similarity, banned phrases | VERIFIED (`report:content`, content tests) |
| 6. One h1, canonical, title and description limits, sitemap, robots, real 404 | VERIFIED (build tests, `dev --local`) |
| 7. Ads off, `ads.txt` comment-only, no ad code | VERIFIED (build test and `check:deploy`) |
| 8. Lighthouse 100 on the listed URLs; axe zero serious or critical | VERIFIED (lab) |
| 9. Windows-safe names, `.gitattributes`, `public/` ≤ 1,000 files | VERIFIED (build test; 67 files) |
| 10. Deploying | Yours: `docs/DEPLOY.md` |

## 8. The ten most important manual checks for you

1. Read **five random pages end to end** (include one money tool, one landing and one guide) as if
   you were an AdSense reviewer.
2. **Re-check five tax figures against IRD** on deploy day: a bracket threshold, the ACC rate and
   cap, the student loan threshold ($24,128), the KiwiSaver rate options, the GST rate.
3. Compare **two take-home pay results** with IRD's own PAYE calculator, one of them with a
   secondary code.
4. Check the **2026 and 2027 holidays** (Anzac Day, Boxing Day, Matariki, two anniversary days)
   against Employment New Zealand, and Matariki against the Act.
5. Confirm **nothing else is attached to `myaddr.app`**, and record the MX and Email Routing
   records, before `wrangler deploy`.
6. After deploy, **send a test email to `nz@myaddr.app`**, then do the dashboard tasks in
   `docs/DEPLOY.md` section 6 (Bot Fight Mode off, Rocket Loader off, and the rest).
7. **Print** a calendar, a planner and a checklist on your own printer, double-sided once.
8. Run `npm ci; npm test; npm run regression; npm run check:deploy` yourself, with
   `NAME_DENYLIST` set so the name scan runs.
9. Fill in **`docs/SEARCH-SPOTCHECK.md`** and decide on the privacy-controller question with
   advice; have Privacy and Terms reviewed.
10. Use the **text cleaner with 100,000 pasted lines** and the take-home pay calculator on your
    phone, keyboard-only once on a computer.
