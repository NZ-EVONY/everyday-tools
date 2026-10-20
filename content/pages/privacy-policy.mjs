// /privacy-policy. A good-faith template, not legal advice (see README and docs/OWNER-TODO.md).
// The advertising section follows config/ads.json: while adsLive is false it says ads are off.
export default function page(ctx) {
  const { site, adsLive } = ctx;
  const mail = `<a href="mailto:${site.contactEmail}">${site.contactEmail}</a>`;
  const ads = adsLive
    ? `<p>This site shows advertising from Google AdSense. Google and its partners use cookies or similar technology to show ads based on your visits to this and other websites. You can turn off personalised advertising in <a href="https://adssettings.google.com" rel="noopener">Google's ad settings</a>, and learn more about opting out of third-party ad cookies at <a href="https://www.aboutads.info" rel="noopener">aboutads.info</a>. Google explains how it uses information from sites that use its services at <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a>.</p>
        <p>Visitors in the United Kingdom, the European Economic Area and Switzerland are asked for consent through a Google-certified consent platform that supports the IAB Transparency and Consent Framework (version 2.3) before any advertising cookies are set. You can change your choice at any time from the "Privacy settings" link in the footer. Where US state privacy laws give you the right to opt out of the "sale" or "sharing" of personal information for advertising, the same link lets you do that.</p>`
    : `<p>At the time of the last update, ${site.brand} shows no ads and sets no advertising cookies. The publisher plans to show ads from Google AdSense to keep the tools free. When it does, this section applies:</p>
        <ul>
          <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</li>
          <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the internet.</li>
          <li>You may opt out of personalised advertising by visiting <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a>. You can also opt out of some third-party vendors' use of cookies for personalised advertising at <a href="https://www.aboutads.info" rel="noopener">www.aboutads.info</a>.</li>
          <li>Read <a href="https://policies.google.com/technologies/partner-sites" rel="noopener"><strong>How Google uses data when you use our partners' sites or apps</strong></a>.</li>
        </ul>
        <p>Ad technology can use cookies, web beacons (small invisible images or scripts), IP addresses and similar identifiers to show ads, limit how often you see the same ad, measure performance and prevent fraud.</p>
        <p><strong>Consent in the UK, EEA and Switzerland.</strong> Before any advertising or other non-essential cookies are used, visitors in the United Kingdom, the European Economic Area and Switzerland will be asked for consent through a Google-certified consent management platform that supports the IAB Transparency and Consent Framework (version 2.3). You will be able to change your choice at any time from a "Privacy settings" link in the footer. US visitors will be offered an opt-out where state law gives one.</p>
        <p>Questions about advertising or cookies go to ${mail}.</p>`;
  return {
    path: "/privacy-policy",
    type: "trust",
    status: "published",
    reviewed: "2026-10-02",
    reviewedLabel: "Last updated",
    title: "Privacy Policy | Everyday Tools",
    description: "How Everyday Tools handles information: what you type stays in your browser, no accounts, no cookies of our own, and how advertising would work.",
    h1: "Privacy policy",
    sources: [], claims: [],
    body: `
        <p>This page explains what information ${site.brand} handles, and what it deliberately doesn't. The site is run by ${site.operatorName} in New Zealand. It covers the tools, the hosting, email and future advertising. Questions go to ${mail}.</p>

        <h2>The short version</h2>
        <ul>
          <li>Everything you type into a calculator, converter or text tool is processed by your own browser. It is never sent to us or anyone else, and it is not saved.</li>
          <li>There are no accounts, no sign-up forms and no contact forms.</li>
          <li>The site sets no cookies of its own. The only thing it stores on your device is your light or dark theme choice.</li>
          <li>Pages load nothing from other companies: no fonts, analytics, social buttons or tracking scripts.</li>
        </ul>

        <h2>What stays on your device</h2>
        <p>If you press the theme button, your choice ("light" or "dark") is kept in your browser's local storage so the next page opens the same way. You can clear it at any time in your browser settings. Some tools remember a setting, such as whether you are adding or removing GST, in the part of the page address after the # sign. That part is never sent to the web server, and it never contains anything you typed.</p>

        <h2>What the hosting provider sees</h2>
        <p>The site is delivered by Cloudflare. Like any web host, Cloudflare receives the technical details your browser sends with each request, such as your IP address, the page requested, the time, and your browser type, and may keep them in logs for security and to keep the service running. Cloudflare acts as a service provider (a processor) for the site. The publisher does not run analytics and does not use these logs to build profiles of visitors.</p>

        <h2>Advertising</h2>
        ${ads}

        <h2>Email</h2>
        <p>If you email ${mail}, your message and address are received through the publisher's email provider and used only to read and answer it. They are not added to any mailing list. Ask, and the publisher will delete the correspondence.</p>

        <h2>Your rights</h2>
        <p><strong>New Zealand.</strong> The Privacy Act 2020 gives you the right to ask for the personal information held about you and to ask for it to be corrected. Because the site collects almost nothing, there is usually nothing to give; email is the exception. If you are unhappy with a response you can complain to the Office of the Privacy Commissioner.</p>
        <p><strong>United Kingdom and European Economic Area.</strong> If the UK GDPR or the GDPR applies to you, you may have rights to access, correct, delete or object to the processing of your personal data, and to complain to your local data protection authority. Write to ${mail} to use them.</p>
        <p><strong>United States.</strong> Some US states give residents rights over personal information, including opting out of its sale or sharing for targeted advertising. The site does not sell personal information. If advertising is switched on, the opt-out described above will apply.</p>

        <h2>Children</h2>
        <p>The tools are general-purpose and not aimed at children. The site does not knowingly collect personal information from anyone, of any age.</p>

        <h2>Changes</h2>
        <p>If what the site does with information changes, this page will be updated before the change goes live, and the date below will move.</p>`,
  };
}
