"use client";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Stat, Seg, CopyBtn, Msg } from "@/components/ui";

const SAMPLE = `Toolsivo makes TEXT tools Simple. Apple, apple and APPLE are three different words when case matters.
the iPhone and the IPHONE look alike, but a Case-Sensitive search treats them differently. NASA, Nasa and nasa too.`;

const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;
const kind = (w) => {
  const letters = w.replace(/[^\p{L}]/gu, "");
  if (!letters) return "number";
  if (letters === letters.toUpperCase() && letters !== letters.toLowerCase()) return letters.length > 1 ? "upper" : "single";
  if (letters === letters.toLowerCase()) return "lower";
  if (letters[0] === letters[0].toUpperCase() && letters.slice(1) === letters.slice(1).toLowerCase()) return "title";
  return "mixed";
};
const COLORS = { upper: "#e5384f", lower: "var(--muted)", title: "#2563eb", mixed: "#a24bff", single: "#e5384f", number: "#0aa874" };
const LABELS = { upper: "ALL CAPS", lower: "lowercase", title: "Title Case", mixed: "MiXeD", single: "Single capital", number: "Number" };

export default function CaseAnalyzer() {
  const [text, setText] = useState(SAMPLE);
  const [view, setView] = useState("variants");

  const a = useMemo(() => {
    const chars = [...text];
    const upper = chars.filter((c) => /\p{Lu}/u.test(c)).length;
    const lower = chars.filter((c) => /\p{Ll}/u.test(c)).length;
    const words = text.match(WORD) || [];
    const kinds = { upper: 0, lower: 0, title: 0, mixed: 0, single: 0, number: 0 };
    const exact = new Map(), folded = new Map();
    for (const w of words) {
      kinds[kind(w)]++;
      exact.set(w, (exact.get(w) || 0) + 1);
      const f = w.toLowerCase();
      if (!folded.has(f)) folded.set(f, new Map());
      folded.get(f).set(w, (folded.get(f).get(w) || 0) + 1);
    }
    const variants = [...folded.entries()].filter(([, m]) => m.size > 1).map(([f, m]) => ({ f, forms: [...m.entries()].sort((x, y) => y[1] - x[1]), total: [...m.values()].reduce((s, n) => s + n, 0) })).sort((x, y) => y.total - x.total);
    // sentences that start with a lowercase letter
    const lowerStarts = (text.match(/(?:^|[.!?]\s+)(\p{Ll}[\p{L}]*)/gu) || []).map((m) => m.replace(/^[.!?\s]+/, ""));
    return { chars: chars.length, upper, lower, letters: upper + lower, words: words.length, kinds, exactUnique: exact.size, foldedUnique: folded.size, variants, exact: [...exact.entries()].sort((x, y) => y[1] - x[1]), lowerStarts };
  }, [text]);

  const pct = (n) => (a.letters ? `${((n / a.letters) * 100).toFixed(1)}%` : "0%");
  const highlighted = useMemo(() => {
    const parts = [];
    let last = 0;
    for (const m of text.matchAll(WORD)) {
      parts.push(text.slice(last, m.index));
      const k = kind(m[0]);
      parts.push(<span key={m.index} title={LABELS[k]} style={{ color: COLORS[k], fontWeight: k === "lower" ? 400 : 700 }}>{m[0]}</span>);
      last = m.index + m[0].length;
    }
    parts.push(text.slice(last));
    return parts;
  }, [text]);

  return (
    <div className="stack">
      <div className="stats">
        <Stat label="Uppercase letters" value={a.upper.toLocaleString("en-IN")} sub={pct(a.upper)} />
        <Stat label="Lowercase letters" value={a.lower.toLocaleString("en-IN")} sub={pct(a.lower)} />
        <Stat label="Unique words (case-sensitive)" value={a.exactUnique} />
        <Stat hl label="Unique words (ignoring case)" value={a.foldedUnique} sub={`${a.exactUnique - a.foldedUnique} extra case variants`} />
      </div>
      <div className="grid-2">
        <div className="field">
          <span className="label">Your text <button className="btn btn-sm btn-ghost" onClick={() => setText("")}><Trash2 size={14} /> Clear</button></span>
          <textarea className="textarea prose" style={{ minHeight: 260 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste text to analyse letter case…" />
        </div>
        <div className="field">
          <span className="label">Words coloured by case</span>
          <div className="panel" style={{ minHeight: 260, background: "var(--elev)", whiteSpace: "pre-wrap", lineHeight: 1.8, overflow: "auto", maxHeight: 400 }}>{highlighted}</div>
          <div className="row" style={{ gap: 10, fontSize: ".8rem" }}>
            {Object.entries(LABELS).filter(([k]) => k !== "single").map(([k, l]) => <span key={k}><b style={{ color: COLORS[k] }}>■</b> {l} ({a.kinds[k] + (k === "upper" ? a.kinds.single : 0)})</span>)}
          </div>
        </div>
      </div>
      {a.lowerStarts.length > 0 && <Msg type="bad">{a.lowerStarts.length} sentence{a.lowerStarts.length > 1 ? "s start" : " starts"} with a lowercase letter: {a.lowerStarts.slice(0, 6).map((w) => `“${w}”`).join(", ")}</Msg>}
      <div className="row" style={{ justifyContent: "space-between" }}>
        <Seg options={[{ label: `Case variants (${a.variants.length})`, value: "variants" }, { label: "Case-sensitive word list", value: "exact" }]} value={view} onChange={setView} />
        <CopyBtn text={(view === "variants" ? a.variants.map((v) => `${v.f}: ${v.forms.map(([w, n]) => `${w} ×${n}`).join(", ")}`) : a.exact.map(([w, n]) => `${w}\t${n}`)).join("\n")} label="Copy list" />
      </div>
      <div className="table-wrap" style={{ maxHeight: 380 }}>
        <table className="table">
          {view === "variants" ? (
            <>
              <thead><tr><th>Word</th><th style={{ textAlign: "left" }}>Spellings found (case-sensitive)</th><th>Total</th></tr></thead>
              <tbody>
                {a.variants.length === 0 && <tr><td colSpan={3} className="muted">No word appears with different capitalisation.</td></tr>}
                {a.variants.map((v) => <tr key={v.f}><td>{v.f}</td><td style={{ textAlign: "left", whiteSpace: "normal" }}>{v.forms.map(([w, n]) => <span key={w} className="chip" style={{ cursor: "default", marginRight: 6, padding: "3px 9px", fontSize: ".8rem" }}>{w} <span className="n">×{n}</span></span>)}</td><td>{v.total}</td></tr>)}
              </tbody>
            </>
          ) : (
            <>
              <thead><tr><th>Word (exact case)</th><th>Type</th><th>Count</th></tr></thead>
              <tbody>{a.exact.slice(0, 500).map(([w, n]) => <tr key={w}><td style={{ fontFamily: "var(--mono)" }}>{w}</td><td style={{ color: COLORS[kind(w)] }}>{LABELS[kind(w)]}</td><td>{n}</td></tr>)}</tbody>
            </>
          )}
        </table>
      </div>
    </div>
  );
}
