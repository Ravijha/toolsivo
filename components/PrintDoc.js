"use client";
import { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";

export const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const nl2br = (s = "") => esc(s).replace(/\n/g, "<br>");

/** useState that is remembered in this browser (localStorage). Falls back silently if storage is blocked. */
export function usePersist(key, initial) {
  const [v, setV] = useState(initial);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setV((cur) => (typeof cur === "object" && !Array.isArray(cur) ? { ...cur, ...JSON.parse(raw) } : JSON.parse(raw)));
    } catch {}
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV];
}

const BASE_CSS = `
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff;color:#1f2430;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:"Segoe UI",system-ui,-apple-system,Roboto,"Noto Sans","Noto Sans Devanagari",Arial,sans-serif;font-size:10.5pt;line-height:1.45}
.page{width:210mm;min-height:297mm;padding:16mm 16mm 18mm;position:relative;overflow:hidden}
.page + .page{page-break-before:always;break-before:page}
table{border-collapse:collapse;width:100%}
h1,h2,h3,p{margin:0}
@media screen{body{background:#e9ebf2}.page{background:#fff;margin:0 auto 10mm;box-shadow:0 2px 12px rgba(0,0,0,.12)}}
`;

/**
 * Live A4 preview in an isolated iframe; "Save as PDF / Print" opens the browser print dialog,
 * where the user can choose "Save as PDF". `css` adds document-specific styles; `page` sets @page.
 */
export default function PrintDoc({ html, css = "", title = "document", page = "size: A4; margin: 0;", label = "Save as PDF / Print", widthMm = 210 }) {
  const frame = useRef(null);
  const wrap = useRef(null);
  const [scale, setScale] = useState(0.6);
  const [height, setHeight] = useState(1123);
  const pageW = (widthMm / 25.4) * 96;

  const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{${page}}${BASE_CSS}${css}</style></head><body>${html}</body></html>`;

  useEffect(() => {
    const el = wrap.current;
    const ro = new ResizeObserver(() => setScale(Math.min(1, (el.clientWidth - 2) / pageW)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageW]);

  const measure = () => {
    const d = frame.current?.contentDocument;
    if (d?.body) setHeight(Math.max(400, d.documentElement.scrollHeight));
  };
  useEffect(() => {
    const t = setTimeout(measure, 60);
    return () => clearTimeout(t);
  });

  const print = () => {
    const w = frame.current.contentWindow;
    w.focus();
    w.print();
  };

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div ref={wrap} style={{ background: "#e9ebf2", borderRadius: 16, padding: 0, overflow: "hidden", border: "1px solid var(--border)" }}>
        <div style={{ width: pageW * scale, height: height * scale, margin: "0 auto", overflow: "hidden" }}>
          <iframe
            ref={frame}
            title="Document preview"
            srcDoc={doc}
            onLoad={measure}
            style={{ width: pageW, height, border: 0, transform: `scale(${scale})`, transformOrigin: "0 0", display: "block", background: "#e9ebf2" }}
          />
        </div>
      </div>
      <button className="btn btn-primary btn-lg" onClick={print}><Printer size={18} /> {label}</button>
      <small className="muted">In the print window, choose <b>Save as PDF</b> as the destination (or pick your printer). Set margins to <b>None</b> and scale to <b>100%</b> for an exact layout.</small>
    </div>
  );
}
