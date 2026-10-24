"use client";
import { useState } from "react";
import { Field, Seg, NumInput, Stat, Dropzone, Msg } from "@/components/ui";
import { loadImage } from "@/lib/file";

const PAPER = [["A4", 210, 297], ["A5", 148, 210], ["A3", 297, 420], ["Letter", 215.9, 279.4], ["4×6 in photo", 101.6, 152.4], ["5×7 in photo", 127, 177.8], ["Passport 35×45 mm", 35, 45], ["Visiting card", 89, 51]];
const UNITS = { in: 1, cm: 2.54, mm: 25.4 };
const SCREENS = [["Full HD 24″", 1920, 1080, 24], ["MacBook Air 13.6″", 2560, 1664, 13.6], ["4K 27″", 3840, 2160, 27], ["Phone 6.1″", 1170, 2532, 6.1], ["Laptop 15.6″ FHD", 1920, 1080, 15.6]];
const r1 = (n, d = 2) => (isFinite(n) ? +n.toFixed(d) : 0);

function quality(dpi) {
  if (dpi >= 300) return ["ok", "Excellent — sharp, photo-quality print (300+ DPI)."];
  if (dpi >= 200) return ["ok", "Good — fine for most prints viewed at arm’s length."];
  if (dpi >= 150) return ["info", "Acceptable for posters and flyers viewed from a distance."];
  return ["bad", "Low — the print may look blurry or pixelated. Use a larger image or print smaller."];
}

export default function DpiCalculator() {
  const [mode, setMode] = useState("print");
  const [px, setPx] = useState({ w: "3000", h: "2000" });
  const [dpi, setDpi] = useState("300");
  const [unit, setUnit] = useState("in");
  const [size, setSize] = useState({ w: "8", h: "10" });
  const [scr, setScr] = useState({ w: "1920", h: "1080", d: "24" });
  const [img, setImg] = useState(null);

  const open = async ([f]) => { const im = await loadImage(f); setImg(f.name); setPx({ w: String(im.naturalWidth), h: String(im.naturalHeight) }); };
  const k = UNITS[unit];
  const W = +px.w || 0, H = +px.h || 0, D = +dpi || 0;
  const sw = (+size.w || 0) / k, sh = (+size.h || 0) / k; // inches
  const paper = (name) => { const p = PAPER.find((x) => x[0] === name); setUnit("mm"); setSize({ w: String(p[1]), h: String(p[2]) }); };

  let result = null;
  if (mode === "print") result = { title: "Maximum print size", main: `${r1((W / D) * k)} × ${r1((H / D) * k)} ${unit}`, sub: `at ${D} DPI`, q: quality(D) };
  if (mode === "pixels") result = { title: "Pixels needed", main: `${Math.ceil(sw * D).toLocaleString("en-IN")} × ${Math.ceil(sh * D).toLocaleString("en-IN")} px`, sub: `${r1((Math.ceil(sw * D) * Math.ceil(sh * D)) / 1e6, 1)} megapixels at ${D} DPI` };
  if (mode === "dpi") { const eff = Math.min(W / sw, H / sh); result = { title: "Effective print resolution", main: `${Math.round(eff)} DPI`, sub: `${r1(W / sw, 0)} × ${r1(H / sh, 0)} DPI (width × height)`, q: quality(eff) }; }
  const sd = Math.hypot(+scr.w || 0, +scr.h || 0) / (+scr.d || 1);

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <Seg options={[{ label: "Print size", value: "print" }, { label: "Pixels needed", value: "pixels" }, { label: "Image DPI", value: "dpi" }, { label: "Screen PPI", value: "screen" }]} value={mode} onChange={setMode} />
        {mode !== "screen" ? (
          <>
            {result && (
              <div className="big-result"><span>{result.title}</span><strong>{result.main}</strong><small>{result.sub}</small></div>
            )}
            {result?.q && <Msg type={result.q[0]}>{result.q[1]}</Msg>}
            {mode === "print" && (
              <div className="table-wrap" style={{ maxHeight: "none" }}>
                <table className="table">
                  <thead><tr><th>Quality</th><th>DPI</th><th>Max print size ({unit})</th></tr></thead>
                  <tbody>{[["Photo / magazine", 300], ["Good print", 240], ["Office document", 200], ["Poster / banner", 150], ["Large banner", 100], ["Screen (web)", 72]].map(([n, d]) => (
                    <tr key={d}><td>{n}</td><td>{d}</td><td>{r1((W / d) * k)} × {r1((H / d) * k)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            <div className="stats">
              <Stat label="Image size" value={`${W.toLocaleString("en-IN")} × ${H.toLocaleString("en-IN")} px`} sub={img || ""} />
              <Stat label="Megapixels" value={r1((W * H) / 1e6, 1)} />
              <Stat label="Aspect ratio" value={W && H ? r1(W / H, 3) : "—"} />
            </div>
          </>
        ) : (
          <>
            <div className="big-result"><span>Pixel density</span><strong>{r1(sd, 1)} PPI</strong><small>{r1(25.4 / sd, 4)} mm per pixel · {r1(sd / 2.54, 1)} pixels per cm</small></div>
            <Msg type={sd >= 220 ? "ok" : sd >= 110 ? "info" : "bad"}>{sd >= 300 ? "Retina-class — individual pixels are invisible at normal viewing distance." : sd >= 220 ? "Very sharp — text looks crisp." : sd >= 110 ? "Typical desktop monitor density." : "Low density — pixels may be visible up close."}</Msg>
            <div className="row" style={{ gap: 6 }}>{SCREENS.map(([n, w, h, d]) => <button key={n} className="btn btn-sm" onClick={() => setScr({ w: String(w), h: String(h), d: String(d) })}>{n}</button>)}</div>
          </>
        )}
        <small className="muted">DPI (dots per inch) is about printing; PPI (pixels per inch) is about screens and image files — they’re often used interchangeably. Changing an image’s DPI setting alone doesn’t add detail: only more pixels do.</small>
      </div>
      <div className="side">
        {mode !== "screen" ? (
          <div className="panel stack">
            {mode !== "pixels" && (
              <>
                <Dropzone compact accept="image/*" onFiles={open} title="Read size from an image" hint="Only dimensions are read — nothing is uploaded" />
                <div className="grid-2">
                  <Field label="Width (px)"><NumInput value={px.w} onChange={(v) => setPx({ ...px, w: v })} /></Field>
                  <Field label="Height (px)"><NumInput value={px.h} onChange={(v) => setPx({ ...px, h: v })} /></Field>
                </div>
              </>
            )}
            {mode !== "dpi" && (
              <Field label="DPI / PPI">
                <NumInput value={dpi} onChange={setDpi} />
                <div className="seg">{[72, 150, 200, 300, 600].map((d) => <button key={d} className={+dpi === d ? "on" : ""} onClick={() => setDpi(String(d))}>{d}</button>)}</div>
              </Field>
            )}
            <Field label="Units"><Seg options={[{ label: "inches", value: "in" }, { label: "cm", value: "cm" }, { label: "mm", value: "mm" }]} value={unit} onChange={(u) => { setSize({ w: String(r1((sw) * UNITS[u])), h: String(r1(sh * UNITS[u])) }); setUnit(u); }} /></Field>
            {mode !== "print" && (
              <>
                <div className="grid-2">
                  <Field label={`Print width (${unit})`}><NumInput value={size.w} onChange={(v) => setSize({ ...size, w: v })} /></Field>
                  <Field label={`Print height (${unit})`}><NumInput value={size.h} onChange={(v) => setSize({ ...size, h: v })} /></Field>
                </div>
                <select className="select" value="" onChange={(e) => e.target.value && paper(e.target.value)}>
                  <option value="">Choose a paper / photo size…</option>
                  {PAPER.map(([n]) => <option key={n}>{n}</option>)}
                </select>
              </>
            )}
          </div>
        ) : (
          <div className="panel stack">
            <div className="grid-2">
              <Field label="Width (px)"><NumInput value={scr.w} onChange={(v) => setScr({ ...scr, w: v })} /></Field>
              <Field label="Height (px)"><NumInput value={scr.h} onChange={(v) => setScr({ ...scr, h: v })} /></Field>
            </div>
            <Field label="Diagonal size"><NumInput value={scr.d} onChange={(v) => setScr({ ...scr, d: v })} suffix="inches" /></Field>
          </div>
        )}
      </div>
    </div>
  );
}
