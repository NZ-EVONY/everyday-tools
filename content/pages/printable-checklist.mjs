// /printable-checklist
import { paperFields } from "./printable-calendar.mjs";

export default function page(ctx) {
  const { link, icon } = ctx;
  return {
    path: "/printable-checklist",
    type: "tool",
    pillar: "printables",
    status: "published",
    reviewed: "2026-10-02",
    title: "Printable Checklist Maker: Lists with Tick Boxes",
    description: "Turn any list into a printable checklist with tick boxes: one or two columns, square or round boxes, spare lines, A4 or US Letter.",
    crumbName: "Printable checklist",
    h1: "Printable checklist",
    h1Accent: "maker",
    appName: "Printable checklist maker",
    script: "checklist",
    chips: [`<span class="chip">${icon("checklist")}Paste a list, print boxes</span>`],
    sources: [], claims: [],
    intro: `<p>Turn a list into a tidy checklist with a tick box beside every item. Type or paste the items, one per line, give the list a title, and choose one or two columns, square or round boxes, and how many blank lines to leave at the end for things you think of later. Bullets and dashes pasted from other apps are tidied away. Print it on A4 or US Letter for a packing list, chores chart or moving-day plan.</p>`,
    tool: `<form id="ckForm" autocomplete="off" novalidate>
      <div class="panel-h"><h2>Your list</h2></div>
      <div class="field"><label for="ckTitle">Title</label><input class="in" id="ckTitle" type="text" maxlength="60" placeholder="Camping trip"></div>
      <div class="field"><label for="ckItems">Items, one per line</label><textarea class="in" id="ckItems" rows="8" maxlength="20000" aria-describedby="ckHint ckCount" placeholder="Tent&#10;Sleeping bags&#10;Torch and batteries"></textarea><span class="muted" id="ckCount"></span></div>
      <fieldset><legend class="field-label">Columns</legend>
        <div class="seg"><label><input type="radio" name="cols" value="1" checked><span>One</span></label><label><input type="radio" name="cols" value="2"><span>Two</span></label></div>
      </fieldset>
      <fieldset><legend class="field-label">Boxes</legend>
        <div class="seg"><label><input type="radio" name="box" value="square" checked><span>Square</span></label><label><input type="radio" name="box" value="circle"><span>Round</span></label></div>
      </fieldset>
      <div class="fields"><div class="field"><label for="ckSpare">Blank lines at the end</label><input class="in" id="ckSpare" type="text" inputmode="numeric" maxlength="2" value="3"></div></div>
      ${paperFields(ctx, { orient: false })}
      <p class="hint" id="ckHint" role="alert"></p>
    </form>`,
    results: `<div class="actions no-print"><button type="button" class="btn btn-primary btn-sm" id="ckPrint">${icon("file")}Print</button></div>
      <p class="print-tips">Print at 100% ("actual size") with headers and footers turned off.</p>
      <p class="sr-only" id="sr" role="status" aria-live="polite"></p>
      <div class="print-area" id="printArea" aria-label="Print preview"></div>`,
    body: `
        <h2>Pasting a list from somewhere else</h2>
        <p>Each line becomes one item. Blank lines are skipped, spaces at the start and end are trimmed, and common list markers are removed: a hyphen, an asterisk, a bullet (•) or an empty box like [ ] at the start of a line. That means you can paste straight from a notes app, an email or a document without cleaning it up first. If a line is too long it wraps inside its row rather than running off the page. Up to 200 items fit the tool; most lists that size need two columns or two pages.</p>

        <h2>Choosing a layout</h2>
        <ul>
          <li><strong>One column</strong> suits lists with longer items, such as steps in a process or a moving-day plan with notes.</li>
          <li><strong>Two columns</strong> suits short items, like a grocery list, packing list or chores chart, and fits roughly twice as many on a page.</li>
          <li><strong>Square boxes</strong> are the familiar tick box; <strong>round boxes</strong> look like bullet points and suit lists that are crossed off rather than ticked.</li>
          <li><strong>Blank lines</strong> at the end leave room for things added later. Set it to zero for a closed list.</li>
        </ul>

        <h2>A worked example</h2>
        <p>Paste "- Tent", "- Sleeping bags", "• Torch and batteries" and "[ ] First aid kit" on four lines and the checklist shows four tidy items, "Tent", "Sleeping bags", "Torch and batteries" and "First aid kit", each with its own box, followed by three blank lines. Switch to two columns and they reflow side by side.</p>
        <!--@slot after-explainer-1-->
        <h2>Ideas that work well</h2>
        <ul>
          <li><strong>Packing lists</strong> for camping, holidays or a hospital bag, kept in a bookmark and reprinted for each trip.</li>
          <li><strong>Chore charts</strong> for flatmates or children, one list per person or per week.</li>
          <li><strong>Moving house</strong>: utilities to transfer, addresses to update, rooms to clean before the final inspection.</li>
          <li><strong>Event checklists</strong> for a birthday, a fundraiser or a working bee, where several people tick things off on the same sheet.</li>
        </ul>

        <h2>Printing well</h2>
        <p>Choose the same paper size in the print dialog, set scale to 100 per cent, and turn off headers and footers. The checklist is black and white with light row lines, so it prints cleanly on any printer. If the list runs past one page, the browser continues it on the next page without splitting an item across the break.</p>

        <h2>Privacy</h2>
        <p>Your list stays in your browser. It isn't saved, sent or put in the page address; only layout choices such as columns and box style are kept after the # sign. Close the tab and the list is gone, so print or copy it before you leave. For a plain-text clean-up before printing, such as removing duplicate lines or sorting the list, ${ctx.isPublished("/text-cleaner") ? `use the ${link("/text-cleaner", "text cleaner")}` : "text tools are coming soon"}. For dates, use the ${link("/printable-calendar", "printable calendar")}.</p>`,
    related: [
      { href: "/weekly-planner-and-timetable", label: "Weekly planner and timetable" },
      { href: "/printable-calendar", label: "Printable calendar" },
      { href: "/printables", label: "All printables" },
    ],
  };
}
