"use client";
import { useState } from "react";
import { Lock, ArrowLeftRight } from "lucide-react";
import { Field, NumInput, Stat, Dropzone, Msg } from "@/components/ui";
import { formatBytes } from "@/lib/file";

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const PRESETS = [
  ["16:9", "YouTube, TV, monitors"], ["9:16", "Reels, Shorts, TikTok, Stories"], ["4:3", "Classic TV, iPad"], ["1:1", "Instagram square"],
  ["4:5", "Instagram portrait"], ["21:9", "Ultrawide cinema"], ["2.39:1", "Anamorphic film"], ["3:2", "DSLR photos"],
];
const RES = {
  "16:9": [[7680, 4320, "8K"], [3840, 2160, "4K UHD"], [2560, 1440, "1440p QHD"], [1920, 1080, "1080p Full HD"], [1280, 720, "720p HD"], [854, 480, "480p"], [640, 360, "360p"]],
  "9:16": [[2160, 3840, "4K vertical"], [1080, 1920, "1080p vertical"], [720, 1280, "720p vertical"]],
  "4:3": [[2048, 1536, "QXGA"], [1600, 1200, "UXGA"], [1024, 768, "XGA"], [640, 480, "VGA"]],
  "1:1": [[2160, 2160, "4K square"], [1080, 1080, "Instagram"], [720, 720, "720 square"]],
  "4:5": [[1080, 1350, "Instagram portrait"], [864, 1080, "Portrait 1080"]],
  "21:9": [[5120, 2160, "5K ultrawide"], [3440, 1440, "UWQHD"], [2560, 1080, "UW-FHD"]],
};
const parseRatio = (r) => { const [a, b] = r.split(":").map(Number); return a / b; };

function simplify(w, h) {
  if (!w || !h) return null;
  const g = gcd(Math.round(w), Math.round(h));
  let a = Math.round(w) / g, b = Math.round(h) / g;
  const dec = w / h;
  // map near-miss resolutions (e.g. 1366×768) to their familiar ratio
  const known = PRESETS.find(([r]) => Math.abs(parseRatio(r) - dec) < 0.01);
  return { exact: `${a}:${b}`, known: known?.[0], dec: dec.toFixed(4) };
}

export default function AspectRatio() {
  const [w, setW] = useState("1920");
  const [h, setH] = useState("1080");
  const [ratio, setRatio] = useState("16:9");
  const [newW, setNewW] = useState("1280");
  const [newH, setNewH] = useState("");
  const [video, setVideo] = useState(null);

  const r = simplify(+w, +h);
  const k = parseRatio(ratio);
  const calcH = newW ? Math.round(+newW / k) : null;
  const calcW = newH ? Math.round(+newH * k) : null;

  const readVideo = ([f]) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      setVideo({ name: f.name, size: f.size, w: v.videoWidth, h: v.videoHeight, dur: v.duration, url: v.src });
      setW(String(v.videoWidth)); setH(String(v.videoHeight));
    };
    v.onerror = () => setVideo({ error: "This browser can’t read that video format. Try MP4 or WebM." });
    v.src = URL.createObjectURL(f);
  };

  const box = (() => {
    const max = 260, rr = +w && +h ? +w / +h : 16 / 9;
    return rr >= 1 ? { width: max, height: max / rr } : { width: max * rr, height: max };
  })();

  return (
    <div className="stack">
      <div className="tool-cols">
        <div className="stack">
          <div className="panel stack">
            <div className="panel-title">Find the aspect ratio</div>
            <div className="row" style={{ flexWrap: "nowrap", alignItems: "flex-end" }}>
              <Field label="Width"><NumInput value={w} onChange={setW} suffix="px" /></Field>
              <button className="btn btn-icon" onClick={() => { setW(h); setH(w); }} aria-label="Swap" style={{ flex: "none" }}><ArrowLeftRight size={16} /></button>
              <Field label="Height"><NumInput value={h} onChange={setH} suffix="px" /></Field>
            </div>
            {r && (
              <div className="stats">
                <Stat hl label="Aspect ratio" value={r.known || r.exact} sub={r.known && r.known !== r.exact ? `exact ${r.exact}` : "simplified"} />
                <Stat label="Decimal" value={r.dec} />
                <Stat label="Orientation" value={+w > +h ? "Landscape" : +w < +h ? "Portrait" : "Square"} />
                <Stat label="Megapixels" value={((+w * +h) / 1e6).toFixed(2)} />
              </div>
            )}
          </div>
          <div className="panel stack">
            <div className="panel-title">Resize keeping the ratio</div>
            <div className="seg">
              {PRESETS.map(([p, use]) => <button key={p} className={ratio === p ? "on" : ""} onClick={() => setRatio(p)} title={use}>{p}</button>)}
            </div>
            <small className="muted"><Lock size={12} style={{ display: "inline", verticalAlign: "-1px" }} /> {ratio} — {PRESETS.find(([p]) => p === ratio)?.[1]}</small>
            <div className="grid-2">
              <Field label="New width"><NumInput value={newW} onChange={(v) => { setNewW(v); setNewH(""); }} suffix="px" /></Field>
              <Field label="New height"><NumInput value={newH} onChange={(v) => { setNewH(v); setNewW(""); }} suffix="px" /></Field>
            </div>
            {(calcH || calcW) && (
              <div className="big-result" style={{ padding: 18 }}>
                <span>Result</span>
                <strong style={{ fontSize: "1.8rem" }}>{newW ? `${newW} × ${calcH}` : `${calcW} × ${newH}`} px</strong>
                {((newW ? calcH : calcW) % 2 === 1) && <small>Tip: most video encoders need even numbers — use {newW ? calcH + 1 : calcW + 1}.</small>}
              </div>
            )}
          </div>
        </div>
        <div className="side">
          <div className="panel" style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
            <div style={{ ...box, background: "var(--grad)", borderRadius: 10, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, transition: "all .35s cubic-bezier(.2,.8,.2,1)", boxShadow: "var(--shadow-lg)" }}>
              {r ? r.known || r.exact : "—"}
            </div>
          </div>
          <div className="panel stack">
            <div className="panel-title">Read from a video file</div>
            <Dropzone compact accept="video/*" onFiles={readVideo} title="Choose a video" hint="Only the metadata is read — nothing is uploaded" />
            {video?.error && <Msg type="bad">{video.error}</Msg>}
            {video && !video.error && (
              <small className="muted"><b style={{ color: "var(--text)" }}>{video.name}</b><br />{video.w}×{video.h}px · {Math.floor(video.dur / 60)}:{String(Math.round(video.dur % 60)).padStart(2, "0")} min · {formatBytes(video.size)}</small>
            )}
          </div>
        </div>
      </div>
      {RES[ratio] && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Common {ratio} resolutions</th><th>Width</th><th>Height</th><th></th></tr></thead>
            <tbody>
              {RES[ratio].map(([a, b, n]) => (
                <tr key={n}><td>{n}</td><td>{a}</td><td>{b}</td><td><button className="btn btn-sm btn-ghost" onClick={() => { setW(String(a)); setH(String(b)); }}>Use</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
