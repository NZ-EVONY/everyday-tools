# Everyday Tools

Free, private, single-purpose tools for everyday jobs in New Zealand: NZ calculators (GST,
take-home pay, KiwiSaver, rent splitting, units), date and time tools, printables and text
tools. A static site: a Node script builds `public/`, which Cloudflare Workers static assets
serves. Nothing a visitor types leaves their browser.

## Quick start
```
npm ci
npm test            # build + unit + build-output + content tests
npm run serve       # preview public/ at http://localhost:8788
```
Other commands are listed in `CLAUDE.md`. Deployment is done by the owner only, following
`docs/DEPLOY.md` (written in the final phase).

## Where things are
- `content/`: page modules (text and structure). `data/`: official figures with sources.
- `src/`: templates, CSS and browser scripts. `scripts/`: build, checks and reports.
- `public/`: generated output, committed so every change to the live site is reviewable.
- `docs/`: status, decisions, unverified items, the owner's to-do list and data sources.

## Legal pages
The privacy policy, terms of use, about and contact pages are good-faith templates written
for this site. **They are not legal advice.** Have them reviewed before launch, and see
`docs/OWNER-TODO.md` for the open questions (including the "identifiable controller" question
under the NZ Privacy Act and GDPR).

## Data
Every tax, levy, KiwiSaver, GST and holiday figure comes from an official New Zealand
government page, recorded in `data/sources.json` and listed in `docs/DATA-SOURCES.md`. The build
fails when a tax year has ended or the current year's public holidays are missing.
