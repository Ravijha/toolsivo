"use client";
import { useState } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { Field, Range, CopyBtn, NumInput } from "@/components/ui";

const OPTS = {
  "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
  "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
  "justify-content": ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"],
  "align-items": ["stretch", "flex-start", "center", "flex-end", "baseline"],
  "align-content": ["normal", "flex-start", "center", "flex-end", "space-between", "space-around", "stretch"],
};
const DEF = { "flex-direction": "row", "flex-wrap": "nowrap", "justify-content": "flex-start", "align-items": "stretch", "align-content": "normal" };
const ITEM = { grow: 0, shrink: 1, basis: "auto", order: 0, self: "auto" };
const COLORS = ["#4f6bff", "#a24bff", "#ff4d8d", "#f59e0b", "#10b981", "#0ea5e9", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#6366f1", "#ec4899"];

function Pick({ prop, value, onChange }) {
  return (
    <Field label={<code>{prop}</code>}>
      <div className="row" style={{ gap: 5 }}>
        {OPTS[prop].map((v) => <button key={v} className={`chip ${value === v ? "active" : ""}`} style={{ padding: "5px 10px", fontSize: ".78rem" }} onClick={() => onChange(v)}>{v}</button>)}
      </div>
    </Field>
  );
}

export default function Flexbox() {
  const [c, setC] = useState(DEF);
  const [gap, setGap] = useState(12);
  const [items, setItems] = useState(() => Array.from({ length: 5 }, () => ({ ...ITEM })));
  const [sel, setSel] = useState(null);
  const set = (p) => (v) => setC((s) => ({ ...s, [p]: v }));
  const upItem = (k, v) => setItems((I) => I.map((it, i) => (i === sel ? { ...it, [k]: v } : it)));

  const container = Object.entries(c).filter(([k, v]) => v !== DEF[k] || k === "flex-direction").map(([k, v]) => `  ${k}: ${v};`);
  const itemCss = items.map((it, i) => {
    const r = [];
    if (+it.grow !== 0 || +it.shrink !== 1 || it.basis !== "auto") r.push(`  flex: ${+it.grow || 0} ${it.shrink === "" ? 1 : +it.shrink} ${it.basis || "auto"};`);
    if (+it.order) r.push(`  order: ${+it.order};`);
    if (it.self !== "auto") r.push(`  align-self: ${it.self};`);
    return r.length ? `.item-${i + 1} {\n${r.join("\n")}\n}` : null;
  }).filter(Boolean);
  const code = `.container {\n  display: flex;\n${container.join("\n")}\n  gap: ${gap}px;\n}${itemCss.length ? "\n\n" + itemCss.join("\n\n") : ""}`;
  const html = `<div class="container">\n${items.map((_, i) => `  <div class="item-${i + 1}">${i + 1}</div>`).join("\n")}\n</div>`;
  const it = sel != null ? items[sel] : null;

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div style={{ display: "flex", ...Object.fromEntries(Object.entries(c).map(([k, v]) => [k.replace(/-(\w)/g, (_, x) => x.toUpperCase()), v])), gap, minHeight: 320, padding: 14, borderRadius: 18, border: "2px dashed var(--border-strong)", background: "var(--surface-2)", overflow: "auto", transition: "all .2s" }}>
          {items.map((x, i) => (
            <div key={i} onClick={() => setSel(i === sel ? null : i)}
              style={{ flexGrow: +x.grow || 0, flexShrink: x.shrink === "" ? 1 : +x.shrink, flexBasis: x.basis || "auto", order: +x.order || 0, alignSelf: x.self, minWidth: 54, minHeight: 54, padding: `${10 + (i % 3) * 8}px 14px`, borderRadius: 12, background: COLORS[i % COLORS.length], color: "#fff", fontWeight: 800, fontSize: "1.2rem", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: i === sel ? "0 0 0 4px var(--text)" : "0 6px 14px -6px rgba(0,0,0,.4)", transition: "all .25s" }}>
              {i + 1}
            </div>
          ))}
        </div>
        <small className="muted">Click an item to edit its own flex settings. Items have different heights so alignment changes are easy to see.</small>
        <div className="grid-2">
          <div className="field"><span className="label">CSS <CopyBtn text={code} /></span><pre className="code-out">{code}</pre></div>
          <div className="field"><span className="label">HTML <CopyBtn text={html} /></span><pre className="code-out">{html}</pre></div>
        </div>
      </div>
      <div className="side" style={{ position: "static" }}>
        <div className="panel stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="panel-title" style={{ margin: 0 }}>Container · {items.length} items</div>
            <div className="actions">
              <button className="btn btn-sm btn-icon" onClick={() => items.length > 1 && setItems((I) => I.slice(0, -1))} aria-label="Remove item"><Minus size={14} /></button>
              <button className="btn btn-sm btn-icon" onClick={() => items.length < 12 && setItems((I) => [...I, { ...ITEM }])} aria-label="Add item"><Plus size={14} /></button>
              <button className="btn btn-sm btn-icon" onClick={() => { setC(DEF); setGap(12); setItems(Array.from({ length: 5 }, () => ({ ...ITEM }))); setSel(null); }} aria-label="Reset"><RotateCcw size={14} /></button>
            </div>
          </div>
          {Object.keys(OPTS).map((p) => <Pick key={p} prop={p} value={c[p]} onChange={set(p)} />)}
          <Range label="gap" value={gap} min={0} max={48} onChange={setGap} format={(v) => `${v}px`} />
        </div>
        {it && (
          <div className="panel stack">
            <div className="panel-title">Item {sel + 1}</div>
            <div className="grid-3">
              <Field label="grow"><NumInput value={it.grow} onChange={(v) => upItem("grow", v)} min={0} /></Field>
              <Field label="shrink"><NumInput value={it.shrink} onChange={(v) => upItem("shrink", v)} min={0} /></Field>
              <Field label="order"><NumInput value={it.order} onChange={(v) => upItem("order", v)} /></Field>
            </div>
            <Field label="flex-basis"><input className="input" value={it.basis} onChange={(e) => upItem("basis", e.target.value)} placeholder="auto, 120px, 30%" /></Field>
            <Field label={<code>align-self</code>}>
              <div className="row" style={{ gap: 5 }}>{["auto", "flex-start", "center", "flex-end", "stretch", "baseline"].map((v) => <button key={v} className={`chip ${it.self === v ? "active" : ""}`} style={{ padding: "5px 10px", fontSize: ".78rem" }} onClick={() => upItem("self", v)}>{v}</button>)}</div>
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
