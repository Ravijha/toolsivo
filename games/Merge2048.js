"use client";
import { useEffect, useRef, useState } from "react";
import { Undo2 } from "lucide-react";
import GameShell, { Overlay, useSwipe, KEYDIR } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const N = 4;
let uid = 1;
const empty = () => Array.from({ length: N }, () => Array(N).fill(null));
function addTile(g) {
  const free = []; g.forEach((row, r) => row.forEach((v, c) => !v && free.push([r, c])));
  if (!free.length) return g;
  const [r, c] = free[Math.floor(Math.random() * free.length)];
  g[r][c] = { id: uid++, v: Math.random() < 0.9 ? 2 : 4, fresh: true };
  return g;
}
const init = () => addTile(addTile(empty()));
// Slide one row to the left, merging equal neighbours once.
function slideRow(row) {
  const t = row.filter(Boolean).map((x) => ({ ...x, fresh: false, merged: false }));
  let gained = 0;
  for (let i = 0; i < t.length - 1; i++) if (t[i].v === t[i + 1].v) { t[i] = { id: uid++, v: t[i].v * 2, merged: true }; gained += t[i].v; t.splice(i + 1, 1); }
  while (t.length < N) t.push(null);
  return [t, gained];
}
function move(g, dir) {
  const rot = (m) => m[0].map((_, c) => m.map((row) => row[c]).reverse()); // clockwise
  let m = g.map((r) => [...r]), turns = { left: 0, up: 3, right: 2, down: 1 }[dir];
  for (let i = 0; i < turns; i++) m = rot(m);
  let gained = 0;
  m = m.map((row) => { const [r, s] = slideRow(row); gained += s; return r; });
  for (let i = 0; i < (4 - turns) % 4; i++) m = rot(m);
  const moved = m.some((row, r) => row.some((v, c) => (v?.v ?? 0) !== (g[r][c]?.v ?? 0)));
  return { g: m, gained, moved };
}
const canMove = (g) => ["left", "right", "up", "down"].some((d) => move(g, d).moved);
const TILE = { 2: ["#eee4da", "#776e65"], 4: ["#ede0c8", "#776e65"], 8: ["#f2b179", "#fff"], 16: ["#f59563", "#fff"], 32: ["#f67c5f", "#fff"], 64: ["#f65e3b", "#fff"], 128: ["#edcf72", "#fff"], 256: ["#edcc61", "#fff"], 512: ["#edc850", "#fff"], 1024: ["#a78bfa", "#fff"], 2048: ["#ec4899", "#fff"] };

export default function Merge2048() {
  const [g, setG] = useState(init);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [undo, setUndo] = useState(null);
  const [wonSeen, setWonSeen] = useState(false);
  const stage = useRef(null);
  const max = Math.max(...g.flat().map((x) => x?.v || 0));
  const over = !canMove(g);
  const showWin = max >= 2048 && !wonSeen;

  const go = (dir) => {
    if (over || showWin) return;
    const r = move(g, dir);
    if (!r.moved) return;
    setUndo({ g, score });
    setG(addTile(r.g)); setScore((s) => s + r.gained); r.gained ? sfx.point() : sfx.click();
  };
  useEffect(() => { setBest((b) => Math.max(b, score)); }, [score]);
  useEffect(() => { if (over) sfx.lose(); }, [over]);
  useEffect(() => {
    const onKey = (e) => { const d = KEYDIR[e.key]; if (d) { e.preventDefault(); go(d); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  useSwipe(stage, go);
  const reset = () => { setG(init()); setScore(0); setUndo(null); setWonSeen(false); };

  return (
    <GameShell stats={[["Score", score, true], ["Best", best], ["Top tile", max]]} onRestart={reset}
      toolbar={<button className="game-btn" onClick={() => { if (undo) { setG(undo.g); setScore(undo.score); setUndo(null); } }} disabled={!undo}><Undo2 size={16} /> Undo</button>}
      overlay={(over || showWin) && (
        <Overlay tone={showWin ? "win" : "lose"} title={showWin ? "You made 2048!" : "No more moves"} actions={showWin ? <><button className="game-btn primary big" onClick={() => setWonSeen(true)}>Keep going</button><button className="game-btn big" onClick={reset}>New game</button></> : <button className="game-btn primary big" onClick={reset}>Try again</button>}>
          <p>Score {score}</p>
        </Overlay>
      )}
    >
      <div ref={stage} style={{ display: "grid", gridTemplateColumns: `repeat(${N}, min(92px, calc((100vw - 136px) / ${N})))`, gap: 10, padding: 10, borderRadius: 18, background: "#bbada0", touchAction: "none" }}>
        {g.flat().map((t, i) => {
          const [bg, fg] = t ? TILE[t.v] || ["#3c3a32", "#fff"] : ["rgba(238,228,218,.35)", ""];
          return (
            <div key={t ? t.id : `e${i}`} style={{ aspectRatio: "1", borderRadius: 10, background: bg, color: fg, display: "grid", placeItems: "center", fontWeight: 900, fontSize: t && t.v >= 1024 ? "clamp(1.1rem,5vw,1.8rem)" : t && t.v >= 128 ? "clamp(1.3rem,6vw,2.1rem)" : "clamp(1.6rem,7vw,2.5rem)",
              animation: t?.merged ? "pop .2s" : t?.fresh ? "rise .2s" : "none", boxShadow: t && t.v >= 128 ? `0 0 ${Math.log2(t.v) * 2}px ${bg}` : "none" }}>
              {t?.v}
            </div>
          );
        })}
      </div>
    </GameShell>
  );
}
