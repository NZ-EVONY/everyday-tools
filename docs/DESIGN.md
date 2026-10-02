# Design

- One column, text width about 720px, mobile first; the tool sits directly under the H1 and a
  short intro, above the fold at 360px.
- System font stack only (no web fonts). Light and dark themes from `prefers-color-scheme`,
  plus a toggle stored in `localStorage` and applied before first paint by the one inline script.
- No popups, modals or sticky bars. Native `<details>` for FAQs and the line-item panel.
- Results are in `aria-live="polite"` regions with a reserved minimum height so nothing shifts.
- Touch targets at least 44px; visible focus outline; skip link; `prefers-reduced-motion` respected.

## Colours and contrast (WCAG 2.2 AA: 4.5:1 text, 3:1 non-text)

| Theme | Pair | Colours | Ratio |
|---|---|---|---|
| light | text on page background | `#1b2124` on `#f6f7f5` | 15.15:1 |
| light | text on card | `#1b2124` on `#ffffff` | 16.28:1 |
| light | muted text on card | `#56626a` on `#ffffff` | 6.27:1 |
| light | muted text on background | `#56626a` on `#f6f7f5` | 5.83:1 |
| light | link on card | `#0a6158` on `#ffffff` | 7.33:1 |
| light | link on background | `#0a6158` on `#f6f7f5` | 6.82:1 |
| light | link on source notice | `#0a6158` on `#f1f6f4` | 6.71:1 |
| light | button text on accent | `#ffffff` on `#0b6b61` | 6.38:1 |
| light | selected option text | `#1b2124` on `#e7f3f0` | 14.33:1 |
| light | error text | `#a3261b` on `#ffffff` | 7.37:1 |
| light | input border | `#7a878d` on `#ffffff` | 3.70:1 |
| dark | text on background | `#e6ecea` on `#14181a` | 14.93:1 |
| dark | text on card | `#e6ecea` on `#1c2225` | 13.45:1 |
| dark | muted text on card | `#a5b2b7` on `#1c2225` | 7.40:1 |
| dark | link on card | `#73d3c5` on `#1c2225` | 9.08:1 |
| dark | link on source notice | `#73d3c5` on `#1a2a28` | 8.43:1 |
| dark | button text on accent | `#0b1a18` on `#4fc1b1` | 8.16:1 |
| dark | selected option text | `#e6ecea` on `#1d3330` | 11.19:1 |
| dark | error text | `#ff9c90` on `#1c2225` | 7.98:1 |
| dark | input border | `#7a878d` on `#1c2225` | 4.35:1 |

axe-core reports no serious or critical issues on any page in either theme (Phase 1 e2e run).

## Budgets (per page, gzip) and Phase 1 measurements
| Budget | Limit | Measured (largest page so far) |
|---|---|---|
| HTML | 60 KB | 5.4 KB (`/gst-calculator`) |
| CSS | 12 KB | 2.9 KB (one shared file) |
| JS | 15 KB | 4.2 KB on `/gst-calculator` (site.js 0.8 + gst.js 3.4) |
