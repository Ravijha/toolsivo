"use client";
import { useEffect, useState } from "react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const winner = (b) => { for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { p: b[l[0]], line: l }; return b.every(Boolean) ? { p: "draw" } : null; };

// Minimax: O = computer (maximiser)
function minimax(b, turn, depth = 0) {
  const w = winner(b);
  if (w) return w.p === "O" ? 10 - depth : w.p === "X" ? depth - 10 : 0;
  let best = turn === "O" ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) if (!b[i]) {
    b[i] = turn;
    const s = minimax(b, turn === "O" ? "X" : "O", depth + 1);
    b[i] = null;
    best = turn === "O" ? Math.max(best, s) : Math.min(best, s);
  }
  return best;
}
function aiMove(b, level) {
  const empty = b.map((v, i) => (v ? null : i)).filter((i) => i !== null);
  const random = empty[Math.floor(Math.random() * empty.length)];
  if (level === "easy" || (level === "medium" && Math.random() < 0.35)) return random;
  let best = -Infinity, moves = [];
  for (const i of empty) {
    b[i] = "O"; const s = minimax(b, "X"); b[i] = null;
    if (s > best) { best = s; moves = [i]; } else if (s === best) moves.push(i);
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

export default function TicTacToe() {
  const [mode, setMode] = useState("ai");
  const [level, setLevel] = useState("hard");
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 });
  const result = winner(board);

  useEffect(() => {
    if (!result) return;
    setScore((s) => ({ ...s, [result.p]: s[result.p] + 1 }));
    if (result.p === "draw") sfx.click(); else if (mode === "ai" && result.p === "O") sfx.lose(); else sfx.win();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.p, result?.line?.join()]);

  useEffect(() => {
    if (mode !== "ai" || turn !== "O" || result) return;
    const t = setTimeout(() => {
      const b = [...board];
      b[aiMove(b, level)] = "O";
      setBoard(b); setTurn("X"); sfx.click();
    }, 380);
    return () => clearTimeout(t);
  }, [turn, mode, board, level, result]);

  const play = (i) => {
    if (board[i] || result || (mode === "ai" && turn === "O")) return;
    const b = [...board]; b[i] = turn;
    setBoard(b); setTurn(turn === "X" ? "O" : "X"); sfx.hit();
  };
  const reset = (keepScore = true) => { setBoard(Array(9).fill(null)); setTurn(Math.random() < 0.5 || mode !== "ai" ? "X" : "X"); if (!keepScore) setScore({ X: 0, O: 0, draw: 0 }); };
  const names = mode === "ai" ? { X: "You", O: "Computer" } : { X: "Player X", O: "Player O" };

  return (
    <GameShell
      stats={[[names.X, score.X, true], [names.O, score.O], ["Draws", score.draw]]}
      onRestart={() => reset(true)}
      toolbar={<>
        <Pill options={[{ label: "vs Computer", value: "ai" }, { label: "2 Players", value: "pvp" }]} value={mode} onChange={(m) => { setMode(m); reset(false); }} />
        {mode === "ai" && <Pill options={[{ label: "Easy", value: "easy" }, { label: "Medium", value: "medium" }, { label: "Unbeatable", value: "hard" }]} value={level} onChange={(l) => { setLevel(l); reset(false); }} />}
      </>}
      overlay={result && (
        <Overlay tone={result.p === "draw" ? "" : mode === "ai" && result.p === "O" ? "lose" : "win"} title={result.p === "draw" ? "It’s a draw!" : `${names[result.p]} ${mode === "ai" && result.p === "X" ? "win!" : "wins!"}`}
          actions={<button className="game-btn primary big" onClick={() => reset(true)}>Play again</button>} />
      )}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--g-muted)", fontWeight: 700, marginBottom: 14 }}>{result ? " " : mode === "ai" && turn === "O" ? "Computer is thinking…" : `${names[turn]}’s turn (${turn})`}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(76px, 112px))", gap: 10 }}>
          {board.map((v, i) => {
            const win = result?.line?.includes(i);
            return (
              <button key={i} onClick={() => play(i)} aria-label={`Cell ${i + 1}${v ? ` ${v}` : ""}`}
                style={{ aspectRatio: "1", borderRadius: 18, border: "1px solid rgba(255,255,255,.12)", background: win ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.05)", cursor: v || result ? "default" : "pointer", display: "grid", placeItems: "center", transition: "background .2s, transform .15s", transform: win ? "scale(1.04)" : "none" }}>
                {v && (
                  <svg viewBox="0 0 100 100" width="62%" height="62%" style={{ animation: "pop .3s cubic-bezier(.2,.9,.3,1.4)" }}>
                    {v === "X"
                      ? <g stroke="url(#gx)" strokeWidth="14" strokeLinecap="round"><line x1="20" y1="20" x2="80" y2="80" /><line x1="80" y1="20" x2="20" y2="80" /></g>
                      : <circle cx="50" cy="50" r="32" fill="none" stroke="url(#go)" strokeWidth="13" />}
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="gx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f472b6" /><stop offset="1" stopColor="#a855f7" /></linearGradient>
            <linearGradient id="go" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#6366f1" /></linearGradient>
          </defs>
        </svg>
      </div>
    </GameShell>
  );
}
