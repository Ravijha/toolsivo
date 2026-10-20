"use client";
import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, RefreshCw } from "lucide-react";
import { Dropzone, Range, Seg, Field } from "@/components/ui";
import { loadImage, canvasToBlob, downloadBlob, baseName, extFor } from "@/lib/file";

export default function RotateFlip() {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [angle, setAngle] = useState(0);
  const [fx, setFx] = useState(false);
  const [fy, setFy] = useState(false);
  const [format, setFormat] = useState("image/png");
  const [bg, setBg] = useState("transparent");
  const ref = useRef(null);

  const open = async ([f]) => {
    setFile(f);
    setImg(await loadImage(f));
    setAngle(0); setFx(false); setFy(false);
  };

  useEffect(() => {
    if (!img) return;
    const rad = (angle * Math.PI) / 180;
    const w = img.naturalWidth, h = img.naturalHeight;
    const cw = Math.round(Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad)));
    const ch = Math.round(Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad)));
    const c = ref.current;
    c.width = cw; c.height = ch;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, cw, ch);
    const fill = format === "image/jpeg" && bg === "transparent" ? "#ffffff" : bg;
    if (fill !== "transparent") { ctx.fillStyle = fill; ctx.fillRect(0, 0, cw, ch); }
    ctx.translate(cw / 2, ch / 2);
    ctx.rotate(rad);
    ctx.scale(fx ? -1 : 1, fy ? -1 : 1);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, -w / 2, -h / 2);
  }, [img, angle, fx, fy, bg, format]);

  if (!img) return <Dropzone onFiles={open} title="Drop an image to rotate or flip" />;

  const turn = (d) => setAngle((a) => { let n = a + d; if (n > 180) n -= 360; if (n < -180) n += 360; return n; });

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="preview-box" style={{ padding: 16 }}>
          <canvas ref={ref} style={{ maxHeight: 520, width: "auto", maxWidth: "100%" }} />
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Rotate</div>
          <div className="grid-2">
            <button className="btn" onClick={() => turn(-90)}><RotateCcw size={16} /> Left 90°</button>
            <button className="btn" onClick={() => turn(90)}><RotateCw size={16} /> Right 90°</button>
          </div>
          <Range label="Custom angle" value={angle} min={-180} max={180} onChange={setAngle} format={(v) => `${v}°`} />
        </div>
        <div className="panel stack">
          <div className="panel-title">Flip</div>
          <div className="grid-2">
            <button className={`btn ${fx ? "btn-dark" : ""}`} onClick={() => setFx(!fx)}><FlipHorizontal size={16} /> Horizontal</button>
            <button className={`btn ${fy ? "btn-dark" : ""}`} onClick={() => setFy(!fy)}><FlipVertical size={16} /> Vertical</button>
          </div>
        </div>
        <div className="panel stack">
          <div className="panel-title">Output</div>
          <Seg options={[{ label: "PNG", value: "image/png" }, { label: "JPG", value: "image/jpeg" }, { label: "WebP", value: "image/webp" }]} value={format} onChange={setFormat} />
          {angle % 90 !== 0 && (
            <Field label="Corner fill">
              <Seg options={[{ label: "Transparent", value: "transparent" }, { label: "White", value: "#ffffff" }, { label: "Black", value: "#000000" }]} value={bg} onChange={setBg} />
            </Field>
          )}
        </div>
        <button className="btn btn-primary btn-lg" onClick={async () => downloadBlob(await canvasToBlob(ref.current, format, 0.92), `${baseName(file.name)}-rotated.${extFor(format)}`)}>
          <Download size={18} /> Download
        </button>
        <button className="btn" onClick={() => setImg(null)}><RefreshCw size={16} /> New image</button>
      </div>
    </div>
  );
}
