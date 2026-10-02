// The 404 page (served with a real 404 status by not_found_handling: "404-page").
export default function page(ctx) {
  const { link } = ctx;
  return {
    path: "/404",
    type: "error",
    status: "published",
    noindex: true,
    title: "Page not found | Everyday Tools",
    description: "This page doesn't exist. Try the home page or the list of all pages.",
    h1: "Page not found",
    sources: [], claims: [],
    body: `
        <p>There's no page at this address. It may have moved, or the link may have a typo.</p>
        <ul>
          <li>Go to the ${link("/", "home page")}</li>
          <li>Browse ${link("/sitemap", "all pages")}</li>
          <li>Try the ${link("/nz-calculators", "NZ calculators")} or the ${link("/guides", "guides")}</li>
        </ul>`,
  };
}
