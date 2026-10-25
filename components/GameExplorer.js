"use client";
import { useMemo, useState } from "react";
import { Search, LayoutGrid } from "lucide-react";
import { games, gameCategories } from "@/lib/games";
import GameCard from "./GameCard";

export default function GameExplorer() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return games.filter((g) => (cat === "all" || g.cat === cat) && (!s || `${g.name} ${g.short} ${g.tags}`.toLowerCase().includes(s)));
  }, [q, cat]);

  return (
    <div>
      <div className="hero-search" style={{ margin: "0 auto 24px", boxShadow: "var(--shadow)" }}>
        <Search size={20} className="muted" />
        <input placeholder="Find a game…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find a game" />
      </div>
      <div className="chips">
        <button className={`chip ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>
          <LayoutGrid /> All <span className="n">{games.length}</span>
        </button>
        {gameCategories.map((c) => (
          <button key={c.id} className={`chip ${cat === c.id ? "active" : ""}`} onClick={() => setCat(c.id)}>
            <span style={{ width: 10, height: 10, borderRadius: 99, background: c.color }} /> {c.name} <span className="n">{games.filter((g) => g.cat === c.id).length}</span>
          </button>
        ))}
      </div>
      <div className="gz-grid" key={cat + q}>
        {list.map((g, i) => <GameCard key={g.slug} slug={g.slug} index={i} />)}
      </div>
      {list.length === 0 && <div className="empty">No games match your search.</div>}
    </div>
  );
}
