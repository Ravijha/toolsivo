"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Lightbulb, Shuffle } from "lucide-react";
import GameShell, { Overlay } from "@/components/GameShell";
import { seeded } from "@/lib/typingText";
import { sfx } from "@/lib/sfx";

const W = 480, H = 360, FIND = 5, MAX_MISS = 5;
const PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#8b5cf6", "#ec4899", "#14b8a6"];

// Build an original scene as a list of simple shapes from a seed.
function makeScene(seed) {
  const r = seeded(seed), pick = (a) => a[Math.floor(r() * a.length)], rnd = (a, b) => a + r() * (b - a);
  const items = [];
  items.push({ k: "sun", x: rnd(60, 420), y: rnd(40, 80), s: rnd(26, 36), c: "#fbbf24" });
  for (let i = 0; i < 3; i++) items.push({ k: "cloud", x: rnd(30, 450), y: rnd(30, 110), s: rnd(18, 28), c: "#ffffff" });
  for (let i = 0; i < 3; i++) items.push({ k: "house", x: 40 + i * 150 + rnd(-15, 15), y: 250, s: rnd(46, 60), c: pick(PALETTE), roof: pick(PALETTE), door: pick(PALETTE) });
  for (let i = 0; i < 4; i++) items.push({ k: "tree", x: rnd(20, 460), y: rnd(255, 290), s: rnd(22, 34), c: pick(["#16a34a", "#15803d", "#22c55e"]) });
  for (let i = 0; i < 6; i++) items.push({ k: "flower", x: rnd(15, 465), y: rnd(305, 350), s: rnd(6, 9), c: pick(PALETTE) });
  items.push({ k: "bird", x: rnd(150, 350), y: rnd(60, 150), s: 10, c: "#1f2937" });
  items.push({ k: "kite", x: rnd(60, 420), y: rnd(90, 170), s: 16, c: pick(PALETTE) });
  // pick 5 distinct items and change them
  const idx = [...items.keys()].sort(() => r() - 0.5).slice(0, FIND);
  const changed = items.map((it, i) => {
    if (!idx.includes(i)) return it;
    const t = Math.floor(r() * 3);
    if (t === 0) return { ...it, c: PALETTE.find((p) => p !== it.c && r() < 0.5) || (it.c === "#ef4444" ? "#0ea5e9" : "#ef4444"), roof: it.roof && PALETTE[(PALETTE.indexOf(it.roof) + 3) % PALETTE.length] };
    if (t === 1) return { ...it, hidden: true };
    return { ...it, s: it.s * 1.45 };
  });
  const diffs = idx.map((i) => ({ x: items[i].x, y: items[i].y - (items[i].k === "house" ? items[i].s * 0.4 : items[i].k === "tree" ? items[i].s : 0), r: Math.max(26, items[i].s * 1.1) }));
  return { items, changed, diffs };
}

function draw(ctx, items) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#7dd3fc"); sky.addColorStop(0.65, "#e0f2fe"); sky.addColorStop(0.66, "#86efac"); sky.addColorStop(1, "#4ade80");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  for (const it of items) {
    if (it.hidden) continue;
    const { x, y, s, c } = it;
    ctx.fillStyle = c; ctx.strokeStyle = c;
    if (it.k === "sun") { ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill(); }
    if (it.k === "cloud") { ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.arc(x + s, y + 4, s * 0.8, 0, 7); ctx.arc(x - s, y + 4, s * 0.75, 0, 7); ctx.fill(); }
    if (it.k === "house") {
      ctx.fillRect(x - s / 2, y - s * 0.8, s, s * 0.8);
      ctx.fillStyle = it.roof; ctx.beginPath(); ctx.moveTo(x - s * 0.65, y - s * 0.8); ctx.lineTo(x, y - s * 1.35); ctx.lineTo(x + s * 0.65, y - s * 0.8); ctx.fill();
      ctx.fillStyle = it.door; ctx.fillRect(x - s * 0.12, y - s * 0.38, s * 0.24, s * 0.38);
      ctx.fillStyle = "#fef9c3"; ctx.fillRect(x - s * 0.38, y - s * 0.62, s * 0.18, s * 0.16); ctx.fillRect(x + s * 0.2, y - s * 0.62, s * 0.18, s * 0.16);
    }
    if (it.k === "tree") { ctx.fillStyle = "#92400e"; ctx.fillRect(x - 3, y - s * 0.4, 6, s * 0.6); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y - s, s * 0.7, 0, 7); ctx.fill(); }
    if (it.k === "flower") { for (let a = 0; a < 5; a++) { ctx.beginPath(); ctx.arc(x + Math.cos(a * 1.26) * s, y + Math.sin(a * 1.26) * s, s * 0.7, 0, 7); ctx.fill(); } ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.arc(x, y, s * 0.6, 0, 7); ctx.fill(); }
    if (it.k === "bird") { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x - s / 2, y - s / 2, x, y); ctx.quadraticCurveTo(x + s / 2, y - s / 2, x + s, y); ctx.stroke(); }
    if (it.k === "kite") { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.7, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.7, y); ctx.fill(); ctx.strokeStyle = "#475569"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y + s); ctx.quadraticCurveTo(x + 20, y + 50, x - 10, y + 90); ctx.stroke(); }
  }
}

export default function SpotDifference() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const scene = useMemo(() => makeScene(seed), [seed]);
  const [found, setFound] = useState([]);
  const [misses, setMisses] = useState([]);
  const [hint, setHint] = useState(null);
  const [level, setLevel] = useState(1);
  const a = useRef(null), b = useRef(null);
  const won = found.length === FIND, lost = misses.length >= MAX_MISS && !won;

  useEffect(() => {
    for (const [ref, items] of [[a, scene.items], [b, scene.changed]]) {
      const c = ref.current, dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = W * dpr; c.height = H * dpr;
      const x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0); draw(x, items);
    }
  }, [scene]);
  useEffect(() => { if (won) sfx.win(); if (lost) sfx.lose(); }, [won, lost]);

  const next = () => { setSeed(Math.floor(Math.random() * 1e9)); setFound([]); setMisses([]); setHint(null); setLevel((l) => l + 1); };
  const click = (e) => {
    if (won || lost) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W, y = ((e.clientY - rect.top) / rect.height) * H;
    const i = scene.diffs.findIndex((d, k) => !found.includes(k) && Math.hypot(d.x - x, d.y - y) < d.r);
    if (i >= 0) { setFound((f) => [...f, i]); setHint(null); sfx.good(); }
    else { setMisses((m) => [...m, { x, y }]); sfx.bad(); }
  };
  const marks = (
    <>
      {found.map((k) => { const d = scene.diffs[k]; return <span key={k} style={{ position: "absolute", left: `${((d.x - d.r) / W) * 100}%`, top: `${((d.y - d.r) / H) * 100}%`, width: `${((d.r * 2) / W) * 100}%`, aspectRatio: "1", borderRadius: "50%", border: "3px solid #22c55e", boxShadow: "0 0 0 2px #fff, 0 0 14px #22c55e", animation: "pop .3s", pointerEvents: "none" }} />; })}
      {hint !== null && (() => { const d = scene.diffs[hint]; return <span style={{ position: "absolute", left: `${((d.x - 50) / W) * 100}%`, top: `${((d.y - 50) / H) * 100}%`, width: `${(100 / W) * 100}%`, aspectRatio: "1", borderRadius: "50%", border: "3px dashed #facc15", animation: "spin 4s linear infinite", pointerEvents: "none" }} />; })()}
      {misses.slice(-3).map((m, i) => <span key={i} style={{ position: "absolute", left: `${(m.x / W) * 100}%`, top: `${(m.y / H) * 100}%`, transform: "translate(-50%,-50%)", color: "#ef4444", fontWeight: 900, fontSize: 22, textShadow: "0 0 4px #fff", pointerEvents: "none" }}>✕</span>)}
    </>
  );
  const pic = (ref, label) => (
    <div style={{ position: "relative", flex: "1 1 300px", maxWidth: 480 }}>
      <canvas ref={ref} onClick={click} style={{ width: "100%", height: "auto", aspectRatio: `${W} / ${H}`, cursor: "crosshair", boxShadow: "0 12px 30px -12px rgba(0,0,0,.7)" }} aria-label={label} />
      {marks}
    </div>
  );

  return (
    <GameShell
      stats={[["Found", `${found.length}/${FIND}`, true], ["Misses", `${misses.length}/${MAX_MISS}`], ["Level", level]]}
      onRestart={() => { setFound([]); setMisses([]); setHint(null); }}
      toolbar={<>
        <button className="game-btn" onClick={() => setHint(scene.diffs.findIndex((_, k) => !found.includes(k)))} disabled={won || lost}><Lightbulb size={16} /> Hint</button>
        <button className="game-btn" onClick={next}><Shuffle size={16} /> New scene</button>
      </>}
      overlay={(won || lost) && <Overlay tone={won ? "win" : "lose"} title={won ? "All 5 found!" : "Too many misses"} actions={<button className="game-btn primary big" onClick={won ? next : () => { setFound([]); setMisses([]); }}>{won ? "Next scene" : "Try again"}</button>}><p>{won ? `${misses.length} wrong click${misses.length === 1 ? "" : "s"} — sharp eyes!` : `You found ${found.length} of ${FIND}.`}</p></Overlay>}
    >
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
        {pic(a, "Original picture")}
        {pic(b, "Changed picture")}
      </div>
    </GameShell>
  );
}
