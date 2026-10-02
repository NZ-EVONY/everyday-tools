# Third-party software and data

## Shipped to visitors
Nothing. The site's HTML, CSS and JavaScript are original to this project and have no runtime
dependencies. No fonts, scripts, images or data are loaded from other servers.

## Development dependencies (not shipped)
Licences read from each package's `package.json` in `node_modules` on 2 October 2026.

| Package | Version | Licence | Used for |
|---|---|---|---|
| wrangler | 4.145.0 | MIT OR Apache-2.0 | local preview (`dev --local`) and `deploy --dry-run` |
| playwright-core | 1.63.0 | Apache-2.0 | browser tests |
| axe-core | 4.13.0 | MPL-2.0 | accessibility tests |
| lighthouse | 13.5.0 | Apache-2.0 | performance and quality audits |

## Data sources
Figures are facts read from official government and standards-body pages and restated in our own
words; no text, tables or documents are reproduced. Each source, with its URL and retrieval
date, is listed in `data/sources.json` and `docs/DATA-SOURCES.md`.

- Inland Revenue (ird.govt.nz): income tax rates, secondary tax codes, ACC earners' levy as
  published by IRD, student loan repayment threshold, KiwiSaver rates and government
  contribution, ESCT bands (IR341), GST rate, registration threshold and related guidance.
- Employment New Zealand / MBIE (employment.govt.nz): public holiday and anniversary dates.
- Inland Revenue's Payroll calculations and business rules specification (1 April 2026 to 31 March
  2027): the PAYE, student loan, IETC and ESCT calculation method. Used as a method; not redistributed.
- UK Weights and Measures Act 1985, Schedule 1 (legislation.gov.uk, Crown copyright, Open Government
  Licence): definitions of imperial units used by the unit converter.
- US National Institute of Standards and Technology (nist.gov), SP 811 Appendix B and the revised unit
  conversion factors page: metric and US unit factors and temperature formulas.

The site is independent and is not affiliated with or endorsed by any of these agencies or bodies.

## Design
The visual design in `design/` was supplied by the owner for this site.
