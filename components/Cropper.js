"use client";
import { useEffect, useRef, useState } from "react";

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

export function initCrop(w, h, aspect, fill = 0.8) {
  let cw = w * fill, ch = h * fill;
  if (aspect) {
    if (cw / ch > aspect) cw = ch * aspect;
    else ch = cw / aspect;
  }
  return { x: (w - cw) / 2, y: (h - ch) / 2, w: cw, h: ch };
}

/** Crop rectangle editor. `crop` is in natural image pixels. */
export default function Cropper({ src, natW, natH, aspect, crop, onChange, overlay, maxHeight = 540 }) {
  const imgRef = useRef(null);
  const [dispW, setDispW] = useState(0);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDispW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [src]);

  const s = dispW / natW || 1;

  const start = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX, sy = e.clientY, c0 = { ...crop };
    const min = Math.max(8, 28 / s);
    const move = (ev) => {
      const dx = (ev.clientX - sx) / s, dy = (ev.clientY - sy) / s;
      let { x, y, w, h } = c0;
      if (mode === "move") {
        x = clamp(x + dx, 0, natW - w);
        y = clamp(y + dy, 0, natH - h);
      } else {
        const left = mode.includes("w"), top = mode.includes("n");
        const ax = left ? c0.x + c0.w : c0.x;
        const ay = top ? c0.y + c0.h : c0.y;
        let px = clamp((left ? c0.x : c0.x + c0.w) + dx, 0, natW);
        let py = clamp((top ? c0.y : c0.y + c0.h) + dy, 0, natH);
        px = left ? Math.min(px, ax - min) : Math.max(px, ax + min);
        py = top ? Math.min(py, ay - min) : Math.max(py, ay + min);
        w = Math.abs(px - ax);
        h = Math.abs(py - ay);
        if (aspect) {
          if (w / h > aspect) w = h * aspect;
          else h = w / aspect;
          const maxW = left ? ax : natW - ax, maxH = top ? ay : natH - ay;
          if (w > maxW) { w = maxW; h = w / aspect; }
          if (h > maxH) { h = maxH; w = h * aspect; }
        }
        x = left ? ax - w : ax;
        y = top ? ay - h : ay;
      }
      onChange({ x, y, w, h });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div style={{ display: "grid", placeItems: "center", background: "var(--checker)", borderRadius: 18, padding: 16, overflow: "hidden" }}>
      <div className="canvas-wrap">
        <img ref={imgRef} src={src} alt="" draggable={false} style={{ maxHeight, width: "auto", maxWidth: "100%" }} />
        {dispW > 0 && (
          <div
            className="crop-box"
            style={{ left: crop.x * s, top: crop.y * s, width: crop.w * s, height: crop.h * s }}
            onPointerDown={(e) => start(e, "move")}
          >
            {overlay}
            <span className="crop-size">{Math.round(crop.w)} × {Math.round(crop.h)}</span>
            {["nw", "ne", "sw", "se"].map((m) => (
              <span key={m} className={`crop-h ${m}`} onPointerDown={(e) => start(e, m)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
