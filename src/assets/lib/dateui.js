// Small helpers shared by the date tool pages (bundled into each page script).
export function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/** "Friday 2 October 2026" (NZ style). */
export function longDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(Date.UTC(2000, 0, 1));
  wd.setUTCFullYear(y, m - 1, d);
  return `${DAYS[wd.getUTCDay()]} ${d} ${MONTHS[m - 1]} ${y}`;
}
export const plural = (n, word) => `${n.toLocaleString("en-NZ")} ${word}${Math.abs(n) === 1 ? "" : "s"}`;
