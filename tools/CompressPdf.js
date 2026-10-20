"use client";
import { useState } from "react";
import { FileArchive, Download, RefreshCw } from "lucide-react";
import { Dropzone, Field, Seg, Range, Msg, Spinner, Stat } from "@/components/ui";
import { savePdf } from "@/components/PdfKit";
import { openPdfjs, renderPage } from "@/lib/pdf";
import { downloadBlob, baseName, formatBytes, canvasToBlob, isPdf } from "@/lib/file";

const levels = {
  light: { label: "Light", dpi: 150, q: 80, note: "Sharp text and images, moderate savings" },
  medium: { label: "Recommended", dpi: 110, q: 65, note: "Great balance for email and uploads" },
  strong: { label: "Extreme", dpi: 80, q: 45, note: "Smallest file, lower image quality" },
};

export default function CompressPdf() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("raster");
  const [level, setLevel] = useState("medium");
  const [custom, setCustom] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  const open = ([f]) => { if (isPdf(f)) { setFile(f); setResult(null); setErr(null); } };
  const cfg = custom || levels[level];

  const run = async () => {
    setBusy(true); setErr(null); setResult(null); setProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { PDFDocument } = await import("pdf-lib");
      let blob;
      if (mode === "lossless") {
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        doc.setProducer("Toolsivo"); doc.setCreator("Toolsivo");
        blob = await savePdf(doc);
        setProgress(100);
      } else {
        const src = await openPdfjs(bytes);
        const out = await PDFDocument.create();
        for (let i = 1; i <= src.numPages; i++) {
          const page = await src.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          const canvas = await renderPage(src, i, { scale: cfg.dpi / 72 });
          const jpg = await canvasToBlob(canvas, "image/jpeg", cfg.q / 100);
          const img = await out.embedJpg(await jpg.arrayBuffer());
          const p = out.addPage([vp.width, vp.height]);
          p.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
          setProgress(Math.round((i / src.numPages) * 100));
        }
        blob = await savePdf(out);
      }
      setResult({ blob, smaller: blob.size < file.size });
    } catch (e) {
      setErr(/encrypt|password/i.test(e.message) ? "This PDF is password-protected." : "Compression failed: " + e.message);
    }
    setBusy(false);
  };

  if (!file) return <Dropzone accept="application/pdf,.pdf" onFiles={open} title="Drop a PDF to compress" />;

  const saved = result ? Math.round((1 - result.blob.size / file.size) * 100) : 0;

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="file-item">
          <span className="ph" style={{ background: "linear-gradient(135deg,#ff4d4d,#f9a826)" }}>PDF</span>
          <div className="meta"><strong>{file.name}</strong><small>{formatBytes(file.size)}</small></div>
          <button className="btn btn-sm" onClick={() => setFile(null)}><RefreshCw size={15} /> Change</button>
        </div>
        {busy && (
          <div className="stack">
            <div className="progress"><i style={{ width: `${progress}%` }} /></div>
            <small className="muted">Compressing… {progress}%</small>
          </div>
        )}
        {err && <Msg type="bad">{err}</Msg>}
        {result && (
          <>
            <div className="stats">
              <Stat label="Original" value={formatBytes(file.size)} />
              <Stat label="Compressed" value={formatBytes(result.blob.size)} />
              <Stat hl label="Saved" value={`${Math.max(0, saved)}%`} />
            </div>
            {result.smaller ? (
              <Msg type="ok">Done! Your PDF is {saved}% smaller.</Msg>
            ) : (
              <Msg type="bad">This PDF is already well optimised — the result isn’t smaller. Try a stronger level, or keep the original.</Msg>
            )}
            <button className="btn btn-primary btn-lg" onClick={() => downloadBlob(result.blob, `${baseName(file.name)}-compressed.pdf`)}>
              <Download size={18} /> Download compressed PDF
            </button>
          </>
        )}
        {!result && !busy && (
          <Msg>
            <b>Strong compression</b> re-renders each page as an optimised image — ideal for scans and photo-heavy PDFs, but text will no longer be selectable.
            <b> Lossless</b> keeps everything intact and just tidies the file structure.
          </Msg>
        )}
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Method</div>
          <Seg options={[{ label: "Strong", value: "raster" }, { label: "Lossless", value: "lossless" }]} value={mode} onChange={setMode} />
          {mode === "raster" && (
            <>
              <Field label="Level">
                <Seg options={Object.entries(levels).map(([k, v]) => ({ label: v.label, value: k }))} value={custom ? "" : level} onChange={(v) => { setLevel(v); setCustom(null); }} />
              </Field>
              <small className="muted">{cfg.note || "Custom settings"}</small>
              <Range label="Resolution" value={cfg.dpi} min={50} max={200} step={10} onChange={(v) => setCustom({ ...cfg, dpi: v, note: null })} format={(v) => `${v} DPI`} />
              <Range label="Image quality" value={cfg.q} min={20} max={95} onChange={(v) => setCustom({ ...cfg, q: v, note: null })} format={(v) => `${v}%`} />
            </>
          )}
        </div>
        <button className="btn btn-primary btn-lg" onClick={run} disabled={busy}>
          {busy ? <Spinner /> : <FileArchive size={18} />} Compress PDF
        </button>
      </div>
    </div>
  );
}
