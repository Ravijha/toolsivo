"use client";
import { useMemo, useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { Field, Range, CopyBtn, Msg } from "@/components/ui";

const COLORS = ["#4f6bff", "#a24bff", "#ff4d8d", "#f59e0b", "#10b981", "#0ea5e9", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316"];
const LAYOUTS = {
  "Holy grail": { cols: ["200px", "1fr", "200px"], rows: ["auto", "1fr", "auto"], areas: [["header", 1, 1, 1, 3], ["sidebar", 2, 1, 2, 1], ["main", 2, 2, 2, 2], ["aside", 2, 3, 2, 3], ["footer", 3, 1, 3, 3]] },
  Dashboard: { cols: ["1fr", "1fr", "1fr", "1fr"], rows: ["auto", "1fr", "1fr"], areas: [["nav", 1, 1, 1, 4], ["chart", 2, 1, 3, 3], ["stats", 2, 4, 2, 4], ["list", 3, 4, 3, 4]] },
  Gallery: { cols: ["1fr", "1fr", "1fr"], rows: ["1fr", "1fr"], areas: [["feature", 1, 1, 2, 2], ["photo1", 1, 3, 1, 3], ["photo2", 2, 3, 2, 3]] },
  Blank: { cols: ["1fr", "1fr", "1fr"], rows: ["1fr", "1fr", "1fr"], areas: [] },
};
const valid = (t) => /^(auto|min-content|max-content|\d+(\.\d+)?(fr|px|%|rem|em|vh|vw)|minmax\(.+\)|repeat\(.+\)|fit-content\(.+\))$/.test(t.trim());

export default function CssGrid() {
  const [cols, setCols] = useState(LAYOUTS["Holy grail"].cols);
  const [rows, setRows] = useState(LAYOUTS["Holy grail"].rows);
  const [areas, setAreas] = useState(LAYOUTS["Holy grail"].areas);
  const [gap, setGap] = useState(12);
  const [drag, setDrag] = useState(null);
  const [name, setName] = useState("");

  const load = (k) => { const l = LAYOUTS[k]; setCols(l.cols); setRows(l.rows); setAreas(l.areas); };
  const resize = (list, set, n) => set((L) => (n > L.length ? [...L, ...Array(n - L.length).fill("1fr")] : L.slice(0, n)));
  const fit = (a) => a[3] <= rows.length && a[4] <= cols.length;
  const shown = areas.filter(fit);

  const occupied = (r, c) => shown.some(([, r1, c1, r2, c2]) => r >= r1 && r <= r2 && c >= c1 && c <= c2);
  const box = drag && { r1: Math.min(drag.r0, drag.r), r2: Math.max(drag.r0, drag.r), c1: Math.min(drag.c0, drag.c), c2: Math.max(drag.c0, drag.c) };
  const finish = () => {
    if (!box) return;
    let overlap = false;
    for (let r = box.r1; r <= box.r2; r++) for (let c = box.c1; c <= box.c2; c++) if (occupied(r, c)) overlap = true;
    if (!overlap) {
      const n = (name.trim() || `item${areas.length + 1}`).replace(/[^\w-]/g, "-");
      setAreas((A) => [...A, [n, box.r1, box.c1, box.r2, box.c2]]);
      setName("");
    }
    setDrag(null);
  };

  const template = useMemo(() => Array.from({ length: rows.length }, (_, r) => Array.from({ length: cols.length }, (_, c) => (shown.find(([, r1, c1, r2, c2]) => r + 1 >= r1 && r + 1 <= r2 && c + 1 >= c1 && c + 1 <= c2) || ["."])[0])), [rows.length, cols.length, shown]);
  const w = Math.max(...template.flat().map((s) => s.length));
  const code = `.container {
  display: grid;
  grid-template-columns: ${cols.join(" ")};
  grid-template-rows: ${rows.join(" ")};
  gap: ${gap}px;${shown.length ? `
  grid-template-areas:
${template.map((r) => `    "${r.map((s) => s.padEnd(w)).join(" ")}"`).join("\n")};` : ""}
}${shown.map(([n]) => `\n.${n} { grid-area: ${n}; }`).join("")}`;
  const html = `<div class="container">\n${shown.map(([n]) => `  <div class="${n}">${n}</div>`).join("\n")}\n</div>`;
  const bad = [...cols, ...rows].filter((t) => !valid(t));

  // render helper (not a component) so the inputs keep focus while typing
  const tracks = ({ list, set, label }) => (
    <Field label={`${label} (${list.length})`}>
      <Range label="" value={list.length} min={1} max={8} onChange={(n) => resize(list, set, n)} format={() => ""} />
      <div className="row" style={{ gap: 5 }}>
        {list.map((t, i) => <input key={i} className="input" style={{ width: 82, padding: "6px 8px", fontFamily: "var(--mono)", fontSize: ".8rem", borderColor: valid(t) ? undefined : "var(--bad)" }} value={t} onChange={(e) => set((L) => L.map((x, j) => (j === i ? e.target.value : x)))} />)}
      </div>
    </Field>
  );

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="row" style={{ gap: 6 }}>{Object.keys(LAYOUTS).map((k) => <button key={k} className="btn btn-sm" onClick={() => load(k)}>{k}</button>)}</div>
        <div style={{ position: "relative", minHeight: 360, padding: 12, overflowX: "auto", borderRadius: 18, border: "2px dashed var(--border-strong)", background: "var(--surface-2)", userSelect: "none" }} onPointerUp={finish} onPointerLeave={() => setDrag(null)}>
          <div style={{ display: "grid", gridTemplateColumns: cols.map((t) => (valid(t) ? t : "1fr")).join(" "), gridTemplateRows: rows.map((t) => (valid(t) && t !== "auto" ? t : "minmax(60px, auto)")).join(" "), gap, minHeight: 336 }}>
            {Array.from({ length: rows.length * cols.length }, (_, k) => {
              const r = Math.floor(k / cols.length) + 1, c = (k % cols.length) + 1;
              const inBox = box && r >= box.r1 && r <= box.r2 && c >= box.c1 && c <= box.c2;
              return <div key={`cell${k}`} style={{ gridRow: r, gridColumn: c, borderRadius: 10, minHeight: 50, border: "1px dashed var(--border-strong)", background: inBox ? "color-mix(in srgb, var(--brand) 25%, transparent)" : "transparent", cursor: "crosshair" }}
                onPointerDown={() => !occupied(r, c) && setDrag({ r0: r, c0: c, r, c })} onPointerEnter={() => drag && setDrag((d) => ({ ...d, r, c }))} />;
            })}
            {shown.map(([n, r1, c1, r2, c2], i) => (
              <div key={n + i} style={{ gridRow: `${r1} / ${r2 + 1}`, gridColumn: `${c1} / ${c2 + 1}`, borderRadius: 12, background: COLORS[i % COLORS.length], color: "#fff", fontWeight: 800, display: "grid", placeItems: "center", position: "relative", zIndex: 1, boxShadow: "0 6px 14px -6px rgba(0,0,0,.4)", minHeight: 50 }}>
                {n}
                <button onClick={() => setAreas((A) => A.filter((a) => a !== shown[i]))} aria-label={`Remove ${n}`} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: 8, border: 0, background: "rgba(255,255,255,.25)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}><X size={13} /></button>
              </div>
            ))}
          </div>
        </div>
        <small className="muted">Drag across empty cells to create an area (name it on the right first, or it gets an automatic name).</small>
        {bad.length > 0 && <Msg type="bad">Unrecognised track size: {bad.join(", ")}. Use values like 1fr, 200px, auto, 25% or minmax(100px, 1fr).</Msg>}
        <div className="grid-2">
          <div className="field"><span className="label">CSS <CopyBtn text={code} /></span><pre className="code-out">{code}</pre></div>
          <div className="field"><span className="label">HTML <CopyBtn text={html} /></span><pre className="code-out">{html}</pre></div>
        </div>
      </div>
      <div className="side" style={{ position: "static" }}>
        <div className="panel stack">
          {tracks({ list: cols, set: setCols, label: "Columns" })}
          {tracks({ list: rows, set: setRows, label: "Rows" })}
          <Range label="gap" value={gap} min={0} max={40} onChange={setGap} format={(v) => `${v}px`} />
        </div>
        <div className="panel stack">
          <Field label="Name for the next area"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. header, sidebar" /></Field>
          <button className="btn btn-sm" onClick={() => setAreas([])}><RotateCcw size={14} /> Clear all areas</button>
        </div>
      </div>
    </div>
  );
}
