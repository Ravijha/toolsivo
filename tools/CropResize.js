"use client";
import { useEffect, useState } from "react";
import { Download, Lock, Unlock, RefreshCw, Maximize } from "lucide-react";
import { Dropzone, Field, Seg, Range, NumInput } from "@/components/ui";
import Cropper, { initCrop } from "@/components/Cropper";
import { loadImage, makeCanvas, canvasToBlob, downloadBlob, baseName, extFor } from "@/lib/file";

const ratios = [
  { label: "Free", value: "free" }, { label: "1:1", value: 1 }, { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 }, { label: "16:9", value: 16 / 9 }, { label: "9:16", value: 9 / 16 }, { label: "4:5", value: 4 / 5 },
];

export default function CropResize() {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [ratio, setRatio] = useState("free");
  const [crop, setCrop] = useState(null);
  const [outW, setOutW] = useState(0);
  const [outH, setOutH] = useState(0);
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState("image/png");
  const [quality, setQuality] = useState(92);

  const open = async ([f]) => {
    const im = await loadImage(f);
    setFile(f);
    setImg(im);
    setFormat(f.type === "image/jpeg" ? "image/jpeg" : f.type === "image/webp" ? "image/webp" : "image/png");
    setRatio("free");
    setCrop({ x: 0, y: 0, w: im.naturalWidth, h: im.naturalHeight });
  };

  // keep the output size in sync with the crop box
  useEffect(() => {
    if (!crop) return;
    setOutW(Math.round(crop.w));
    setOutH(Math.round(crop.h));
  }, [crop]);

  const pickRatio = (r) => {
    setRatio(r);
    setCrop(initCrop(img.naturalWidth, img.naturalHeight, r === "free" ? null : r, r === "free" ? 1 : 0.9));
  };

  const setW = (v) => {
    const w = Math.max(0, Math.round(+v || 0));
    setOutW(w);
    if (lock && crop) setOutH(Math.round((w * crop.h) / crop.w));
  };
  const setH = (v) => {
    const h = Math.max(0, Math.round(+v || 0));
    setOutH(h);
    if (lock && crop) setOutW(Math.round((h * crop.w) / crop.h));
  };
  const scale = (p) => {
    setOutW(Math.round((crop.w * p) / 100));
    setOutH(Math.round((crop.h * p) / 100));
  };

  const download = async () => {
    const c = makeCanvas(outW, outH);
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    if (format === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, c.width, c.height);
    const blob = await canvasToBlob(c, format, quality / 100);
    downloadBlob(blob, `${baseName(file.name)}-${c.width}x${c.height}.${extFor(format)}`);
  };

  if (!img) return <Dropzone onFiles={open} title="Drop an image to crop & resize" hint="JPG, PNG, WebP, GIF — processed locally" />;

  return (
    <div className="tool-cols">
      <div className="stack">
        <Cropper src={img.src} natW={img.naturalWidth} natH={img.naturalHeight} aspect={ratio === "free" ? null : ratio} crop={crop} onChange={setCrop} />
        <div className="row" style={{ justifyContent: "space-between" }}>
          <small className="muted">Original: {img.naturalWidth} × {img.naturalHeight}px · Drag the box or its corners</small>
          <div className="actions">
            <button className="btn btn-sm" onClick={() => setCrop({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight })}><Maximize size={15} /> Full image</button>
            <button className="btn btn-sm" onClick={() => setImg(null)}><RefreshCw size={15} /> New image</button>
          </div>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Crop ratio</div>
          <Seg options={ratios} value={ratio} onChange={pickRatio} />
        </div>
        <div className="panel stack">
          <div className="panel-title">Resize output</div>
          <div className="row" style={{ alignItems: "flex-end", flexWrap: "nowrap" }}>
            <Field label="Width"><NumInput value={outW} onChange={setW} suffix="px" /></Field>
            <button className="btn btn-icon" onClick={() => setLock(!lock)} title="Lock aspect ratio" style={{ flex: "none" }}>
              {lock ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
            <Field label="Height"><NumInput value={outH} onChange={setH} suffix="px" /></Field>
          </div>
          <div className="seg">
            {[25, 50, 75, 100, 200].map((p) => <button key={p} onClick={() => scale(p)}>{p}%</button>)}
          </div>
        </div>
        <div className="panel stack">
          <div className="panel-title">Format</div>
          <Seg options={[{ label: "PNG", value: "image/png" }, { label: "JPG", value: "image/jpeg" }, { label: "WebP", value: "image/webp" }]} value={format} onChange={setFormat} />
          {format !== "image/png" && <Range label="Quality" value={quality} min={40} max={100} onChange={setQuality} format={(v) => `${v}%`} />}
        </div>
        <button className="btn btn-primary btn-lg" onClick={download} disabled={!outW || !outH}>
          <Download size={18} /> Download {outW}×{outH}
        </button>
      </div>
    </div>
  );
}
