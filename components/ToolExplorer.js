"use client";
import { useMemo, useState } from "react";
import { Search, LayoutGrid } from "lucide-react";
import { categories, tools } from "@/lib/tools";
import { searchTools } from "./CommandPalette";
import ToolCard from "./ToolCard";

export default function ToolExplorer({ initialCat = "all", showSearch = true }) {
  const [cat, setCat] = useState(initialCat);
  const [q, setQ] = useState("");
  const list = useMemo(() => searchTools(q).filter((t) => cat === "all" || t.cat === cat), [q, cat]);

  return (
    <div>
      {showSearch && (
        <div className="hero-search" style={{ margin: "0 auto 24px", boxShadow: "var(--shadow)" }}>
          <Search size={20} className="muted" />
          <input placeholder="Filter tools…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter tools" />
        </div>
      )}
      <div className="chips">
        <button className={`chip ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>
          <LayoutGrid /> All <span className="n">{tools.length}</span>
        </button>
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.id} className={`chip ${cat === c.id ? "active" : ""}`} onClick={() => setCat(c.id)}>
              <Icon /> {c.short} <span className="n">{tools.filter((t) => t.cat === c.id).length}</span>
            </button>
          );
        })}
      </div>
      <div className="tool-grid" key={cat + q}>
        {list.map((t, i) => <ToolCard key={t.slug} slug={t.slug} index={i} />)}
      </div>
      {list.length === 0 && <div className="empty">No tools match your search.</div>}
    </div>
  );
}
