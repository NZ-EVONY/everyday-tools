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
| Student loan annual threshold | $24,128 | ird-student-loan-salary + ird-payroll-spec-2026-27 | confirmed by IRD's payroll specification 2026-27 and the IR340/IR341 tables |
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

## Added in Phase 2 (all retrieved 2 October 2026)

| Figure | Value | Source id | Page |
|---|---|---|---|
| PAYE calculation method (sections 5.2 to 5.4, 5.6, 5.20.6) | annualise, drop cents, tax + ACC, ÷52, truncate, convert, truncate | ird-payroll-spec-2026-27 | [Payroll calculations and business rules](https://www.ird.govt.nz/digital-service-providers/services-catalogue/returns-and-information/payday-filing/payroll-calculations-and-business-rules) (specification 1 April 2026 to 31 March 2027) |
| Student loan threshold 2026-27 | $24,128 (section 2.2: "2024 onwards") | ird-payroll-spec-2026-27 | same |
| Independent earner tax credit | $520 a year for $24,000 to $66,000; reduces by 13c per $1 to $70,000 | ird-ietc + ird-payroll-spec-2026-27 | [IETC](https://www.ird.govt.nz/income-tax/income-tax-for-individuals/individual-tax-credits/independent-earner-tax-credit-ietc) |
| IETC eligibility | NZ tax resident; not receiving Working for Families, an income-tested benefit, NZ Super or a Veteran's Pension | ird-ietc | same |
| Yard, foot, inch, mile; acre (4840 sq yd), square mile (640 acres); pound, ounce, stone, tonne; imperial gallon | exact definitions | uk-wma-1985-sch1 | [Weights and Measures Act 1985, Schedule 1](https://www.legislation.gov.uk/ukpga/1985/72/schedule/1) |
| Metric prefixes, square inch/foot, hectare, mph; US gallon, cup, fl oz, tsp, tbsp, knot (rounded); mpg (US) to km/L | factors | nist-sp811-b8 | [NIST SP 811 Appendix B.8](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8) |
| Temperature formulas | °C = (°F − 32)/1.8; K = °C + 273.15 | nist-sp811-b9 | [NIST SP 811 Appendix B.9](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9) |
| Acre (international foot) | 4046.856 422 4 m² | nist-survey-foot-factors | [NIST revised unit conversion factors](https://www.nist.gov/pml/us-surveyfoot/revised-unit-conversion-factors) |

Test fixtures now also hold 6 rows from IRD's secondary-code tables (IR340 weekly and fortnightly,
IR341 monthly).

## Added in Phase 3 (retrieved 2 October 2026)

| Figure | Value | Source id | Page |
|---|---|---|---|
| 2027 national holidays (11) and regional anniversary days (12), with Mon-Fri observed dates | see `data/nz/public-holidays.json` | mbie-public-holidays | [Public holidays and anniversary dates](https://www.employment.govt.nz/leave-and-holidays/public-holidays/public-holidays-and-anniversary-dates) (second table, unlabelled; see UNVERIFIED) |
| Mondayisation rules (Waitangi, Anzac; Christmas, Boxing Day, New Year days) | as described on the page | mbie-public-holidays | same |
| NZ daylight saving rule | starts 2am last Sunday in September; ends 3am first Sunday in April | govt-daylight-saving | [Daylight saving in NZ](https://www.govt.nz/browse/recreation-and-the-environment/daylight-saving/) (last updated 11 August 2026) |
| Change dates 2026-2029 | 27 Sep 2026 / 4 Apr 2027 / 26 Sep 2027 / 2 Apr 2028 / 24 Sep 2028 / 1 Apr 2029 | govt-daylight-saving | same |

## Added in Phase 5 (retrieved 3 October 2026)

Rules stated in guide copy; no new figures in `data/`.

| Fact | Source id | Page |
|---|---|---|
| Which tax code to use; SL; WT, CAE, NSW, EDW | ird-what-tax-code | [What tax code should I use](https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/what-tax-code-should-i-use) |
| Secondary codes and the IR330 declaration | ird-secondary-codes | [Secondary tax codes](https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/secondary-tax-codes) |
| Weekend holidays and Mondayisation | emp-weekend-holidays | [When a public holiday falls on a weekend](https://www.employment.govt.nz/leave-and-holidays/public-holidays/when-a-public-holiday-falls-on-a-weekend) |
| Limits on holidays claimed; working a public holiday; Employment Leave Act from August 2028 | emp-holiday-rights | [Public holidays rights for employees](https://www.employment.govt.nz/leave-and-holidays/public-holidays/public-holidays-rights-for-employees) |
| Time Act 1974 (NZST UTC+12, Chatham Islands +45 min), pay at a clock change, 2007 review | govt-dst-legislation | [Governing legislation](https://www.govt.nz/browse/recreation-and-the-environment/daylight-saving/governing-legislation/) |


## Added in Phase 6 (retrieved 3 October 2026)

| Fact | Source id | Page |
|---|---|---|
| 2027 school terms (term 1 starts 28 January to 3 February, ends 9 April; term 2 27 April to 2 July; term 3 19 July to 24 September; term 4 11 October to no later than 17 December); Easter Tuesday a school holiday | moe-school-terms | [School terms and holidays dates](https://www.education.govt.nz/school-terms-and-holidays-dates) (last updated 21 May 2026) |
