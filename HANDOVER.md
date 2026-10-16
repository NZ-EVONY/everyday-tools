# Everyday Tools handover

Written 16 October 2026 for whoever picks up this site next. Read this first, then `CLAUDE.md`.
Facts marked **(checked 16 Oct)** were confirmed against the live site and GitHub on that date.

## 1. What this is

Everyday Tools is a live static site at **https://myaddr.app**: free single-purpose tools for New
Zealand. It has NZ calculators (take-home pay/PAYE, KiwiSaver, GST, flatmate rent splitter, unit
converter), date and time tools, printables, text tools and a fancy text generator, plus guides,
hubs and four trust pages. It is run by an independent publisher in New Zealand (always say it that
way; never use a personal name). Contact: `nz@myaddr.app`. NZ English.

Hosting: Cloudflare Workers **static assets only** (Worker `everyday-tools`, `wrangler.jsonc`,
routes `myaddr.app` and `www.myaddr.app`; `www` 301s to the apex). No server code, database,
analytics or ads.

## 2. Where things stand (checked 16 Oct)

| Item | State |
|---|---|
| Repo | `NZ-EVONY/everyday-tools` (**public**) |
| Live build | Branch **`build/everyday-tools`** at `ce794bb` (Phase 7). The live home page loads `/assets/style.19238df39b.css`, the same file this commit has in `public/`, and `/fancy-text-generator` returns 200. |
| `main` | Only the initial commit. Nothing is merged; the site is deployed from the build branch. |
| Deploy record | `docs/deploy-log.md` is empty; the dates come from `docs/STATUS.md` and the live site. |
| Tests | `npm test` 106 pass, 1 skipped (the personal-name scan, which needs `NAME_DENYLIST` set on the owner's machine), 0 fail (16 Oct, Linux, Node 22). Phase 7 run (2 Oct): regression 6/6, e2e 30/30, Lighthouse mobile 100 x4 on the new pages. |
| Look | Letterpile "Night Edition" palette (navy, electric blue, violet), **dark by default for everyone**; light via the header toggle (saved as `et-theme`). The `design/` mockups are the older approved look, kept as history. |
| Pages | 46 HTML pages including the 404 (23 tools in `config/tools.json`, all published). |

The owner rewrote this repo's history in October 2026 (all commits by `NZ-EVONY`). If you have an
older clone, clone again.

## 3. Read in this order

1. `CLAUDE.md`: purpose, stack, commands, conventions.
2. `docs/STATUS.md`, then `docs/FINAL-REPORT.md` (what exists, test tables, page inventory,
   known weaknesses, the owner's ten manual checks).
3. `docs/DECISIONS.md` (one line per default; phases in order, palette change near the end).
4. `docs/UNVERIFIED.md`, `docs/OWNER-TODO.md`, `docs/DATA-SOURCES.md`, `docs/CONTENT-LOG.md`.
5. `docs/DEPLOY.md`: the owner's PowerShell runbook, including the yearly data updates.

## 4. Rules that must not be broken

- **Never deploy or touch Cloudflare.** The owner deploys. Allowed: `wrangler --version`,
  `npm run dev` (`wrangler dev --local`, never `--remote`), `npm run dry-run`
  (`wrangler deploy --dry-run --outdir .wrangler-dry`) and `wrangler types`. Never `deploy`,
  `versions`, `rollback`, `delete`, `login`, `whoami`, `secret`, `kv`, `r2`, `d1` or `tail`. Don't
  read `.wrangler/`. No CI or deploy workflow files.
- **Git:** commit only as `NZ-EVONY <221470641+NZ-EVONY@users.noreply.github.com>`, set
  repo-locally. No `--author`, no `Co-authored-by`, session or "on behalf of" trailers, no AI wording
  in commit messages, and never write any other identity or any absolute local path into a file,
  doc or commit. Don't commit to `main`; no force-push, history rewriting, pull requests or tags
  unless the owner asks. The repo is public: every commit is published.
- **No personal names anywhere public.** `site.config.json`: brand, publisherName and authorName
  "Everyday Tools", operatorName "an independent publisher", contactEmail `nz@myaddr.app`,
  governingLaw New Zealand, siteUrl `https://myaddr.app`. JSON-LD author and publisher are
  Organizations. `TODO-OWNER:` markers only in source and `docs/OWNER-TODO.md` (the build strips them).
- **No AI-assistance wording on any page.**
- **No third-party request of any kind at runtime.** Typed text is never stored or sent. Settings go
  only in the URL fragment (`#...`), and never free text. Favourites (fancy text) and the theme are
  the only localStorage keys.
- **Official data only for money, tax and holidays.** Every figure lives in `data/` with a
  `sourceId` into `data/sources.json` (govt.nz hosts only; `kind: "units"` also allows nist.gov and
  legislation.gov.uk) and a retrieval date. Anything unconfirmed goes in `docs/UNVERIFIED.md` and
  its page stays `status: "draft"`. Never hard-code a rate in `src/` or `content/`. Don't copy
  wording from sources.
- Content rules enforced by tests: word ranges per page type (`config/quality.json`), similarity
  limits, banned filler phrases, no typed "%" in prose (use `ctx.pct()`, write "100 per cent"), no
  claims of being official or government-approved, no unrendered `${`, `undefined` or `NaN`.
- CSP: one hashed inline script (the theme script), no `style=` attributes, no `innerHTML` with
  user text. Windows-safe file names. `public/` is generated: rebuild and commit it with the change.
- Report in three buckets: **VERIFIED** / **IMPLEMENTED, NOT TESTED** / **NOT VERIFIED**. Never say
  "all tests pass" unless you just ran them.

## 5. Working on it

```
npm ci
npm test                # build + unit + build-output + content tests
npm run regression      # URL manifest, golden PAYE and output values
npm run test:e2e        # Chromium: tools, printing (PDF), axe light/dark, CLS, 360px, privacy
npm run lighthouse      # 8 URLs by default
npm run check:contrast  # contrast of every text style, light and dark
npm run check:glyphs    # fancy-text characters drawn as boxes in headless Chromium
npm run report:content  # word counts, similarity, opener diversity
npm run check:links     # broken links and orphans
npm run check:deploy    # pre-deploy gate
npm run dry-run
npm run serve           # http://localhost:8788
```

Browser tests need Chromium (`playwright-core`; set `CHROME_PATH` if it isn't found). Develop on
`build/everyday-tools` or a branch from it; push only when the owner asks.

### Gotchas
- **The build depends on today's date.** Expiry checks read the NZ date (tests inject `ET_TODAY`),
  and the time-zone page bakes in the current Sydney offset, so building on another day changes
  `public/time-zone-converter.html`. Rebuild before any deploy, and don't commit date-only churn
  unless you mean to.
- **New page = add its URL to `tests/regression/urls.json`**, or the regression test fails.
- Internal links in copy use `ctx.link(href, text)`; links to unpublished pages render as plain text.
- PAYE follows IRD's Payroll calculations and business rules specification 2026-27 exactly and
  matches all 27 sampled IR340/IR341 rows; don't "simplify" the truncation steps.
- Big text inputs (over 200,000 characters) run in a Web Worker; the cap is 2,000,000.

## 6. Dates that will break the build

- **1 March 2027:** the build warns; **from 1 April 2027 it fails** until
  `data/nz/tax-2027-28.json` exists and is added to `config/data.json` (`docs/DEPLOY.md` section 8).
- **1 September 2027:** warns; **1 January 2028 fails** until the 2028 public holidays (MBIE table)
  are in `data/nz/public-holidays.json`.
- The holidays and printing guides use 2027 dates in their examples; review them each year.
- Before August 2028: Employment New Zealand says the Employment Leave Act replaces the Holidays
  Act; review the holidays copy.

## 7. Open items and known weaknesses

- Owner to-dos (`docs/OWNER-TODO.md`): search spot-check, comparing take-home pay with IRD's own
  calculator, Matariki dates against the Act, printing on a real printer, a legal review of Privacy
  and Terms, Search Console, and AdSense with a TCF v2.3 consent platform (`adsLive` is false; no
  ad code).
- Several tool pages sit just above the 500-word floor (add-subtract-days, printable checklist,
  the add-text landing, weekly planner).
- School term dates are typed into the printing guide (sourced, but not covered by the expiry checks).
- Not verified: Safari and Firefox printing, real devices, screen readers, how fancy-text
  characters render on other systems (`docs/UNVERIFIED.md`).
- `docs/deploy-log.md` is empty; ask the owner to fill it in after each deploy.

## 8. The owner's other site

**Letterpile** (word-game tools, https://letterpile.app) lives in `NZ-EVONY/websites`, folder
`Letterpile/`, with its own `HANDOVER.md`. The two sites share the Night Edition palette.
The domain name `myaddr.app` is historical: an older, stopped "MyAddr" project in the `websites`
repo once planned to use it. It now belongs to Everyday Tools.
