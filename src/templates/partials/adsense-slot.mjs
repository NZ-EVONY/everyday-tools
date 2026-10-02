// AdSense integration point (in <head>, after the CMP slot). Comment only: no ad code ships.
export default function adsenseSlot() {
  return `<!-- ==== ADSENSE INTEGRATION POINT. After approval, paste exactly as the AdSense account shows them:
  1. <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX"> (placeholder; never guess the real id)
  2. the AdSense loader snippet.
Then add the CSP origins listed in public/_headers, update public/ads.txt and set adsLive in config/ads.json. ==== -->`;
}
