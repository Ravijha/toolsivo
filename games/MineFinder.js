"use client";
import { useEffect, useRef, useState } from "react";
import { Flag } from "lucide-react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const LEVELS = { beginner: [9, 9, 10], intermediate: [16, 16, 40], expert: [16, 30, 99] };
const NUM_COLORS = ["", "#60a5fa", "#4ade80", "#f87171", "#a78bfa", "#fb923c", "#22d3ee", "#f472b6", "#e5e7eb"];

export default function MineFinder() {
  const [level, setLevel] = useState("beginner");
  const [R, C, M] = LEVELS[level];
  const [board, setBoard] = useState(null); // { mine, n, open, flag }
  const [state, setState] = useState("play");
  const [flagMode, setFlagMode] = useState(false);
  const [start, setStart] = useState(null);
  const [now, setNow] = useState(0);
  const [boom, setBoom] = useState(null);
  const press = useRef(null);
  const blank = () => Array.from({ length: R * C }, () => ({ mine: false, n: 0, open: false, flag: false }));
  const cells = board || blank();
  const secs = start ? Math.floor(((state === "play" ? now || Date.now() : now) - start) / 1000) : 0;
  const flags = cells.filter((c) => c.flag).length;

  useEffect(() => { if (!start || state !== "play") return; const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, [start, state]);
  const reset = (lv = level) => { setLevel(lv); setBoard(null); setState("play"); setStart(null); setNow(0); setBoom(null); };
  const around = (i) => { const r = Math.floor(i / C), c = i % C, out = []; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const y = r + dr, x = c + dc; if ((dr || dc) && y >= 0 && y < R && x >= 0 && x < C) out.push(y * C + x); } return out; };

  // Mines are placed after the first click so it (and its neighbours) are always safe.
  const generate = (safe) => {
    const b = blank(), keep = new Set([safe, ...around(safe)]);
    let placed = 0;
    while (placed < M) { const i = Math.floor(Math.random() * R * C); if (!b[i].mine && !keep.has(i)) { b[i].mine = true; placed++; } }
    b.forEach((c, i) => (c.n = around(i).filter((j) => b[j].mine).length));
    return b;
  };
  const reveal = (b, i) => {
    const stack = [i];
    while (stack.length) { const k = stack.pop(); if (b[k].open || b[k].flag) continue; b[k].open = true; if (!b[k].n && !b[k].mine) stack.push(...around(k)); }
  };
  const open = (i) => {
    if (state !== "play") return;
    let b = board ? board.map((c) => ({ ...c })) : generate(i);
    if (!board) { setStart(Date.now()); setNow(Date.now()); }
    const cell = b[i];
    if (cell.flag) return;
    if (cell.open && cell.n) { // chord: open neighbours when the right number of flags is placed
      const nb = around(i);
      if (nb.filter((j) => b[j].flag).length !== cell.n) return;
      nb.forEach((j) => { if (!b[j].flag && !b[j].open) { if (b[j].mine) { b[j].open = true; setBoom(j); } else reveal(b, j); } });
    } else if (cell.mine) { cell.open = true; setBoom(i); }
    else reveal(b, i);
    if (b.some((c) => c.mine && c.open)) { b.forEach((c) => c.mine && (c.open = true)); setState("lost"); setNow(Date.now()); sfx.lose(); }
    else if (b.every((c) => c.mine || c.open)) { setState("won"); setNow(Date.now()); sfx.win(); }
    else sfx.click();
    setBoard(b);
  };
  const flag = (i) => {
    if (state !== "play" || !board || board[i].open) return;
    const b = board.map((c) => ({ ...c })); b[i].flag = !b[i].flag; setBoard(b); sfx.hit();
  };
  const size = level === "expert" ? 26 : level === "intermediate" ? 28 : 38;

  return (
    <GameShell stats={[["Mines left", M - flags, true], ["Time", `${secs}s`], ["Board", `${C}×${R}`]]} onRestart={() => reset()}
      toolbar={<>
        <Pill options={[{ label: "Beginner", value: "beginner" }, { label: "Intermediate", value: "intermediate" }, { label: "Expert", value: "expert" }]} value={level} onChange={reset} />
        <button className={`game-btn ${flagMode ? "primary" : ""}`} onClick={() => setFlagMode(!flagMode)}><Flag size={16} /> Flag mode</button>
      </>}
      overlay={state !== "play" && <Overlay tone={state === "won" ? "win" : "lose"} title={state === "won" ? "Field cleared!" : "Boom!"} actions={<button className="game-btn primary big" onClick={() => reset()}>Play again</button>}><p>{state === "won" ? `Cleared in ${secs} seconds.` : "You uncovered a mine."}</p></Overlay>}
    >
      <div style={{ overflowX: "auto", maxWidth: "100%", padding: 4 }}>
        <div style={{ "--s": `max(22px, min(${size}px, calc((100vw - 112px) / ${C} - 2px)))`, display: "grid", gridTemplateColumns: `repeat(${C}, var(--s))`, gap: 2, userSelect: "none" }} onContextMenu={(e) => e.preventDefault()}>
          {cells.map((c, i) => (
            <button key={i}
              onClick={() => (flagMode ? flag(i) : open(i))}
              onContextMenu={(e) => { e.preventDefault(); flag(i); }}
              onTouchStart={() => { press.current = setTimeout(() => { flag(i); press.current = "done"; }, 450); }}
              onTouchEnd={(e) => { if (press.current === "done") e.preventDefault(); clearTimeout(press.current); press.current = null; }}
              aria-label={c.open ? (c.mine ? "Mine" : `${c.n}`) : c.flag ? "Flagged" : "Hidden"}
              style={{ width: "var(--s)", height: "var(--s)", borderRadius: 6, border: 0, padding: 0, cursor: "pointer", fontWeight: 900, fontSize: "calc(var(--s) * .52)",
                background: c.open ? (boom === i ? "#ef4444" : "rgba(255,255,255,.07)") : "linear-gradient(145deg, #6366f1, #4338ca)",
                boxShadow: c.open ? "none" : "inset 0 2px 0 rgba(255,255,255,.25), inset 0 -2px 0 rgba(0,0,0,.25)", color: NUM_COLORS[c.n] }}>
              {c.open ? (c.mine ? "✹" : c.n || "") : c.flag ? "🚩" : ""}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
