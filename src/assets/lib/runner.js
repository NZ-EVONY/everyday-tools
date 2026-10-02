// Runs text jobs in the Worker when the input is large and Workers are available, otherwise on the
// main thread. A newer job replaces an older one, so only the latest result is shown.
import { cleanText } from "./textclean.js";
import { countText } from "./count.js";

export const WORKER_THRESHOLD = 200000;

export function makeRunner(workerUrl) {
  let worker = null, seq = 0, failed = false;
  const pending = new Map();
  function getWorker() {
    if (worker || failed || !workerUrl || typeof Worker === "undefined") return worker;
    try {
      worker = new Worker(workerUrl);
      worker.onmessage = e => { const p = pending.get(e.data.id); if (!p) return; pending.delete(e.data.id); e.data.error ? p.reject(new Error(e.data.error)) : p.resolve(e.data.result); };
      worker.onerror = () => { failed = true; worker = null; for (const [id, p] of pending) { pending.delete(id); p.retry(); } };
    } catch (e) { failed = true; worker = null; }
    return worker;
  }
  const local = (op, text, options) => (op === "count" ? countText(text, options) : cleanText(text, options));
  return {
    usedWorker: false,
    run(op, text, options) {
      const id = ++seq;
      const w = text.length > WORKER_THRESHOLD ? getWorker() : null;
      this.usedWorker = !!w;
      if (!w) return Promise.resolve({ id, result: local(op, text, options), latest: () => id === seq });
      return new Promise((resolve, reject) => {
        pending.set(id, {
          resolve: result => resolve({ id, result, latest: () => id === seq }),
          reject,
          retry: () => resolve({ id, result: local(op, text, options), latest: () => id === seq }),
        });
        w.postMessage({ id, op, text, options });
      });
    },
  };
}
