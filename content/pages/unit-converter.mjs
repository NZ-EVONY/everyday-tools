// /unit-converter: metric and imperial conversions with cited factors (data/units.json).
import { convert, formatNumber } from "../../src/assets/lib/units.js";

export default function page(ctx) {
  const { data, esc, src, link } = ctx;
  const units = data.units;
  const cat = k => units.categories.find(c => c.key === k);
  const u = (c, k) => cat(c).units.find(x => x.key === k);
  const f = (v, a, b, c) => formatNumber(convert(v, a, b, cat(c)));
  const factorRows = units.categories.filter(c => !c.formula).flatMap(c => c.units.filter(x => x.toBase !== 1 && !["mm", "cm", "km", "g", "ml", "cm2", "km2", "ms"].includes(x.key)).map(x => `<tr><td>1 ${esc(x.label.replace(/s( \(|$)/, "$1"))}</td><td class="num">${formatNumber(x.toBase)} ${esc(c.base)}</td><td>${x.exact ? "exact" : "rounded"}</td></tr>`)).join("");
  const sourceIds = [...new Set(units.categories.flatMap(c => [c.sourceId, ...c.units.map(x => x.sourceId)]).filter(Boolean))];
  return {
    path: "/unit-converter",
    type: "tool",
    pillar: "nz-calculators",
    status: "published",
    reviewed: "2026-10-02",
    title: "Unit Converter: Metric and Imperial, with Sources",
    description: "Convert length, area, weight, volume, temperature, speed and fuel economy between metric and imperial units, with every factor's source listed.",
    crumbName: "Unit converter",
    h1: "Unit converter:",
    h1Accent: "metric and imperial",
    appName: "Unit converter",
    script: "units",
    chips: [`<span class="chip">${ctx.icon("ruler")}${units.categories.length} kinds of measurement</span>`, `<span class="chip">Factors cited</span>`],
    sources: sourceIds.map(ctx.source),
    claims: [
      { text: "Yard, pound and imperial gallon definitions", source: "uk-wma-1985-sch1" },
      { text: "Metric and US unit factors", source: "nist-sp811-b8" },
      { text: "Temperature formulas", source: "nist-sp811-b9" },
      { text: "Acre in square metres", source: "nist-survey-foot-factors" },
    ],
    intro: `<p>Convert between metric units and the imperial and US units that still turn up in New Zealand: a section measured in acres, a baby's weight in pounds, an old recipe in cups, a car's fuel use in miles per gallon. Choose what you're measuring, type a number and the answer appears straight away, along with the same amount in every other unit. Each factor comes from legislation or a national standards body, listed below.</p>`,
    tool: `<form id="unitForm" autocomplete="off" novalidate data-units="${esc(JSON.stringify(units))}">
      <div class="panel-h"><h2>Convert</h2></div>
      <div class="field">
        <label for="uCat">What are you measuring?</label>
        <select class="in" id="uCat">${units.categories.map(c => `<option value="${c.key}">${esc(c.label)}</option>`).join("")}</select>
      </div>
      <div class="fields">
        <div class="field"><label for="uValue">Amount</label><input class="in" id="uValue" type="text" inputmode="decimal" maxlength="24" placeholder="1" aria-describedby="uHint"></div>
        <div class="field"><label for="uFrom">From</label><select class="in" id="uFrom"></select></div>
        <div class="field"><label for="uTo">To</label><select class="in" id="uTo"></select></div>
      </div>
      <p class="hint" id="uHint" role="alert"></p>
      <div class="actions no-print"><button type="button" class="btn btn-ghost btn-sm" id="uSwap">${ctx.icon("sort")}Swap units</button></div>
    </form>`,
    results: `<div class="results">
        <div class="res key"><div class="k">Result<small id="uResultK">metres</small></div><div class="v" id="uResult">–</div></div>
      </div>
      <p class="rounding" id="uSentence"></p>
      <div class="breakdown"><table id="uAll"><caption id="uAllCap">Every unit</caption><thead class="sr-only"><tr><th scope="col">Unit</th><th scope="col">Amount</th></tr></thead><tbody></tbody></table></div>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="uCopy">${ctx.icon("copy")}Copy result</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    body: `
        <h2>Where the factors come from</h2>
        <p>Most imperial units are defined exactly in terms of metric ones. The yard is defined as exactly ${u("length", "yd").toBase} of a metre and the pound as exactly ${u("mass", "lb").toBase} of a kilogram, so the foot, inch, mile, ounce and stone follow exactly from them. The imperial gallon is defined as ${u("volume", "gal_uk").toBase} litres. These definitions come from the ${src("uk-wma-1985-sch1")}. US units such as the US gallon, cup and fluid ounce, and the formulas for temperature, come from the US National Institute of Standards and Technology. Where a source gives a rounded factor rather than an exact definition, the table below says so.</p>
        <table><thead><tr><th scope="col">Unit</th><th scope="col" class="num">In base units</th><th scope="col">Factor</th></tr></thead><tbody>${factorRows}</tbody></table>

        <h2>Worked examples</h2>
        <ul>
          <li>A ${formatNumber(5)}-acre lifestyle block is ${f(5, "acre", "ha", "area")} hectares, or ${f(5, "acre", "m2", "area")} square metres.</li>
          <li>A newborn weighing 7 pounds 8 ounces is ${f(7.5, "lb", "kg", "mass")} kg.</li>
          <li>Someone who is 11 stone weighs ${f(11, "st", "kg", "mass")} kg.</li>
          <li>A 6-foot doorway is ${f(6, "ft", "cm", "length")} cm.</li>
          <li>A summer day of 77 °F is ${f(77, "f", "c", "temperature")} °C.</li>
          <li>A car doing 40 miles per imperial gallon uses ${f(40, "mpg_uk", "l100", "fuel")} litres per 100 km; at 40 miles per US gallon it uses ${f(40, "mpg_us", "l100", "fuel")}.</li>
        </ul>
        <p>All of these are worked out by the same code the converter uses.</p>
        <!--@slot after-explainer-1-->
        <h2>Mistakes to watch for</h2>
        <ul>
          <li><strong>Mixing up UK and US gallons.</strong> A UK (imperial) gallon is about a fifth bigger than a US gallon. A British car magazine quoting miles per gallon means the imperial gallon; an American one means the US gallon. The same mpg figure therefore means different fuel use.</li>
          <li><strong>Reading fuel economy the wrong way round.</strong> Litres per 100 km goes down as a car gets more efficient; miles per gallon and kilometres per litre go up. The converter handles the flip for you.</li>
          <li><strong>Treating US cups as metric cups.</strong> Recipes from the United States use the US cup, listed here as ${f(1, "cup_us", "ml", "volume")} mL. Many New Zealand and Australian recipes use a metric cup instead, which this converter doesn't include because it isn't defined in the sources used.</li>
          <li><strong>Converting temperatures with a single factor.</strong> Celsius and Fahrenheit have different zero points, so you can't just multiply. A rise of 10 °C is a rise of 18 °F, but 10 °C is 50 °F.</li>
          <li><strong>Stones and pounds.</strong> "11 stone 4" means 11 stone and 4 pounds, not 11.4 stone. Convert the pounds separately and add them.</li>
        </ul>

        <h2>Limits</h2>
        <p>Results are shown to six significant figures, which is more precision than everyday measuring needs. Rounded factors (marked above) carry about seven significant figures. Currency isn't included, because exchange rates change by the minute. Everything runs in your browser; the number you type isn't stored or sent anywhere, and only your choice of units is kept in the page address after the # sign. For money calculations, see the ${link("/nz-calculators", "NZ calculators")}.</p>`,
    faq: [
      { q: "How many hectares is an acre?", a: `<p>One acre is ${f(1, "acre", "ha", "area")} hectares, and one hectare is ${f(1, "ha", "acre", "area")} acres.</p>` },
      { q: "Why does my mpg figure give two different answers?", a: "<p>Because there are two gallons. The imperial gallon used in the UK is larger than the US gallon, so the same number of miles per gallon means a different amount of fuel per 100 km. Pick the gallon that matches where the figure came from.</p>" },
    ],
    related: [
      { href: "/nz-calculators", label: "All NZ calculators" },
      { href: "/gst-calculator", label: "GST calculator" },
    ],
  };
}
