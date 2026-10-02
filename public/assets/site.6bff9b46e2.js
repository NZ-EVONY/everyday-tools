/* Everyday Tools shared behaviour: theme toggle, small-screen menu, tool search on the home
   page, toast and copy-to-clipboard. Header, navigation and footer are plain HTML. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  // Theme: the saved choice is applied before first paint by the inline script in <head>.
  const themeBtn = $("#themeToggle");
  const isDark = () => root.dataset.theme !== "light"; // dark is the default for everyone; the system setting is not followed
  const sync = () => themeBtn?.setAttribute("aria-pressed", String(isDark()));
  themeBtn?.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("et-theme", root.dataset.theme); } catch (e) { /* storage blocked: theme lasts for this page */ }
    sync();
  });
  sync();

  // Small-screen menu is a <details>; close it on outside click and Escape.
  const menu = $("#menu");
  if (menu) {
    document.addEventListener("click", e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); } });
  }

  let timer;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { t.hidden = true; }, 1800);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast("Copied"); }
    catch (e) { toast("Couldn't copy: select the text and copy it yourself"); }
  }

  // Home page tool search: filters the cards already in the page. Nothing is sent anywhere.
  const q = $("#q");
  if (q) {
    const items = $$("[data-kw]");
    const pillars = $$(".pillar");
    const count = $("#count"), empty = $("#empty");
    const total = items.length;
    const filter = () => {
      const terms = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      let shown = 0;
      for (const li of items) {
        const hit = terms.every(t => li.dataset.kw.includes(t));
        li.hidden = !hit;
        if (hit) shown++;
      }
      for (const p of pillars) p.hidden = !p.querySelector("[data-kw]:not([hidden])");
      count.textContent = terms.length ? `${shown} of ${total} tools match` : `${total} tools`;
      empty.dataset.show = String(shown === 0);
      $("#empty-q").textContent = q.value.trim();
    };
    q.addEventListener("input", filter);
    $("#search-form").addEventListener("submit", e => { e.preventDefault(); const first = $("[data-kw]:not([hidden]) a"); if (first) first.focus(); });
    for (const b of $$("[data-q]")) b.addEventListener("click", () => { q.value = b.dataset.q; filter(); q.focus(); });
    $("#clear")?.addEventListener("click", () => { q.value = ""; filter(); q.focus(); });
    document.addEventListener("keydown", e => {
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); }
    });
  }

  window.ET = { $, $$, toast, copyText };
})();
