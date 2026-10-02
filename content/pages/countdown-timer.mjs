// /countdown-timer
import { zonedToInstant, formatInZone } from "../../src/assets/lib/tz.js";

export default function page(ctx) {
  const { link, icon } = ctx;
  const xmas = zonedToInstant("2026-12-25", "00:00", "Pacific/Auckland").ms;
  const london = formatInZone(xmas, "Europe/London");
  return {
    path: "/countdown-timer",
    type: "tool",
    pillar: "date-and-time-tools",
    status: "published",
    reviewed: "2026-10-02",
    title: "Countdown Timer: Days, Hours and Minutes to a Date",
    description: "Count down to any date and time in any time zone, in days, hours, minutes and seconds. Bookmark or share the countdown with its own link.",
    crumbName: "Countdown timer",
    h1: "Countdown timer:",
    h1Accent: "to any moment",
    appName: "Countdown timer",
    script: "countdown",
    chips: [`<span class="chip">${icon("timer")}Shareable link</span>`],
    sources: [], claims: [],
    intro: `<p>Count down to a birthday, a holiday, an exam, a launch or the end of the school term. Choose the date and time, and the time zone it happens in, and the countdown ticks in days, hours, minutes and seconds. The page address updates as you set it up, so you can bookmark the countdown or send the link to someone else and they'll see the same moment counted from their own clock.</p>`,
    tool: `<form id="cdForm" autocomplete="off" novalidate>
      <div class="panel-h"><h2>Set the moment</h2></div>
      <div class="fields">
        <div class="field"><label for="cdDate">Date</label><input class="in" id="cdDate" type="date" min="1970-01-01" max="2100-12-31"></div>
        <div class="field"><label for="cdTime">Time</label><input class="in" id="cdTime" type="time" value="00:00"></div>
        <div class="field"><label for="cdZone">Time zone</label><input class="in" id="cdZone" value="Pacific/Auckland" maxlength="40" aria-describedby="cdHint"></div>
        <div class="field"><label for="cdLabel">Label (optional, not shared)</label><input class="in" id="cdLabel" type="text" maxlength="40" placeholder="Summer holidays"></div>
      </div>
      <p class="hint" id="cdHint" role="alert"></p>
    </form>`,
    results: `<div class="results">
        <div class="res key"><div class="k" id="cdTitle">Countdown<small></small></div><div class="v"><span id="c-days">0</span>d <span id="c-hours">00</span>h <span id="c-minutes">00</span>m <span id="c-seconds">00</span>s</div></div>
      </div>
      <p class="rounding" id="cdWhen">Choose a date to start the countdown.</p>
      <p class="rounding" id="cdDone" hidden>That moment has arrived.</p>
      <div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="cdCopy">${icon("copy")}Copy link</button></div>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>`,
    body: `
        <h2>How the countdown works</h2>
        <p>The date, time and time zone you choose are turned into one exact moment, using your browser's built-in time-zone data. Every second the page subtracts the current time on your device from that moment and shows what's left. Because the target is a fixed moment, two people in different countries looking at the same link see the same number counting down, even though their clocks read different times.</p>
        <p>The countdown pauses while the tab is hidden, to save battery, and catches up the moment you come back. If your device is set to reduce motion, it updates once a minute instead of every second. When the moment arrives, the timer stops at zero.</p>

        <h2>Sharing a countdown</h2>
        <p>Setting the date, time or time zone updates the part of the page address after the # sign, for example "#d=2026-12-25&t=00:00&z=Pacific/Auckland". Copy the link and anyone who opens it gets the same countdown. The address after the # isn't sent to the website's server; it stays in the browser. The optional label is never put in the link, because it's text you typed; the person you send it to can add their own.</p>

        <h2>An example</h2>
        <p>Set 25 December 2026 at 12:00am in Pacific/Auckland and the timer counts down to the first minute of Christmas Day in New Zealand. Someone in London opening the same link sees the same countdown, which reaches zero at ${london} their time.</p>
        <p>A few more ideas: the start of the school holidays, a flight departure (set it in the departure city's zone), the end of a fundraising campaign, a new year in a different country, or a long-awaited release. For a deadline measured in working days rather than hours, pair it with the ${link("/working-days-calculator", "working days calculator")} to see how much real working time is left.</p>
        <!--@slot after-explainer-1-->
        <h2>Things to know</h2>
        <ul>
          <li><strong>Your device's clock matters.</strong> The countdown trusts the time on your phone or computer. If it's set wrong, the countdown will be too.</li>
          <li><strong>Pick the event's time zone, not yours.</strong> A rugby kick-off in Paris should be set in Europe/Paris; the countdown then works for everyone.</li>
          <li><strong>Times during a clock change</strong> can be ambiguous or skipped. The countdown uses the same rule as the ${link("/time-zone-converter", "time zone converter")}.</li>
          <li><strong>Very long countdowns</strong> are fine; days simply keep growing.</li>
          <li><strong>Leaving the tab open on a lock screen or classroom display</strong> works, but some devices put background tabs to sleep. The countdown always recalculates from the real time when it wakes, so it never drifts.</li>
          <li><strong>Privacy.</strong> Nothing is stored on a server and the label stays on your device. The link only carries the date, time and zone.</li>
        </ul>
        <p>To know how many whole days are left without the ticking, use ${link("/days-between-dates", "days between dates")}.</p>`,
    related: [
      { href: "/time-zone-converter", label: "Time zone converter" },
      { href: "/days-between-dates", label: "Days between dates" },
      { href: "/date-and-time-tools", label: "All date and time tools" },
    ],
  };
}
