// Site header: brand, menu button (small screens) and theme toggle.
export default function header({ site }) {
  return `<header class="masthead">
  <div class="wrap bar">
    <a class="brand" href="/"><svg aria-hidden="true" width="28" height="28" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor"/><path d="M9 11h14M9 16h9M9 21h11" stroke="var(--brand-ink)" stroke-width="2.6" stroke-linecap="round"/></svg><span>${site.brand}</span></a>
    <button class="icon-btn menu-toggle" id="menuToggle" type="button" aria-expanded="false" aria-controls="navbar"><span class="sr">Menu</span><svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <button class="icon-btn theme-toggle" id="themeToggle" type="button" aria-pressed="false"><span class="sr">Dark theme</span><svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 2.5a7.5 7.5 0 0 1 0 15z" fill="currentColor"/></svg></button>
  </div>
</header>`;
}
