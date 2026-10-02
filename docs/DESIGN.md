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

- System font stack only (no web fonts). Dark by default for everyone, and light only through the header toggle
  (stored in `localStorage` as `et-theme`, applied before first paint by the one inline script).
- No popups or modals. The header is sticky, as in the approved design (see DECISIONS).
- Results are in reserved, `aria-live` regions; touch targets at least 44px; visible focus rings; skip link;
  `prefers-reduced-motion` turns off transitions.
- Icons are the design's line icons; each page includes only the symbols it uses in an inline SVG sprite.

## Colours and contrast (WCAG 2.2 AA: 4.5:1 for text)

**Recoloured on 3 October 2026 to the Letterpile "Night Edition" palette.** The original "Pounamu & Kōwhai" teal/yellow tokens were replaced by navy, electric blue and violet. Dark is the default for everyone (the system colour scheme is not followed); light shows only when the header toggle sets `data-theme="light"` (saved as `et-theme`). One `theme-color`, `#0A1030`. Yellow (`#FFDD55`) is now only the dark-theme focus ring and the no-JavaScript warning background. `npm run check:contrast` recomputes every pair below from the tokens in `style.css`.

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--bg` / `--bg-2` | `#0E1735` / `#0A1030` | `#F3F5FF` / `#E8ECFF` | page / footer, segmented controls, code blocks |
| `--surface` / `--surface-2` | `#161F4A` / `#1D2960` | `#FFFFFF` / `#F0F3FF` | cards / inputs, quiet panels |
| `--ink` / `--ink-2` / `--ink-3` | `#F2F5FF` / `#CBD5F7` / `#AEBBE6` | `#0A1030` / `#2B3668` / `#4A557F` | body / secondary / muted text |
| `--accent` (links) | `#7FB0FF` | `#1F4FD8` | links, icons, chips |
| `--accent-2` / `--violet` | `#4D8DFF` / `#9A7BFF` | same | chart and legend colours |
| `--grad` | `#4D8DFF` to `#9A7BFF` | same | primary button, key result, icon hover, bullets |
| `--on-grad` | `#0A1030` | same | text on the gradient (5.8:1 to 5.9:1) |
| `--line` / `--line-2` / `--field` | `#2D3E86` / `#4559AD` / `#7F92E6` | `#CBD3F5` / `#A7B3E6` / `#6A76A8` | borders / input borders (3:1 needed) |
| `--focus` | `#FFDD55` | `#1D3FD1` | focus ring |
| `--error` | `#FF9A8A` | `#B3261E` | error text and borders |

| Pair | Dark | Light |
|---|---|---|
| body text on page | 16.17:1 | 17.10:1 |
| secondary text on card | 10.84:1 | 11.47:1 |
| muted text on card | 8.31:1 | 7.25:1 |
| muted text on quiet panel | 7.18:1 | 6.55:1 |
| links on page / card | 8.01:1 / 7.19:1 | 6.10:1 / 6.63:1 |
| error text on card | 7.71:1 | 6.54:1 |
| navy text on gradient (blue / middle / violet) | 5.82 / 5.95 / 5.89:1 | same |
| input border on card (non-text, 3:1) | 5.38:1 | 4.40:1 |
| focus ring on page | 13.19:1 | 7.20:1 |

axe-core reports no serious or critical issues on any page in either theme (Phase 2 e2e run).

## Budgets (per page, gzip) and Phase 2 measurements
| Budget | Limit | Measured (largest page) |
|---|---|---|
| HTML | 60 KB | 8.5 KB (`/nz-paye-calculator`) |
| CSS | 12 KB | 10.9 KB (one shared file, after Phase 4) |
| JS | 15 KB | 6.2 KB (`/kiwisaver-calculator`: site.js 1.4 + kiwisaver.js 4.8); the text Worker (2.6 KB) loads only for input over 200,000 characters |
