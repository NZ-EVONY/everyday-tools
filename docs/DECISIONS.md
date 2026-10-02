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
