"use client";
import { useEffect, useState } from "react";
import GameShell, { Overlay, Pill, KEYDIR } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const solved = (n) => [...Array(n * n - 1).keys()].map((i) => i + 1).concat(0);
// Shuffle by making random legal moves from the solved state, so every puzzle is solvable.
function shuffle(n) {
  let b = solved(n), z = b.length - 1, prev = -1;
  for (let k = 0; k < n * n * 40; k++) {
    const r = Math.floor(z / n), c = z % n;
    const opts = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([y, x]) => y >= 0 && y < n && x >= 0 && x < n).map(([y, x]) => y * n + x).filter((i) => i !== prev);
    const t = opts[Math.floor(Math.random() * opts.length)];
    [b[z], b[t]] = [b[t], b[z]]; prev = z; z = t;
  }
  return b.join() === solved(n).join() ? shuffle(n) : b;
}
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function SlidingPuzzle() {
  const [n, setN] = useState(4);
  const [b, setB] = useState(() => shuffle(4));
  const [moves, setMoves] = useState(0);
  const [start, setStart] = useState(null);
  const [now, setNow] = useState(0);
  const [best, setBest] = useState({});
  const won = moves > 0 && b.join() === solved(n).join();
  const secs = start ? Math.floor(((won ? now : now || Date.now()) - start) / 1000) : 0;

  useEffect(() => { if (!start || won) return; const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, [start, won]);
  useEffect(() => { if (won) { sfx.win(); setNow(Date.now()); setBest((x) => ({ ...x, [n]: Math.min(x[n] ?? Infinity, moves) })); } /* eslint-disable-next-line */ }, [won]);

  const reset = (size = n) => { setN(size); setB(shuffle(size)); setMoves(0); setStart(null); setNow(0); };
  const move = (i) => {
    if (won) return;
    const z = b.indexOf(0), [r, c, zr, zc] = [Math.floor(i / n), i % n, Math.floor(z / n), z % n];
    if (Math.abs(r - zr) + Math.abs(c - zc) !== 1) return;
    const nb = [...b]; [nb[i], nb[z]] = [nb[z], nb[i]];
    setB(nb); setMoves((m) => m + 1); if (!start) setStart(Date.now()); sfx.click();
  };
  useEffect(() => {
    const onKey = (e) => {
      const d = KEYDIR[e.key]; if (!d) return; e.preventDefault();
      const z = b.indexOf(0), zr = Math.floor(z / n), zc = z % n;
      // arrow moves the tile on the opposite side into the gap
      const [r, c] = d === "up" ? [zr + 1, zc] : d === "down" ? [zr - 1, zc] : d === "left" ? [zr, zc + 1] : [zr, zc - 1];
      if (r >= 0 && r < n && c >= 0 && c < n) move(r * n + c);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const size = Math.min(420, typeof window !== "undefined" ? window.innerWidth - 80 : 420);
  const cell = size / n;
  return (
    <GameShell
      stats={[["Moves", moves, true], ["Time", fmt(secs)], ["Best", best[n] ? `${best[n]} moves` : "—"]]}
      onRestart={() => reset()}
      toolbar={<Pill options={[3, 4, 5].map((k) => ({ label: `${k}×${k}`, value: k }))} value={n} onChange={reset} />}
      overlay={won && <Overlay tone="win" title="Solved!" actions={<button className="game-btn primary big" onClick={() => reset()}>New puzzle</button>}><p>{moves} moves in {fmt(secs)}.</p></Overlay>}
    >
      <div style={{ position: "relative", width: size, height: size, borderRadius: 18, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)" }}>
        {b.map((v, i) => v !== 0 && (
          <button key={v} onClick={() => move(i)} aria-label={`Tile ${v}`}
            style={{ position: "absolute", left: (i % n) * cell + 4, top: Math.floor(i / n) * cell + 4, width: cell - 8, height: cell - 8, borderRadius: 14, border: 0, cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: cell * 0.36,
              background: v === i + 1 ? "linear-gradient(135deg, #22c55e, #0ea5e9)" : `linear-gradient(135deg, hsl(${(v * 360) / (n * n) + 250}, 75%, 58%), hsl(${(v * 360) / (n * n) + 290}, 75%, 48%))`,
              boxShadow: "inset 0 2px 0 rgba(255,255,255,.25), 0 8px 18px -8px rgba(0,0,0,.6)", transition: "left .14s ease, top .14s ease" }}>
            {v}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
