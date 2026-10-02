# Owner to-do list

Things only the owner can do. Claude Code cannot do these.

## Now (before deploying)
- [ ] Work through the ten checks at the end of `docs/FINAL-REPORT.md`.
- [ ] Run the five searches in `docs/SEARCH-SPOTCHECK.md` by hand (private window, NZ location) and fill in the table.
- [ ] Try the five NZ calculators (take-home pay, KiwiSaver, GST, flatmate splitter, unit converter) and compare two take-home pay results with IRD's own PAYE calculator.
- [ ] Confirm the brand "Everyday Tools" (a one-line change in `site.config.json`).

- [ ] Compare the 2026 and 2027 Matariki dates (10 July 2026, 25 June 2027) with the schedule in the Te Kāhui o Matariki Public Holiday Act 2022, and check MBIE's 2027 table has a year label (see `docs/UNVERIFIED.md`).
- [ ] Print a calendar, a planner and a checklist on your own printer (Chrome, and Firefox or Safari if you use them).
- [ ] Read the ten guides, starting with the four money guides and the holidays guide, and flag anything that reads wrongly for a New Zealand reader.

- [ ] Fancy text: open `/fancy-text-generator` on your phone and one other device; type a name with a macron and check the rows listed in `docs/UNVERIFIED.md` (superscript q, small-caps q, upside-down 2/3/K, Warband F, squared and filled rows, the turned-dagger frame) for empty boxes or colour emoji.
- [ ] Fancy text: paste two or three styled names into a real name box you use, to see how it counts them.
- [ ] Click the two Unicode links that couldn't be opened from the build session (code chart U1D400.pdf, Unicode 18.0 page).

## Before launch
- [ ] Decide, with advice, whether the privacy policy needs a more identifiable controller than "an independent publisher" plus `nz@myaddr.app` (NZ Privacy Act 2020 and GDPR/UK GDPR).
- [ ] Have the privacy policy and terms reviewed; they are templates, not legal advice.
- [ ] On deploy day, re-check five tax figures (a bracket threshold, the ACC rate and cap, the student loan threshold, the KiwiSaver rate options, the GST rate) and the holiday table against the official pages.
- [ ] Confirm nothing else is deployed on `myaddr.app` (an earlier address-format plan also targeted that domain) before attaching this Worker.
- [ ] Deploy with `docs/DEPLOY.md`, then confirm MX / Email Routing records still exist and a test email to `nz@myaddr.app` arrives.
- [ ] Cloudflare dashboard: `www` → apex redirect, Always Use HTTPS, Bot Fight Mode off, Rocket Loader off, Email Address Obfuscation off, Web Analytics injection off, check the managed `robots.txt`.
- [ ] Search Console: Domain property, submit the sitemap, inspect a tool and a guide.

## Advertising (only after pages are live, indexed and read by a human)
- [ ] Apply for AdSense. Approval needs real content and trust pages and is never guaranteed.
- [ ] Wire a Google-certified CMP supporting IAB TCF v2.3 at the CMP comment, unhide the "Privacy settings" footer link, set `adsLive: true`, paste the AdSense snippet at the marked point, switch slots on page type by page type, update `ads.txt` and the CSP, re-test CLS, and update the privacy policy's advertising section (it changes automatically with `adsLive`).

## Every year
- [ ] By March: add `data/nz/tax-YYYY-YY.json` for the new tax year and one line in `config/data.json` (the build warns from 1 March and fails from 1 April).
- [ ] Before August 2028: review the holidays guide and working days copy for the Employment Leave Act, which Employment New Zealand says replaces the Holidays Act then.
- [ ] By September: add next year's holiday table from MBIE (the build warns from 1 September and fails on 1 January).
