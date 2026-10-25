"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import { setMuted, isMuted } from "@/lib/sfx";

/** Arcade-style frame: HUD stats, controls, a dark stage and optional overlay. */
export default function GameShell({ stats = [], onRestart, children, toolbar, overlay, stageStyle, wide = false }) {
  const box = useRef(null);
  const [full, setFull] = useState(false);
  const [mute, setMute] = useState(isMuted());

  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const toggleFull = () => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen?.().catch(() => {}));
  const toggleMute = () => { setMuted(!mute); setMute(!mute); };

  return (
    <div ref={box} className={`game-shell ${full ? "is-full" : ""}`}>
      <div className="game-hud">
        <div className="game-stats">
          {stats.map(([label, value, accent]) => (
            <div key={label} className={`game-stat ${accent ? "accent" : ""}`}><span>{label}</span><b>{value}</b></div>
          ))}
        </div>
        <div className="game-actions">
          {toolbar}
          {onRestart && <button className="game-btn" onClick={onRestart} title="Restart"><RotateCcw size={17} /></button>}
          <button className="game-btn" onClick={toggleMute} title={mute ? "Sound on" : "Mute"}>{mute ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
          <button className="game-btn" onClick={toggleFull} title="Full screen">{full ? <Minimize size={17} /> : <Maximize size={17} />}</button>
        </div>
      </div>
      <div className={`game-stage ${wide ? "wide" : ""}`} style={stageStyle}>
        {children}
        {overlay}
      </div>
    </div>
  );
}

export function Overlay({ title, children, actions, tone = "" }) {
  return (
    <div className={`game-overlay ${tone}`}>
      <div className="game-overlay-card">
        {title && <h3>{title}</h3>}
        {children}
        {actions && <div className="row" style={{ justifyContent: "center", marginTop: 16, gap: 10 }}>{actions}</div>}
      </div>
    </div>
  );
}

export function Pill({ options, value, onChange }) {
  return (
    <div className="game-pill">
      {options.map((o) => {
        const v = typeof o === "object" ? o.value : o, l = typeof o === "object" ? o.label : o;
        return <button key={String(v)} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>;
      })}
    </div>
  );
}

/** Hi-DPI canvas sized to its CSS box; returns [ref, size]. */
export function useCanvas(aspect = 4 / 3, max = 900) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 640, h: 480, dpr: 1 });
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const fit = () => {
      const parent = c.parentElement;
      const w = Math.min(max, parent.clientWidth);
      const h = Math.round(w / aspect);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      c.style.width = `${w}px`; c.style.height = `${h}px`;
      setSize({ w, h, dpr });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c.parentElement);
    return () => ro.disconnect();
  }, [aspect, max]);
  return [ref, size];
}

/** Swipe detection on an element → callback("up"|"down"|"left"|"right"). */
export function useSwipe(ref, cb) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let sx = 0, sy = 0;
    const start = (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; };
    const end = (e) => {
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      cb(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    };
    const block = (e) => e.preventDefault();
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", end);
    el.addEventListener("touchmove", block, { passive: false });
    return () => { el.removeEventListener("touchstart", start); el.removeEventListener("touchend", end); el.removeEventListener("touchmove", block); };
  });
}

export const KEYDIR = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right" };
