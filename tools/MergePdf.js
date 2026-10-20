"use client";
import { useState } from "react";
import { ArrowUp, ArrowDown, X, Merge, Trash2, GripVertical } from "lucide-react";
import { Dropzone, Msg, Spinner } from "@/components/ui";
import { savePdf } from "@/components/PdfKit";
import { openPdfjs, renderPage } from "@/lib/pdf";
import { downloadBlob, formatBytes, isPdf } from "@/lib/file";

export default function MergePdf() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [drag, setDrag] = useState(null);

  const add = async (files) => {
    const { PDFDocument } = await import("pdf-lib");
    for (const f of files.filter(isPdf)) {
      const id = Math.random().toString(36).slice(2);
      try {
        const bytes = new Uint8Array(await f.arrayBuffer());
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        setItems((p) => [...p, { id, file: f, bytes, pages: doc.getPageCount() }]);
        openPdfjs(bytes)
          .then((pj) => renderPage(pj, 1, { maxWidth: 120 }))
          .then((c) => setItems((p) => p.map((x) => (x.id === id ? { ...x, thumb: c.toDataURL("image/jpeg", 0.7) } : x))))
          .catch(() => {});
      } catch {
        setErr(`Could not read “${f.name}” — it may be encrypted or damaged.`);
      }
    }
  };

  const move = (i, d) => setItems((p) => {
    const a = [...p];
    const j = i + d;
    if (j < 0 || j >= a.length) return a;
    [a[i], a[j]] = [a[j], a[i]];
    return a;
  });

  const onDrop = (i) => {
    if (drag === null || drag === i) return;
    setItems((p) => {
      const a = [...p];
      const [x] = a.splice(drag, 1);
      a.splice(i, 0, x);
      return a;
    });
    setDrag(null);
  };

  const merge = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const out = await PDFDocument.create();
      for (const it of items) {
        const src = await PDFDocument.load(it.bytes, { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      downloadBlob(await savePdf(out), "toolsivo-merged.pdf");
    } catch (e) {
      setErr("Merging failed: " + e.message);
    }
    setBusy(false);
  };

  const total = items.reduce((s, i) => s + i.pages, 0);

  if (!items.length) return <Dropzone multiple accept="application/pdf,.pdf" onFiles={add} title="Drop PDF files to merge" hint="Select two or more PDFs — reorder them before merging" />;

  return (
    <div className="tool-cols">
      <div className="stack">
        {err && <Msg type="bad">{err}</Msg>}
        <div className="file-list">
          {items.map((it, i) => (
            <div
              key={it.id}
              className={`file-item ${drag === i ? "dragging" : ""}`}
              draggable
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              onDragEnd={() => setDrag(null)}
            >
              <GripVertical size={18} className="muted" />
              {it.thumb ? <img className="thumb" src={it.thumb} alt="" style={{ objectFit: "contain", background: "#fff" }} /> : <span className="ph" style={{ background: "linear-gradient(135deg,#ff4d4d,#f9a826)" }}>PDF</span>}
              <div className="meta">
                <strong>{i + 1}. {it.file.name}</strong>
                <small>{it.pages} page{it.pages > 1 ? "s" : ""} · {formatBytes(it.file.size)}</small>
              </div>
              <button className="btn btn-sm btn-ghost btn-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={16} /></button>
              <button className="btn btn-sm btn-ghost btn-icon" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down"><ArrowDown size={16} /></button>
              <button className="btn btn-sm btn-ghost btn-icon btn-danger" onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))} aria-label="Remove"><X size={16} /></button>
            </div>
          ))}
        </div>
        <Dropzone compact multiple accept="application/pdf,.pdf" onFiles={add} title="Add more PDFs" />
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Merge summary</div>
          <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">Files</span><b>{items.length}</b></div>
          <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">Total pages</span><b>{total}</b></div>
          <small className="muted">Drag rows or use the arrows to set the order.</small>
        </div>
        <button className="btn btn-primary btn-lg" onClick={merge} disabled={items.length < 2 || busy}>
          {busy ? <Spinner /> : <Merge size={18} />} Merge {items.length} PDFs
        </button>
        <button className="btn" onClick={() => setItems([])}><Trash2 size={16} /> Clear all</button>
      </div>
    </div>
  );
}
