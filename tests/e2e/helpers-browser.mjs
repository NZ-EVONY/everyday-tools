// Shared browser setup for e2e tests (Chromium via playwright-core, local static server).
import { createServer } from "../../scripts/serve.mjs";
import { findChrome } from "../../scripts/chrome.mjs";
import { PUBLIC, pages } from "../helpers.mjs";

export const chrome = findChrome();
export const skip = chrome ? false : "NOT VERIFIED: no Chrome/Chromium found";

export async function withBrowser(fn, { root = PUBLIC } = {}) {
  const { chromium } = await import("playwright-core");
  const server = createServer(root).listen(0);
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: chrome });
  try { return await fn(browser, base); } finally { await browser.close(); server.close(); }
}

/** Every built page plus an unknown URL (the 404 template). */
export const ALL_URLS = () => [...pages().filter(p => p.type !== "error").map(p => p.path), "/no-such-page"];
