// /contact. Email only: no form, no promised reply time.
export default function page(ctx) {
  const { site, link } = ctx;
  const mail = `<a href="mailto:${site.contactEmail}">${site.contactEmail}</a>`;
  return {
    path: "/contact",
    type: "trust",
    status: "published",
    reviewed: "2026-10-02",
    title: "Contact Everyday Tools",
    description: "How to contact Everyday Tools by email: report a wrong rate or date, a bug in a tool, or suggest an improvement.",
    h1: "Contact",
    sources: [], claims: [],
    body: `
        <p>Email is the way to reach the publisher: ${mail}. ${site.brand} is run by ${site.operatorName} in New Zealand, and there is no contact form, so nothing you send passes through the site itself. Plain text is fine, and a short message with the page address usually says everything needed.</p>

        <h2>Good reasons to write</h2>
        <ul>
          <li><strong>A rate, threshold or date looks wrong.</strong> These matter most. Include the page address, the figure you think is wrong and a link to the official page that shows the right one.</li>
          <li><strong>A tool gives an odd result.</strong> Say what you entered, what you expected and what you got, plus the browser and device you were using. Please don't send real personal or financial details; invented numbers that show the same problem are perfect.</li>
          <li><strong>Something is hard to use.</strong> Problems with a screen reader, keyboard navigation, small screens or printing are all worth reporting.</li>
          <li><strong>An idea for an improvement</strong> to an existing tool, or a simple everyday tool that would fit the site.</li>
        </ul>

        <h2>What to expect</h2>
        <p>Every message is read, and corrections to official figures are dealt with first. The site is run by one independent publisher, so a reply can't be promised and there is no fixed response time. Fixes show up on the page itself, with an updated "Last reviewed" date.</p>
        <p>The site can't give personal tax, KiwiSaver, employment or legal advice by email. For questions about your own situation, contact Inland Revenue, your employer, your KiwiSaver provider or a qualified adviser.</p>

        <h2>Before you write</h2>
        <p>Many questions are answered on the pages themselves. Each calculator explains its method, shows a worked example and lists the reasons a result might differ from a pay slip or invoice. The source notice near the top of each money page links straight to the official page the figures came from, which is the quickest way to check whether a rate has changed. The ${link("/about", "about page")} explains how figures are sourced and dated.</p>

        <h2>Your email and privacy</h2>
        <p>Your message is used only to read and answer it, and is never added to a mailing list. The ${link("/privacy-policy", "privacy policy")} explains how email is handled and how to ask for it to be deleted.</p>`,
  };
}
