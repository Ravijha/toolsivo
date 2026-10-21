import { notFound } from "next/navigation";
import { categories, getCategory, toolsIn } from "@/lib/tools";
import { CatIcon } from "@/components/ToolIcon";
import ToolCard from "@/components/ToolCard";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return categories.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const c = getCategory(id);
  if (!c) return {};
  return pageMeta({
    title: `${c.name} — Free Online ${c.short} Tools`,
    description: `${c.tagline} ${toolsIn(id).map((t) => t.name).join(", ")}.`,
    path: `/category/${c.id}/`,
    keywords: [c.name.toLowerCase(), `free ${c.short.toLowerCase()} tools`, `online ${c.short.toLowerCase()} tools`, ...toolsIn(id).map((t) => t.name.toLowerCase())],
  });
}

export default async function CategoryPage({ params }) {
  const { id } = await params;
  const c = getCategory(id);
  if (!c) notFound();
  const list = toolsIn(id);
  return (
    <div className="container">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: c.name,
          description: c.tagline,
          url: abs(`/category/${c.id}/`),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: list.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: abs(`/tools/${t.slug}/`) })),
          },
        }}
      />
      <div className="cat-page-head">
        <CatIcon id={c.id} size={72} />
        <span className="eyebrow">{list.length} free tools</span>
        <h1>{c.name}</h1>
        <p>{c.tagline}</p>
      </div>
      <div className="tool-grid">
        {list.map((t, i) => <ToolCard key={t.slug} slug={t.slug} index={i} />)}
      </div>
    </div>
  );
}
