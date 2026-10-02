// Reserved ad container. Rendered only when its page type is enabled in config/ads.json
// (all disabled in this build). Fixed height in CSS so nothing shifts when an ad loads.
export default function adSlot(name, { preview = false } = {}) {
  return `<!-- AD SLOT: ${name} -->
<aside class="ad-slot${preview ? " ad-slot--preview" : ""}" data-ad-slot="${name}" aria-label="Advertisement"><span class="ad-label">Advertisement</span></aside>`;
}
