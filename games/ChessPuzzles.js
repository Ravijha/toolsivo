"use client";
import { useMemo, useState } from "react";
import { Lightbulb, ChevronRight } from "lucide-react";
import GameShell, { Overlay } from "@/components/GameShell";
import { parseFen, legalMoves, apply, isMate, inCheck, allMoves, sq, GLYPH } from "@/lib/chess";
import { PUZZLES } from "@/lib/chessPuzzles";
import { sfx } from "@/lib/sfx";

export default function ChessPuzzles() {
  const [idx, setIdx] = useState(0);
  const [b, setB] = useState(() => parseFen(PUZZLES[0].fen).b);
  const [sel, setSel] = useState(null);
  const [state, setState] = useState("play"); // play | wrong | solved
  const [hint, setHint] = useState(null);
  const [solved, setSolved] = useState(0);
  const [tries, setTries] = useState(0);
  const [lastMove, setLastMove] = useState(null);
  const p = PUZZLES[idx];
  const targets = useMemo(() => (sel ? legalMoves(b, sel[0], sel[1]) : []), [b, sel]);

  const load = (i) => { const k = (i + PUZZLES.length) % PUZZLES.length; setIdx(k); setB(parseFen(PUZZLES[k].fen).b); setSel(null); setState("play"); setHint(null); setLastMove(null); };
  const click = (r, c) => {
    if (state !== "play") return;
    const piece = b[r][c];
    if (sel && targets.some(([y, x]) => y === r && x === c)) {
      const nb = apply(b, sel, [r, c]);
      setB(nb); setLastMove([sel, [r, c]]); setSel(null); setTries((t) => t + 1);
      if (isMate(nb, "b")) { setState("solved"); setSolved((s) => s + 1); sfx.win(); }
      else {
        setState("wrong"); sfx.bad();
        setTimeout(() => { setB(parseFen(p.fen).b); setState("play"); setLastMove(null); }, 1100);
      }
      return;
    }
    if (piece?.[0] === "w") { setSel([r, c]); sfx.click(); } else setSel(null);
  };
  const showHint = () => {
    const start = parseFen(p.fen).b;
    const m = allMoves(start, "w").find(([f, t]) => isMate(apply(start, f, t), "b"));
    if (m) setHint(m[0]);
  };
  const checkKing = state !== "play" && inCheck(b, "b") ? (() => { for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (b[r][c] === "bK") return `${r},${c}`; })() : null;

  return (
    <GameShell
      stats={[["Puzzle", `${idx + 1}/${PUZZLES.length}`, true], ["Solved", solved], ["Moves tried", tries]]}
      onRestart={() => load(idx)}
      toolbar={<>
        <button className="game-btn" onClick={showHint} disabled={state !== "play"}><Lightbulb size={16} /> Hint</button>
        <button className="game-btn" onClick={() => load(idx + 1)}>Skip <ChevronRight size={16} /></button>
      </>}
      overlay={state === "solved" && (
        <Overlay tone="win" title="Checkmate!" actions={<button className="game-btn primary big" onClick={() => load(idx + 1)}>Next puzzle</button>}>
          <p>{lastMove && `${sq(lastMove[0])} → ${sq(lastMove[1])}`} — beautifully done.</p>
        </Overlay>
      )}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 800, fontSize: "1.1rem" }}>{p.title}</p>
        <p style={{ color: state === "wrong" ? "#fda4af" : "var(--g-muted)", marginBottom: 12, minHeight: 24 }}>
          {state === "wrong" ? "Not checkmate — try again!" : hint ? p.hint : "White to move — find checkmate in one."}
        </p>
        <div style={{ display: "inline-grid", gridTemplateColumns: "repeat(8, min(52px, calc((100vw - 116px) / 8)))", borderRadius: 10, overflow: "hidden", border: "6px solid #3b2a1a", boxShadow: "0 24px 48px -20px rgba(0,0,0,.8)" }}>
          {b.map((row, r) => row.map((pc, c) => {
            const light = (r + c) % 2 === 0;
            const isSel = sel && sel[0] === r && sel[1] === c;
            const isTarget = targets.some(([y, x]) => y === r && x === c);
            const isHint = hint && hint[0] === r && hint[1] === c;
            const isLast = lastMove && lastMove.some(([y, x]) => y === r && x === c);
            return (
              <button key={`${r}${c}`} onClick={() => click(r, c)} aria-label={`${sq([r, c])}${pc ? ` ${pc}` : ""}`}
                style={{ aspectRatio: "1", border: 0, padding: 0, position: "relative", cursor: pc?.[0] === "w" || isTarget ? "pointer" : "default",
                  background: isSel ? "#f6e05e" : isHint ? "#68d391" : checkKing === `${r},${c}` ? "#f56565" : isLast ? (light ? "#f0e68c" : "#c9b458") : light ? "#ecd9b6" : "#b07d52" }}>
                {pc && <span style={{ fontSize: "min(40px, 6.8vw)", lineHeight: 1, color: pc[0] === "w" ? "#fff" : "#1a1a1a", textShadow: pc[0] === "w" ? "0 0 2px #000, 0 0 1px #000, 0 2px 3px rgba(0,0,0,.5)" : "0 1px 1px rgba(255,255,255,.3)" }}>{GLYPH[pc[1]]}</span>}
                {isTarget && <span style={{ position: "absolute", inset: pc ? 3 : "36%", borderRadius: "50%", background: pc ? "transparent" : "rgba(0,0,0,.28)", border: pc ? "4px solid rgba(0,0,0,.35)" : 0 }} />}
                {c === 0 && <small style={{ position: "absolute", left: 2, top: 1, fontSize: 9, color: light ? "#b07d52" : "#ecd9b6", fontWeight: 800 }}>{8 - r}</small>}
                {r === 7 && <small style={{ position: "absolute", right: 3, bottom: 0, fontSize: 9, color: light ? "#b07d52" : "#ecd9b6", fontWeight: 800 }}>{"abcdefgh"[c]}</small>}
              </button>
            );
          }))}
        </div>
      </div>
    </GameShell>
  );
}
