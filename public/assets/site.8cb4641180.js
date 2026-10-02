/* Everyday Tools shared behaviour: menu, theme toggle, toast and copy-to-clipboard.
   Header, navigation and footer are plain HTML; this file only adds behaviour. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);

  const menuBtn = $("#menuToggle");
  menuBtn?.addEventListener("click", () => {
    const open = $("#navbar").classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  // The saved theme is applied before first paint by the inline script in <head>.
  const root = document.documentElement;
  const themeBtn = $("#themeToggle");
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
  const sync = () => themeBtn?.setAttribute("aria-pressed", String(isDark()));
  themeBtn?.addEventListener("click", () => {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) { /* storage blocked: theme lasts for this page only */ }
    sync();
  });
  sync();

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
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied");
    } catch (e) {
      toast("Couldn't copy: select the text and copy it yourself");
    }
  }

  window.ET = { $, toast, copyText };
})();
