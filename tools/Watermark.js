"use client";
import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Dropzone, Field, Seg, Range, Toggle } from "@/components/ui";
import { loadImage, canvasToBlob, downloadBlob, baseName, extFor } from "@/lib/file";

const POS = ["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"];

export default function Watermark() {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [kind, setKind] = useState("text");
  const [text, setText] = useState("© Toolsivo.com");
  const [logo, setLogo] = useState(null);
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(6);
  const [opacity, setOpacity] = useState(60);
  const [angle, setAngle] = useState(0);
  const [pos, setPos] = useState("br");
  const [tile, setTile] = useState(false);
  const [shadow, setShadow] = useState(true);
  const [margin, setMargin] = useState(3);
  const ref = useRef(null);

  const open = async ([f]) => { setFile(f); setImg(await loadImage(f)); };

  useEffect(() => {
    if (!img) return;
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = ref.current;
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    if (kind === "logo" && !logo) return;

    const unit = Math.max(W, H) / 100;
    let mw, mh;
    const drawMark = () => {
      if (kind === "text") {
        ctx.fillText(text, 0, 0);
      } else {
        ctx.drawImage(logo, -mw / 2, -mh / 2, mw, mh);
      }
    };
    ctx.globalAlpha = opacity / 100;
    if (kind === "text") {
      ctx.font = `700 ${size * unit}px system-ui, "Segoe UI", sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      mw = ctx.measureText(text).width;
      mh = size * unit;
      if (shadow) { ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = unit * 0.8; ctx.shadowOffsetY = unit * 0.2; }
    } else {
      mw = (W * size * 3) / 100;
      mh = (mw * logo.naturalHeight) / logo.naturalWidth;
    }
    const rad = (angle * Math.PI) / 180;
    if (tile) {
      const stepX = mw + unit * 12, stepY = mh + unit * 12;
      for (let y = -H; y < H * 2; y += stepY)
        for (let x = -W + ((y / stepY) % 2 ? stepX / 2 : 0); x < W * 2; x += stepX) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(rad || -Math.PI / 6); drawMark(); ctx.restore();
        }
    } else {
      const m = margin * unit;
      const col = pos[1] === "l" ? 0 : pos[1] === "c" ? 1 : 2;
      const row = pos[0] === "t" ? 0 : pos[0] === "m" ? 1 : 2;
      const x = [m + mw / 2, W / 2, W - m - mw / 2][col];
      const y = [m + mh / 2, H / 2, H - m - mh / 2][row];
      ctx.save(); ctx.translate(x, y); ctx.rotate(rad); drawMark(); ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = "transparent";
  }, [img, kind, text, logo, color, size, opacity, angle, pos, tile, shadow, margin]);

  if (!img) return <Dropzone onFiles={open} title="Drop an image to watermark" />;
  const type = ["image/png", "image/webp"].includes(file.type) ? file.type : "image/jpeg";

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="preview-box" style={{ padding: 16 }}>
          <canvas ref={ref} style={{ maxHeight: 560, width: "auto", maxWidth: "100%", boxShadow: "var(--shadow)" }} />
        </div>
        <div className="row" style={{ justifyContent: "flex-end" }}><button className="btn btn-sm" onClick={() => setImg(null)}><RefreshCw size={15} /> New image</button></div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Seg options={[{ label: "Text", value: "text" }, { label: "Logo", value: "logo" }]} value={kind} onChange={setKind} />
          {kind === "text" ? (
            <>
              <Field label="Watermark text"><input className="input" value={text} onChange={(e) => setText(e.target.value)} /></Field>
              <div className="row">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                <Toggle label="Drop shadow" checked={shadow} onChange={setShadow} />
              </div>
            </>
          ) : (
            <Dropzone compact onFiles={async ([f]) => setLogo(await loadImage(f))} title={logo ? "Replace logo" : "Choose a logo"} hint="Transparent PNG recommended" />
          )}
          <Range label="Size" value={size} min={1} max={25} step={0.5} onChange={setSize} format={(v) => `${v}`} />
          <Range label="Opacity" value={opacity} min={5} max={100} onChange={setOpacity} format={(v) => `${v}%`} />
          <Range label="Rotation" value={angle} min={-90} max={90} onChange={setAngle} format={(v) => `${v}°`} />
        </div>
        <div className="panel stack">
          <Toggle label="Tile across the image" checked={tile} onChange={setTile} />
          {!tile && (
            <>
              <Field label="Position">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, width: 132 }}>
                  {POS.map((p) => (
                    <button key={p} onClick={() => setPos(p)} aria-label={p} style={{ height: 36, borderRadius: 9, border: "1px solid var(--border-strong)", background: pos === p ? "var(--grad)" : "var(--elev)", cursor: "pointer" }} />
                  ))}
                </div>
              </Field>
              <Range label="Margin" value={margin} min={0} max={15} onChange={setMargin} format={(v) => `${v}%`} />
            </>
          )}
        </div>
        <button className="btn btn-primary btn-lg" onClick={async () => downloadBlob(await canvasToBlob(ref.current, type, 0.92), `${baseName(file.name)}-watermarked.${extFor(type)}`)}>
          <Download size={18} /> Download
        </button>
      </div>
    </div>
  );
}
