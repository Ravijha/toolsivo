import { categories, tools } from "@/lib/tools";
import { abs } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap() {
  const now = new Date("2026-10-21");
  const page = (path, priority, changeFrequency = "monthly") => ({ url: abs(path), lastModified: now, changeFrequency, priority });
  return [
    page("/", 1, "weekly"),
    page("/tools/", 0.9, "weekly"),
    ...categories.map((c) => page(`/category/${c.id}/`, 0.8)),
    ...tools.map((t) => page(`/tools/${t.slug}/`, t.popular ? 0.9 : 0.8)),
    page("/about/", 0.5),
    page("/contact/", 0.5),
    page("/privacy/", 0.3, "yearly"),
    page("/terms/", 0.3, "yearly"),
  ];
}
