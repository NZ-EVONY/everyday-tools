// Time zones through the browser's built-in Intl data (no network). Converts a wall-clock time
// in one IANA zone to an instant, and formats instants in other zones.

/** Offset of `zone` from UTC at instant `ms`, in minutes (NZDT = +780). */
export function offsetMinutes(ms, zone) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).filter(x => x.type !== "literal").map(x => [x.type, +x.value]));
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
}

/**
 * The instant for a wall-clock date ("YYYY-MM-DD") and time ("HH:MM") in `zone`.
 * Returns { ms, status: "ok" | "gap" | "overlap" }. In a spring-forward gap the time doesn't exist
 * and the result moves forward by the gap; in an autumn overlap the earlier (daylight) instant is used.
 */
export function zonedToInstant(date, time, zone) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  const candidates = new Set();
  for (const guess of [wall - 14 * 3600000, wall, wall + 14 * 3600000]) {
    const off = offsetMinutes(guess, zone);
    const ms = wall - off * 60000;
    if (offsetMinutes(ms, zone) === off) candidates.add(ms);
  }
  const list = [...candidates].sort((a, b) => a - b);
  if (list.length === 0) {
    const before = offsetMinutes(wall - 86400000, zone);
    return { ms: wall - before * 60000, status: "gap" };
  }
  return { ms: list[0], status: list.length > 1 ? "overlap" : "ok" };
}

export function formatInZone(ms, zone, { withDate = true } = {}) {
  return new Intl.DateTimeFormat("en-NZ", { timeZone: zone, weekday: withDate ? "short" : undefined, day: withDate ? "numeric" : undefined, month: withDate ? "short" : undefined, year: withDate ? "numeric" : undefined, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(ms));
}

export function formatOffset(min) {
  const s = min < 0 ? "−" : "+";
  const a = Math.abs(min);
  return `UTC${s}${Math.floor(a / 60)}${a % 60 ? ":" + String(a % 60).padStart(2, "0") : ""}`;
}

/** Days, hours, minutes and seconds left until `ms` from `now` (all zero once passed). */
export function remaining(ms, now) {
  let s = Math.max(0, Math.floor((ms - now) / 1000));
  const days = Math.floor(s / 86400); s -= days * 86400;
  const hours = Math.floor(s / 3600); s -= hours * 3600;
  const minutes = Math.floor(s / 60); s -= minutes * 60;
  return { days, hours, minutes, seconds: s, done: ms <= now };
}
