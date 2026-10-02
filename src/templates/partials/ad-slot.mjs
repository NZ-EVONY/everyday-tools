// Reserved ad container from the design. Rendered only when its page type is enabled in
// config/ads.json (all disabled in this build) or in the ads preview build.
export default function adSlot(name, { preview = false } = {}) {
  return `<!-- AD SLOT: ${name} -->
<div class="ad-slot ad-slot--rect" role="group" data-ad-slot="${name}" data-enabled="true" aria-label="Advertisement"><span class="ad-label">Advertisement</span>${preview ? `<span class="ad-box" aria-hidden="true">${name} (preview)</span>` : ""}</div>`;
}
