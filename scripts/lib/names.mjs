// Windows cannot create files or folders with these base names (any extension, any case).
export const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/** Problems with one repo-relative path, for Windows checkouts. Empty array = fine. */
export function windowsNameProblems(rel) {
  const out = [];
  if (rel.length >= 120) out.push(`path is ${rel.length} characters (limit 119)`);
  for (const seg of rel.split("/")) {
    if (WINDOWS_RESERVED.test(seg.split(".")[0])) out.push(`reserved name "${seg}"`);
    if (/[. ]$/.test(seg)) out.push(`"${seg}" ends with a dot or space`);
    if (/[<>:"|?*\x00-\x1f]/.test(seg)) out.push(`"${seg}" has a character Windows forbids`);
  }
  return out;
}
