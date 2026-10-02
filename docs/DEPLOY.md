# Deploying Everyday Tools (owner's runbook)

Claude Code never deploys. You run every command below yourself, in **PowerShell**, from the
repo root. The site is Cloudflare Workers **static assets only**: no Worker script, no bindings,
no secrets. `wrangler deploy` uploads `public/` and attaches `myaddr.app` and `www.myaddr.app`.

Cloudflare facts re-read on 3 October 2026 (developers.cloudflare.com): requests to static
assets are free and unlimited; 20,000 files per Worker version on the free plan; 25 MiB per
file; `_headers` up to 100 rules, 2,000 characters per line; a Custom Domain makes Cloudflare
create the DNS record and certificate, and **can't be created on a hostname that already has a
CNAME record**. This site uses 67 files and 3 header rules.

---

## 1. Before deploy day

| Check | How | Why |
|---|---|---|
| Nothing else owns `myaddr.app` | Dashboard → Workers & Pages: no other Worker or Pages project lists `myaddr.app` or `www.myaddr.app` under Domains & Routes. Dashboard → DNS: note any A, AAAA or CNAME on `myaddr.app` and `www`. | An earlier address-format plan targeted the same domain. Decide which site owns it first. An existing CNAME blocks the Custom Domain. |
| Record the email set-up | Dashboard → Email → Email Routing: screenshot the MX and TXT records and the `nz@myaddr.app` rule. Or run `Resolve-DnsName myaddr.app -Type MX` and `Resolve-DnsName myaddr.app -Type TXT` and save the output. | Attaching the domain creates DNS records; you'll compare against this afterwards. |
| Choose the branch | Deploy from `build/everyday-tools`, or merge it into `main` first (your choice, via a pull request you open). | Whatever is checked out is what gets uploaded. |

## 2. Pre-deploy checks (deploy day)

```powershell
git fetch origin
git switch build/everyday-tools      # or main, if you merged
git pull
git status                           # must say "nothing to commit, working tree clean"
node -v                              # 20 or later
npm ci
npm test                             # expect: pass 83, fail 0 (or more passes if tests were added)
npm run regression                   # expect: pass 5, fail 0
npm run check:deploy                 # expect: "OK: 67 files in public/ ..."
npm run dry-run                      # expect: "Read ... files from the assets directory", "No bindings found."
git status                           # still clean: the build must not have changed public/
```

Optional, needs Chrome or Edge installed:

```powershell
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
npm run test:e2e                     # expect: pass 24, fail 0
npm run lighthouse                   # eight URLs; scores print in a table
```

If `check:deploy` or `npm run build` fails with a date message, the tax year or the holiday
year has run out: see section 8 before deploying.

**Re-check five figures against the official pages** (links are in `docs/DATA-SOURCES.md`):
a tax bracket threshold, the ACC levy rate and cap, the student loan threshold ($24,128), the
KiwiSaver rate options, the GST rate. Also spot-check Anzac Day, Boxing Day, Matariki and two
anniversary days in the holiday table. If anything differs, stop: change `data/`, rebuild, rerun
the tests, commit.

## 3. Local preview

```powershell
npm run serve        # http://localhost:8788  (plain static server, no compression)
npm run dev          # http://localhost:8787  (wrangler dev --local: Cloudflare's asset handling and _headers)
```

Open with `npm run dev`: `/`, `/nz-paye-calculator`, `/gst-calculator`, `/working-days-calculator`,
`/printable-calendar` (print preview), `/text-cleaner`, `/guides/how-nz-paye-is-worked-out`,
`/privacy-policy`, and `/no-such-page` (must show the 404 page). Check `/gst-calculator.html`
and `/gst-calculator/` both redirect to `/gst-calculator`.

## 4. Deploy

```powershell
npx wrangler login                   # opens the browser; log in to the account that holds myaddr.app
npx wrangler deploy
```

Expect the asset upload, then the two custom domains. If Wrangler says a domain can't be
attached because a DNS record already exists, **stop and decide** (section 1): remove the old
record only if you're sure nothing else needs it. Never delete MX or TXT records.

Then add a line to `docs/deploy-log.md` (date, commit from `git rev-parse --short HEAD`, checks
run, email check result) and commit it.

## 5. Straight after deploy

```powershell
curl.exe -sI https://myaddr.app/ | Select-String "HTTP|content-security-policy|x-content-type"
curl.exe -sI https://myaddr.app/no-such-page | Select-String "HTTP"      # expect 404
curl.exe -s https://myaddr.app/robots.txt
curl.exe -s https://myaddr.app/ads.txt                                   # comment lines only
Resolve-DnsName myaddr.app -Type MX                                      # same as your saved output
```

- Send a test email to `nz@myaddr.app` from another account and confirm it arrives.
- Open five pages on your phone, including one calculator and one printable.
- Browser DevTools → Network on two pages: every request goes to `myaddr.app` only.

## 6. Dashboard tasks

| Setting | Where | Set to | Reason |
|---|---|---|---|
| `www` → apex redirect | Rules → Redirect Rules (template "Redirect from WWW to root") | 301 to `https://myaddr.app` keeping path | One canonical host; pages already declare the apex as canonical. |
| Always Use HTTPS | SSL/TLS → Edge Certificates | On | No plain-HTTP pages. |
| Bot Fight Mode | Security → Bots | **Off** | It can challenge search engine and AdSense crawlers on the free plan. |
| Rocket Loader | Speed → Optimization | Off | It rewrites scripts and breaks the CSP hash. |
| Email Address Obfuscation | Scrape Shield | Off | It injects a third-party-looking script and changes the contact page. |
| Web Analytics automatic injection | Analytics → Web Analytics | Off | The privacy policy says there's no analytics. |
| Managed `robots.txt` | Security → Bots (AI crawl control / managed robots.txt) | Check it doesn't replace or block the site's own `robots.txt` | The sitemap line must stay. |
| Email Routing | Email → Email Routing | Unchanged | Confirm after deploy (section 5). |

## 7. Rollback

1. Dashboard → Workers & Pages → `everyday-tools` → Deployments → pick the previous version →
   Rollback. This is instant and doesn't touch DNS.
2. Fallback: check out the last good commit and deploy it again.

```powershell
git log --oneline -5
git switch --detach <good-commit>
npm ci; npm test; npx wrangler deploy
git switch build/everyday-tools
```

Note the rollback in `docs/deploy-log.md`.

## 8. Yearly updates

**New tax year (by March; the build warns from 1 March and fails from 1 April):**
1. Copy `data/nz/tax-2026-27.json` to `data/nz/tax-2027-28.json` and update every figure from the
   official pages. Each figure keeps its `sourceId`; add new sources to `data/sources.json` with
   the retrieval date.
2. In `config/data.json`, add `"2027-28"` to `taxYears` and set `currentTaxYear`.
3. Add the new IR340/IR341 rows to the test fixtures, then run `npm test` and `npm run regression`,
   and record the figures in `docs/DATA-SOURCES.md`.

**New holiday year (by September; the build warns from 1 September and fails on 1 January):**
1. Add the year to `data/nz/public-holidays.json` from Employment New Zealand's table: each
   holiday's `date` and `observedForMonFri`, and every regional anniversary day.
2. Run `npm test`; the rule tests check Easter, Mondayisation and the anniversary rules.
3. Review the holidays and printing guides, which use 2027 in their examples.

Then rebuild, commit, and deploy with sections 2 to 5.

## 9. Search Console (after the first deploy)

Add a **Domain** property for `myaddr.app` (DNS TXT verification, in the Cloudflare DNS
dashboard), submit `https://myaddr.app/sitemap.xml`, and URL-inspect one tool and one guide.
