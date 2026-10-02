// Loads the official data (tax years, GST, holidays, sources) and runs the expiry checks.
// Everything takes an injectable "today" (ISO date, NZ time) so tests can prove each failure.
import fs from "node:fs";
import path from "node:path";

/** Today's date in New Zealand as YYYY-MM-DD. */
export function nzToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

const readJson = (root, f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));

export function loadData(root) {
  const cfg = readJson(root, "config/data.json");
  const sources = readJson(root, "data/sources.json").sources;
  const taxYears = Object.fromEntries(cfg.taxYears.map(y => [y, readJson(root, `data/nz/tax-${y}.json`)]));
  return {
    cfg, sources, taxYears,
    tax: taxYears[cfg.currentTaxYear],
    gst: readJson(root, "data/nz/gst.json"),
    holidays: readJson(root, cfg.holidayFile),
  };
}

/** Every sourceId used in data/ must exist in sources.json. Returns a list of problems. */
export function checkSourceIds(data) {
  const ids = new Set(data.sources.map(s => s.id));
  const problems = [];
  const walk = (o, where) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${where}[${i}]`));
    if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) {
      if (/sourceId$/i.test(k) && typeof v === "string" && !ids.has(v)) problems.push(`${where}.${k}: unknown source "${v}"`);
      walk(v, `${where}.${k}`);
    }
  };
  for (const [y, t] of Object.entries(data.taxYears)) walk(t, `tax-${y}`);
  walk(data.gst, "gst");
  walk(data.holidays, "public-holidays");
  for (const s of data.sources) if (!/^https:\/\/([a-z0-9-]+\.)*(govt\.nz)\//.test(s.url)) problems.push(`source ${s.id} is not on an official govt.nz host: ${s.url}`);
  return problems;
}

/**
 * Expiry checks. Returns { errors, warnings }.
 * - The current tax-year file must not have ended before today (NZ time); warning from 1 March of its final year.
 * - Holiday data must include the current calendar year; warning from 1 September if next year is missing.
 */
export function expiryChecks(data, today) {
  const errors = [], warnings = [];
  const t = data.tax;
  if (!t) errors.push(`config/data.json names tax year ${data.cfg.currentTaxYear}, but no data file was loaded for it.`);
  else {
    if (t.periodEnd < today) errors.push(`Tax data for ${t.taxYear} ended on ${t.periodEnd}; add data/nz/tax-YYYY-YY.json for the current tax year (see docs/DEPLOY.md).`);
    else if (today >= `${t.periodEnd.slice(0, 4)}-03-01`) warnings.push(`Next tax year's rates not added: ${t.taxYear} ends on ${t.periodEnd}.`);
  }
  const year = today.slice(0, 4);
  const years = Object.keys(data.holidays.years || {});
  if (!years.includes(year)) errors.push(`Public-holiday data has no entry for ${year}; add MBIE's table for ${year} to ${data.cfg.holidayFile}.`);
  else if (today.slice(5) >= "09-01" && !years.includes(String(+year + 1))) warnings.push(`Public-holiday data for ${+year + 1} not added yet.`);
  return { errors, warnings };
}
