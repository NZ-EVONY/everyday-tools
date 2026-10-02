// /terms. A good-faith template, not legal advice.
export default function page(ctx) {
  const { site } = ctx;
  return {
    path: "/terms",
    type: "trust",
    status: "published",
    reviewed: "2026-10-02",
    reviewedLabel: "Last updated",
    title: "Terms of Use | Everyday Tools",
    description: "The terms for using Everyday Tools: free tools provided as they are, calculators that give estimates rather than advice, and New Zealand law.",
    h1: "Terms of use",
    sources: [], claims: [],
    body: `
        <p>These terms cover your use of ${site.brand}, a free website run by ${site.operatorName} in New Zealand. By using the site you agree to them. If you don't agree, please don't use it.</p>

        <h2>Using the tools</h2>
        <p>You are welcome to use the calculators, converters, printables and text tools for personal, study or work purposes, and to print or copy the results. Please don't try to disrupt the site, overload it with automated requests, or copy large parts of its written content to republish as your own. Linking to any page is fine.</p>

        <h2>Estimates, not advice</h2>
        <p>The pay, tax, KiwiSaver and GST calculators give estimates for general information. They use rates published by Inland Revenue and other official sources, show the date those rates were checked, and explain their method, but they cannot know your full circumstances. Nothing on the site is financial, tax, legal or employment advice. Before you make a decision that matters, check with Inland Revenue, your employer, your KiwiSaver provider or a qualified adviser.</p>
        <p>Dates of public holidays come from official tables, but a workplace may observe a holiday on a different day under an employment agreement. Printed calendars and planners are only as accurate as your printer settings.</p>

        <h2>No affiliation</h2>
        <p>${site.brand} is independent. It is not affiliated with, endorsed by or approved by Inland Revenue, ACC, the Ministry of Business, Innovation and Employment or any other government agency. Official sources are linked so you can check them yourself.</p>

        <h2>The site is provided as it is</h2>
        <p>The tools are offered free and "as is". The publisher works to keep them accurate and available, but does not promise that they are free of errors, always online or suitable for any particular purpose. If you find a mistake, please report it so it can be fixed.</p>

        <h2>Liability</h2>
        <p>To the extent the law allows, the publisher is not liable for any loss arising from your use of the site or reliance on its results, including loss from errors, out-of-date rates or downtime. Nothing in these terms limits any rights you have under laws that cannot be excluded by agreement, such as the Consumer Guarantees Act 1993 where it applies.</p>

        <h2>Changes</h2>
        <p>These terms may be updated from time to time; the date below shows the latest version. Continuing to use the site after a change means you accept the new terms.</p>

        <h2>Governing law</h2>
        <p>These terms are governed by the law of ${site.governingLaw}, and the courts of ${site.governingLaw} have jurisdiction over any dispute. Questions go to <a href="mailto:${site.contactEmail}">${site.contactEmail}</a>.</p>`,
  };
}
