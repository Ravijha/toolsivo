"use client";
import { useCallback, useEffect, useState } from "react";
import { Lock, Unlock, Copy, RefreshCw, Download, ImageIcon, Undo2 } from "lucide-react";
import { Seg, CopyBtn, Dropzone } from "@/components/ui";
import { harmony, textOn, hexToRgb, hexToHsl, extractPalette } from "@/lib/color";
import { copyText, downloadBlob, loadImage, makeCanvas, canvasToBlob } from "@/lib/file";

const modes = [
  { label: "Random", value: "random" }, { label: "Analogous", value: "analogous" }, { label: "Complementary", value: "complementary" },
  { label: "Triadic", value: "triadic" }, { label: "Monochrome", value: "monochrome" }, { label: "Pastel", value: "pastel" },
];

export default function Palette() {
  const [mode, setMode] = useState("random");
  const [colors, setColors] = useState(["#4f6bff", "#a24bff", "#ff4d8d", "#ffb547", "#0f1024"]);
  const [locked, setLocked] = useState([false, false, false, false, false]);
  const [history, setHistory] = useState([]);
  const [photo, setPhoto] = useState(null);

  const generate = useCallback(() => {
    setHistory((h) => [colors, ...h].slice(0, 12));
    const fresh = harmony(mode, 5);
    setColors((c) => c.map((x, i) => (locked[i] ? x : fresh[i])));
  }, [mode, locked, colors]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement?.tagName)) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generate]);

  const fromPhoto = async ([f]) => {
    const img = await loadImage(f);
    setPhoto(img.src);
    const p = extractPalette(img, 5);
    if (p.length) { setHistory((h) => [colors, ...h].slice(0, 12)); setColors(p); setLocked([false, false, false, false, false]); }
  };

  const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`;
  const exportPng = async () => {
    const c = makeCanvas(1500, 600);
    const ctx = c.getContext("2d");
    colors.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(i * 300, 0, 300, 600);
      ctx.fillStyle = textOn(col);
      ctx.font = "bold 34px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(col.toUpperCase(), i * 300 + 150, 540);
    });
    downloadBlob(await canvasToBlob(c, "image/png"), "toolora-palette.png");
  };

  return (
    <div className="stack">
      <div className="toolbar">
        <Seg options={modes} value={mode} onChange={setMode} />
        <div className="actions">
          <button className="btn btn-sm" onClick={() => { if (history[0]) { setColors(history[0]); setHistory((h) => h.slice(1)); } }} disabled={!history.length}><Undo2 size={15} /> Undo</button>
          <button className="btn btn-primary" onClick={generate}><RefreshCw size={16} /> Generate</button>
        </div>
      </div>
      <div className="swatches">
        {colors.map((c, i) => {
          const fg = textOn(c);
          const [r, g, b] = hexToRgb(c);
          const [h, s, l] = hexToHsl(c);
          return (
            <div key={i} className="swatch" style={{ background: c, color: fg }}>
              <div className={`sw-tools ${locked[i] ? "show" : ""}`}>
                <button onClick={() => setLocked((L) => L.map((x, j) => (j === i ? !x : x)))} aria-label={locked[i] ? "Unlock" : "Lock"}>{locked[i] ? <Lock size={16} /> : <Unlock size={16} />}</button>
                <button onClick={() => copyText(c.toUpperCase(), `Copied ${c.toUpperCase()}`)} aria-label="Copy"><Copy size={16} /></button>
                <label style={{ position: "relative" }}>
                  <button tabIndex={-1} aria-label="Edit colour" style={{ pointerEvents: "none" }}>✎</button>
                  <input type="color" value={c} onChange={(e) => setColors((C) => C.map((x, j) => (j === i ? e.target.value : x)))} style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
                </label>
              </div>
              <span className="hex" onClick={() => copyText(c.toUpperCase(), `Copied ${c.toUpperCase()}`)}>{c.toUpperCase().slice(1)}</span>
              <span className="nm">rgb({r}, {g}, {b})<br />hsl({h}, {s}%, {l}%)</span>
            </div>
          );
        })}
      </div>
      <small className="muted" style={{ textAlign: "center" }}>Press <span className="kbd">Space</span> to generate · click a hex code to copy · lock colours you love</small>
      <div className="grid-2">
        <div className="panel stack">
          <div className="panel-title">Export</div>
          <pre className="code-out" style={{ maxHeight: 180 }}>{css}</pre>
          <div className="actions">
            <CopyBtn text={css} label="Copy CSS" />
            <CopyBtn text={JSON.stringify(colors)} label="Copy array" />
            <button className="btn btn-sm" onClick={exportPng}><Download size={15} /> PNG</button>
          </div>
        </div>
        <div className="panel stack">
          <div className="panel-title"><ImageIcon size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Extract from a photo</div>
          <Dropzone compact onFiles={fromPhoto} title="Drop a photo" hint="We’ll pull its 5 dominant colours" />
          {photo && <img src={photo} alt="" style={{ maxHeight: 140, borderRadius: 12, objectFit: "cover" }} />}
        </div>
      </div>
      {history.length > 0 && (
        <div className="panel">
          <div className="panel-title">Recent palettes</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
            {history.map((p, i) => (
              <button key={i} onClick={() => setColors(p)} style={{ display: "flex", height: 40, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", padding: 0, cursor: "pointer" }}>
                {p.map((c, j) => <span key={j} style={{ flex: 1, background: c }} />)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
