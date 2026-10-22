"use client";
import { useMemo, useRef, useState } from "react";
import { Plus, X, Shuffle, RotateCw, Pipette } from "lucide-react";
import { Field, Seg, Range, CopyBtn } from "@/components/ui";
import { hexToRgb, rgbToHex, hexToHsl, hslToHex, luminance } from "@/lib/color";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function hsvToHex(h, s, v) {
  s /= 100; v /= 100;
  const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return rgbToHex(f(5) * 255, f(3) * 255, f(1) * 255);
}
function hexToHsv(hex) {
  const [r, g, b] = hexToRgb(hex).map((x) => x / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [Math.round((h * 60 + 360) % 360), Math.round(max ? (d / max) * 100 : 0), Math.round(max * 100)];
}
function cmyk(hex) {
  const [r, g, b] = hexToRgb(hex).map((x) => x / 255);
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map((x) => Math.round(x * 100));
}
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

/* ---------------- Picker ---------------- */
function Picker() {
  const [hsv, setHsv] = useState([258, 72, 96]);
  const hex = hsvToHex(...hsv);
  const svRef = useRef(null);
  const [draft, setDraft] = useState(null);

  const drag = (e, el, fn) => {
    const move = (ev) => { const r = el.getBoundingClientRect(); fn(clamp((ev.clientX - r.left) / r.width, 0, 1), clamp((ev.clientY - r.top) / r.height, 0, 1)); };
    move(e);
    el.setPointerCapture(e.pointerId);
    el.onpointermove = (ev) => ev.buttons && move(ev);
  };
  const setHex = (h) => { if (/^#?[0-9a-f]{6}$/i.test(h)) setHsv(hexToHsv(h.startsWith("#") ? h : "#" + h)); };

  const [r, g, b] = hexToRgb(hex);
  const [hh, ss, ll] = hexToHsl(hex);
  const [c, m, y, k] = cmyk(hex);
  const formats = [
    ["HEX", hex.toUpperCase()],
    ["RGB", `rgb(${r}, ${g}, ${b})`],
    ["HSL", `hsl(${hh}, ${ss}%, ${ll}%)`],
    ["HSV", `hsv(${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%)`],
    ["CMYK", `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`],
    ["CSS var", `--brand-color: ${hex};`],
  ];
  const shades = [95, 85, 70, 55, 45, 35, 25, 15].map((L) => hslToHex(hh, ss, L));
  const eyedrop = async () => { try { const r2 = await new window.EyeDropper().open(); setHex(r2.sRGBHex); } catch {} };

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div
          ref={svRef}
          onPointerDown={(e) => drag(e, svRef.current, (x, y2) => setHsv(([h]) => [h, Math.round(x * 100), Math.round((1 - y2) * 100)]))}
          style={{ position: "relative", height: 300, borderRadius: 18, cursor: "crosshair", touchAction: "none", background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv[0]}, 100%, 50%))` }}
        >
          <span style={{ position: "absolute", left: `${hsv[1]}%`, top: `${100 - hsv[2]}%`, width: 22, height: 22, borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 0 0 1px rgba(0,0,0,.3), 0 2px 8px rgba(0,0,0,.4)", transform: "translate(-50%,-50%)", background: hex, pointerEvents: "none" }} />
        </div>
        <div
          onPointerDown={(e) => drag(e, e.currentTarget, (x) => setHsv(([, s, v]) => [Math.round(x * 360), s, v]))}
          style={{ position: "relative", height: 18, borderRadius: 99, cursor: "pointer", touchAction: "none", background: "linear-gradient(90deg,red,#ff0,lime,cyan,blue,#f0f,red)" }}
        >
          <span style={{ position: "absolute", top: "50%", left: `${(hsv[0] / 360) * 100}%`, width: 22, height: 22, borderRadius: "50%", border: "3px solid #fff", boxShadow: "0 1px 6px rgba(0,0,0,.4)", transform: "translate(-50%,-50%)", background: `hsl(${hsv[0]},100%,50%)`, pointerEvents: "none" }} />
        </div>
        <div className="panel">
          <div className="panel-title">Tints & shades</div>
          <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", height: 54 }}>
            {shades.map((s2) => <button key={s2} title={s2} onClick={() => setHex(s2)} style={{ flex: 1, border: 0, background: s2, cursor: "pointer" }} />)}
          </div>
        </div>
      </div>
      <div className="side">
        <div style={{ height: 120, borderRadius: 18, background: hex, boxShadow: "var(--shadow)", display: "grid", placeItems: "center", color: luminance(hex) > 0.42 ? "#111" : "#fff", fontWeight: 800, fontSize: "1.4rem", fontFamily: "var(--mono)" }}>{hex.toUpperCase()}</div>
        <div className="panel stack">
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} />
            <input className="input" style={{ fontFamily: "var(--mono)" }} value={draft ?? hex.toUpperCase()} onChange={(e) => { setDraft(e.target.value); setHex(e.target.value.trim()); }} onBlur={() => setDraft(null)} aria-label="HEX value" />
            {typeof window !== "undefined" && "EyeDropper" in window && <button className="btn btn-icon" onClick={eyedrop} title="Pick a colour from your screen"><Pipette size={17} /></button>}
          </div>
          <div className="grid-3">
            {["R", "G", "B"].map((n, i) => (
              <Field key={n} label={n}>
                <input className="input" type="number" min={0} max={255} value={[r, g, b][i]} onChange={(e) => { const v = [r, g, b]; v[i] = clamp(+e.target.value || 0, 0, 255); setHex(rgbToHex(...v)); }} />
              </Field>
            ))}
          </div>
          {formats.map(([n, v]) => (
            <div key={n} className="row" style={{ flexWrap: "nowrap", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <small style={{ fontWeight: 800, color: "var(--muted)", width: 56 }}>{n}</small>
              <code style={{ flex: 1, fontSize: ".85rem" }}>{v}</code>
              <CopyBtn text={v} className="btn btn-sm btn-ghost" label="" />
            </div>
          ))}
        </div>
        <div className="panel stack">
          <div className="panel-title">Contrast (WCAG)</div>
          {["#ffffff", "#000000"].map((bg) => {
            const ratio = contrast(hex, bg);
            return (
              <div key={bg} className="row" style={{ flexWrap: "nowrap", gap: 10 }}>
                <span style={{ padding: "6px 12px", borderRadius: 8, background: bg, color: hex, fontWeight: 800, border: "1px solid var(--border)" }}>Aa</span>
                <span style={{ flex: 1, fontSize: ".88rem" }}>on {bg === "#ffffff" ? "white" : "black"}: <b>{ratio.toFixed(2)}:1</b></span>
                <small style={{ fontWeight: 700, color: ratio >= 4.5 ? "var(--ok)" : ratio >= 3 ? "var(--warn)" : "var(--bad)" }}>{ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large" : "Fail"}</small>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Gradient ---------------- */
const PRESETS = [
  [["#4f6bff", 0], ["#a24bff", 50], ["#ff4d8d", 100]],
  [["#ff7a18", 0], ["#ff3d77", 100]],
  [["#00c896", 0], ["#00a3ff", 100]],
  [["#fbc2eb", 0], ["#a6c1ee", 100]],
  [["#0f2027", 0], ["#203a43", 50], ["#2c5364", 100]],
  [["#f6d365", 0], ["#fda085", 100]],
  [["#43e97b", 0], ["#38f9d7", 100]],
  [["#fa709a", 0], ["#fee140", 100]],
];
let uid = 0;
const mk = (list) => list.map(([color, pos]) => ({ id: ++uid, color, pos }));

function Gradient() {
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState(120);
  const [shape, setShape] = useState("circle");
  const [stops, setStops] = useState(() => mk(PRESETS[0]));
  const [sel, setSel] = useState(null);
  const barRef = useRef(null);

  const sorted = [...stops].sort((a, b) => a.pos - b.pos);
  const list = sorted.map((s) => `${s.color} ${s.pos}%`).join(", ");
  const value = type === "linear" ? `linear-gradient(${angle}deg, ${list})` : type === "radial" ? `radial-gradient(${shape} at center, ${list})` : `conic-gradient(from ${angle}deg at center, ${list})`;
  const css = `background: ${sorted[0].color};\nbackground: ${value};`;
  const textCss = `background: ${value};\n-webkit-background-clip: text;\nbackground-clip: text;\ncolor: transparent;`;
  const current = stops.find((s) => s.id === sel) || sorted[0];

  const update = (id, patch) => setStops((S) => S.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const addAt = (pos) => {
    const s = { id: ++uid, color: hslToHex(Math.random() * 360, 75, 60), pos: Math.round(pos) };
    setStops((S) => [...S, s]);
    setSel(s.id);
  };
  const onBar = (e) => {
    if (e.target !== barRef.current) return;
    const r = barRef.current.getBoundingClientRect();
    addAt(((e.clientX - r.left) / r.width) * 100);
  };
  const dragStop = (e, id) => {
    e.stopPropagation();
    setSel(id);
    const el = barRef.current;
    const move = (ev) => { const r = el.getBoundingClientRect(); update(id, { pos: Math.round(clamp((ev.clientX - r.left) / r.width, 0, 1) * 100) }); };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const random = () => {
    const h = Math.random() * 360;
    setStops(mk([[hslToHex(h, 80, 60), 0], [hslToHex(h + 40 + Math.random() * 80, 80, 58), 100]]));
    setAngle(Math.round(Math.random() * 360));
  };

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div style={{ height: 300, borderRadius: 22, background: value, boxShadow: "var(--shadow-lg)", transition: "background .2s" }} />
        <div className="panel stack">
          <div className="panel-title">Colour stops — click the bar to add, drag to move</div>
          <div ref={barRef} onPointerDown={onBar} style={{ position: "relative", height: 34, borderRadius: 10, background: `linear-gradient(90deg, ${list})`, cursor: "copy", touchAction: "none", margin: "4px 10px 14px" }}>
            {stops.map((s) => (
              <span key={s.id} onPointerDown={(e) => dragStop(e, s.id)}
                style={{ position: "absolute", left: `${s.pos}%`, top: "50%", width: 22, height: 44, transform: "translate(-50%,-50%)", borderRadius: 8, background: s.color, cursor: "grab", border: "3px solid #fff", boxShadow: current.id === s.id ? "0 0 0 3px var(--brand), 0 3px 10px rgba(0,0,0,.35)" : "0 2px 8px rgba(0,0,0,.35)" }} />
            ))}
          </div>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input type="color" value={current.color} onChange={(e) => update(current.id, { color: e.target.value })} />
            <input className="input" style={{ fontFamily: "var(--mono)" }} value={current.color} onChange={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value) && update(current.id, { color: e.target.value })} />
            <div style={{ width: 110, flex: "none" }}><input className="input" type="number" min={0} max={100} value={current.pos} onChange={(e) => update(current.id, { pos: clamp(+e.target.value || 0, 0, 100) })} /></div>
            <button className="btn btn-icon" disabled={stops.length <= 2} onClick={() => { setStops((S) => S.filter((s) => s.id !== current.id)); setSel(null); }} aria-label="Remove stop"><X size={16} /></button>
          </div>
          <button className="btn btn-sm" onClick={() => addAt(50)}><Plus size={15} /> Add colour stop</button>
        </div>
        <div className="panel">
          <div className="panel-title">Presets</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 10 }}>
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => setStops(mk(p))} aria-label={`Preset ${i + 1}`}
                style={{ height: 54, borderRadius: 12, border: "1px solid var(--border)", cursor: "pointer", background: `linear-gradient(120deg, ${p.map(([c, s]) => `${c} ${s}%`).join(", ")})` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Seg options={[{ label: "Linear", value: "linear" }, { label: "Radial", value: "radial" }, { label: "Conic", value: "conic" }]} value={type} onChange={setType} />
          {type !== "radial" ? (
            <>
              <Range label="Angle" value={angle} min={0} max={360} onChange={setAngle} format={(v) => `${v}°`} />
              <div className="seg">{[0, 45, 90, 135, 180, 270].map((a) => <button key={a} className={angle === a ? "on" : ""} onClick={() => setAngle(a)}>{a}°</button>)}</div>
            </>
          ) : (
            <Field label="Shape"><Seg options={[{ label: "Circle", value: "circle" }, { label: "Ellipse", value: "ellipse" }]} value={shape} onChange={setShape} /></Field>
          )}
          <div className="grid-2">
            <button className="btn btn-sm" onClick={random}><Shuffle size={15} /> Random</button>
            <button className="btn btn-sm" onClick={() => setStops((S) => S.map((s) => ({ ...s, pos: 100 - s.pos })))}><RotateCw size={15} /> Reverse</button>
          </div>
        </div>
        <div className="field">
          <span className="label">CSS <CopyBtn text={css} label="Copy CSS" /></span>
          <pre className="code-out">{css}</pre>
        </div>
        <div className="field">
          <span className="label">Gradient text <CopyBtn text={textCss} /></span>
          <div style={{ fontSize: "2rem", fontWeight: 800, background: value, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Toolsivo</div>
          <pre className="code-out" style={{ fontSize: ".8rem" }}>{textCss}</pre>
        </div>
      </div>
    </div>
  );
}

export default function ColorGradient() {
  const [tab, setTab] = useState("picker");
  return (
    <div className="stack">
      <div style={{ maxWidth: 420 }}>
        <Seg options={[{ label: "Color picker & converter", value: "picker" }, { label: "Gradient generator", value: "gradient" }]} value={tab} onChange={setTab} />
      </div>
      {tab === "picker" ? <Picker /> : <Gradient />}
    </div>
  );
}
