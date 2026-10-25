"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Route } from "lucide-react";
import GameShell, { Overlay, Pill, useSwipe, KEYDIR } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const DIR = { up: [0, -1, 0], right: [1, 0, 1], down: [0, 1, 2], left: [-1, 0, 3] }; // dx, dy, wall index
// Recursive-backtracker maze: walls[y][x] = [top, right, bottom, left]
function generate(n) {
  const walls = Array.from({ length: n }, () => Array.from({ length: n }, () => [1, 1, 1, 1]));
  const seen = Array.from({ length: n }, () => Array(n).fill(false));
  const stack = [[0, 0]]; seen[0][0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const opts = Object.values(DIR).map(([dx, dy, w]) => [x + dx, y + dy, w]).filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n && !seen[b][a]);
    if (!opts.length) { stack.pop(); continue; }
    const [a, b, w] = opts[Math.floor(Math.random() * opts.length)];
    walls[y][x][w] = 0; walls[b][a][(w + 2) % 4] = 0;
    seen[b][a] = true; stack.push([a, b]);
  }
  return walls;
}
function solve(walls, n, from) {
  const prev = {}, q = [from], key = (x, y) => `${x},${y}`;
  prev[key(...from)] = null;
  while (q.length) {
    const [x, y] = q.shift();
    if (x === n - 1 && y === n - 1) break;
    for (const [dx, dy, w] of Object.values(DIR)) {
      const a = x + dx, b = y + dy;
      if (!walls[y][x][w] && a >= 0 && b >= 0 && a < n && b < n && !(key(a, b) in prev)) { prev[key(a, b)] = [x, y]; q.push([a, b]); }
    }
  }
  const path = []; let cur = [n - 1, n - 1];
  while (cur) { path.push(cur); cur = prev[key(...cur)]; }
  return path.reverse();
}
const fmt = (ms) => `${(ms / 1000).toFixed(1)}s`;

export default function Maze() {
  const [n, setN] = useState(15);
  const [walls, setWalls] = useState(() => generate(15));
  const [pos, setPos] = useState([0, 0]);
  const [trail, setTrail] = useState([[0, 0]]);
  const [start, setStart] = useState(null);
  const [now, setNow] = useState(0);
  const [showPath, setShowPath] = useState(false);
  const [best, setBest] = useState({});
  const cv = useRef(null), stage = useRef(null);
  const won = pos[0] === n - 1 && pos[1] === n - 1;
  const elapsed = start ? (won ? now : now || Date.now()) - start : 0;

  useEffect(() => { if (!start || won) return; const t = setInterval(() => setNow(Date.now()), 100); return () => clearInterval(t); }, [start, won]);
  useEffect(() => { if (won) { setNow(Date.now()); sfx.win(); setBest((b) => ({ ...b, [n]: Math.min(b[n] ?? Infinity, Date.now() - start) })); } /* eslint-disable-next-line */ }, [won]);

  const reset = (size = n) => { setN(size); setWalls(generate(size)); setPos([0, 0]); setTrail([[0, 0]]); setStart(null); setNow(0); setShowPath(false); };
  const move = (d) => {
    if (won) return;
    const [dx, dy, w] = DIR[d], [x, y] = pos;
    if (walls[y][x][w]) return sfx.hit();
    const np = [x + dx, y + dy];
    setPos(np); setTrail((t) => [...t, np]); if (!start) setStart(Date.now());
  };
  useEffect(() => {
    const onKey = (e) => { const d = KEYDIR[e.key]; if (d) { e.preventDefault(); move(d); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  useSwipe(stage, move);

  useEffect(() => {
    const c = cv.current; if (!c) return;
    const size = Math.min(560, c.parentElement.clientWidth - 4), dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = size * dpr; c.height = size * dpr; c.style.width = c.style.height = `${size}px`;
    const x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = size / n;
    x.fillStyle = "#0d0b24"; x.fillRect(0, 0, size, size);
    // exit glow
    const g = x.createRadialGradient((n - 0.5) * s, (n - 0.5) * s, 2, (n - 0.5) * s, (n - 0.5) * s, s);
    g.addColorStop(0, "#4ade80"); g.addColorStop(1, "rgba(74,222,128,0)");
    x.fillStyle = g; x.fillRect((n - 1.5) * s, (n - 1.5) * s, s * 2, s * 2);
    if (showPath) {
      x.strokeStyle = "rgba(250, 204, 21, .75)"; x.lineWidth = s * 0.18; x.lineCap = x.lineJoin = "round"; x.beginPath();
      solve(walls, n, pos).forEach(([a, b], i) => (i ? x.lineTo : x.moveTo).call(x, (a + 0.5) * s, (b + 0.5) * s)); x.stroke();
    }
    x.strokeStyle = "rgba(168, 85, 247, .35)"; x.lineWidth = s * 0.3; x.lineCap = x.lineJoin = "round"; x.beginPath();
    trail.forEach(([a, b], i) => (i ? x.lineTo : x.moveTo).call(x, (a + 0.5) * s, (b + 0.5) * s)); x.stroke();
    x.strokeStyle = "#7dd3fc"; x.lineWidth = Math.max(2, s * 0.09); x.lineCap = "round"; x.shadowColor = "#38bdf8"; x.shadowBlur = 6;
    x.beginPath();
    for (let y = 0; y < n; y++) for (let xx = 0; xx < n; xx++) {
      const [t, r, b, l] = walls[y][xx], X = xx * s, Y = y * s;
      if (t) { x.moveTo(X, Y); x.lineTo(X + s, Y); }
      if (r) { x.moveTo(X + s, Y); x.lineTo(X + s, Y + s); }
      if (b) { x.moveTo(X, Y + s); x.lineTo(X + s, Y + s); }
      if (l) { x.moveTo(X, Y); x.lineTo(X, Y + s); }
    }
    x.stroke(); x.shadowBlur = 0;
    x.fillStyle = "#f472b6"; x.shadowColor = "#f472b6"; x.shadowBlur = 14;
    x.beginPath(); x.arc((pos[0] + 0.5) * s, (pos[1] + 0.5) * s, s * 0.3, 0, 7); x.fill(); x.shadowBlur = 0;
  }, [walls, pos, trail, n, showPath]);

  return (
    <GameShell
      stats={[["Time", fmt(elapsed), true], ["Steps", trail.length - 1], ["Best", best[n] ? fmt(best[n]) : "—"]]}
      onRestart={() => reset()}
      toolbar={<>
        <Pill options={[{ label: "Small", value: 10 }, { label: "Medium", value: 15 }, { label: "Large", value: 22 }, { label: "Huge", value: 30 }]} value={n} onChange={reset} />
        <button className={`game-btn ${showPath ? "primary" : ""}`} onClick={() => setShowPath(!showPath)}><Route size={16} /> Solution</button>
      </>}
      overlay={won && <Overlay tone="win" title="You escaped!" actions={<button className="game-btn primary big" onClick={() => reset()}>New maze</button>}><p>{fmt(elapsed)} · {trail.length - 1} steps{showPath ? " (with a little help)" : ""}</p></Overlay>}
    >
      <div ref={stage} style={{ width: "100%", display: "grid", placeItems: "center" }}>
        <canvas ref={cv} aria-label="Maze" />
        <div className="dpad touch-only">
          <button className="up" onClick={() => move("up")} aria-label="Up"><ArrowUp /></button>
          <button className="left" onClick={() => move("left")} aria-label="Left"><ArrowLeft /></button>
          <button className="down" onClick={() => move("down")} aria-label="Down"><ArrowDown /></button>
          <button className="right" onClick={() => move("right")} aria-label="Right"><ArrowRight /></button>
        </div>
      </div>
    </GameShell>
  );
}
