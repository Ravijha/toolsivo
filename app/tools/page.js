import ToolExplorer from "@/components/ToolExplorer";
import { tools } from "@/lib/tools";

import { abs, pageMeta } from "@/lib/site";
import JsonLd from "@/components/JsonLd";

export const metadata = pageMeta({
  title: `All ${tools.length} Free Online Tools`,
  description: `Browse all ${tools.length} free Toolsivo tools — image, PDF, document, calculator, developer, SEO, media, text and design utilities. No sign-up, no uploads, 100% in your browser.`,
  path: "/tools/",
});

export default function AllTools() {
  return (
    <div className="container">
      <div className="cat-page-head">
        <span className="eyebrow">The complete toolbox</span>
        <h1>All <span className="grad-text">{tools.length}</span> tools</h1>
        <p>Search, filter and open any tool — everything runs privately in your browser.</p>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "All Toolsivo tools",
          numberOfItems: tools.length,
          itemListElement: tools.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: abs(`/tools/${t.slug}/`) })),
        }}
      />
      <ToolExplorer />
    </div>
  );
}
