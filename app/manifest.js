import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest() {
  return {
    name: `${SITE.name} — Free Online Tools`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: `${SITE.basePath}/`,
    scope: `${SITE.basePath}/`,
    display: "standalone",
    background_color: "#f6f6fb",
    theme_color: "#6d4dff",
    icons: [{ src: `${SITE.basePath}/logo-mark.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
