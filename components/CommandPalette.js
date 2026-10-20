"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { tools, getCategory } from "@/lib/tools";
import { ToolIcon } from "./ToolIcon";

export function searchTools(q) {
  const s = q.trim().toLowerCase();
  if (!s) return tools;
  const words = s.split(/\s+/);
  return tools
    .map((t) => {
      const hay = `${t.name} ${t.short} ${t.tags} ${getCategory(t.cat).name}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) return null;
      const score = (t.name.toLowerCase().startsWith(s) ? 3 : 0) + (t.name.toLowerCase().includes(s) ? 2 : 0) + (t.popular ? 0.5 : 0);
      return { t, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.t);
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const listRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("toolora:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("toolora:palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) { setQ(""); setSel(0); }
  }, [open]);

  const results = useMemo(() => searchTools(q).slice(0, 40), [q]);
  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector(".sel")?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  if (!open) return null;

  const go = (t) => {
    setOpen(false);
    router.push(`/tools/${t.slug}`);
  };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[sel]) go(results[sel]);
  };

  return (
    <div className="palette-backdrop" onMouseDown={() => setOpen(false)}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Search tools">
        <div className="palette-input">
          <Search size={20} className="muted" />
          <input autoFocus placeholder="Search tools… e.g. “merge pdf”, “emi”, “json”" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} />
          <span className="kbd">Esc</span>
        </div>
        <div className="palette-list" ref={listRef}>
          {!q && <div className="palette-group">All tools</div>}
          {results.length === 0 && <div className="empty">No tools match “{q}”.</div>}
          {results.map((t, i) => (
            <div key={t.slug} className={`palette-item ${i === sel ? "sel" : ""}`} onMouseEnter={() => setSel(i)} onClick={() => go(t)}>
              <ToolIcon slug={t.slug} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{t.name}</strong>
                <small>{getCategory(t.cat).name} · {t.short}</small>
              </div>
              {i === sel && <CornerDownLeft size={16} className="muted" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
