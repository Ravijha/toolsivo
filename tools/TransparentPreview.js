"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, RefreshCw, ZoomIn, ZoomOut, Scissors } from "lucide-react";
import { Dropzone, Field, Seg, Stat, Msg, Range } from "@/components/ui";
import { loadImage, makeCanvas, canvasToBlob, downloadBlob, baseName, formatBytes } from "@/lib/file";

const BGS = [
  { id: "checker", label: "Checker", css: "var(--checker)" },
  { id: "white", label: "White", css: "#ffffff" },
  { id: "black", label: "Black", css: "#000000" },
  { id: "gray", label: "Grey", css: "#808080" },
  { id: "grad", label: "Gradient", css: "linear-gradient(135deg,#4f6bff,#a24bff,#ff4d8d)" },
  { id: "photo", label: "Scene", css: "radial-gradient(circle at 30% 30%, #ffd166, transparent 40%), radial-gradient(circle at 70% 70%, #06d6a0, transparent 45%), linear-gradient(135deg,#118ab2,#073b4c)" },
];

export default function TransparentPreview() {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [bg, setBg] = useState("checker");
  const [custom, setCustom] = useState("#ff4d8d");
  const [zoom, setZoom] = useState(1);
  const [view, setView] = useState("image");
  const [info, setInfo] = useState(null);
  const maskRef = useRef(null);

  const open = async ([f]) => { setFile(f); setImg(await loadImage(f)); setZoom(1); };

  useEffect(() => {
    if (!img) return;
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = makeCanvas(W, H);
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, W, H);
    let clear = 0, semi = 0, minX = W, minY = H, maxX = -1, maxY = -1;
    const mask = new ImageData(W, H);
    for (let y = 0, i = 0; y < H; y++)
      for (let x = 0; x < W; x++, i += 4) {
        const a = d.data[i + 3];
        if (a === 0) clear++;
        else {
          if (a < 255) semi++;
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
        mask.data[i] = mask.data[i + 1] = mask.data[i + 2] = a;
        mask.data[i + 3] = 255;
      }
    const total = W * H;
    setInfo({ W, H, clear, semi, opaque: total - clear - semi, total, box: maxX >= 0 ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : null, src: c });
    const m = maskRef.current;
    if (m) { m.width = W; m.height = H; m.getContext("2d").putImageData(mask, 0, 0); }
  }, [img, view]);

  const background = useMemo(() => (bg === "custom" ? custom : BGS.find((b) => b.id === bg).css), [bg, custom]);

  const trim = async () => {
    const b = info.box;
    const c = makeCanvas(b.w, b.h);
    c.getContext("2d").drawImage(info.src, b.x, b.y, b.w, b.h, 0, 0, b.w, b.h);
    downloadBlob(await canvasToBlob(c, "image/png"), `${baseName(file.name)}-trimmed.png`);
  };

  if (!img) return <Dropzone accept="image/png,image/webp,image/gif,image/svg+xml,image/avif" onFiles={open} title="Drop a transparent PNG to inspect" hint="PNG, WebP, GIF, SVG or AVIF with alpha" />;

  const pct = (n) => `${((n / info?.total) * 100 || 0).toFixed(1)}%`;
  const hasAlpha = info && info.clear + info.semi > 0;
  const trimmable = info?.box && (info.box.w !== info.W || info.box.h !== info.H);

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div style={{ borderRadius: 18, border: "1px solid var(--border)", background, overflow: "auto", maxHeight: 600, display: "grid", placeItems: "center", padding: 24, minHeight: 320, transition: "background .3s" }}>
          {view === "image" ? (
            <img src={img.src} alt="" style={{ width: img.naturalWidth * zoom, maxWidth: zoom === 1 ? "100%" : "none", height: "auto", imageRendering: zoom > 2 ? "pixelated" : "auto" }} />
          ) : (
            <canvas ref={maskRef} style={{ width: img.naturalWidth * zoom, maxWidth: zoom === 1 ? "100%" : "none", height: "auto" }} />
          )}
        </div>
        {info && (
          <div className="stats">
            <Stat label="Dimensions" value={`${info.W}×${info.H}`} sub={formatBytes(file.size)} />
            <Stat label="Transparent" value={pct(info.clear)} sub={`${info.clear.toLocaleString()} px`} />
            <Stat label="Semi-transparent" value={pct(info.semi)} />
            <Stat label="Opaque" value={pct(info.opaque)} />
          </div>
        )}
        {info && (hasAlpha ? <Msg type="ok">This image has transparency. {info.box && `Visible content: ${info.box.w}×${info.box.h}px at (${info.box.x}, ${info.box.y}).`}</Msg> : <Msg type="bad">This image is fully opaque — it has no transparent pixels.</Msg>)}
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Background</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {BGS.map((b) => (
              <button key={b.id} onClick={() => setBg(b.id)} style={{ height: 52, borderRadius: 12, background: b.css, border: bg === b.id ? "3px solid var(--brand)" : "1px solid var(--border-strong)", cursor: "pointer", color: b.id === "white" || b.id === "checker" ? "#333" : "#fff", fontWeight: 700, fontSize: ".75rem" }}>{b.label}</button>
            ))}
          </div>
          <div className="row">
            <input type="color" value={custom} onChange={(e) => { setCustom(e.target.value); setBg("custom"); }} />
            <small className="muted">Custom colour</small>
          </div>
        </div>
        <div className="panel stack">
          <Field label="View"><Seg options={[{ label: "Image", value: "image" }, { label: "Alpha mask", value: "mask" }]} value={view} onChange={setView} /></Field>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <button className="btn btn-sm btn-icon" onClick={() => setZoom((z) => Math.max(0.25, z / 1.5))} aria-label="Zoom out"><ZoomOut size={16} /></button>
            <div className="grow"><Range label="Zoom" value={zoom} min={0.25} max={8} step={0.05} onChange={setZoom} format={(v) => `${Math.round(v * 100)}%`} /></div>
            <button className="btn btn-sm btn-icon" onClick={() => setZoom((z) => Math.min(8, z * 1.5))} aria-label="Zoom in"><ZoomIn size={16} /></button>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={trim} disabled={!trimmable}><Scissors size={18} /> Trim transparent edges</button>
        {!trimmable && info && <small className="muted">No empty edges to trim.</small>}
        <button className="btn" onClick={() => setImg(null)}><RefreshCw size={16} /> Another image</button>
      </div>
    </div>
  );
}
