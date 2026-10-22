"use client";
import { useMemo, useState } from "react";
import { Monitor, Smartphone, CheckCircle2, AlertTriangle } from "lucide-react";
import { Field, Seg, CopyBtn } from "@/components/ui";
import { tools } from "@/lib/tools";

// Google truncates by pixel width (≈600px titles, ≈920px descriptions on desktop), not characters.
let ctx;
const measure = (text, font) => {
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  ctx.font = font;
  return ctx.measureText(text).width;
};
function truncate(text, maxPx, font) {
  if (measure(text, font) <= maxPx) return { text, cut: false };
  let lo = 0, hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (measure(text.slice(0, mid) + " ...", font) <= maxPx) lo = mid; else hi = mid - 1;
  }
  return { text: text.slice(0, lo).replace(/\s+\S*$/, "") + " ...", cut: true };
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export default function MetaPreview() {
  const [title, setTitle] = useState("Free Online Tools — Compress, Convert & Calculate | Toolsivo");
  const [desc, setDesc] = useState(`Toolsivo offers ${tools.length} free online tools: image compressor, PDF merge, GST and EMI calculators, JSON formatter and more. Fast, private and 100% in your browser — no sign-up.`);
  const [url, setUrl] = useState("https://toolsivo.com/tools/image-compressor/");
  const [site, setSite] = useState("Toolsivo");
  const [view, setView] = useState("desktop");

  const mobile = view === "mobile";
  const tFont = mobile ? "400 18px Arial" : "400 20px Arial";
  const dFont = "400 14px Arial";
  const T = useMemo(() => truncate(title, mobile ? 520 : 600, tFont), [title, mobile, tFont]);
  const D = useMemo(() => truncate(desc, mobile ? 680 : 920, dFont), [desc, mobile]);
  const tPx = useMemo(() => Math.round(measure(title, "400 20px Arial")), [title]);
  const dPx = useMemo(() => Math.round(measure(desc, dFont)), [desc]);

  let crumbs = url;
  try {
    const u = new URL(url);
    crumbs = [u.host.replace(/^www\./, ""), ...u.pathname.split("/").filter(Boolean)].join(" › ");
  } catch {}

  const checks = [
    { ok: title.length >= 30 && tPx <= 600, text: title.length < 30 ? "Title is short — aim for 50–60 characters." : tPx > 600 ? `Title is ${tPx}px wide and will be cut off (max ≈600px).` : `Title length looks great (${title.length} chars, ${tPx}px).` },
    { ok: desc.length >= 120 && dPx <= 920, text: desc.length < 120 ? "Description is short — aim for 140–160 characters." : dPx > 920 ? `Description is ${dPx}px and will be cut off (max ≈920px).` : `Description length looks great (${desc.length} chars).` },
    { ok: /^https:\/\//.test(url), text: /^https:\/\//.test(url) ? "URL uses HTTPS." : "Use an HTTPS URL." },
  ];

  const code = `<title>${esc(title)}</title>\n<meta name="description" content="${esc(desc)}">\n<link rel="canonical" href="${esc(url)}">`;

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <h3>Google search preview</h3>
          <Seg options={[{ label: <><Monitor size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Desktop</>, value: "desktop" }, { label: <><Smartphone size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Mobile</>, value: "mobile" }]} value={view} onChange={setView} />
        </div>
        <div style={{ background: "#fff", color: "#202124", borderRadius: 18, padding: mobile ? 16 : "22px 26px", border: "1px solid var(--border)", boxShadow: "var(--shadow)", maxWidth: mobile ? 400 : "100%", fontFamily: "Arial, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f3f4", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, color: "#5f6368", border: "1px solid #dadce0" }}>{(site || "?")[0]}</span>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 14, color: "#202124" }}>{site || "Website"}</div>
              <div style={{ fontSize: 12, color: "#4d5156" }}>{crumbs}</div>
            </div>
          </div>
          <div style={{ font: tFont, color: "#1a0dab", lineHeight: 1.3, marginBottom: 4, cursor: "pointer" }}>{T.text || "Page title"}</div>
          <div style={{ font: dFont, color: "#4d5156", lineHeight: 1.58 }}>{D.text || "Your meta description appears here."}</div>
        </div>
        <div className="panel stack">
          <div className="panel-title">SEO checks</div>
          {checks.map((c) => (
            <div key={c.text} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: ".92rem" }}>
              {c.ok ? <CheckCircle2 size={18} color="var(--ok)" style={{ flex: "none" }} /> : <AlertTriangle size={18} color="var(--warn)" style={{ flex: "none" }} />} {c.text}
            </div>
          ))}
        </div>
        <div className="field">
          <span className="label">HTML tags <CopyBtn text={code} /></span>
          <pre className="code-out">{code}</pre>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Page title" value={`${title.length} chars · ${tPx}/600px`}>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="progress"><i style={{ width: `${Math.min(100, (tPx / 600) * 100)}%`, background: tPx > 600 ? "var(--bad)" : undefined }} /></div>
          </Field>
          <Field label="Meta description" value={`${desc.length} chars · ${dPx}/920px`}>
            <textarea className="textarea prose" style={{ minHeight: 140 }} value={desc} onChange={(e) => setDesc(e.target.value)} />
            <div className="progress"><i style={{ width: `${Math.min(100, (dPx / 920) * 100)}%`, background: dPx > 920 ? "var(--bad)" : undefined }} /></div>
          </Field>
          <Field label="Page URL"><input className="input" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
          <Field label="Site name"><input className="input" value={site} onChange={(e) => setSite(e.target.value)} /></Field>
        </div>
      </div>
    </div>
  );
}
