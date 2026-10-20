"use client";
import { useMemo, useState } from "react";
import { Scissors, RefreshCw } from "lucide-react";
import { Dropzone, Field, Seg, Msg, Spinner, NumInput } from "@/components/ui";
import { usePdfFile, PageThumb, savePdf } from "@/components/PdfKit";
import { parseRanges } from "@/lib/pdf";
import { downloadBlob, baseName } from "@/lib/file";
import { makeZip } from "@/lib/zip";

const groupColors = ["#7c5cff", "#ff4d8d", "#00b3b0", "#f9a826", "#2d8cff", "#e84bc7", "#0aa874", "#f0543c"];

export default function SplitPdf() {
  const { pdf, error, load, reset } = usePdfFile();
  const [mode, setMode] = useState("all");
  const [ranges, setRanges] = useState("1-2, 3-");
  const [every, setEvery] = useState(2);
  const [busy, setBusy] = useState(false);

  const plan = useMemo(() => {
    if (!pdf) return { groups: [] };
    try {
      if (mode === "all") return { groups: Array.from({ length: pdf.count }, (_, i) => [i]) };
      if (mode === "every") {
        const n = Math.max(1, +every || 1), g = [];
        for (let i = 0; i < pdf.count; i += n) g.push(Array.from({ length: Math.min(n, pdf.count - i) }, (_, k) => i + k));
        return { groups: g };
      }
      return { groups: parseRanges(ranges, pdf.count, true) };
    } catch (e) {
      return { groups: [], error: e.message };
    }
  }, [pdf, mode, ranges, every]);

  const groupOf = (i) => plan.groups.findIndex((g) => g.includes(i));

  const split = async () => {
    setBusy(true);
    const { PDFDocument } = await import("pdf-lib");
    const src = await PDFDocument.load(pdf.bytes, { ignoreEncryption: true });
    const base = baseName(pdf.file.name);
    const files = [];
    for (const g of plan.groups) {
      const out = await PDFDocument.create();
      (await out.copyPages(src, g)).forEach((p) => out.addPage(p));
      const label = g.length === 1 ? `page-${g[0] + 1}` : `pages-${g[0] + 1}-${g[g.length - 1] + 1}`;
      files.push({ name: `${base}-${label}.pdf`, data: await savePdf(out) });
    }
    if (files.length === 1) downloadBlob(files[0].data, files[0].name);
    else downloadBlob(await makeZip(files), `${base}-split.zip`);
    setBusy(false);
  };

  if (!pdf)
    return (
      <div className="stack">
        {error && <Msg type="bad">{error}</Msg>}
        <Dropzone accept="application/pdf,.pdf" onFiles={([f]) => load(f)} title="Drop a PDF to split" />
      </div>
    );

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="toolbar"><h3>{pdf.file.name} · {pdf.count} pages</h3><button className="btn btn-sm" onClick={reset}><RefreshCw size={15} /> New PDF</button></div>
        <div className="thumb-grid">
          {Array.from({ length: pdf.count }, (_, i) => {
            const g = groupOf(i);
            return (
              <div key={i} style={{ position: "relative" }}>
                <PageThumb thumb={pdf.thumbs[i]} n={i + 1} />
                {g >= 0 && (
                  <span style={{ position: "absolute", top: 6, left: 6, background: groupColors[g % groupColors.length], color: "#fff", fontSize: ".7rem", fontWeight: 800, padding: "2px 7px", borderRadius: 6 }}>
                    File {g + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Split mode</div>
          <Seg options={[{ label: "Every page", value: "all" }, { label: "Ranges", value: "ranges" }, { label: "Every N", value: "every" }]} value={mode} onChange={setMode} />
          {mode === "ranges" && (
            <Field label="Page ranges" hint="Each range becomes its own PDF, e.g. 1-3, 4, 5-">
              <input className="input" value={ranges} onChange={(e) => setRanges(e.target.value)} />
            </Field>
          )}
          {mode === "every" && <Field label="Pages per file"><NumInput value={every} onChange={setEvery} min={1} /></Field>}
          {plan.error && <Msg type="bad">{plan.error}</Msg>}
          {!plan.error && <Msg>This will create <b>{plan.groups.length}</b> PDF file{plan.groups.length === 1 ? "" : "s"}{plan.groups.length > 1 ? " (as a ZIP)" : ""}.</Msg>}
        </div>
        <button className="btn btn-primary btn-lg" onClick={split} disabled={busy || !plan.groups.length}>
          {busy ? <Spinner /> : <Scissors size={18} />} Split PDF
        </button>
      </div>
    </div>
  );
}
