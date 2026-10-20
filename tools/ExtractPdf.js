"use client";
import { useEffect, useState } from "react";
import { FileOutput, RefreshCw } from "lucide-react";
import { Dropzone, Field, Msg, Spinner, Toggle } from "@/components/ui";
import { usePdfFile, PageThumb, savePdf } from "@/components/PdfKit";
import { parseRanges } from "@/lib/pdf";
import { downloadBlob, baseName } from "@/lib/file";
import { makeZip } from "@/lib/zip";

// Turn [0,1,2,4] into "1-3, 5"
const toRanges = (idx) => {
  const out = [];
  for (let i = 0; i < idx.length; i++) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1] === idx[j] + 1) j++;
    out.push(i === j ? `${idx[i] + 1}` : `${idx[i] + 1}-${idx[j] + 1}`);
    i = j;
  }
  return out.join(", ");
};

export default function ExtractPdf() {
  const { pdf, error, load, reset } = usePdfFile();
  const [sel, setSel] = useState(new Set());
  const [text, setText] = useState("");
  const [textErr, setTextErr] = useState(null);
  const [separate, setSeparate] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setSel(new Set()); setText(""); }, [pdf?.bytes]);

  const apply = (s) => { setSel(s); setText(toRanges([...s].sort((a, b) => a - b))); setTextErr(null); };
  const toggle = (i) => { const s = new Set(sel); s.has(i) ? s.delete(i) : s.add(i); apply(s); };
  const onText = (v) => {
    setText(v);
    try { setSel(new Set(parseRanges(v, pdf.count))); setTextErr(null); } catch (e) { setTextErr(e.message); }
  };
  const pick = (fn) => apply(new Set(Array.from({ length: pdf.count }, (_, i) => i).filter(fn)));

  const extract = async () => {
    setBusy(true);
    const { PDFDocument } = await import("pdf-lib");
    const src = await PDFDocument.load(pdf.bytes, { ignoreEncryption: true });
    const idx = [...sel].sort((a, b) => a - b);
    const base = baseName(pdf.file.name);
    if (separate) {
      const files = [];
      for (const i of idx) {
        const out = await PDFDocument.create();
        out.addPage((await out.copyPages(src, [i]))[0]);
        files.push({ name: `${base}-page-${i + 1}.pdf`, data: await savePdf(out) });
      }
      downloadBlob(await makeZip(files), `${base}-pages.zip`);
    } else {
      const out = await PDFDocument.create();
      (await out.copyPages(src, idx)).forEach((p) => out.addPage(p));
      downloadBlob(await savePdf(out), `${base}-extracted.pdf`);
    }
    setBusy(false);
  };

  if (!pdf)
    return (
      <div className="stack">
        {error && <Msg type="bad">{error}</Msg>}
        <Dropzone accept="application/pdf,.pdf" onFiles={([f]) => load(f)} title="Drop a PDF to extract pages from" />
      </div>
    );

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="toolbar"><h3>Click pages to select them</h3><button className="btn btn-sm" onClick={reset}><RefreshCw size={15} /> New PDF</button></div>
        <div className="thumb-grid">
          {Array.from({ length: pdf.count }, (_, i) => (
            <PageThumb key={i} n={i + 1} thumb={pdf.thumbs[i]} selected={sel.has(i)} onClick={() => toggle(i)} />
          ))}
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Selection</div>
          <Field label="Pages" hint={`Example: 1-3, 7, 10- (of ${pdf.count})`}>
            <input className="input" value={text} onChange={(e) => onText(e.target.value)} placeholder="e.g. 1-3, 5" />
          </Field>
          {textErr && <Msg type="bad">{textErr}</Msg>}
          <div className="seg">
            <button onClick={() => pick(() => true)}>All</button>
            <button onClick={() => pick((i) => i % 2 === 0)}>Odd</button>
            <button onClick={() => pick((i) => i % 2 === 1)}>Even</button>
            <button onClick={() => apply(new Set())}>None</button>
          </div>
          <Toggle label="Save each page as a separate file" checked={separate} onChange={setSeparate} />
        </div>
        <button className="btn btn-primary btn-lg" onClick={extract} disabled={busy || !sel.size}>
          {busy ? <Spinner /> : <FileOutput size={18} />} Extract {sel.size} page{sel.size === 1 ? "" : "s"}
        </button>
      </div>
    </div>
  );
}
