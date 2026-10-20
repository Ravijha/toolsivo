"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { searchTools } from "./CommandPalette";
import { ToolIcon } from "./ToolIcon";
import { getCategory } from "@/lib/tools";

export default function HeroSearch() {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const results = useMemo(() => (q.trim() ? searchTools(q).slice(0, 7) : []), [q]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[sel]) router.push(`/tools/${results[sel].slug}`);
  };

  return (
    <div className="hero-search">
      <Search size={22} className="muted" />
      <input
        placeholder="What do you want to do today? Try “compress image”"
        value={q}
        onChange={(e) => { setQ(e.target.value); setSel(0); }}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
        onKeyDown={onKey}
        aria-label="Search tools"
      />
      <Link href="/tools" className="btn btn-primary">Explore <ArrowRight size={17} /></Link>
      {focus && q.trim() && (
        <div className="hero-results">
          {results.length === 0 && <div className="empty" style={{ padding: 20 }}>No tools found — try another word.</div>}
          {results.map((t, i) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} className={i === sel ? "sel" : ""} onMouseEnter={() => setSel(i)}>
              <ToolIcon slug={t.slug} size={36} />
              <div>
                <strong style={{ fontSize: ".95rem" }}>{t.name}</strong>
                <div className="muted" style={{ fontSize: ".8rem" }}>{getCategory(t.cat).name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
