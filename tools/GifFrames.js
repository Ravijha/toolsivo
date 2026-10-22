"use client";
import { useEffect, useRef, useState } from "react";
import { Download, FileArchive, RefreshCw, LayoutGrid, Play, Pause } from "lucide-react";
import { Dropzone, Stat, Msg, Spinner, Seg, NumInput, Field } from "@/components/ui";
import { downloadBlob, canvasToBlob, makeCanvas, baseName, formatBytes } from "@/lib/file";
import { makeZip } from "@/lib/zip";

// Decode a GIF into full, composited frames (applying each frame's disposal method).
async function decode(buffer) {
  const { parseGIF, decompressFrames } = await import("gifuct-js");
  const gif = parseGIF(buffer);
  const raw = decompressFrames(gif, true);
  const W = gif.lsd.width, H = gif.lsd.height;
  const full = makeCanvas(W, H);
  const fctx = full.getContext("2d", { willReadFrequently: true });
  const patch = document.createElement("canvas");
  const pctx = patch.getContext("2d");
  const frames = [];
  let restore = null;
  for (const f of raw) {
    const { width, height, top, left } = f.dims;
    if (f.disposalType === 3) restore = fctx.getImageData(0, 0, W, H);
    patch.width = width; patch.height = height;
    const img = pctx.createImageData(width, height);
    img.data.set(f.patch);
    pctx.putImageData(img, 0, 0);
    fctx.drawImage(patch, left, top);
    const snap = makeCanvas(W, H);
    snap.getContext("2d").drawImage(full, 0, 0);
    frames.push({ canvas: snap, delay: f.delay || 100, url: snap.toDataURL("image/png") });
    if (f.disposalType === 2) fctx.clearRect(left, top, width, height);
    else if (f.disposalType === 3 && restore) fctx.putImageData(restore, 0, 0);
  }
  return { W, H, frames };
}

export default function GifFrames() {
  const [file, setFile] = useState(null);
  const [gif, setGif] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [sel, setSel] = useState(new Set());
  const [cols, setCols] = useState("8");
  const [playing, setPlaying] = useState(true);
  const [cur, setCur] = useState(0);
  const timer = useRef(null);

  const open = async ([f]) => {
    setFile(f); setGif(null); setErr(null); setBusy(true); setSel(new Set()); setCur(0);
    try {
      const g = await decode(await f.arrayBuffer());
      if (!g.frames.length) throw new Error();
      setGif(g);
    } catch {
      setErr("Couldn’t decode this GIF. Make sure it’s a valid .gif file.");
    }
    setBusy(false);
  };

  useEffect(() => {
    if (!gif || !playing) return;
    timer.current = setTimeout(() => setCur((c) => (c + 1) % gif.frames.length), gif.frames[cur].delay);
    return () => clearTimeout(timer.current);
  }, [gif, playing, cur]);

  if (!file) return <Dropzone accept="image/gif,.gif" onFiles={open} title="Drop an animated GIF" hint="Every frame is extracted in your browser" />;

  const name = (i) => `${baseName(file.name)}-frame-${String(i + 1).padStart(3, "0")}.png`;
  const picked = sel.size ? [...sel].sort((a, b) => a - b) : gif ? gif.frames.map((_, i) => i) : [];
  const total = gif ? gif.frames.reduce((s, f) => s + f.delay, 0) : 0;
  const toggle = (i) => setSel((S) => { const n = new Set(S); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const zip = async () => {
    const files = await Promise.all(picked.map(async (i) => ({ name: name(i), data: await canvasToBlob(gif.frames[i].canvas, "image/png") })));
    downloadBlob(await makeZip(files), `${baseName(file.name)}-frames.zip`);
  };
  const sprite = async () => {
    const n = picked.length, c = Math.max(1, Math.min(n, +cols || 8)), rows = Math.ceil(n / c);
    const sheet = makeCanvas(gif.W * c, gif.H * rows);
    const ctx = sheet.getContext("2d");
    picked.forEach((fi, k) => ctx.drawImage(gif.frames[fi].canvas, (k % c) * gif.W, Math.floor(k / c) * gif.H));
    downloadBlob(await canvasToBlob(sheet, "image/png"), `${baseName(file.name)}-sprite-${c}x${rows}.png`);
  };

  return (
    <div className="tool-cols">
      <div className="stack">
        {busy && <div className="panel" style={{ display: "grid", placeItems: "center", minHeight: 200 }}><Spinner dark /></div>}
        {err && <Msg type="bad">{err}</Msg>}
        {gif && (
          <>
            <div className="stats">
              <Stat hl label="Frames" value={gif.frames.length} />
              <Stat label="Size" value={`${gif.W}×${gif.H}`} sub={formatBytes(file.size)} />
              <Stat label="Duration" value={`${(total / 1000).toFixed(2)}s`} />
              <Stat label="Avg. frame rate" value={`${(gif.frames.length / (total / 1000)).toFixed(1)} fps`} />
            </div>
            <div className="toolbar" style={{ marginBottom: 0 }}>
              <h3>{sel.size ? `${sel.size} selected` : "Click frames to select (none = all)"}</h3>
              <div className="actions">
                <button className="btn btn-sm" onClick={() => setSel(new Set(gif.frames.map((_, i) => i)))}>Select all</button>
                <button className="btn btn-sm" onClick={() => setSel(new Set())} disabled={!sel.size}>Clear</button>
              </div>
            </div>
            <div className="thumb-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
              {gif.frames.map((f, i) => (
                <div key={i} className={`pg ${sel.has(i) ? "sel" : ""}`} onClick={() => toggle(i)} style={{ padding: 8 }}>
                  <span className="pg-check">✓</span>
                  <div className="pg-img" style={{ aspectRatio: `${gif.W} / ${gif.H}`, background: "var(--checker)" }}><img src={f.url} alt={`Frame ${i + 1}`} /></div>
                  <div className="pg-n">#{i + 1} · {f.delay}ms</div>
                  <button className="btn btn-sm btn-ghost" style={{ width: "100%", marginTop: 4 }} onClick={async (e) => { e.stopPropagation(); downloadBlob(await canvasToBlob(f.canvas, "image/png"), name(i)); }}><Download size={13} /></button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="side">
        {gif && (
          <>
            <div className="panel" style={{ display: "grid", gap: 10, placeItems: "center", background: "var(--checker)" }}>
              <img src={gif.frames[cur].url} alt="Preview" style={{ maxHeight: 220, imageRendering: gif.W < 120 ? "pixelated" : "auto" }} />
              <div className="row">
                <button className="btn btn-sm" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
                <small style={{ fontWeight: 700, background: "var(--elev)", padding: "4px 8px", borderRadius: 8 }}>Frame {cur + 1}/{gif.frames.length}</small>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" onClick={zip}><FileArchive size={18} /> Download {picked.length} frame{picked.length === 1 ? "" : "s"} (ZIP)</button>
            <div className="panel stack">
              <div className="panel-title">Sprite sheet</div>
              <Field label="Columns"><NumInput value={cols} onChange={setCols} min={1} /></Field>
              <button className="btn" onClick={sprite}><LayoutGrid size={16} /> Download sprite sheet</button>
            </div>
          </>
        )}
        <button className="btn" onClick={() => setFile(null)}><RefreshCw size={16} /> Another GIF</button>
      </div>
    </div>
  );
}
