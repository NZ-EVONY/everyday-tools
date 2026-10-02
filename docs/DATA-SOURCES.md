# Data sources

Every official figure used by the site, where it came from and when it was read. All pages
were fetched from the build session on **2 October 2026** (NZ time). Source ids refer to
`data/sources.json`. Facts only: no text or tables are copied.

## Tax year 2026-27 (`data/nz/tax-2026-27.json`, 1 April 2026 to 31 March 2027)

| Figure | Value | Source id | Page |
|---|---|---|---|
| Income tax, 0 to $15,600 | 10.5% | ird-tax-rates-individuals | [Tax rates for individuals](https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals) ("From 1 April 2025" table, still current) |
| Income tax, $15,601 to $53,500 | 17.5% | ird-tax-rates-individuals | same |
| Income tax, $53,501 to $78,100 | 30% | ird-tax-rates-individuals | same |
| Income tax, $78,101 to $180,000 | 33% | ird-tax-rates-individuals | same |
| Income tax, over $180,000 | 39% | ird-tax-rates-individuals | same |
| Secondary codes SB / S / SH / ST / SA | 10.5 / 17.5 / 30 / 33 / 39% | ird-tax-rates-individuals | same |
| ACC earners' levy rate (incl. GST), 2026-27 | 1.75% | ird-acc-levy-rates | [ACC earners' levy rates](https://www.ird.govt.nz/income-tax/income-tax-for-individuals/acc-clients-and-carers/acc-earners-levy-rates) (page also lists 2027-28: not used) |
| ACC maximum liable earnings, 2026-27 | $156,641 | ird-acc-levy-rates | same; also stated on [About tax codes](https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/about-tax-codes) |
| ACC maximum levy, 2026-27 | $2,741.22 | ird-acc-levy-rates | same |
| Student loan repayment rate | 12% | ird-student-loan-salary | [Repaying my student loan when I earn salary or wages](https://www.ird.govt.nz/student-loans/living-in-new-zealand-with-a-student-loan/repaying-my-student-loan-when-i-earn-salary-or-wages) |
| Student loan annual threshold | $24,128 | ird-student-loan-salary + ird-ir340-apr-2026 | page says "2026 tax year"; IR340/IR341 April 2026 tables build in the same thresholds (see UNVERIFIED) |
| Student loan per-period thresholds | $464 wk / $928 fn / $1,856 4-wk / $2,010.66 mth | ird-student-loan-salary | same |
| Student loan, secondary income | 12% from the first dollar | ird-student-loan-salary | same |
| KiwiSaver employee rates | 3.5% (default), 4, 6, 8, 10% | ird-ks-employee | [Employee contributions](https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/growing-my-kiwisaver-account/employee-contributions-to-kiwisaver) (last updated 1 Apr 2026) |
| KiwiSaver employer minimum | 3.5% of gross pay | ird-ks-employer | [Employer contributions](https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/growing-my-kiwisaver-account/employer-contributions-to-kiwisaver) |
| Government contribution | 25c per $1, max $260.72, needs $1,042.86 member contributions (1 July to 30 June), income $180,000 or less, age 16 to 65 | ird-ks-government | [Getting the government contribution](https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/growing-my-kiwisaver-account/getting-the-kiwisaver-government-contribution) (last updated 3 Jun 2026) |
| ESCT bands | $0-18,720 10.5%; to $64,200 17.5%; to $93,720 30%; to $216,000 33%; above 39% | ird-ir341-apr-2026 | [IR341 April 2026](https://www.ird.govt.nz/-/media/project/ir/home/documents/forms-and-guides/ir300---ir399/ir341/ir341-apr-2026.pdf), page 4 |

## GST (`data/nz/gst.json`)

| Figure | Value | Source id | Page |
|---|---|---|---|
| Standard rate | 15% | ird-gst-charging | [Charging GST](https://www.ird.govt.nz/gst/charging-gst) (last updated 1 Apr 2026) |
| GST share of an inclusive price | 3/23 | ird-gst-charging | same ($100 incl. → $13.04) |
| Registration threshold | $60,000 in 12 months (past or expected) | ird-gst-registering | [Registering for GST](https://www.ird.govt.nz/gst/registering-for-gst) (last updated 13 Feb 2025) |
| Zero-rated supplies (examples) | certain exported services | ird-gst-zero-rated | [Zero-rated supplies](https://www.ird.govt.nz/gst/charging-gst/zero-rated-supplies) |
| Exempt supplies (examples) | financial services; donated goods sold by non-profits | ird-gst-exempt | [Exempt supplies](https://www.ird.govt.nz/gst/charging-gst/exempt-supplies) |
| Taxable supply information on request | supplies over $200 | ird-gst-supply-info | [How taxable supply information works](https://www.ird.govt.nz/gst/tax-invoices-for-gst/how-tax-invoices-for-gst-work) |

## Public holidays (`data/nz/public-holidays.json`)

| Figure | Source id | Page |
|---|---|---|
| 2026 national holidays (11) with observed dates for Mon-Fri workers | mbie-public-holidays | [Public holidays and anniversary dates](https://www.employment.govt.nz/leave-and-holidays/public-holidays/public-holidays-and-anniversary-dates) |
| 2026 regional anniversary days (12) | mbie-public-holidays | same (MBIE notes possible errors; check with councils) |

## Test fixtures
`tests/fixtures/official-examples.json` holds 21 rows read from the IR340 (weekly, fortnightly)
and IR341 (four-weekly, monthly) April 2026 tables, IRD's worked examples (student loan $600 →
$16.32; secondary $200 → $24; GST $100 incl. → $13.04; $100 + GST → $115), and three rows
marked "hand-computed (not from IRD)".

## Not official, not a source
No third-party site was used for any figure.
