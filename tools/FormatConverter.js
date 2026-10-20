"use client";
import { useEffect, useRef, useState } from "react";
import { Download, Trash2, FileArchive } from "lucide-react";
import { Dropzone, Range, Field, Msg } from "@/components/ui";
import FileRow from "@/components/FileRow";
import { loadImage, makeCanvas, canvasToBlob, downloadBlob, baseName, extFor, isImage, formatBytes } from "@/lib/file";
import { makeZip } from "@/lib/zip";

const labels = { "image/png": "PNG", "image/jpeg": "JPG", "image/webp": "WebP" };

export default function FormatConverter({ to = "image/png", accept = "image/*", from = "image" }) {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(90);
  const [bg, setBg] = useState("#ffffff");
  const run = useRef(0);
  const lossy = to !== "image/png";

  const add = (files) => {
    const imgs = files.filter(isImage);
    setItems((prev) => [...prev, ...imgs.map((f) => ({ id: Math.random().toString(36).slice(2), file: f, thumb: URL.createObjectURL(f) }))]);
  };

  // (Re)convert everything whenever the file list or settings change.
  const key = items.map((i) => i.id).join() + quality + bg;
  useEffect(() => {
    if (!items.length) return;
    const id = ++run.current;
    const t = setTimeout(async () => {
      for (const it of items) {
        if (id !== run.current) return;
        try {
          const img = await loadImage(it.thumb);
          const c = makeCanvas(img.naturalWidth, img.naturalHeight);
          const ctx = c.getContext("2d");
          if (to === "image/jpeg") { ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height); }
          ctx.drawImage(img, 0, 0);
          const blob = await canvasToBlob(c, to, lossy ? quality / 100 : undefined);
          if (id !== run.current) return;
          setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, out: blob, error: null } : p)));
        } catch (e) {
          setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, error: e.message } : p)));
        }
      }
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const nameFor = (it) => `${baseName(it.file.name)}.${extFor(to)}`;
  const ready = items.filter((i) => i.out);
  const totalIn = items.reduce((s, i) => s + i.file.size, 0);
  const totalOut = ready.reduce((s, i) => s + i.out.size, 0);

  const zipAll = async () => {
    const zip = await makeZip(ready.map((i) => ({ name: nameFor(i), data: i.out })));
    downloadBlob(zip, `toolora-${labels[to].toLowerCase()}-images.zip`);
  };

  if (!items.length)
    return <Dropzone multiple accept={accept} onFiles={add} title={`Drop ${from} files to convert to ${labels[to]}`} hint="Add as many files as you like — batch conversion is instant" />;

  return (
    <div className="tool-cols">
      <div className="stack">
        <Dropzone compact multiple accept={accept} onFiles={add} title="Add more images" />
        <div className="file-list">
          {items.map((it) => (
            <FileRow
              key={it.id}
              thumb={it.thumb}
              name={nameFor(it)}
              size={it.file.size}
              outSize={it.out?.size}
              busy={!it.out && !it.error}
              error={it.error}
              onDownload={it.out ? () => downloadBlob(it.out, nameFor(it)) : null}
              onRemove={() => setItems((p) => p.filter((x) => x.id !== it.id))}
            />
          ))}
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Output: {labels[to]}</div>
          {lossy && <Range label="Quality" value={quality} min={30} max={100} onChange={setQuality} format={(v) => `${v}%`} />}
          {to === "image/jpeg" && (
            <Field label="Background for transparent areas">
              <div className="row">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
                {["#ffffff", "#000000", "#f3f4f6"].map((c) => (
                  <button key={c} className="btn btn-sm" onClick={() => setBg(c)} style={{ background: c, width: 34, padding: 0 }} aria-label={c} />
                ))}
              </div>
            </Field>
          )}
          {!lossy && <Msg>PNG is lossless — every pixel is preserved, including transparency.</Msg>}
        </div>
        <div className="panel stack">
          <div className="panel-title">Summary</div>
          <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">Files</span><b>{ready.length}/{items.length}</b></div>
          <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">Total size</span><b>{formatBytes(totalIn)} → {formatBytes(totalOut)}</b></div>
        </div>
        {ready.length > 1 && <button className="btn btn-primary btn-lg" onClick={zipAll}><FileArchive size={18} /> Download all (ZIP)</button>}
        {ready.length === 1 && <button className="btn btn-primary btn-lg" onClick={() => downloadBlob(ready[0].out, nameFor(ready[0]))}><Download size={18} /> Download {labels[to]}</button>}
        <button className="btn" onClick={() => setItems([])}><Trash2 size={16} /> Clear all</button>
      </div>
    </div>
  );
}
