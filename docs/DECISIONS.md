# Decisions

One line per default chosen during the build (owner can overrule any of them).

## Phase 1
- Branch `build/everyday-tools` from `origin/main`; repo-local git identity as the brief specifies.
- `compatibility_date` 2026-09-01 in `wrangler.jsonc` (accepted by Wrangler 4.145.0 in dry-run).
- Cloudflare limits re-read from the cloudflare-docs source on 2 October 2026: 20,000 files per Worker version (free plan), 25 MiB per file, `_headers` 100 rules and 2,000 characters per line, static asset requests free. No differences from the brief.
- Single-column layout, ~720px text width, teal accent (`#0b6b61` light, `#4fc1b1` dark); no sidebar.
- Navigation and footer show only pillar hubs that are published, so there are never links to pages that don't exist yet; home cards show "(coming soon)" for the rest.
- Internal links in content go through `ctx.link()`, which renders plain text until the target page is published.
- Each data section carries one `sourceId` for all its figures (they come from the same page); extra sources are named per field (`tableSourceId`, `employerSourceId`, `governmentSourceId`).
- Sources must be on a `govt.nz` host; the build fails otherwise.
- Holiday data for 2026 was added in Phase 1 (from MBIE) so the expiry check runs on real data; 2027 is left out (see UNVERIFIED).
- `observedForMonFri` stores MBIE's observed date for a Monday-to-Friday worker (the Mondayised date for weekend Anzac Day, Waitangi Day, Christmas, Boxing Day and the New Year days).
- Money is handled in whole cents with half-away-from-zero rounding (`divRound`), never floating-point dollars.
- GST is removed as inclusive × rate ÷ (1 + rate), which equals 3/23 at 15%, matching IRD's $100 → $13.04 example.
- Line items round GST per line and also show GST worked out once on the total, with the difference explained, because accounting packages differ.
- **IRD tables drop fractions of a cent from KiwiSaver deductions** ($465 × 3.5% = $16.275 shown as $16.27; $2,015 × 3.5% = $70.525 shown as $70.52). The take-home pay calculator (Phase 2) will truncate KiwiSaver to match.
- Weekly PAYE in the IR340 table at the bottom bracket equals the annualised tax plus ACC divided by 52 ($300 → $36.75). Monthly rows differ by a few cents ($1,500 → $197.73 vs $197.75 annualised); the per-period approach is worked out in Phase 2.
- Data-derived percentages are wrapped in `<span class="dv">` so the content test can forbid typed-in percentages; "0%" for zero-rated supplies is written as "a rate of zero" because it isn't stored in data.
- The GST calculator keeps only the add/remove choice in the URL fragment (`#remove`); amounts and descriptions are never put in the URL or stored.
- `ET_TODAY` environment variable overrides "today" for the build's expiry checks; it exists only for tests.
- Prose word counts exclude headings, tables, the tool card, the source notice, related links and FAQ questions (answers count).
- The HTML `/sitemap` page was built in Phase 1 because the footer links to it.
- Out of scope, possible later: fancy-font generators and Instagram caption spacers (not built).

## Phase 2
- The owner approved the design in `design/` (commit `98b648c`); all pages were restyled to it, including the Phase 1 pages. Its CSS is used as-is, with additions at the end of `style.css` for components the mockups don't show.
- The approved design has a sticky header. The brief's "no sticky bars" is read as no sticky ads, banners or cookie bars; the header stays sticky because the owner approved it.
- Mockup copy was treated as placeholder text. Where it differed from what the sources say, the sourced wording was kept (for example the mockup listed residential rent as exempt, which wasn't checked).
- The GST calculator now uses the mockup's line-item layout. The headline GST is worked out once on the sum of the lines; per-line rounding is shown in a breakdown with any difference explained.
- A tool registry (`config/tools.json`) drives home cards, hub cards and search; unpublished tools show as "Coming soon" without links. Home search filters cards in the page and never makes a request.
- Navigation and footer still list only published hubs, so the five-pillar menu in the mockup appears as hubs go live.
- The "Written with AI assistance and reviewed by the publisher." line and its TODO-OWNER marker were removed from `/about` at the owner's request.
- Student loan threshold $24,128 for 2026-27, confirmed by the owner and by IRD's Payroll calculations and business rules specification 2026-27 (section 2.2).
- **PAYE follows IRD's Payroll calculations and business rules specification 2026-27 exactly** (annualise and drop cents; tax plus ACC; divide by 52 and truncate; convert to the period and truncate; secondary codes at a flat rate plus ACC on whole dollars). It reproduces all 21 sampled IR340/IR341 main-code rows (M, ME, SL, five KiwiSaver columns, net CEC) and 6 secondary rows (5 codes plus SL) to the cent.
- No "ACC on/off" switch: employees always pay the ACC earners' levy through PAYE, so a switch would produce numbers no payroll uses. The ACC part is shown separately instead.
- Tax codes offered: M, ME, SB, S, SH, ST, SA, each with optional SL. Tailored codes, ND, NSW, CAE, EDW and WT are out of scope and listed in the page's limits.
- ME (independent earner tax credit) uses the spec's thresholds ($24,000 to $70,000, $520, 13c abatement from $66,000) and IRD's IETC page for eligibility; the page tells people who can't use it.
- An annual salary is converted to per-period pay by dividing and rounding to the cent; payroll systems may differ by a cent (stated on the page).
- Employer KiwiSaver contribution and ESCT: ESCT is worked on the whole-dollar part of the contribution (spec 5.20.6), matching IRD's "Net CEC" columns. The ESCT band uses this year's salary plus employer contributions as an estimate (IRD uses the previous year's figure).
- KiwiSaver projection runs only when the visitor enters a return; no default return is shown. Contributions are assumed constant and added once a year; fees as a percentage of balance and/or a fixed yearly amount.
- KiwiSaver government contribution: 25c per $1 of member contributions (employee plus voluntary), capped at $260.72, only if the visitor ticks the age/conditions box and income is $180,000 or less.
- Flatmate splitter uses largest-remainder rounding (ties to the earlier person); bills split equally by default; "days present" weights both rent and bills. No tenancy-law claims.
- Unit sources may be non-NZ official bodies (NIST, UK legislation); the source check allows those hosts only for sources marked `kind: "units"`. Money, tax and holiday sources must still be govt.nz.
- Exact unit definitions come from the UK Weights and Measures Act 1985 Schedule 1 (yard, pound, imperial gallon, stone, acre) and NIST; US volume units (gallon, cup, fluid ounce, teaspoon, tablespoon) and the knot use NIST's published rounded factors and are labelled "rounded". The metric cup is left out because none of the fetched sources define it.
- Results in the unit converter show 6 significant figures.
- Settings that go in the URL fragment: GST add/remove; PAYE per/period/code/KiwiSaver/SL; splitter method; unit category and units. Typed amounts, names and descriptions never do.
- Prose word counts and similarity now also exclude the card grids, the meta chips and the related-links aside (shared navigation, not page copy).
