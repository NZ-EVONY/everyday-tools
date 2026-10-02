// Guide: printing calendars and planners at home. Paper sizes are the ISO 216 and US Letter dimensions; no other rules stated.
export default function page(ctx) {
  const { link } = ctx;
  const mm = (w, h) => `${w} × ${h} mm`;
  const sizes = [["A3", mm(297, 420), "wall planners, a year on one sheet you can read across the room"], ["A4", mm(210, 297), "standard New Zealand printer paper; calendars, planners and checklists"], ["A5", mm(148, 210), "half an A4 sheet; diary inserts and pocket lists"], ["US Letter", `8.5 × 11 in (${mm(215.9, 279.4)})`, "the usual size in the US and Canada"]];
  return {
    path: "/guides/printing-calendars-and-planners-at-home",
    type: "guide", pillar: "guides", topic: "Printing", status: "published", reviewed: "2026-10-03", published: "2026-10-03",
    title: "Printing Calendars and Planners at Home: A Practical Guide",
    description: "Print calendars and planners properly at home: A4 or Letter, scale and margins, double-sided pages the right way up, paper choice and saving ink.",
    crumbName: "Printing calendars and planners",
    h1: "Printing calendars and planners",
    h1Accent: "at home",
    sources: [], claims: [],
    intro: `<p>A printed calendar on the fridge or a weekly planner on the desk is still one of the easiest ways to keep a household or a class organised. Getting it onto paper can be fiddly, though: grids shrink, edges get cut off, and the back of a double-sided sheet comes out upside down. This guide covers paper sizes, the print settings that matter, double-sided printing, and a few tips for making printouts last.</p>`,
    body: `
        <p class="lede">Match the paper size in the page and in the print dialog, print at 100 per cent rather than "fit to page", turn off headers and footers, and for double-sided sheets choose the flip edge that matches the orientation.</p>

        <h2>A4, A5, A3 or US Letter</h2>
        <p>New Zealand uses the international A series of paper sizes. Each size is half the one before it, cut across the long side, and every sheet has the same shape, so a layout scales cleanly from one to another. US Letter is a little wider and shorter than A4, which is why a page designed for one can be clipped or shrunk on the other.</p>
        <table><thead><tr><th scope="col">Size</th><th scope="col">Dimensions</th><th scope="col">Good for</th></tr></thead><tbody>${sizes.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>
        <p>Most home printers take A4 and nothing larger. If you want an A3 wall planner, a library, copy shop or office printer is usually the answer: save the page as a PDF set to A3 and take that file along. To make an A5 booklet from A4, print two pages per sheet and cut or fold down the middle.</p>

        <h2>The print settings that matter</h2>
        <p>Open the print dialog and work through these in order. First, the paper size, which should match the size chosen on the page. Second, the scale: choose 100 per cent, sometimes called actual size or default. "Fit to page" sounds safe but can shrink a grid unevenly, leaving one margin wider than the other. Third, headers and footers: most browsers add the page address, date and page numbers to the edges unless you turn this off, usually under "More settings". Fourth, background graphics: switch them on if the page uses shading you want to keep.</p>
        <p>Before printing several copies, use "Save as PDF" as the destination and open the file. If the PDF looks right on one page, the printout will too. That habit catches most problems without wasting paper.</p>
        <!--@slot after-intro-->
        <h2>Margins and the edge of the page</h2>
        <p>Home printers can't print right to the edge of the sheet. Most leave a strip of a few millimetres unprinted, and the width varies between models. Layouts built for printing leave a margin wider than that, so nothing important gets cut off. If a line near the edge goes missing, don't reduce the scale first. Check that the paper size matches, because a Letter layout on A4 paper, or the other way round, is the usual culprit. If you plan to hole-punch or bind the sheets, leave extra room on the binding edge, or choose a layout with wider boxes so the holes don't land on your writing.</p>

        <h2>Double-sided printing without upside-down pages</h2>
        <p>The setting that trips people up is the flip edge. For a portrait page, choose "flip on long edge", like turning the pages of a book. For a landscape page, choose "flip on short edge", like a notepad hinged at the top, otherwise the back comes out upside down. If your printer has no automatic double-sided option, print the odd pages, put the stack back in the tray, then print the even pages. Test with two sheets first, because printers differ in which way up the paper must go back in. A pencil mark in one corner of the top sheet before you reload it shows you how the paper travels.</p>
        <!--@slot mid-content-->
        <h2>Choosing paper</h2>
        <p>Paper weight is measured in grams per square metre (gsm). Ordinary copy paper is around 80 gsm, which is fine for checklists and anything you'll replace weekly. For a calendar that stays on the wall for a month, a heavier paper of around 120 to 160 gsm feels sturdier and lets less ink show through. Check your printer's manual for the heaviest paper it accepts, and feed heavy sheets one at a time if it struggles. For something you'll reuse, like a chore chart, laminate it or slide it into a clear sleeve and write on it with a whiteboard marker.</p>

        <h2>Saving ink</h2>
        <p>Layouts with thin black lines and light grey shading use little ink and print well on any printer. Choosing greyscale or draft mode in the print dialog saves more, at the cost of slightly paler lines. For a full year, a single sheet with all twelve months uses far less paper than twelve monthly pages, and suits a pinboard. Print monthly pages only when you need space to write in each day.</p>

        <h2>Which printable for which job</h2>
        <ul>
          <li><strong>A month at a glance</strong> with holidays marked: the ${link("/printable-calendar", "printable calendar")}, one month per page or the whole year on one sheet.</li>
          <li><strong>A week by the hour</strong>, or a school or work timetable: the ${link("/weekly-planner-and-timetable", "weekly planner and timetable")}.</li>
          <li><strong>Shopping, packing or chores</strong>: the ${link("/printable-checklist", "printable checklist")}, which can turn a pasted list into tick boxes.</li>
        </ul>
        <p>All three build the page in your browser, so nothing you type is sent anywhere, and each keeps its layout settings in the page address so a bookmark brings back the same design. If something still won't fit on one page, check the paper size and scale again before anything else; those two settings fix most printing problems.</p>`,
    related: [
      { href: "/printable-calendar", label: "Printable calendar" },
      { href: "/weekly-planner-and-timetable", label: "Weekly planner and timetable" },
      { href: "/printables", label: "All printables" },
    ],
  };
}
