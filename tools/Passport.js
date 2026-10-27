"use client";
import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw, Printer } from "lucide-react";
import { Dropzone, Field, Seg, Range, Toggle, Msg } from "@/components/ui";
import Cropper, { initCrop } from "@/components/Cropper";
import { loadImage, makeCanvas, canvasToBlob, downloadBlob } from "@/lib/file";

const presets = [
  { id: "in", name: "India Passport — 35×45 mm", w: 35, h: 45 },
  { id: "in-visa", name: "India Visa / OCI — 51×51 mm", w: 51, h: 51 },
  { id: "us", name: "USA Passport / Visa — 2×2 in", w: 50.8, h: 50.8 },
  { id: "uk", name: "UK — 35×45 mm", w: 35, h: 45 },
  { id: "eu", name: "Schengen / EU — 35×45 mm", w: 35, h: 45 },
  { id: "ca", name: "Canada — 50×70 mm", w: 50, h: 70 },
  { id: "au", name: "Australia — 35×45 mm", w: 35, h: 45 },
  { id: "cn", name: "China — 33×48 mm", w: 33, h: 48 },
  { id: "ae", name: "UAE — 43×55 mm", w: 43, h: 55 },
  { id: "pan", name: "PAN Card — 25×35 mm", w: 25, h: 35 },
];
const DPI = 300;
const mm2px = (mm) => Math.round((mm / 25.4) * DPI);
const sheets = { "4x6": { name: "4×6 in", w: 1800, h: 1200 }, a4: { name: "A4", w: 2480, h: 3508 }, "5x7": { name: "5×7 in", w: 2100, h: 1500 } };

export default function Passport() {
  const [img, setImg] = useState(null);
  const [pid, setPid] = useState("in");
  const [crop, setCrop] = useState(null);
  const [bright, setBright] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [sat, setSat] = useState(100);
  const [border, setBorder] = useState(true);
  const [sheet, setSheet] = useState("4x6");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [sheetInfo, setSheetInfo] = useState(null);
  const sheetRef = useRef(null);
  const p = presets.find((x) => x.id === pid);
  const aspect = p.w / p.h;

  const open = async ([f]) => {
    const im = await loadImage(f);
    setImg(im);
    setCrop(initCrop(im.naturalWidth, im.naturalHeight, aspect, 0.85));
  };

  useEffect(() => {
    if (img) setCrop(initCrop(img.naturalWidth, img.naturalHeight, aspect, 0.85));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  const renderPhoto = () => {
    const w = mm2px(p.w), h = mm2px(p.h);
    const c = makeCanvas(w, h);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.filter = `brightness(${bright}%) contrast(${contrast}%) saturate(${sat}%)`;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, w, h);
    ctx.filter = "none";
    if (border) { ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2); }
    return c;
  };

  // live preview of single photo + print sheet
  useEffect(() => {
    if (!img || !crop) return;
    const t = setTimeout(() => {
      const photo = renderPhoto();
      setPhotoUrl(photo.toDataURL("image/jpeg", 0.9));
      const s = sheets[sheet];
      const sc = sheetRef.current;
      sc.width = s.w; sc.height = s.h;
      const ctx = sc.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, s.w, s.h);
      const gap = mm2px(2.5), margin = mm2px(4);
      const cols = Math.floor((s.w - 2 * margin + gap) / (photo.width + gap));
      const rows = Math.floor((s.h - 2 * margin + gap) / (photo.height + gap));
      const gw = cols * photo.width + (cols - 1) * gap, gh = rows * photo.height + (rows - 1) * gap;
      const x0 = (s.w - gw) / 2, y0 = (s.h - gh) / 2;
      for (let r = 0; r < rows; r++)
        for (let cI = 0; cI < cols; cI++) ctx.drawImage(photo, x0 + cI * (photo.width + gap), y0 + r * (photo.height + gap));
      setSheetInfo({ count: Math.max(0, cols * rows) });
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, crop, bright, contrast, sat, border, sheet, pid]);

  if (!img)
    return (
      <div className="stack">
        <Dropzone onFiles={open} title="Upload a front-facing photo" hint="Use a plain light background and even lighting for best results" />
        <Msg>Tip: stand about 1 m from a plain white wall, face the camera straight on, keep a neutral expression and remove glasses.</Msg>
        <small className="muted">Toolsivo is not a government service and is not affiliated with any passport or visa authority. Photo rules change — always check the latest requirements of the authority you are applying to.</small>
      </div>
    );

  const guide = (
    <svg className="passport-guide" viewBox="0 0 100 100" preserveAspectRatio="none">
      <ellipse cx="50" cy="44" rx="27" ry="31" fill="none" stroke="#fff" strokeWidth=".7" strokeDasharray="2 1.5" vectorEffect="non-scaling-stroke" />
      <line x1="0" y1="13" x2="100" y2="13" stroke="#ffd166" strokeWidth=".5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
      <line x1="0" y1="80" x2="100" y2="80" stroke="#ffd166" strokeWidth=".5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
    </svg>
  );

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <Cropper src={img.src} natW={img.naturalWidth} natH={img.naturalHeight} aspect={aspect} crop={crop} onChange={setCrop} overlay={guide} maxHeight={480} />
        <small className="muted">Fit the face inside the oval — top of head near the upper line, chin near the lower line.</small>
        <div className="panel">
          <div className="toolbar">
            <h3>Print sheet preview · {sheets[sheet].name} · {sheetInfo?.count || 0} photos</h3>
            <Seg options={Object.entries(sheets).map(([k, v]) => ({ label: v.name, value: k }))} value={sheet} onChange={setSheet} />
          </div>
          <div style={{ background: "var(--checker)", borderRadius: 14, padding: 14, display: "grid", placeItems: "center" }}>
            <canvas ref={sheetRef} style={{ maxHeight: 360, width: "auto", boxShadow: "var(--shadow)" }} />
          </div>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Photo size</div>
          <select className="select" value={pid} onChange={(e) => setPid(e.target.value)}>
            {presets.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <div className="row" style={{ gap: 16, alignItems: "center" }}>
            {photoUrl && <img src={photoUrl} alt="Passport preview" style={{ height: 110, borderRadius: 6, boxShadow: "var(--shadow)" }} />}
            <small className="muted">{mm2px(p.w)} × {mm2px(p.h)} px<br />at {DPI} DPI</small>
          </div>
        </div>
        <div className="panel stack">
          <div className="panel-title">Adjust</div>
          <Range label="Brightness" value={bright} min={60} max={150} onChange={setBright} format={(v) => `${v}%`} />
          <Range label="Contrast" value={contrast} min={60} max={150} onChange={setContrast} format={(v) => `${v}%`} />
          <Range label="Saturation" value={sat} min={0} max={150} onChange={setSat} format={(v) => `${v}%`} />
          <Toggle label="Thin cut border" checked={border} onChange={setBorder} />
        </div>
        <button className="btn btn-primary btn-lg" onClick={async () => downloadBlob(await canvasToBlob(renderPhoto(), "image/jpeg", 0.95), `passport-photo-${p.id}.jpg`)}>
          <Download size={18} /> Download photo
        </button>
        <button className="btn btn-lg" onClick={async () => downloadBlob(await canvasToBlob(sheetRef.current, "image/jpeg", 0.95), `passport-sheet-${sheet}.jpg`)}>
          <Printer size={18} /> Download print sheet
        </button>
        <button className="btn" onClick={() => setImg(null)}><RefreshCw size={16} /> Use another photo</button>
      </div>
    </div>
  );
}
