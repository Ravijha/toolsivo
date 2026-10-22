"use client";
import { useEffect, useRef, useState } from "react";
import { Download, FileText, ImagePlus } from "lucide-react";
import { Field, Seg, Range, Toggle } from "@/components/ui";
import { canvasToBlob, downloadBlob, loadImage } from "@/lib/file";

const SIZES = { a4p: { n: "A4 portrait", w: 210, h: 297 }, a4l: { n: "A4 landscape", w: 297, h: 210 }, a3p: { n: "A3 portrait", w: 297, h: 420 }, letter: { n: "US Letter", w: 215.9, h: 279.4 } };
const FONTS = { modern: "'Segoe UI', system-ui, Arial, sans-serif", serif: "Georgia, 'Times New Roman', serif", impact: "'Arial Black', 'Segoe UI Black', Arial, sans-serif" };
const TEMPLATES = {
  event: { bg: ["#1e1b4b", "#7c3aed"], fg: "#ffffff", accent: "#fbbf24", font: "modern", kicker: "YOU'RE INVITED", title: "Annual Tech Meetup 2026", sub: "Talks · Workshops · Networking", body: "Join developers, designers and founders for an evening of ideas, food and great conversations.", when: "Saturday, 14 November · 5:00 PM", where: "Innovation Hub, Koramangala, Bengaluru", cta: "Free entry · Register at toolsivo.com" },
  sale: { bg: ["#dc2626", "#f97316"], fg: "#ffffff", accent: "#fde047", font: "impact", kicker: "LIMITED TIME", title: "FESTIVE SALE\nUP TO 50% OFF", sub: "On clothing, footwear & accessories", body: "", when: "20 – 27 October", where: "All stores & online", cta: "Use code FESTIVE50" },
  notice: { bg: ["#ffffff", "#ffffff"], fg: "#111827", accent: "#2563eb", font: "serif", kicker: "NOTICE", title: "Water Supply Interruption", sub: "Society maintenance work", body: "Water supply will be unavailable due to tank cleaning. Please store water in advance. We regret the inconvenience.", when: "Sunday, 9 November · 9 AM – 2 PM", where: "All towers, Green Valley Residency", cta: "— Society Management Committee" },
  hiring: { bg: ["#064e3b", "#10b981"], fg: "#ffffff", accent: "#a7f3d0", font: "modern", kicker: "WE'RE HIRING", title: "Join Our Team", sub: "Frontend Developer · Sales Executive · Designer", body: "Grow with a fast-moving team. Competitive pay, flexible hours and a great culture.", when: "Apply by 30 November", where: "Pune · Hybrid", cta: "Send your CV to careers@example.com" },
  minimal: { bg: ["#f5f5f4", "#e7e5e4"], fg: "#1c1917", accent: "#ea580c", font: "modern", kicker: "WORKSHOP", title: "Introduction to\nWatercolour", sub: "A relaxed beginner session", body: "All materials provided. Limited to 15 seats.", when: "Every Sunday · 11 AM", where: "The Art Room, Indiranagar", cta: "Book: +91 98765 43210" },
};

function wrap(ctx, text, maxW) {
  const out = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const w of para.split(" ")) {
      const t = line ? `${line} ${w}` : w;
      if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
  }
  return out;
}

export default function Poster() {
  const [tpl, setTpl] = useState("event");
  const [d, setD] = useState(TEMPLATES.event);
  const [size, setSize] = useState("a4p");
  const [photo, setPhoto] = useState(null);
  const [photoPos, setPhotoPos] = useState("top");
  const [scale, setScale] = useState(100);
  const [border, setBorder] = useState(true);
  const ref = useRef(null);
  const set = (k) => (e) => setD((s) => ({ ...s, [k]: e.target.value }));
  const pick = (k) => { setTpl(k); setD(TEMPLATES[k]); };

  useEffect(() => {
    const S = SIZES[size], DPI = 150;
    const W = Math.round((S.w / 25.4) * DPI), H = Math.round((S.h / 25.4) * DPI);
    const c = ref.current;
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, d.bg[0]); g.addColorStop(1, d.bg[1]);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // soft decorative circles (original artwork)
    x.globalAlpha = 0.12; x.fillStyle = d.accent;
    x.beginPath(); x.arc(W * 0.92, H * 0.06, W * 0.32, 0, 7); x.fill();
    x.beginPath(); x.arc(W * 0.04, H * 0.97, W * 0.26, 0, 7); x.fill();
    x.globalAlpha = 1;
    const pad = W * 0.08, maxW = W - pad * 2, k = (scale / 100) * (W / 1240);
    const font = FONTS[d.font];
    let y = pad * 1.1;

    if (photo && photoPos === "top") {
      const ph = H * 0.3, r = Math.max(maxW / photo.naturalWidth, ph / photo.naturalHeight);
      x.save(); x.beginPath(); x.roundRect(pad, y, maxW, ph, 24 * k); x.clip();
      x.drawImage(photo, pad + (maxW - photo.naturalWidth * r) / 2, y + (ph - photo.naturalHeight * r) / 2, photo.naturalWidth * r, photo.naturalHeight * r);
      x.restore(); y += ph + 50 * k;
    }
    const text = (s, px, weight, color, gap = 1.18, family = font) => {
      if (!s) return;
      x.font = `${weight} ${px * k}px ${family}`; x.fillStyle = color; x.textBaseline = "top";
      for (const l of wrap(x, s, maxW)) { x.fillText(l, pad, y); y += px * k * gap; }
    };
    if (d.kicker) {
      x.font = `800 ${30 * k}px ${font}`;
      const tw = x.measureText(d.kicker).width;
      x.fillStyle = d.accent; x.beginPath(); x.roundRect(pad, y, tw + 40 * k, 52 * k, 26 * k); x.fill();
      x.fillStyle = d.bg[0] === "#ffffff" || d.bg[0] === "#f5f5f4" ? "#fff" : d.bg[0]; x.textBaseline = "middle"; x.fillText(d.kicker, pad + 20 * k, y + 27 * k);
      y += 90 * k;
    }
    text(d.title, d.font === "impact" ? 120 : 108, 800, d.fg, 1.08);
    y += 14 * k;
    text(d.sub, 46, 600, d.accent, 1.25);
    y += 26 * k;
    text(d.body, 36, 400, d.fg, 1.45);
    if (photo && photoPos === "middle") {
      y += 26 * k;
      const ph = Math.min(H * 0.28, H - y - 360 * k), r = Math.max(maxW / photo.naturalWidth, ph / photo.naturalHeight);
      if (ph > 60) { x.save(); x.beginPath(); x.roundRect(pad, y, maxW, ph, 24 * k); x.clip(); x.drawImage(photo, pad + (maxW - photo.naturalWidth * r) / 2, y + (ph - photo.naturalHeight * r) / 2, photo.naturalWidth * r, photo.naturalHeight * r); x.restore(); y += ph; }
    }
    // details block anchored to the bottom
    let by = H - pad * 1.1 - 230 * k;
    x.fillStyle = d.accent; x.fillRect(pad, by, 120 * k, 8 * k);
    by += 40 * k;
    for (const [s, px, w] of [[d.when, 44, 800], [d.where, 34, 500], [d.cta, 34, 700]]) {
      if (!s) continue;
      x.font = `${w} ${px * k}px ${font}`; x.fillStyle = s === d.cta ? d.accent : d.fg; x.textBaseline = "top";
      for (const l of wrap(x, s, maxW)) { x.fillText(l, pad, by); by += px * k * 1.35; }
    }
    if (border) { x.strokeStyle = d.accent; x.lineWidth = 10 * k; x.strokeRect(pad * 0.4, pad * 0.4, W - pad * 0.8, H - pad * 0.8); }
  }, [d, size, photo, photoPos, scale, border]);

  const png = async () => downloadBlob(await canvasToBlob(ref.current, "image/png"), `poster-${tpl}.png`);
  const pdf = async () => {
    const { PDFDocument } = await import("pdf-lib");
    const S = SIZES[size], pt = (mm) => (mm / 25.4) * 72;
    const doc = await PDFDocument.create();
    const img = await doc.embedPng(await (await canvasToBlob(ref.current, "image/png")).arrayBuffer());
    doc.addPage([pt(S.w), pt(S.h)]).drawImage(img, { x: 0, y: 0, width: pt(S.w), height: pt(S.h) });
    downloadBlob(new Blob([await doc.save()], { type: "application/pdf" }), `poster-${tpl}.pdf`);
  };

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="seg">{Object.keys(TEMPLATES).map((k) => <button key={k} className={tpl === k ? "on" : ""} onClick={() => pick(k)} style={{ textTransform: "capitalize" }}>{k}</button>)}</div>
        <div className="preview-box" style={{ padding: 16, background: "var(--surface-2)" }}>
          <canvas ref={ref} style={{ maxHeight: 640, width: "auto", maxWidth: "100%", boxShadow: "var(--shadow-lg)", borderRadius: 4 }} />
        </div>
        <div className="grid-2">
          <button className="btn btn-primary btn-lg" onClick={pdf}><FileText size={18} /> Download PDF</button>
          <button className="btn btn-lg" onClick={png}><Download size={18} /> Download PNG</button>
        </div>
        <small className="muted">Rendered at 150 DPI for crisp prints. Only use photos you own or have permission to use.</small>
      </div>
      <div className="side" style={{ position: "static" }}>
        <div className="panel stack">
          <Field label="Paper size"><select className="select" value={size} onChange={(e) => setSize(e.target.value)}>{Object.entries(SIZES).map(([k, v]) => <option key={k} value={k}>{v.n}</option>)}</select></Field>
          <div className="grid-3">
            <Field label="Background"><input type="color" value={d.bg[0]} onChange={(e) => setD((s) => ({ ...s, bg: [e.target.value, s.bg[1]] }))} /></Field>
            <Field label="Gradient"><input type="color" value={d.bg[1]} onChange={(e) => setD((s) => ({ ...s, bg: [s.bg[0], e.target.value] }))} /></Field>
            <Field label="Accent"><input type="color" value={d.accent} onChange={set("accent")} /></Field>
          </div>
          <div className="grid-2">
            <Field label="Text"><input type="color" value={d.fg} onChange={set("fg")} /></Field>
            <Field label="Font"><select className="select" value={d.font} onChange={set("font")}><option value="modern">Modern</option><option value="serif">Serif</option><option value="impact">Heavy</option></select></Field>
          </div>
          <Range label="Text size" value={scale} min={70} max={130} onChange={setScale} format={(v) => `${v}%`} />
          <Toggle label="Accent border" checked={border} onChange={setBorder} />
        </div>
        <div className="panel stack">
          <label className="btn btn-sm" style={{ cursor: "pointer" }}><ImagePlus size={15} /> {photo ? "Change photo" : "Add a photo"}<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await loadImage(f)); }} /></label>
          {photo && (<><Seg options={[{ label: "Top", value: "top" }, { label: "Middle", value: "middle" }]} value={photoPos} onChange={setPhotoPos} /><button className="btn btn-sm btn-ghost" onClick={() => setPhoto(null)}>Remove photo</button></>)}
        </div>
        <div className="panel stack">
          {[["kicker", "Label"], ["title", "Headline", true], ["sub", "Subheading"], ["body", "Description", true], ["when", "Date & time"], ["where", "Location"], ["cta", "Call to action / contact"]].map(([k, l, multi]) => (
            <Field key={k} label={l}>{multi ? <textarea className="textarea prose" style={{ minHeight: 64 }} value={d[k]} onChange={set(k)} /> : <input className="input" value={d[k]} onChange={set(k)} />}</Field>
          ))}
        </div>
      </div>
    </div>
  );
}
