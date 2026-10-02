// Tool cards and guide links from the approved design. A card links only when its page is
// published; otherwise it shows as "Coming soon" with no link.
import { esc } from "./util.mjs";
import { icon } from "../icons.mjs";

export function toolCard(t, { isPublished, blurb }) {
  const live = isPublished(t.path);
  const text = blurb(t.blurb);
  const kw = esc(`${t.name} ${text.replace(/<[^>]+>/g, "")} ${t.kw}`.toLowerCase());
  const title = live ? `<a href="${t.path}">${esc(t.name)}</a>` : esc(t.name);
  const foot = live ? `<div class="foot"><span class="chip">Free</span><span class="go" aria-hidden="true">${icon("arrow")}</span></div>` : `<div class="foot"><span class="chip quiet">Coming soon</span></div>`;
  return `<li data-kw="${kw}"><article class="card${live ? "" : " soon"}"><div class="ic">${icon(t.icon)}</div><h3>${title}</h3><p>${text}</p>${foot}</article></li>`;
}

export function toolGrid(tools, opts) {
  return `<ul class="grid">${tools.map(t => toolCard(t, opts)).join("")}</ul>`;
}

export function guideLink(g) {
  return `<a class="guide" href="${g.path}"><span><small>${esc(g.topic || "Guide")}</small>${esc(g.h1)}</span>${icon("arrow")}</a>`;
}
