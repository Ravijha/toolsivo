"use client";
import { useMemo, useState } from "react";
import { Field, Seg, Range, Toggle, NumInput, Msg } from "@/components/ui";
import PrintDoc, { esc } from "@/components/PrintDoc";

// Common A4 label-sheet layouts (mm). Described by size so they work with any brand of compatible sheets.
const SHEETS = {
  "a4-21": { name: "21 per sheet · 63.5 × 38.1 mm", cols: 3, rows: 7, w: 63.5, h: 38.1, top: 15.15, left: 7.2, gx: 2.5, gy: 0 },
  "a4-14": { name: "14 per sheet · 99.1 × 38.1 mm", cols: 2, rows: 7, w: 99.1, h: 38.1, top: 15.15, left: 4.65, gx: 2.5, gy: 0 },
  "a4-16": { name: "16 per sheet · 99.1 × 33.9 mm", cols: 2, rows: 8, w: 99.1, h: 33.9, top: 12.9, left: 4.65, gx: 2.5, gy: 0 },
  "a4-24": { name: "24 per sheet · 63.5 × 33.9 mm", cols: 3, rows: 8, w: 63.5, h: 33.9, top: 12.9, left: 7.2, gx: 2.5, gy: 0 },
  "a4-8": { name: "8 per sheet · 99.1 × 67.7 mm", cols: 2, rows: 4, w: 99.1, h: 67.7, top: 13.1, left: 4.65, gx: 2.5, gy: 0 },
  "a4-4": { name: "4 per sheet · 99.1 × 139 mm", cols: 2, rows: 2, w: 99.1, h: 139, top: 9.5, left: 4.65, gx: 2.5, gy: 0 },
  "a4-65": { name: "65 per sheet · 38.1 × 21.2 mm", cols: 5, rows: 13, w: 38.1, h: 21.2, top: 10.7, left: 4.65, gx: 2.5, gy: 0 },
  custom: { name: "Custom size" },
};

const SAMPLE = `Ms. Ananya Iyer
14, Lake View Apartments
Indiranagar, Bengaluru 560038

Mr. Rahul Mehta
7B, Sea Breeze Towers
Bandra West, Mumbai 400050

Dr. Kavita Rao
22, Green Park Extension
New Delhi 110016`;

export default function Labels() {
  const [sheetId, setSheetId] = useState("a4-21");
  const [custom, setCustom] = useState({ cols: 3, rows: 7, w: 63.5, h: 38.1, top: 15, left: 7, gx: 2.5, gy: 0 });
  const [mode, setMode] = useState("list");
  const [text, setText] = useState(SAMPLE);
  const [copies, setCopies] = useState("1");
  const [skip, setSkip] = useState("0");
  const [size, setSize] = useState(10);
  const [align, setAlign] = useState("left");
  const [boldFirst, setBoldFirst] = useState(true);
  const [border, setBorder] = useState(false);

  const s = sheetId === "custom" ? { ...custom, name: "Custom" } : SHEETS[sheetId];
  const perPage = s.cols * s.rows;

  const labels = useMemo(() => {
    const blocks = mode === "list" ? text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean) : [text.trim()];
    const n = Math.max(1, Math.min(2000, Math.round(+copies || 1)));
    return blocks.flatMap((b) => Array(n).fill(b));
  }, [text, mode, copies]);

  const skipN = Math.max(0, Math.min(perPage - 1, Math.round(+skip || 0)));
  const slots = [...Array(skipN).fill(null), ...labels];
  const pages = Math.max(1, Math.ceil(slots.length / perPage));

  const cell = (b) => {
    if (!b) return "";
    const lines = b.split("\n");
    return lines.map((l, i) => (i === 0 && boldFirst ? `<b>${esc(l)}</b>` : esc(l))).join("<br>");
  };
  const html = Array.from({ length: pages }, (_, p) => `
<div class="sheet">${slots.slice(p * perPage, (p + 1) * perPage).map((b, i) => {
    const c = i % s.cols, r = Math.floor(i / s.cols);
    return `<div class="lab" style="left:${s.left + c * (s.w + s.gx)}mm;top:${s.top + r * (s.h + s.gy)}mm"><div>${cell(b)}</div></div>`;
  }).join("")}</div>`).join("");

  const css = `
.sheet{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;break-after:page}
.sheet:last-child{page-break-after:auto;break-after:auto}
@media screen{.sheet{background:#fff;margin:0 auto 10mm;box-shadow:0 2px 12px rgba(0,0,0,.12)}}
.lab{position:absolute;width:${s.w}mm;height:${s.h}mm;padding:2.5mm 3.5mm;display:flex;align-items:center;justify-content:${align === "center" ? "center" : "flex-start"};text-align:${align};overflow:hidden;font-size:${size}pt;line-height:1.3;${border ? "outline:0.2mm solid #999;outline-offset:-0.1mm;" : ""}}
@media screen{.lab{${border ? "" : "outline:0.2mm dashed #cfd3dc;"}border-radius:2mm}}
`;

  const tooSmall = size > Math.max(6, s.h / 4.2);

  return (
    <div className="tool-cols wide-side">
      <PrintDoc html={html} css={css} title="Labels" label={`Print ${labels.length} label${labels.length === 1 ? "" : "s"} (${pages} sheet${pages === 1 ? "" : "s"})`} />
      <div className="side" style={{ position: "static" }}>
        <div className="panel stack">
          <Field label="Label sheet">
            <select className="select" value={sheetId} onChange={(e) => setSheetId(e.target.value)}>
              {Object.entries(SHEETS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </Field>
          {sheetId === "custom" && (
            <div className="grid-2">
              {[["cols", "Columns"], ["rows", "Rows"], ["w", "Width mm"], ["h", "Height mm"], ["top", "Top margin mm"], ["left", "Left margin mm"], ["gx", "Gap across mm"], ["gy", "Gap down mm"]].map(([k, l]) => (
                <Field key={k} label={l}><NumInput value={custom[k]} onChange={(v) => setCustom((c) => ({ ...c, [k]: Math.max(0, +v || 0) }))} /></Field>
              ))}
            </div>
          )}
          <small className="muted">{perPage} labels per A4 sheet. Check the size printed on your label pack.</small>
        </div>
        <div className="panel stack">
          <Seg options={[{ label: "List (one per block)", value: "list" }, { label: "Same on every label", value: "same" }]} value={mode} onChange={setMode} />
          <Field label={mode === "list" ? "Labels — separate each one with a blank line" : "Label text"}>
            <textarea className="textarea prose" style={{ minHeight: 180 }} value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <div className="grid-2">
            <Field label={mode === "list" ? "Copies of each" : "How many labels"}><NumInput value={copies} onChange={setCopies} min={1} /></Field>
            <Field label="Skip first (used) labels" hint="For part-used sheets"><NumInput value={skip} onChange={setSkip} min={0} /></Field>
          </div>
        </div>
        <div className="panel stack">
          <Range label="Font size" value={size} min={6} max={28} onChange={setSize} format={(v) => `${v} pt`} />
          {tooSmall && <Msg type="bad">Text may not fit these labels — try a smaller font size.</Msg>}
          <Seg options={[{ label: "Left", value: "left" }, { label: "Centre", value: "center" }]} value={align} onChange={setAlign} />
          <Toggle label="Bold first line" checked={boldFirst} onChange={setBoldFirst} />
          <Toggle label="Print cut lines (plain paper)" checked={border} onChange={setBorder} />
        </div>
        <Msg>Print a test on plain paper first and hold it against a label sheet. In the print window set <b>Margins: None</b> and <b>Scale: 100%</b> (Actual size).</Msg>
      </div>
    </div>
  );
}
