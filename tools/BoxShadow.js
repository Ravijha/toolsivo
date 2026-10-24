"use client";
import { useState } from "react";
import { Plus, X, Copy as CopyIcon } from "lucide-react";
import { Field, Range, Toggle, CopyBtn } from "@/components/ui";
import { hexToRgb } from "@/lib/color";

let uid = 0;
const layer = (o = {}) => ({ id: ++uid, x: 0, y: 10, blur: 30, spread: -10, color: "#1e1b4b", alpha: 25, inset: false, ...o });
const PRESETS = {
  Soft: [layer({ y: 10, blur: 30, spread: -10, alpha: 25 })],
  Material: [layer({ y: 1, blur: 3, spread: 0, alpha: 12, color: "#000000" }), layer({ y: 1, blur: 2, spread: 0, alpha: 24, color: "#000000" })],
  Floating: [layer({ y: 24, blur: 48, spread: -12, alpha: 35, color: "#312e81" }), layer({ y: 8, blur: 16, spread: -8, alpha: 20, color: "#312e81" })],
  Sharp: [layer({ x: 8, y: 8, blur: 0, spread: 0, alpha: 100, color: "#111827" })],
  Glow: [layer({ y: 0, blur: 40, spread: 4, alpha: 60, color: "#a24bff" })],
  Inset: [layer({ y: 4, blur: 12, spread: 0, alpha: 25, inset: true, color: "#000000" })],
  Neumorphic: [layer({ x: 10, y: 10, blur: 24, spread: 0, alpha: 18, color: "#1e293b" }), layer({ x: -10, y: -10, blur: 24, spread: 0, alpha: 90, color: "#ffffff" })],
};
const css = (l) => { const [r, g, b] = hexToRgb(l.color); return `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px rgba(${r}, ${g}, ${b}, ${(l.alpha / 100).toFixed(2)})`; };

export default function BoxShadow() {
  const [layers, setLayers] = useState(PRESETS.Soft.map((l) => ({ ...l, id: ++uid })));
  const [sel, setSel] = useState(layers[0].id);
  const [box, setBox] = useState({ bg: "#ffffff", page: "#eef0f6", radius: 18 });
  const cur = layers.find((l) => l.id === sel) || layers[0];
  const value = layers.map(css).join(",\n    ");
  const code = `box-shadow: ${value};`;
  const up = (k) => (v) => setLayers((L) => L.map((l) => (l.id === cur.id ? { ...l, [k]: v } : l)));

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div style={{ background: box.page, borderRadius: 22, minHeight: 360, display: "grid", placeItems: "center", border: "1px solid var(--border)", transition: "background .2s" }}>
          <div style={{ width: 220, height: 160, background: box.bg, borderRadius: box.radius, boxShadow: layers.map(css).join(", "), transition: "box-shadow .15s, border-radius .15s" }} />
        </div>
        <div className="row" style={{ gap: 6 }}>
          {Object.keys(PRESETS).map((p) => <button key={p} className="btn btn-sm" onClick={() => { const n = PRESETS[p].map((l) => ({ ...l, id: ++uid })); setLayers(n); setSel(n[0].id); }}>{p}</button>)}
        </div>
        <div className="field">
          <span className="label">CSS <CopyBtn text={code} label="Copy CSS" /></span>
          <pre className="code-out">{code}{"\n"}-webkit-box-shadow: {value};</pre>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Shadow layers</div>
          <div className="row" style={{ gap: 6 }}>
            {layers.map((l, i) => (
              <span key={l.id} className={`chip ${l.id === cur.id ? "active" : ""}`} onClick={() => setSel(l.id)} style={{ paddingRight: layers.length > 1 ? 6 : undefined }}>
                Layer {i + 1}
                {layers.length > 1 && <X size={13} onClick={(e) => { e.stopPropagation(); setLayers((L) => L.filter((x) => x.id !== l.id)); }} />}
              </span>
            ))}
            <button className="btn btn-sm" onClick={() => { const n = layer({ ...cur, id: undefined }); setLayers((L) => [...L, n]); setSel(n.id); }}><Plus size={14} /> Add</button>
          </div>
          <Range label="Horizontal offset" value={cur.x} min={-100} max={100} onChange={up("x")} format={(v) => `${v}px`} />
          <Range label="Vertical offset" value={cur.y} min={-100} max={100} onChange={up("y")} format={(v) => `${v}px`} />
          <Range label="Blur" value={cur.blur} min={0} max={150} onChange={up("blur")} format={(v) => `${v}px`} />
          <Range label="Spread" value={cur.spread} min={-60} max={60} onChange={up("spread")} format={(v) => `${v}px`} />
          <Range label="Opacity" value={cur.alpha} min={0} max={100} onChange={up("alpha")} format={(v) => `${v}%`} />
          <div className="row"><input type="color" value={cur.color} onChange={(e) => up("color")(e.target.value)} /><Toggle label="Inset (inner shadow)" checked={cur.inset} onChange={up("inset")} /></div>
        </div>
        <div className="panel stack">
          <div className="panel-title">Preview box</div>
          <div className="grid-2">
            <Field label="Box colour"><input type="color" value={box.bg} onChange={(e) => setBox({ ...box, bg: e.target.value })} /></Field>
            <Field label="Background"><input type="color" value={box.page} onChange={(e) => setBox({ ...box, page: e.target.value })} /></Field>
          </div>
          <Range label="Corner radius" value={box.radius} min={0} max={80} onChange={(v) => setBox({ ...box, radius: v })} format={(v) => `${v}px`} />
        </div>
      </div>
    </div>
  );
}
