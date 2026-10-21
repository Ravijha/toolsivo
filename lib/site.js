// Central site + SEO settings.
// NEXT_PUBLIC_SITE_URL is set by the deploy workflow from GitHub Pages
// (e.g. https://ravijha.github.io/toolsivo, or https://toolsivo.com once a custom domain is connected).
export const SITE = {
  name: "Toolsivo",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://toolsivo.com").replace(/\/$/, ""),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  email: "toolsivo@gmail.com",
  tagline: "Every tool you need, right in your browser",
  description:
    "Toolsivo offers 40+ free online tools: image cropper, compressor, passport photo maker, PDF merge & split, EMI, GST & salary calculators, JSON formatter, regex tester and more. 100% in-browser, fast and private.",
  keywords: [
    "free online tools", "online tools", "image compressor", "image resizer", "crop image online", "jpg to png", "png to jpg",
    "image to webp", "passport size photo maker", "merge pdf", "split pdf", "compress pdf", "images to pdf", "rotate pdf",
    "gst calculator india", "emi calculator", "salary calculator india", "take home salary calculator", "age calculator",
    "percentage calculator", "discount calculator", "json formatter", "base64 encoder decoder", "url encoder", "uuid generator",
    "unix timestamp converter", "regex tester", "html css js minifier", "word counter", "text compare", "slug generator",
    "lorem ipsum generator", "youtube thumbnail resizer", "social media image resizer", "favicon generator",
    "color palette generator", "image watermark", "toolsivo",
  ],
  ogImage: "/og-image.png",
  locale: "en_IN",
  updated: "21 October 2026",
  // Optional, set as GitHub repository variables (see README): ADSENSE_CLIENT, GOOGLE_SITE_VERIFICATION
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
};

/** Absolute URL for a site path, e.g. abs("/tools/merge-pdf/"). */
export const abs = (path = "/") => SITE.url + path;

/** Standard per-page metadata: title, description, keywords, canonical, Open Graph and Twitter card. */
export function pageMeta({ title, description, path = "/", keywords = [], absoluteTitle = false }) {
  const url = abs(path);
  const fullTitle = absoluteTitle ? title : `${title} · ${SITE.name}`;
  const image = { url: abs(SITE.ogImage), width: 1200, height: 630, alt: `${SITE.name} — ${SITE.tagline}` };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords.length ? [...keywords, "toolsivo", "free online tools"] : SITE.keywords,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: SITE.name, locale: SITE.locale, url, title: fullTitle, description, images: [image] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image.url] },
  };
}
