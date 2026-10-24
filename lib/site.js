
import { tools, categories } from "./tools";

// Central site + SEO settings.
// NEXT_PUBLIC_SITE_URL is set by the deploy workflow from GitHub Pages
// (e.g. https://ravijha.github.io/toolsivo, or https://toolsivo.com once a custom domain is connected).
export const SITE = {
  name: "Toolsivo",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://toolsivo.com").replace(/\/$/, ""),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  email: "toolsivo@gmail.com",
  tagline: "Every tool you need, right in your browser",
  toolCount: tools.length,
  categoryCount: categories.length,
  description: `Toolsivo offers ${tools.length} free online tools: image compressor, PDF merge & split, English to Hindi typing, typing speed tests, invoice & resume makers, QR code tools, EMI, GST & salary calculators, JSON & SQL formatters and more. 100% in-browser, fast and private — no sign-up.`,
  keywords: [
    "free online tools", "online tools", "image compressor", "image resizer", "crop image online", "jpg to png", "png to jpg",
    "image to webp", "passport size photo maker", "merge pdf", "split pdf", "compress pdf", "images to pdf", "rotate pdf",
    "gst calculator india", "emi calculator", "salary calculator india", "take home salary calculator", "age calculator",
    "percentage calculator", "discount calculator", "json formatter", "base64 encoder decoder", "url encoder", "uuid generator",
    "unix timestamp converter", "regex tester", "html css js minifier", "word counter", "text compare", "slug generator",
    "lorem ipsum generator", "youtube thumbnail resizer", "social media image resizer", "favicon generator",
    "color palette generator", "image watermark", "image to text ocr", "qr code generator", "qr code reader", "password generator",
    "invoice generator", "gst invoice generator", "quotation generator", "resume builder", "label maker", "meeting agenda template",
    "time zone converter", "loan prepayment calculator", "fuel cost calculator", "split bill calculator", "json to typescript",
    "sql formatter", "cron expression generator", "markdown table generator", "email signature generator", "color contrast checker",
    "sha256 checksum", "exif remover", "text to speech", "csv viewer", "robots.txt generator", "xml sitemap generator",
    "english to hindi typing", "hindi typing", "type in hindi", "hindi to english typing", "typing test", "typing speed test",
    "english typing test", "hindi typing test", "wpm test", "typing practice", "online calculator", "scientific calculator",
    "jwt decoder", "xml formatter", "uuid validator", "css box shadow generator", "flexbox playground", "css grid generator",
    "text to binary", "unicode character inspector", "character frequency counter", "case sensitive text analyzer", "dpi calculator", "toolsivo",
  ],
  ogImage: `/og-image.png?v=${tools.length}`,
  locale: "en_IN",
  updated: "22 October 2026",
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
  const image = { url: abs(SITE.ogImage), width: 1200, height: 630, type: "image/png", alt: `${SITE.name} — ${SITE.toolCount} free online tools, right in your browser` };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords.length ? [...keywords, "toolsivo", "free online tools"] : SITE.keywords,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: SITE.name, locale: SITE.locale, url, title: fullTitle, description, images: [image] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image.url] },
  };
}
