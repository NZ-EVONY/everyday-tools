# Status

**Phase 1 (Foundation): done, waiting for the owner's "continue".** Next: Phase 2 (NZ calculators).

## Built
- Build pipeline (`scripts/build.mjs`): content modules + templates + data → `public/`, hashed
  assets, a tiny bundler for tool scripts, `_headers` with CSP hash, robots, sitemap, ads.txt
  placeholder, 404, HTML sitemap, `public-manifest.json`; fails on expired data, unknown sources,
  placeholders, inline styles, TODO-OWNER in output, reserved Windows names, forbidden files.
- Data layer: `data/sources.json`, `data/nz/tax-2026-27.json`, `data/nz/gst.json`,
  `data/nz/public-holidays.json` (2026), all from official pages fetched 2 October 2026.
- Expiry checks (tax year, holidays) with injectable dates; `check:deploy`.
- Pages: home, `/gst-calculator` (pilot tool), `/nz-calculators` and `/guides` hubs,
  `/privacy-policy`, `/terms`, `/about`, `/contact`, `/sitemap`, 404.
- Ad/CMP integration points (comments only); every ad page type `enabled: false`.
- Tests: unit (money/GST, data and expiry, official IR340/IR341 rows, Windows names), build
  output, identity, content quality, rebuild-with-changed-data, regression, e2e (Chromium).

## Draft / not started
Phases 2-6: the other 15 tools, 4 text-cleaner landings, 3 hubs, 10 guides, `docs/DEPLOY.md`,
`docs/FINAL-REPORT.md`.

## Open questions for the owner
See `docs/OWNER-TODO.md` ("Now" section) and `docs/UNVERIFIED.md`.
