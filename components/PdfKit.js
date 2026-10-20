"use client";
import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { openPdfjs, renderPage } from "@/lib/pdf";

const MAX_THUMBS = 300;

/** Loads a PDF, reports its page count, then streams in page thumbnails. */
export function usePdfFile() {
  const [pdf, setPdf] = useState(null);
  const [error, setError] = useState(null);
  const token = useRef(0);

  const load = async (file) => {
    const id = ++token.current;
    setError(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setPdf({ file, bytes, count, thumbs: Array(count).fill(null) });
      try {
        const pj = await openPdfjs(bytes);
        for (let i = 1; i <= Math.min(count, MAX_THUMBS); i++) {
          if (id !== token.current) return;
          const c = await renderPage(pj, i, { maxWidth: 200 });
          const url = c.toDataURL("image/jpeg", 0.72);
          setPdf((s) => (s && s.bytes === bytes ? { ...s, thumbs: s.thumbs.map((t, j) => (j === i - 1 ? url : t)) } : s));
        }
      } catch (e) {
        console.warn("Thumbnail rendering unavailable", e);
      }
    } catch (e) {
      setError(/encrypt|password/i.test(e.message) ? "This PDF is password-protected. Please unlock it first." : "Could not read this PDF file.");
    }
  };
  const reset = () => { token.current++; setPdf(null); };
  return { pdf, error, load, reset };
}

export function PageThumb({ thumb, n, selected, rotation = 0, onClick, badge }) {
  return (
    <div className={`pg ${selected ? "sel" : ""}`} onClick={onClick}>
      <span className="pg-check"><Check size={14} /></span>
      {badge && <span className="pg-rot">{badge}</span>}
      <div className="pg-img">
        {thumb ? (
          <img src={thumb} alt={`Page ${n}`} style={{ transform: `rotate(${rotation}deg) scale(${rotation % 180 ? 0.75 : 1})` }} />
        ) : (
          <span className="pg-ph">{n}</span>
        )}
      </div>
      <div className="pg-n">Page {n}</div>
    </div>
  );
}

export async function savePdf(doc) {
  const bytes = await doc.save({ useObjectStreams: true });
  return new Blob([bytes], { type: "application/pdf" });
}
