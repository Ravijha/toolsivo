"use client";
import { useState } from "react";
import { ArrowUp, ArrowDown, X, FileText, Trash2, GripVertical } from "lucide-react";
import { Dropzone, Field, Seg, Range, Spinner } from "@/components/ui";
import { savePdf } from "@/components/PdfKit";
import { loadImage, makeCanvas, canvasToBlob, downloadBlob, isImage, formatBytes } from "@/lib/file";

const sizes = { a4: [595.28, 841.89], letter: [612, 792], legal: [612, 1008] };
const margins = { none: 0, small: 18, large: 42 };

export default function ImagesToPdf() {
  const [items, setItems] = useState([]);
  const [size, setSize] = useState("a4");
  const [orient, setOrient] = useState("auto");
  const [margin, setMargin] = useState("small");
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(null);

  const add = (files) => setItems((p) => [...p, ...files.filter(isImage).map((f) => ({ id: Math.random().toString(36).slice(2), file: f, url: URL.createObjectURL(f) }))]);
  const move = (i, d) => setItems((p) => { const a = [...p], j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const onDrop = (i) => {
    if (drag === null || drag === i) return;
    setItems((p) => { const a = [...p]; const [x] = a.splice(drag, 1); a.splice(i, 0, x); return a; });
    setDrag(null);
  };

  const build = async () => {
    setBusy(true);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    for (const it of items) {
      const img = await loadImage(it.url);
      let embedded;
      if (it.file.type === "image/png" && quality === 100) {
        embedded = await doc.embedPng(await it.file.arrayBuffer());
      } else if (it.file.type === "image/jpeg" && quality === 100) {
        embedded = await doc.embedJpg(await it.file.arrayBuffer());
      } else {
        const c = makeCanvas(img.naturalWidth, img.naturalHeight);
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);
        const blob = await canvasToBlob(c, "image/jpeg", quality / 100);
        embedded = await doc.embedJpg(await blob.arrayBuffer());
      }
      const iw = embedded.width, ih = embedded.height;
      let pw, ph;
      if (size === "fit") {
        pw = iw * 0.75 + margins[margin] * 2;
        ph = ih * 0.75 + margins[margin] * 2;
      } else {
        [pw, ph] = sizes[size];
        const land = orient === "landscape" || (orient === "auto" && iw > ih);
        if (land) [pw, ph] = [ph, pw];
      }
      const page = doc.addPage([pw, ph]);
      const m = margins[margin];
      const s = Math.min((pw - 2 * m) / iw, (ph - 2 * m) / ih);
      const dw = iw * s, dh = ih * s;
      page.drawImage(embedded, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
    }
    downloadBlob(await savePdf(doc), "toolora-images.pdf");
    setBusy(false);
  };

  if (!items.length) return <Dropzone multiple onFiles={add} title="Drop images to turn into a PDF" hint="JPG, PNG, WebP — each image becomes a page" />;

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="thumb-grid">
          {items.map((it, i) => (
            <div
              key={it.id}
              className={`pg ${drag === i ? "dragging" : ""}`}
              draggable
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              onDragEnd={() => setDrag(null)}
              style={{ cursor: "grab", opacity: drag === i ? 0.4 : 1 }}
            >
              <div className="pg-img"><img src={it.url} alt="" /></div>
              <div className="row" style={{ justifyContent: "center", gap: 2, marginTop: 6 }}>
                <GripVertical size={14} className="muted" />
                <button className="btn btn-sm btn-ghost btn-icon" onClick={() => move(i, -1)} aria-label="Move earlier"><ArrowUp size={14} /></button>
                <span className="pg-n" style={{ margin: 0 }}>{i + 1}</span>
                <button className="btn btn-sm btn-ghost btn-icon" onClick={() => move(i, 1)} aria-label="Move later"><ArrowDown size={14} /></button>
                <button className="btn btn-sm btn-ghost btn-icon btn-danger" onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))} aria-label="Remove"><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        <Dropzone compact multiple onFiles={add} title="Add more images" />
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Page setup</div>
          <Field label="Page size"><Seg options={[{ label: "A4", value: "a4" }, { label: "Letter", value: "letter" }, { label: "Legal", value: "legal" }, { label: "Fit image", value: "fit" }]} value={size} onChange={setSize} /></Field>
          {size !== "fit" && <Field label="Orientation"><Seg options={[{ label: "Auto", value: "auto" }, { label: "Portrait", value: "portrait" }, { label: "Landscape", value: "landscape" }]} value={orient} onChange={setOrient} /></Field>}
          <Field label="Margin"><Seg options={[{ label: "None", value: "none" }, { label: "Small", value: "small" }, { label: "Large", value: "large" }]} value={margin} onChange={setMargin} /></Field>
          <Range label="Image quality" value={quality} min={40} max={100} onChange={setQuality} format={(v) => (v === 100 ? "Original" : `${v}%`)} />
          <small className="muted">{items.length} images · {formatBytes(items.reduce((s, i) => s + i.file.size, 0))}</small>
        </div>
        <button className="btn btn-primary btn-lg" onClick={build} disabled={busy}>
          {busy ? <Spinner /> : <FileText size={18} />} Create PDF
        </button>
        <button className="btn" onClick={() => setItems([])}><Trash2 size={16} /> Clear all</button>
      </div>
    </div>
  );
}
