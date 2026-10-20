# Deploy log (filled in by the owner)

| Date (NZ) | Git commit | Who | What changed | Checks run (tests, check:deploy, dry-run) | Email Routing / MX checked | Notes |
|---|---|---|---|---|---|---|
| 2026-10-20 | `4e2a799` | greg (for Bee) | Google readiness: CSP allows AdSense, Funding Choices and Cloudflare Web Analytics; privacy policy has Google's third-party vendor/cookie wording; default share image; trailing slashes 301. Version `e5fd54b4-bbcf-4206-886e-9b481eb260fd`, previous `42df8413-e2d8-433b-926e-aba47c38619d`. | npm test 107/107, regression 6/6, e2e all pass (one file at a time; copy-all test now normalises Windows clipboard CRLF), check:deploy OK | not checked (routes unchanged) | Sitemap 45 URLs, unchanged. |
