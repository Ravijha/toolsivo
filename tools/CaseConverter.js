"use client";
import { useState } from "react";
import { CopyBtn } from "@/components/ui";

const words = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_\-./]+/g, " ").trim().split(/\s+/).filter(Boolean);
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
const SMALL = new Set("a an the and but or for nor on at to by of in up as".split(" "));

const cases = [
  ["UPPER CASE", (s) => s.toUpperCase()],
  ["lower case", (s) => s.toLowerCase()],
  ["Title Case", (s) => s.toLowerCase().replace(/\b[\p{L}']+/gu, (w, i) => (i > 0 && SMALL.has(w) ? w : cap(w)))],
  ["Sentence case", (s) => s.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toUpperCase())],
  ["Capitalize Each Word", (s) => s.toLowerCase().replace(/\b\p{L}/gu, (m) => m.toUpperCase())],
  ["camelCase", (s) => words(s).map((w, i) => (i ? cap(w) : w.toLowerCase())).join("")],
  ["PascalCase", (s) => words(s).map(cap).join("")],
  ["snake_case", (s) => words(s).map((w) => w.toLowerCase()).join("_")],
  ["kebab-case", (s) => words(s).map((w) => w.toLowerCase()).join("-")],
  ["CONSTANT_CASE", (s) => words(s).map((w) => w.toUpperCase()).join("_")],
  ["dot.case", (s) => words(s).map((w) => w.toLowerCase()).join(".")],
  ["aLtErNaTiNg", (s) => [...s].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join("")],
  ["iNVERSE cASE", (s) => [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("")],
];

export default function CaseConverter() {
  const [text, setText] = useState("the quick brown fox jumps over the lazy dog. toolora makes text easy!");
  const [active, setActive] = useState(null);

  return (
    <div className="stack">
      <textarea className="textarea prose" style={{ minHeight: 180 }} value={text} onChange={(e) => { setText(e.target.value); setActive(null); }} placeholder="Type or paste text…" />
      <div className="row" style={{ gap: 8 }}>
        {cases.map(([name, fn]) => (
          <button key={name} className={`chip ${active === name ? "active" : ""}`} onClick={() => { setText(fn(text)); setActive(name); }}>{name}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {cases.map(([name, fn]) => {
          const v = fn(text);
          return (
            <div key={name} className="panel" style={{ padding: 14 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                <small style={{ fontWeight: 800, color: "var(--brand)" }}>{name}</small>
                <CopyBtn text={v} className="btn btn-sm btn-ghost" />
              </div>
              <div style={{ fontSize: ".9rem", wordBreak: "break-word", maxHeight: 90, overflow: "auto" }}>{v || <span className="muted">—</span>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
