"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Trash2, FileArchive, MoveHorizontal } from "lucide-react";
import { Dropzone, Range, Field, Seg, Msg, Stat, NumInput } from "@/components/ui";
import FileRow from "@/components/FileRow";
import { loadImage, makeCanvas, canvasToBlob, downloadBlob, baseName, extFor, isImage, formatBytes } from "@/lib/file";
import { makeZip } from "@/lib/zip";

function Compare({ before, after }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const drag = (e) => {
    const r = ref.current.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={ref}
      className="compare"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag(e); }}
      onPointerMove={(e) => e.buttons && drag(e)}
    >
      <img src={before} alt="Original" />
      <div className="after" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={after} alt="Compressed" style={{ width: "100%" }} />
      </div>
      <span className="tag" style={{ left: 12 }}>Original</span>
      <span className="tag" style={{ right: 12 }}>Compressed</span>
      <div className="bar" style={{ left: `${pos}%` }}><span className="knob"><MoveHorizontal size={18} /></span></div>
    </div>
  );
}

// Highest-quality encode that fits under `target` bytes: binary-search quality, then downscale if needed.
async function fitToSize(img, w0, h0, type, target, cancelled) {
  let w = w0, h = h0, best = null;
  for (let pass = 0; pass < 8; pass++) {
    const c = makeCanvas(w, h);
    const ctx = c.getContext("2d");
    if (type === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    let lo = 0.05, hi = 0.95, fit = null;
    for (let i = 0; i < 7; i++) {
      if (cancelled()) return {};
      const q = (lo + hi) / 2;
      const b = await canvasToBlob(c, type, q);
      if (b.size <= target) { fit = b; lo = q; } else hi = q;
    }
    if (!fit) {
      const b = await canvasToBlob(c, type, 0.05);
      if (b.size <= target) fit = b;
      else {
        if (!best || b.size < best.size) best = b;
        // shrink dimensions roughly in proportion to the overshoot and try again
        const k = Math.max(0.5, Math.min(0.9, Math.sqrt(target / b.size) * 0.95));
        w = Math.max(16, Math.round(w * k));
        h = Math.max(16, Math.round(h * k));
        if (w === 16 && h === 16) break;
        continue;
      }
    }
    return { blob: fit, hit: true };
  }
  return { blob: best, hit: false };
}

export default function Compressor() {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(72);
  const [format, setFormat] = useState("same");
  const [maxW, setMaxW] = useState("");
  const [mode, setMode] = useState("quality");
  const [targetKB, setTargetKB] = useState("100");
  const [sel, setSel] = useState(null);
  const run = useRef(0);

  const add = (files) => {
    const list = files.filter(isImage).map((f) => ({ id: Math.random().toString(36).slice(2), file: f, thumb: URL.createObjectURL(f) }));
    setItems((p) => [...p, ...list]);
    if (!sel && list[0]) setSel(list[0].id);
    // PNG is lossless, so "same format" can't shrink it — default to WebP for real savings
    if (!items.length && format === "same" && list.some((i) => i.file.type === "image/png")) setFormat("image/webp");
  };

  const outType = (f) => (format === "same" ? (["image/jpeg", "image/webp", "image/png"].includes(f.type) ? f.type : "image/jpeg") : format);

  const target = Math.max(1, +targetKB || 0) * 1024;
  const key = items.map((i) => i.id).join() + quality + format + maxW + mode + (mode === "size" ? targetKB : "");
  useEffect(() => {
    if (!items.length) return;
    const id = ++run.current;
    const t = setTimeout(async () => {
      for (const it of items) {
        if (id !== run.current) return;
        const img = await loadImage(it.thumb);
        let w = img.naturalWidth, h = img.naturalHeight;
        const mw = +maxW;
        if (mw && w > mw) { h = Math.round((h * mw) / w); w = mw; }
        const c = makeCanvas(w, h);
        const ctx = c.getContext("2d");
        let type = outType(it.file);
        if (type === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);
        let blob, kept = false, hit = null;
        if (mode === "size") {
          // PNG has no quality setting, so target-size mode always uses a lossy format
          if (type === "image/png") type = "image/jpeg";
          ({ blob, hit } = await fitToSize(img, w, h, type, target, () => id !== run.current));
          if (!blob) return;
        } else {
          blob = await canvasToBlob(c, type, quality / 100);
          // never hand back a bigger file than the original in the same format
          kept = blob.size >= it.file.size && type === it.file.type && !mw;
          if (kept) blob = it.file;
        }
        if (id !== run.current) return;
        setItems((p) => p.map((x) => (x.id === it.id ? { ...x, out: blob, outUrl: URL.createObjectURL(blob), kept, hit, type } : x)));
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const nameFor = (it) => `${baseName(it.file.name)}-compressed.${extFor(it.type || outType(it.file))}`;
  const ready = items.filter((i) => i.out);
  const tin = ready.reduce((s, i) => s + i.file.size, 0);
  const tout = ready.reduce((s, i) => s + i.out.size, 0);
  const current = useMemo(() => items.find((i) => i.id === sel) || items[0], [items, sel]);
  const hasPng = items.some((i) => outType(i.file) === "image/png");

  if (!items.length) return <Dropzone multiple onFiles={add} title="Drop images to compress" hint="JPG, PNG, WebP — batch supported, nothing is uploaded" />;

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        {current?.outUrl ? <Compare before={current.thumb} after={current.outUrl} /> : <div className="preview-box"><img src={current?.thumb} alt="" /></div>}
        <div className="stats">
          <Stat label="Original" value={formatBytes(tin)} />
          <Stat label="Compressed" value={formatBytes(tout)} />
          <Stat hl label="Saved" value={tin ? `${Math.max(0, Math.round((1 - tout / tin) * 100))}%` : "—"} sub={formatBytes(Math.max(0, tin - tout))} />
        </div>
        <Dropzone compact multiple onFiles={add} title="Add more images" />
        <div className="file-list">
          {items.map((it) => (
            <FileRow
              key={it.id}
              active={current?.id === it.id}
              onClick={() => setSel(it.id)}
              thumb={it.thumb}
              name={it.file.name}
              size={it.file.size}
              outSize={it.out?.size}
              busy={!it.out}
              extra={it.kept ? " · already optimal" : it.hit === false ? " · smallest possible" : it.hit ? ` · under ${targetKB} KB ✓` : null}
              onDownload={it.out ? () => downloadBlob(it.out, nameFor(it)) : null}
              onRemove={() => setItems((p) => p.filter((x) => x.id !== it.id))}
            />
          ))}
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Compression</div>
          <Seg options={[{ label: "By quality", value: "quality" }, { label: "Target size (KB)", value: "size" }]} value={mode} onChange={setMode} />
          {mode === "quality" ? (
            <>
              <Range label="Quality" value={quality} min={10} max={100} onChange={setQuality} format={(v) => `${v}%`} />
              <div className="row" style={{ justifyContent: "space-between", fontSize: ".78rem" }} >
                <span className="muted">Smaller file</span><span className="muted">Better quality</span>
              </div>
            </>
          ) : (
            <>
              <Field label="Maximum file size" hint="We find the best quality that fits under this size">
                <NumInput value={targetKB} onChange={setTargetKB} suffix="KB" min={1} placeholder="e.g. 100" />
              </Field>
              <div className="seg">
                {[20, 50, 100, 200, 500].map((k) => (
                  <button key={k} className={+targetKB === k ? "on" : ""} onClick={() => setTargetKB(String(k))}>{k} KB</button>
                ))}
              </div>
            </>
          )}
          <Field label="Output format">
            <Seg options={[{ label: "Same", value: "same" }, { label: "JPG", value: "image/jpeg" }, { label: "WebP", value: "image/webp" }]} value={format} onChange={setFormat} />
          </Field>
          {mode === "size" && items.some((i) => i.hit === false) && <Msg type="bad">Some images can’t reach {targetKB} KB without becoming unrecognisable — we saved the smallest usable version. Try a larger size.</Msg>}
          {mode === "quality" && hasPng && <Msg>PNG output is lossless, so quality has no effect. Choose WebP or JPG for big savings.</Msg>}
          <Field label="Max width (optional)" hint="Downscale large photos for much smaller files">
            <NumInput value={maxW} onChange={setMaxW} suffix="px" placeholder="e.g. 1920" />
          </Field>
        </div>
        {ready.length > 1 && (
          <button className="btn btn-primary btn-lg" onClick={async () => downloadBlob(await makeZip(ready.map((i) => ({ name: nameFor(i), data: i.out }))), "toolsivo-compressed.zip")}>
            <FileArchive size={18} /> Download all (ZIP)
          </button>
        )}
        {ready.length === 1 && <button className="btn btn-primary btn-lg" onClick={() => downloadBlob(ready[0].out, nameFor(ready[0]))}><Download size={18} /> Download</button>}
        <button className="btn" onClick={() => { setItems([]); setSel(null); }}><Trash2 size={16} /> Clear all</button>
      </div>
    </div>
  );
}
