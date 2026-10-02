// /printables hub
export default function page(ctx) {
  const { link, holidays } = ctx;
  const years = Object.keys(holidays.years).sort();
  return {
    path: "/printables",
    type: "hub",
    pillar: "printables",
    status: "published",
    reviewed: "2026-10-02",
    title: "Printables: Calendars, Planners and Checklists",
    description: "Free printable calendars with NZ holidays, weekly planners, hourly timetables and checklists. Set up on screen, print on A4 or US Letter.",
    h1: "Printable calendars,",
    h1Accent: "planners and checklists",
    intro: `<p>Set up a page on screen, check the preview, and print it at home. Every printable here is black and white, sized for A4 or US Letter, and built to fit the page without fiddling.</p>`,
    top: `<section class="hub-tools" aria-labelledby="hub-tools-h"><h2 class="sec-title" id="hub-tools-h">The printables</h2>${ctx.toolGrid("printables", ctx.isPublished)}</section>`,
    sources: [], claims: [],
    body: `
        <h2>Which one do you need?</h2>
        <p>For a wall or fridge calendar, the ${link("/printable-calendar", "printable calendar")} prints one month, all twelve months, or the whole year on one sheet, with weeks starting on Monday or Sunday. New Zealand public holidays and your regional anniversary day are marked for ${years.join(" and ")}. For organising a single week, the ${link("/weekly-planner-and-timetable", "weekly planner")} gives a row per day with room for plans and priorities, and the same tool makes an hourly timetable for school, university, shifts or family routines. For anything you want to tick off, the ${link("/printable-checklist", "printable checklist")} turns a pasted list into rows with tick boxes.</p>

        <h2>Printing at home without surprises</h2>
        <p>Three settings in your browser's print dialog matter most. Choose the same paper size as the printable, set the scale to 100 per cent (or "actual size") rather than fit to page, and turn off headers and footers so the page address doesn't print along the edges. Each printable leaves a margin of about 10 mm, which suits most home printers. Only the printable itself is printed: the site's menus, explanations and buttons are hidden automatically.</p>
        <p>The designs use thin black lines and light grey shading, so they print well in black and white and use little ink. If your printer has a draft or economy mode, it's usually fine for planners and checklists.</p>

        <h2>Privacy</h2>
        <p>What you type into a printable, such as checklist items or a timetable title, stays in your browser and isn't saved or sent. Layout choices are kept in the page address after the # sign, so you can bookmark a setup and print it again next week. To work out dates before printing, try the ${link("/date-and-time-tools", "date and time tools")}.</p>`,
  };
}
