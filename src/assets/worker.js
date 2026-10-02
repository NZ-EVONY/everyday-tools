// Web Worker for large text (over 200,000 characters): runs the same pure functions as the page,
// so a big paste never freezes the browser. The page falls back to the main thread if Workers fail.
import { cleanText } from "./lib/textclean.js";
import { countText } from "./lib/count.js";

self.onmessage = e => {
  const { id, op, text, options } = e.data;
  try {
    const result = op === "count" ? countText(text, options) : cleanText(text, options);
    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message || err) });
  }
};
