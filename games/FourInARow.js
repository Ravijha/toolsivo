"use client";
import { useEffect, useState } from "react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const R = 6, C = 7;
const empty = () => Array.from({ length: R }, () => Array(C).fill(0));
const drop = (b, c) => { for (let r = R - 1; r >= 0; r--) if (!b[r][c]) return r; return -1; };
const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];

function winLine(b) {
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const p = b[r][c]; if (!p) continue;
    for (const [dr, dc] of DIRS) {
      const line = [[r, c]];
      for (let k = 1; k < 4; k++) { const y = r + dr * k, x = c + dc * k; if (y < 0 || y >= R || x < 0 || x >= C || b[y][x] !== p) break; line.push([y, x]); }
      if (line.length === 4) return { p, line };
    }
  }
  return b[0].every(Boolean) ? { p: 0 } : null;
}

// Heuristic: score every window of 4 cells for the computer (2) against the player (1).
function evaluate(b) {
  let s = 0;
  for (let r = 0; r < R; r++) if (b[r][3] === 2) s += 3; else if (b[r][3] === 1) s -= 3;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of DIRS) {
    const cells = [];
    for (let k = 0; k < 4; k++) { const y = r + dr * k, x = c + dc * k; if (y < 0 || y >= R || x < 0 || x >= C) break; cells.push(b[y][x]); }
    if (cells.length < 4) continue;
    const me = cells.filter((v) => v === 2).length, op = cells.filter((v) => v === 1).length;
    if (me && op) continue;
    s += me === 3 ? 6 : me === 2 ? 2 : 0;
    s -= op === 3 ? 8 : op === 2 ? 2 : 0;
  }
  return s;
}
const ORDER = [3, 2, 4, 1, 5, 0, 6];
function negamax(b, depth, alpha, beta, player) {
  const w = winLine(b);
  if (w) return w.p === 0 ? 0 : (w.p === 2 ? 1 : -1) * player * (1000 + depth);
  if (depth === 0) return player * evaluate(b);
  let best = -Infinity;
  for (const c of ORDER) {
    const r = drop(b, c); if (r < 0) continue;
    b[r][c] = player === 1 ? 2 : 1;
    const v = -negamax(b, depth - 1, -beta, -alpha, -player);
    b[r][c] = 0;
    best = Math.max(best, v); alpha = Math.max(alpha, v);
    if (alpha >= beta) break;
  }
  return best;
}
function aiMove(b, depth) {
  let best = -Infinity, moves = [];
  for (const c of ORDER) {
    const r = drop(b, c); if (r < 0) continue;
    b[r][c] = 2;
    const v = -negamax(b, depth - 1, -Infinity, Infinity, -1);
    b[r][c] = 0;
    if (v > best) { best = v; moves = [c]; } else if (v === best) moves.push(c);
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

export default function FourInARow() {
  const [mode, setMode] = useState("ai");
  const [level, setLevel] = useState(5);
  const [b, setB] = useState(empty);
  const [turn, setTurn] = useState(1);
  const [hover, setHover] = useState(null);
  const [last, setLast] = useState(null);
  const [score, setScore] = useState({ 1: 0, 2: 0, 0: 0 });
  const res = winLine(b);
  const names = mode === "ai" ? { 1: "You", 2: "Computer" } : { 1: "Red", 2: "Yellow" };

  useEffect(() => {
    if (!res) return;
    setScore((s) => ({ ...s, [res.p]: s[res.p] + 1 }));
    res.p === 0 ? sfx.click() : mode === "ai" && res.p === 2 ? sfx.lose() : sfx.win();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!res]);
  useEffect(() => {
    if (mode !== "ai" || turn !== 2 || res) return;
    const t = setTimeout(() => place(aiMove(b.map((r) => [...r]), level)), 350);
    return () => clearTimeout(t);
  });

  const place = (c) => {
    if (res) return;
    const r = drop(b, c); if (r < 0) return;
    const nb = b.map((row) => [...row]); nb[r][c] = turn;
    setB(nb); setLast([r, c]); setTurn(turn === 1 ? 2 : 1); sfx.hit();
  };
  const reset = (keep = true) => { setB(empty()); setTurn(1); setLast(null); if (!keep) setScore({ 1: 0, 2: 0, 0: 0 }); };
  const winSet = new Set(res?.line?.map(([r, c]) => `${r},${c}`));
  const COLORS = { 1: "radial-gradient(circle at 35% 30%, #fca5a5, #ef4444 55%, #b91c1c)", 2: "radial-gradient(circle at 35% 30%, #fef08a, #facc15 55%, #ca8a04)" };

  return (
    <GameShell
      stats={[[names[1], score[1], true], [names[2], score[2]], ["Draws", score[0]]]}
      onRestart={() => reset()}
      toolbar={<>
        <Pill options={[{ label: "vs Computer", value: "ai" }, { label: "2 Players", value: "pvp" }]} value={mode} onChange={(m) => { setMode(m); reset(false); }} />
        {mode === "ai" && <Pill options={[{ label: "Easy", value: 2 }, { label: "Medium", value: 4 }, { label: "Hard", value: 6 }]} value={level} onChange={(l) => { setLevel(l); reset(false); }} />}
      </>}
      overlay={res && <Overlay tone={res.p === 0 ? "" : mode === "ai" && res.p === 2 ? "lose" : "win"} title={res.p === 0 ? "Draw!" : `${names[res.p]} ${mode === "ai" && res.p === 1 ? "win!" : "wins!"}`} actions={<button className="game-btn primary big" onClick={() => reset()}>Play again</button>} />}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--g-muted)", fontWeight: 700, marginBottom: 12, display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
          <span style={{ width: 16, height: 16, borderRadius: "50%", background: COLORS[turn], display: "inline-block" }} />
          {mode === "ai" && turn === 2 ? "Computer is thinking…" : `${names[turn]}’s turn`}
        </p>
        <div onMouseLeave={() => setHover(null)} style={{ display: "grid", gridTemplateColumns: `repeat(${C}, min(54px, calc((100vw - 152px) / ${C})))`, gap: 6, padding: 10, borderRadius: 18, background: "linear-gradient(180deg, #2563eb, #1e3a8a)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.2), 0 20px 40px -18px rgba(37,99,235,.8)" }}>
          {b.map((row, r) => row.map((v, c) => (
            <button key={`${r}-${c}`} onClick={() => !(mode === "ai" && turn === 2) && place(c)} onMouseEnter={() => setHover(c)} aria-label={`Column ${c + 1}`}
              style={{ aspectRatio: "1", borderRadius: "50%", border: 0, cursor: "pointer", padding: 0, background: v ? COLORS[v] : hover === c && !res ? "rgba(255,255,255,.28)" : "#0b1230", boxShadow: winSet.has(`${r},${c}`) ? "0 0 0 4px #fff, 0 0 18px #fff" : "inset 0 4px 8px rgba(0,0,0,.5)",
                animation: last && last[0] === r && last[1] === c ? `drop${r} .35s cubic-bezier(.3,1.4,.6,1)` : "none" }} />
          )))}
        </div>
        <style>{[...Array(R)].map((_, r) => `@keyframes drop${r}{from{transform:translateY(-${(r + 1) * 62}px)}to{transform:none}}`).join("")}</style>
      </div>
    </GameShell>
  );
}
