"use client";
import { useEffect, useState } from "react";
import { RotateCw, RotateCcw, Download, RefreshCw, Undo2 } from "lucide-react";
import { Dropzone, Msg, Spinner } from "@/components/ui";
import { usePdfFile, PageThumb, savePdf } from "@/components/PdfKit";
import { downloadBlob, baseName } from "@/lib/file";

export default function RotatePdf() {
  const { pdf, error, load, reset } = usePdfFile();
  const [rot, setRot] = useState([]);
  const [busy, setBusy] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (pdf) setRot(Array(pdf.count).fill(0)); }, [pdf?.bytes]);

  const all = (d) => setRot((r) => r.map((x) => (x + d + 360) % 360));
  const one = (i) => setRot((r) => r.map((x, j) => (j === i ? (x + 90) % 360 : x)));

  const save = async () => {
    setBusy(true);
    const { PDFDocument, degrees } = await import("pdf-lib");
    const doc = await PDFDocument.load(pdf.bytes, { ignoreEncryption: true });
    doc.getPages().forEach((p, i) => {
      if (rot[i]) p.setRotation(degrees((p.getRotation().angle + rot[i]) % 360));
    });
    downloadBlob(await savePdf(doc), `${baseName(pdf.file.name)}-rotated.pdf`);
    setBusy(false);
  };

  if (!pdf)
    return (
      <div className="stack">
        {error && <Msg type="bad">{error}</Msg>}
        <Dropzone accept="application/pdf,.pdf" onFiles={([f]) => load(f)} title="Drop a PDF to rotate" />
      </div>
    );

  const changed = rot.filter(Boolean).length;
  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="toolbar"><h3>Click a page to rotate it 90°</h3><button className="btn btn-sm" onClick={reset}><RefreshCw size={15} /> New PDF</button></div>
        <div className="thumb-grid">
          {Array.from({ length: pdf.count }, (_, i) => (
            <PageThumb key={i} n={i + 1} thumb={pdf.thumbs[i]} rotation={rot[i] || 0} selected={!!rot[i]} onClick={() => one(i)} />
          ))}
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Rotate all pages</div>
          <div className="grid-2">
            <button className="btn" onClick={() => all(-90)}><RotateCcw size={16} /> Left</button>
            <button className="btn" onClick={() => all(90)}><RotateCw size={16} /> Right</button>
          </div>
          <button className="btn" onClick={() => setRot(Array(pdf.count).fill(0))} disabled={!changed}><Undo2 size={16} /> Reset</button>
          <Msg>{changed} of {pdf.count} pages will be rotated.</Msg>
        </div>
        <button className="btn btn-primary btn-lg" onClick={save} disabled={busy || !changed}>
          {busy ? <Spinner /> : <Download size={18} />} Save rotated PDF
        </button>
      </div>
    </div>
  );
}
