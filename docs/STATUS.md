# Status

**Phases 1 to 7 done.** Phases 1 to 6 and the palette change were deployed by the owner on 3 October 2026 (see below). Phase 7 (fancy text and name styler) is built on the branch and **not deployed**; it waits for the owner's "continue". The owner deploys with `docs/DEPLOY.md`; results and open items are in `docs/FINAL-REPORT.md`.

## Built
- Phase 1 foundation (build, data, expiry checks, trust pages, tests), restyled in Phase 2 to the
  approved design in `design/`.
- NZ calculators, all published: `/nz-paye-calculator` (IRD payroll method, matches IR340/IR341),
  `/kiwisaver-calculator`, `/gst-calculator` (line items), `/flatmate-rent-splitter`, `/unit-converter`.
- Date and time tools: days between dates, age, add or subtract days, working days (MBIE holidays 2026 and 2027), time zone converter, countdown timer.
- Printables: calendar (month, 12 pages, year on one page), weekly planner and timetable, checklist; A4 and US Letter, PDF-tested.
- Text tools: text cleaner, four landings (remove duplicate lines, remove blank lines, sort lines alphabetically, add text to start and end of lines), word and character counter; Web Worker for large input.
- Fancy text and name styler (Phase 7): `/fancy-text-generator` (32 styles plus plain text, 45 frames, length filter, favourites in localStorage), landings `/name-styler-for-games` and `/fancy-text-for-bios`, and the guide `/guides/unicode-fonts-and-fancy-text-explained`.
- Ten guides under `/guides/` (PAYE, tax codes, KiwiSaver, GST, flatmates, working days and holidays, counting days, time zones, printing, cleaning text), each linked from its tools and hub.
- Hubs `/nz-calculators`, `/date-and-time-tools`, `/printables`, `/text-tools` and `/guides`, home with tool search, `/sitemap`, 404.
- Tool registry `config/tools.json` for all 23 tools (unpublished ones show "Coming soon").

## Phase 6
Lighthouse 100/100/100/100 on the eight listed URLs (plus three changed pages), axe clean, CLS under 0.02, budgets met; `DEPLOY.md`, `FINAL-REPORT.md`. The PAYE guide gained a second-job and student loan example; the printing guide now covers the New Zealand year (A4, 2027 holidays, school terms); `/sort-lines-alphabetically` was expanded.

## Open questions for the owner
See `docs/OWNER-TODO.md` ("Now") and `docs/UNVERIFIED.md`.

- 2026-10-03: Letterpile palette and dark-by-default theme applied (see DECISIONS). npm test, regression, e2e (axe, dark and light), Lighthouse 100 x4, check:contrast and check:deploy pass locally; deployed to the `everyday-tools` Worker.

## Phase 7
Fancy text and name styler, two landings and one Unicode guide, all published. Style mappings are tested against the Unicode Character Database 18.0.0 (names, decompositions, NamesList cross-references) and against Node's NFKC. `npm test` 105 pass / 1 skipped (name denylist, owner-only), regression 6/6, e2e 30/30, Lighthouse mobile 100/100/100/100 on the four new pages plus `/text-tools` and `/`, `check:deploy` OK. New command: `npm run check:glyphs`.
