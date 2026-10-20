"use client";
import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw, Move } from "lucide-react";
import { Dropzone, Field, Seg, Range, Toggle, NumInput, Msg } from "@/components/ui";
import { loadImage, canvasToBlob, downloadBlob, baseName, drawFitted, formatBytes } from "@/lib/file";

export const PRESETS = {
  youtube: [
    { id: "yt-thumb", group: "YouTube", name: "Thumbnail", w: 1280, h: 720 },
    { id: "yt-banner", group: "YouTube", name: "Channel banner", w: 2560, h: 1440 },
    { id: "yt-profile", group: "YouTube", name: "Profile picture", w: 800, h: 800 },
    { id: "yt-short", group: "YouTube", name: "Shorts cover", w: 1080, h: 1920 },
  ],
  social: [
    { id: "ig-post", group: "Instagram", name: "Square post", w: 1080, h: 1080 },
    { id: "ig-portrait", group: "Instagram", name: "Portrait post", w: 1080, h: 1350 },
    { id: "ig-story", group: "Instagram", name: "Story / Reel", w: 1080, h: 1920 },
    { id: "fb-post", group: "Facebook", name: "Shared image", w: 1200, h: 630 },
    { id: "fb-cover", group: "Facebook", name: "Page cover", w: 851, h: 315 },
    { id: "x-post", group: "X / Twitter", name: "Post image", w: 1600, h: 900 },
    { id: "x-header", group: "X / Twitter", name: "Header", w: 1500, h: 500 },
    { id: "li-post", group: "LinkedIn", name: "Post image", w: 1200, h: 627 },
    { id: "li-banner", group: "LinkedIn", name: "Profile banner", w: 1584, h: 396 },
    { id: "pin", group: "Pinterest", name: "Standard pin", w: 1000, h: 1500 },
    { id: "wa-dp", group: "WhatsApp", name: "Profile photo", w: 500, h: 500 },
    { id: "og", group: "Web", name: "Open Graph", w: 1200, h: 630 },
  ],
};

export default function CanvasResizer({ set = "social" }) {
  const presets = PRESETS[set];
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);
  const [pid, setPid] = useState(presets[0].id);
  const [custom, setCustom] = useState({ w: 1200, h: 800 });
  const [fit, setFit] = useState("cover");
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ ox: 0.5, oy: 0.5 });
  const [bgMode, setBgMode] = useState("blur");
  const [bg, setBg] = useState("#111111");
  const [format, setFormat] = useState("image/jpeg");
  const [guides, setGuides] = useState(true);
  const [size, setSize] = useState(null);
  const ref = useRef(null);

  const preset = pid === "custom" ? { id: "custom", name: "Custom", w: +custom.w || 1, h: +custom.h || 1 } : presets.find((p) => p.id === pid);
  const W = Math.min(8000, preset.w), H = Math.min(8000, preset.h);

  const open = async ([f]) => { setFile(f); setImg(await loadImage(f)); setPos({ ox: 0.5, oy: 0.5 }); setZoom(1); };

  useEffect(() => {
    if (!img) return;
    const c = ref.current;
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingQuality = "high";
    drawFitted(ctx, img, W, H, { fit, zoom, ...pos, bg: bgMode === "color" ? bg : format === "image/png" && bgMode === "none" ? "transparent" : bg, blurBg: bgMode === "blur" });
  }, [img, W, H, fit, zoom, pos, bgMode, bg, format]);

  // Drag the image to reframe it
  const onDown = (e) => {
    const c = ref.current;
    const ratio = W / c.clientWidth;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const base = fit === "cover" ? Math.max(W / iw, H / ih) : Math.min(W / iw, H / ih);
    const dw = iw * base * zoom, dh = ih * base * zoom;
    const sx = e.clientX, sy = e.clientY, p0 = pos;
    c.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const dx = (ev.clientX - sx) * ratio, dy = (ev.clientY - sy) * ratio;
      setPos({
        ox: W - dw !== 0 ? Math.min(1, Math.max(0, p0.ox + dx / (W - dw))) : p0.ox,
        oy: H - dh !== 0 ? Math.min(1, Math.max(0, p0.oy + dy / (H - dh))) : p0.oy,
      });
    };
    const up = () => { c.removeEventListener("pointermove", move); c.removeEventListener("pointerup", up); };
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
  };

  const download = async () => {
    let q = 0.92, blob = await canvasToBlob(ref.current, format, q);
    // YouTube rejects thumbnails over 2 MB — step quality down until it fits
    if (set === "youtube" && pid === "yt-thumb") {
      if (format === "image/png" && blob.size > 2e6) blob = await canvasToBlob(ref.current, "image/jpeg", (q = 0.9));
      while (blob.size > 2e6 && q > 0.4) blob = await canvasToBlob(ref.current, "image/jpeg", (q -= 0.08));
    }
    setSize(blob.size);
    const ext = blob.type === "image/png" ? "png" : "jpg";
    downloadBlob(blob, `${baseName(file.name)}-${preset.name.toLowerCase().replace(/\W+/g, "-")}-${W}x${H}.${ext}`);
  };

  if (!img) return <Dropzone onFiles={open} title={set === "youtube" ? "Drop an image for your YouTube thumbnail" : "Drop an image to resize for social media"} />;

  const groups = [...new Set(presets.map((p) => p.group))];
  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="preview-box" style={{ padding: 16 }}>
          <div style={{ position: "relative", lineHeight: 0, maxWidth: "100%" }}>
            <canvas ref={ref} onPointerDown={onDown} style={{ maxHeight: 520, width: "auto", maxWidth: "100%", cursor: "grab", touchAction: "none", boxShadow: "var(--shadow)", borderRadius: preset.id === "yt-profile" || preset.id === "wa-dp" ? "50%" : 6 }} />
            {guides && pid === "yt-thumb" && (
              <span style={{ position: "absolute", right: "2%", bottom: "4%", background: "rgba(0,0,0,.8)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 6px", borderRadius: 4, lineHeight: 1.2, pointerEvents: "none" }}>12:34</span>
            )}
            {guides && pid === "yt-banner" && (
              <span style={{ position: "absolute", left: "50%", top: "50%", width: `${(1546 / 2560) * 100}%`, height: `${(423 / 1440) * 100}%`, transform: "translate(-50%,-50%)", border: "2px dashed rgba(255,255,255,.9)", pointerEvents: "none" }} />
            )}
          </div>
        </div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <small className="muted"><Move size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Drag the image to reframe · Output {W}×{H}px</small>
          <button className="btn btn-sm" onClick={() => setImg(null)}><RefreshCw size={15} /> New image</button>
        </div>
        {size && <Msg type={size <= 2e6 || set !== "youtube" ? "ok" : "bad"}>Last export: {formatBytes(size)}{set === "youtube" && pid === "yt-thumb" ? (size <= 2e6 ? " — within YouTube’s 2 MB limit." : " — over 2 MB.") : ""}</Msg>}
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Size preset</div>
          {groups.map((g) => (
            <div key={g} className="field">
              <span className="label" style={{ fontSize: ".75rem", color: "var(--muted)" }}>{g}</span>
              <div className="seg">
                {presets.filter((p) => p.group === g).map((p) => (
                  <button key={p.id} className={pid === p.id ? "on" : ""} onClick={() => setPid(p.id)} title={`${p.w}×${p.h}`}>{p.name}</button>
                ))}
              </div>
            </div>
          ))}
          <button className={`btn btn-sm ${pid === "custom" ? "btn-dark" : ""}`} onClick={() => setPid("custom")}>Custom size</button>
          {pid === "custom" && (
            <div className="grid-2">
              <Field label="Width"><NumInput value={custom.w} onChange={(v) => setCustom({ ...custom, w: v })} suffix="px" /></Field>
              <Field label="Height"><NumInput value={custom.h} onChange={(v) => setCustom({ ...custom, h: v })} suffix="px" /></Field>
            </div>
          )}
        </div>
        <div className="panel stack">
          <div className="panel-title">Framing</div>
          <Seg options={[{ label: "Fill (crop)", value: "cover" }, { label: "Fit (no crop)", value: "contain" }]} value={fit} onChange={(v) => { setFit(v); setPos({ ox: 0.5, oy: 0.5 }); }} />
          <Range label="Zoom" value={zoom} min={1} max={3} step={0.01} onChange={setZoom} format={(v) => `${Math.round(v * 100)}%`} />
          {fit === "contain" && (
            <Field label="Background">
              <Seg options={[{ label: "Blurred", value: "blur" }, { label: "Colour", value: "color" }, ...(format === "image/png" ? [{ label: "None", value: "none" }] : [])]} value={bgMode} onChange={setBgMode} />
              {bgMode === "color" && <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />}
            </Field>
          )}
          {set === "youtube" && <Toggle label="Show safe-area guides" checked={guides} onChange={setGuides} />}
        </div>
        <div className="panel stack">
          <Seg options={[{ label: "JPG", value: "image/jpeg" }, { label: "PNG", value: "image/png" }]} value={format} onChange={setFormat} />
        </div>
        <button className="btn btn-primary btn-lg" onClick={download}><Download size={18} /> Download {W}×{H}</button>
      </div>
    </div>
  );
}
