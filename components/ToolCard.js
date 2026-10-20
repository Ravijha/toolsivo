import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategory, getTool } from "@/lib/tools";
import { ToolIcon } from "./ToolIcon";

export default function ToolCard({ slug, index = 0 }) {
  const t = getTool(slug);
  const c = getCategory(t.cat);
  return (
    <Link href={`/tools/${t.slug}`} className="tool-card" style={{ "--c": c.color, animationDelay: `${Math.min(index, 16) * 30}ms` }}>
      <div className="tool-card-top">
        <ToolIcon slug={t.slug} />
        <span className="go"><ArrowRight size={16} /></span>
      </div>
      {t.popular && <span className="badge">Popular</span>}
      <div>
        <h3>{t.name}</h3>
        <p>{t.short}</p>
      </div>
    </Link>
  );
}
