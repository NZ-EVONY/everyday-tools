# Design

**The approved look is the "Pounamu & Kōwhai" design system in `design/` (`home.html`, `tool-gst.html`,
`screenshots/`), approved by the owner on 2 October 2026.** Every page follows it. The mockups' CSS is
now `src/assets/style.css` (unchanged apart from the additions marked at the end of the file), and the
templates use the mockups' markup: sticky header with pill navigation and a `<details>` menu on small
screens, gradient hero, tool cards, a tool panel beside a results column, prose with gradient bullets,
an aside of related links, and the four-column footer.

Mockup content was treated as sample copy: the build supplies the real text and figures from `content/`
and `data/`, so wording that the mockups used but that isn't sourced (for example, example exempt
supplies) was not carried over.

- System font stack only (no web fonts). Light and dark themes from `prefers-color-scheme`, plus a toggle
  stored in `localStorage` (`et-theme`) and applied before first paint by the one inline script.
- No popups or modals. The header is sticky, as in the approved design (see DECISIONS).
- Results are in reserved, `aria-live` regions; touch targets at least 44px; visible focus rings; skip link;
  `prefers-reduced-motion` turns off transitions.
- Icons are the design's line icons; each page includes only the symbols it uses in an inline SVG sprite.

## Colours and contrast (WCAG 2.2 AA: 4.5:1 for text)

| Theme | Pair | Colours | Ratio |
|---|---|---|---|
| light | body text on page | `#0B1F1A` on `#F6F5EF` | 15.69:1 |
| light | secondary text on card | `#34473F` on `#FFFFFF` | 9.91:1 |
| light | muted text on page | `#52665D` on `#F6F5EF` | 5.63:1 |
| light | muted text on card | `#52665D` on `#FFFFFF` | 6.15:1 |
| light | links and accent on page | `#006B58` on `#F6F5EF` | 5.93:1 |
| light | links and accent on card | `#006B58` on `#FFFFFF` | 6.47:1 |
| light | dark text on gradient (green end) | `#03221B` on `#00B792` | 6.56:1 |
| light | dark text on gradient (yellow end) | `#03221B` on `#F6C544` | 10.40:1 |
| light | error text on card | `#B42318` on `#FFFFFF` | 6.57:1 |
| dark | body text on page | `#E9F5F0` on `#06120E` | 17.07:1 |
| dark | muted text on card | `#8DA69D` on `#0E1F19` | 6.57:1 |
| dark | links and accent on page | `#3FE0B5` on `#06120E` | 11.39:1 |
| dark | links and accent on card | `#3FE0B5` on `#0E1F19` | 10.21:1 |
| dark | dark text on gradient (green end) | `#03221B` on `#19D3A8` | 8.75:1 |
| dark | error text on card | `#FF9B8C` on `#0E1F19` | 8.40:1 |

axe-core reports no serious or critical issues on any page in either theme (Phase 2 e2e run).

## Budgets (per page, gzip) and Phase 2 measurements
| Budget | Limit | Measured (largest page) |
|---|---|---|
| HTML | 60 KB | 8.5 KB (`/nz-paye-calculator`) |
| CSS | 12 KB | 10.7 KB (one shared file, after Phase 3) |
| JS | 15 KB | 6.2 KB (`/kiwisaver-calculator`: site.js 1.4 + kiwisaver.js 4.8) |
