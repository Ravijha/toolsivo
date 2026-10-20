"use client";
import { useEffect, useRef, useState } from "react";
import { Download, FileArchive } from "lucide-react";
import { Dropzone, Field, Seg, Range, CopyBtn } from "@/components/ui";
import { loadImage, makeCanvas, canvasToBlob, downloadBlob } from "@/lib/file";
import { makeZip } from "@/lib/zip";
import { LogoMark } from "@/components/Logo";

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512];
const fills = [
  "linear-gradient(135deg,#4f6bff,#a24bff,#ff4d8d)", "linear-gradient(135deg,#ff7a18,#ff3d77)", "linear-gradient(135deg,#00c896,#00a3ff)",
  "#111827", "#ffffff", "#7c5cff", "#ef4444", "#10b981",
];

function paintFill(ctx, fill, s) {
  if (fill.startsWith("linear")) {
    const stops = fill.match(/#[0-9a-f]{6}/gi);
    const g = ctx.createLinearGradient(0, 0, s, s);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = g;
  } else ctx.fillStyle = fill;
}

// ICO with embedded PNGs (supported by all modern browsers)
async function buildIco(canvases) {
  const pngs = await Promise.all(canvases.map(async (c) => new Uint8Array(await (await canvasToBlob(c, "image/png")).arrayBuffer())));
  const head = new DataView(new ArrayBuffer(6 + 16 * pngs.length));
  head.setUint16(2, 1, true);
  head.setUint16(4, pngs.length, true);
  let off = head.byteLength;
  pngs.forEach((p, i) => {
    const o = 6 + i * 16, s = canvases[i].width;
    head.setUint8(o, s >= 256 ? 0 : s);
    head.setUint8(o + 1, s >= 256 ? 0 : s);
    head.setUint16(o + 4, 1, true);
    head.setUint16(o + 6, 32, true);
    head.setUint32(o + 8, p.length, true);
    head.setUint32(o + 12, off, true);
    off += p.length;
  });
  return new Blob([head, ...pngs], { type: "image/x-icon" });
}

export default function Favicon() {
  const [src, setSrc] = useState("text");
  const [img, setImg] = useState(null);
  const [text, setText] = useState("T");
  const [fill, setFill] = useState(fills[0]);
  const [color, setColor] = useState("#ffffff");
  const [shape, setShape] = useState("rounded");
  const [scale, setScale] = useState(62);
  const [pad, setPad] = useState(0);
  const [weight, setWeight] = useState("800");
  const [icons, setIcons] = useState({});
  const master = useRef(null);

  useEffect(() => {
    const S = 512;
    const c = master.current;
    c.width = c.height = S;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, S, S);
    ctx.save();
    ctx.beginPath();
    if (shape === "circle") ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
    else if (shape === "rounded") ctx.roundRect(0, 0, S, S, S * 0.22);
    else ctx.rect(0, 0, S, S);
    ctx.clip();
    if (shape !== "none") { paintFill(ctx, fill, S); ctx.fillRect(0, 0, S, S); }
    if (src === "image" && img) {
      const inset = (S * pad) / 100;
      const box = S - inset * 2;
      const r = Math.min(box / img.naturalWidth, box / img.naturalHeight);
      const w = img.naturalWidth * r, h = img.naturalHeight * r;
      ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
    } else if (src === "text") {
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      const fs = (S * scale) / 100 / Math.max(1, [...text].length * 0.55);
      ctx.font = `${weight} ${fs}px system-ui, "Segoe UI", "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      const m = ctx.measureText(text);
      // centre the glyphs' actual ink box, not the font's line box
      ctx.fillText(text, S / 2, S / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
    }
    ctx.restore();
    const out = {};
    for (const s of SIZES) {
      const k = makeCanvas(s, s);
      const kc = k.getContext("2d");
      kc.imageSmoothingQuality = "high";
      kc.drawImage(c, 0, 0, s, s);
      out[s] = k;
    }
    setIcons(out);
  }, [src, img, text, fill, color, shape, scale, pad, weight]);

  const names = { 16: "favicon-16x16.png", 32: "favicon-32x32.png", 48: "favicon-48x48.png", 64: "favicon-64x64.png", 128: "favicon-128x128.png", 180: "apple-touch-icon.png", 192: "android-chrome-192x192.png", 512: "android-chrome-512x512.png" };
  const snippet = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
  const manifest = JSON.stringify({ name: "My Site", short_name: "Site", icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" }, { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }], theme_color: "#ffffff", background_color: "#ffffff", display: "standalone" }, null, 2);

  const ico = () => buildIco([icons[16], icons[32], icons[48]]);
  const zip = async () => {
    const files = [{ name: "favicon.ico", data: await ico() }];
    for (const s of SIZES) files.push({ name: names[s], data: await canvasToBlob(icons[s], "image/png") });
    files.push({ name: "site.webmanifest", data: new TextEncoder().encode(manifest) }, { name: "favicon-snippet.html", data: new TextEncoder().encode(snippet) });
    downloadBlob(await makeZip(files), "favicon-package.zip");
  };

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="panel" style={{ display: "grid", placeItems: "center", gap: 20 }}>
          <canvas ref={master} style={{ width: 200, height: 200, background: "var(--checker)", borderRadius: 16 }} />
          <div>
            <div className="browser-tab">
              {icons[32] && <img src={icons[32].toDataURL()} width={16} height={16} alt="" />}
              <span>My awesome website</span>
              <span className="muted">×</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">All sizes</div>
          <div className="fav-grid">
            {SIZES.map((s) => icons[s] && (
              <div key={s} className="fav-item">
                <div className="fi"><img src={icons[s].toDataURL()} alt="" style={{ width: Math.min(s, 96), height: Math.min(s, 96), imageRendering: s < 48 ? "pixelated" : "auto" }} /></div>
                <small>{s}×{s}</small>
                <button className="btn btn-sm btn-ghost" onClick={async () => downloadBlob(await canvasToBlob(icons[s], "image/png"), names[s])}><Download size={13} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="label">HTML snippet <CopyBtn text={snippet} /></span>
          <pre className="code-out">{snippet}</pre>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Seg options={[{ label: "Text / emoji", value: "text" }, { label: "Image", value: "image" }]} value={src} onChange={setSrc} />
          {src === "text" ? (
            <>
              <Field label="Text (1–3 characters or an emoji)"><input className="input" value={text} maxLength={6} onChange={(e) => setText(e.target.value)} /></Field>
              <div className="row">{["T", "★", "🚀", "⚡", "🔥", "AB"].map((t) => <button key={t} className="btn btn-sm" onClick={() => setText(t)}>{t}</button>)}</div>
              <Range label="Text size" value={scale} min={20} max={100} onChange={setScale} format={(v) => `${v}%`} />
              <Field label="Weight"><Seg options={[{ label: "Regular", value: "500" }, { label: "Bold", value: "700" }, { label: "Black", value: "800" }]} value={weight} onChange={setWeight} /></Field>
              <Field label="Text colour"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></Field>
            </>
          ) : (
            <>
              <Dropzone compact onFiles={async ([f]) => setImg(await loadImage(f))} title={img ? "Replace image" : "Choose an image"} hint="Square PNG or SVG works best" />
              <Range label="Padding" value={pad} min={0} max={30} onChange={setPad} format={(v) => `${v}%`} />
            </>
          )}
        </div>
        <div className="panel stack">
          <Field label="Shape"><Seg options={[{ label: "Rounded", value: "rounded" }, { label: "Circle", value: "circle" }, { label: "Square", value: "square" }, { label: "None", value: "none" }]} value={shape} onChange={setShape} /></Field>
          {shape !== "none" && (
            <Field label="Background">
              <div className="row" style={{ gap: 8 }}>
                {fills.map((f) => (
                  <button key={f} onClick={() => setFill(f)} aria-label="Background" style={{ width: 32, height: 32, borderRadius: 9, background: f, border: fill === f ? "3px solid var(--text)" : "1px solid var(--border-strong)", cursor: "pointer" }} />
                ))}
                <input type="color" value={fill.startsWith("#") ? fill : "#7c5cff"} onChange={(e) => setFill(e.target.value)} />
              </div>
            </Field>
          )}
        </div>
        <button className="btn btn-primary btn-lg" onClick={zip} disabled={!icons[16]}><FileArchive size={18} /> Download full package</button>
        <button className="btn" onClick={async () => downloadBlob(await ico(), "favicon.ico")} disabled={!icons[16]}><Download size={16} /> favicon.ico only</button>
        <small className="muted" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={18} /> Includes ICO, PNGs, Apple touch icon & web manifest.</small>
      </div>
    </div>
  );
}
