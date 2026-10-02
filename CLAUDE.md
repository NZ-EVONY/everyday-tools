# Everyday Tools: notes for Claude Code

Read `docs/STATUS.md` first: it says which phase the build is in and what is next.

## Purpose
A static, ad-supported hub of free single-purpose tools for New Zealand (NZ calculators, date and
time tools, printables, text tools), built by a Node script into `public/` and served as
Cloudflare Workers static assets. No server, no database, no third-party requests.

## Stack
Node >= 20, ES modules, hand-written generator, zero runtime dependencies. Dev dependencies:
wrangler, playwright-core, axe-core, lighthouse (pinned).

## Commands
- `npm run build`: writes `public/` and `public-manifest.json` (commit both)
- `npm test`: build + unit + build-output + content tests
- `npm run regression` / `npm run test:e2e` / `npm run lighthouse`
- `npm run report:content`, `npm run report:claims`, `npm run check:links`
- `npm run check:deploy`: pre-deploy gate; `npm run dry-run`: `wrangler deploy --dry-run`
- `npm run dev`: `wrangler dev --local` (never `--remote`)

## Conventions
- Never deploy, never touch Cloudflare, never commit to `main`. Work on the build branch.
- Money, tax and holiday figures live only in `data/` with a `sourceId` into
  `data/sources.json` (official govt.nz pages). Never hard-code a rate in `src/` or `content/`.
  Unconfirmed figure -> `docs/UNVERIFIED.md` and the page stays `status: "draft"`.
- Content modules (`content/pages`, `content/guides`) export `default (ctx) => page`.
  Use `ctx.link()` for internal links (plain text until the target is published),
  `ctx.pct()` for data-derived percentages, `ctx.taxNotice()` on NZ money pages.
- Tool logic goes in pure modules in `src/assets/lib/` (unit-tested); `src/assets/js/<tool>.js`
  wires the page and is bundled by `scripts/lib/bundle.mjs`.
- No inline styles, one inline script (theme), no `innerHTML` with user text.
- Typed input is never sent, stored or put in the URL; settings only in the `#fragment`.
- No personal names anywhere; JSON-LD author/publisher is the Organization. `TODO-OWNER:`
  markers only in source and `docs/OWNER-TODO.md` (the build strips them).
- Windows-safe file names; NZ English; no filler phrases; no invented statistics.

## Honesty buckets for reports
VERIFIED (ran it, quote output) / IMPLEMENTED, NOT TESTED / NOT VERIFIED (say why).
