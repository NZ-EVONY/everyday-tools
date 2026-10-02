// Line icons from the approved design (design/). The build adds only the symbols a page uses
// to an inline SVG sprite at the top of <body>; templates reference them with icon(name).
export const ICONS = {
 "percent": "<path d=\"M19 5 5 19\"/><circle cx=\"7.2\" cy=\"7.2\" r=\"2.4\"/><circle cx=\"16.8\" cy=\"16.8\" r=\"2.4\"/>",
 "wallet": "<path d=\"M3.5 7.5A2.5 2.5 0 0 1 6 5h11v3.5\"/><path d=\"M3.5 7.5V17A2.5 2.5 0 0 0 6 19.5h12.5a1 1 0 0 0 1-1V9.5a1 1 0 0 0-1-1H6a2.5 2.5 0 0 1-2.5-1z\"/><circle cx=\"15.8\" cy=\"14\" r=\"1.1\"/>",
 "sprout": "<path d=\"M12 20.5V11\"/><path d=\"M12 11c0-3.8 2.6-6 7-6 0 3.8-2.6 6-7 6z\"/><path d=\"M12 14.5c0-2.8-1.9-4.5-6-4.5 0 2.8 1.9 4.5 6 4.5z\"/>",
 "home": "<path d=\"M3.5 11 12 4l8.5 7\"/><path d=\"M5.5 9.8V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.8\"/><path d=\"M12 13v7M9.5 16h5\"/>",
 "ruler": "<path d=\"M3.5 16.5 16.5 3.5l4 4-13 13z\"/><path d=\"m7.5 12.5 2 2M10.5 9.5l2 2M13.5 6.5l2 2\"/>",
 "range": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15.5\" rx=\"3\"/><path d=\"M8 3v4M16 3v4M3.5 10h17M8 15h8\"/><path d=\"m14 13 2 2-2 2\"/>",
 "hourglass": "<path d=\"M6.5 3.5h11M6.5 20.5h11\"/><path d=\"M7.5 3.5c0 4.8 4.5 5.7 4.5 8.5s-4.5 3.7-4.5 8.5\"/><path d=\"M16.5 3.5c0 4.8-4.5 5.7-4.5 8.5s4.5 3.7 4.5 8.5\"/>",
 "calplus": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15.5\" rx=\"3\"/><path d=\"M8 3v4M16 3v4M3.5 10h17M12 12.5v5M9.5 15h5\"/>",
 "brief": "<rect x=\"3.5\" y=\"7.5\" width=\"17\" height=\"12.5\" rx=\"2.5\"/><path d=\"M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 13h17\"/>",
 "globe": "<circle cx=\"12\" cy=\"12\" r=\"8.75\"/><path d=\"M3.5 12h17M12 3.3c3 3.2 3 14.2 0 17.4M12 3.3c-3 3.2-3 14.2 0 17.4\"/>",
 "timer": "<circle cx=\"12\" cy=\"13.5\" r=\"7.5\"/><path d=\"M12 9.5v4l2.6 1.6M9.5 2.8h5\"/>",
 "cal": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15.5\" rx=\"3\"/><path d=\"M8 3v4M16 3v4M3.5 10h17\"/><path d=\"M8 14h.01M12 14h.01M16 14h.01M8 17.2h.01M12 17.2h.01\"/>",
 "grid": "<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15.5\" rx=\"3\"/><path d=\"M3.5 9.5h17M9.5 9.5v10.5\"/>",
 "checklist": "<path d=\"m4 6.5 1.4 1.4L8 5.2M4 12.5l1.4 1.4L8 11.2M4 18.5l1.4 1.4L8 17.2\"/><path d=\"M12 7h8M12 13h8M12 19h8\"/>",
 "sparkles": "<path d=\"M11 3.5 12.9 9l5.6 1.9-5.6 1.9L11 18.3 9.1 12.8 3.5 10.9 9.1 9z\"/><path d=\"M19 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z\"/>",
 "type": "<path d=\"M4.5 7.5v-2h15v2M12 5.5v13M9 18.5h6\"/>",
 "copy": "<rect x=\"8.5\" y=\"8.5\" width=\"12\" height=\"12\" rx=\"2.5\"/><path d=\"M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2\"/>",
 "blank": "<path d=\"M4 6h16M4 18h16\"/><path d=\"M8 12h8\" stroke-dasharray=\"1.5 3\"/>",
 "sort": "<path d=\"M7 4.5v15M7 19.5l-3-3M7 19.5l3-3\"/><path d=\"M14.5 6h6M14.5 11h4.5M14.5 16h3\"/>",
 "brackets": "<path d=\"M8 4.5H5.5v15H8M16 4.5h2.5v15H16\"/><path d=\"M10 9.5h4M10 14.5h4\"/>",
 "shield": "<path d=\"M12 3.2 5 6v5.2c0 4.7 3 8.2 7 9.6 4-1.4 7-4.9 7-9.6V6z\"/><path d=\"m9 12 2.2 2.2L15.2 10\"/>",
 "file": "<path d=\"M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z\"/><path d=\"M14 3.5V8h4.5M9 14.2l2 2 3.8-3.8\"/>",
 "bolt": "<path d=\"M13 3 5 14h6l-1 7 8-11h-6z\"/>",
 "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"m20 20-4.4-4.4\"/>",
 "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4\"/>",
 "moon": "<path d=\"M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z\"/>",
 "menu": "<path d=\"M4 7.5h16M4 12h16M4 16.5h16\"/>",
 "arrow": "<path d=\"M5 12h14M13 6l6 6-6 6\"/>",
 "plus": "<path d=\"M12 5v14M5 12h14\"/>",
 "trash": "<path d=\"M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12\"/>",
 "reset": "<path d=\"M4 12a8 8 0 1 0 2.6-5.9\"/><path d=\"M4 4.5v4.6h4.6\"/>",
 "check": "<path d=\"m5 12.5 4.5 4.5L19 7.5\"/>",
 "chev": "<path d=\"m6 9.5 6 6 6-6\"/>",
 "info": "<circle cx=\"12\" cy=\"12\" r=\"8.75\"/><path d=\"M12 11v5M12 8h.01\"/>",
 "mail": "<rect x=\"3.5\" y=\"5.5\" width=\"17\" height=\"13\" rx=\"2.5\"/><path d=\"m4 7.5 8 6 8-6\"/>",
 "lock": "<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"9.5\" rx=\"2.5\"/><path d=\"M8 10.5V8a4 4 0 0 1 8 0v2.5\"/>"
};

export const icon = (name, cls = "") => {
  if (!ICONS[name]) throw new Error(`Unknown icon ${name}`);
  return `<svg class="ico${cls ? " " + cls : ""}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;
};

/** The sprite for one page: only the symbols it references. */
export function sprite(html) {
  const used = [...new Set([...html.matchAll(/href="#i-([a-z]+)"/g)].map(m => m[1]))].filter(n => ICONS[n]).sort();
  if (!used.length) return "";
  return `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false"><defs>${used.map(n => `<symbol id="i-${n}" viewBox="0 0 24 24">${ICONS[n]}</symbol>`).join("")}</defs></svg>`;
}
