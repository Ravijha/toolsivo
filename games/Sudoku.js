"use client";
import { useEffect, useMemo, useState } from "react";
import { Lightbulb, Pencil, Eraser } from "lucide-react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { generate, PEERS } from "@/lib/sudoku";
import { sfx } from "@/lib/sfx";

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function Sudoku() {
  const [level, setLevel] = useState("easy");
  const [game, setGame] = useState(() => generate("easy"));
  const [vals, setVals] = useState(() => [...game.puzzle]);
  const [notes, setNotes] = useState(() => Array.from({ length: 81 }, () => new Set()));
  const [sel, setSel] = useState(null);
  const [noteMode, setNoteMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [start, setStart] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const won = vals.every((v, i) => v === game.solution[i]);
  const secs = Math.floor((now - start) / 1000);

  useEffect(() => { if (won) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [won]);
  useEffect(() => { if (won) sfx.win(); }, [won]);

  const newGame = (lv = level) => {
    const gm = generate(lv);
    setLevel(lv); setGame(gm); setVals([...gm.puzzle]); setNotes(Array.from({ length: 81 }, () => new Set())); setSel(null); setMistakes(0); setHints(0); setStart(Date.now()); setNow(Date.now());
  };
  const conflicts = useMemo(() => new Set(vals.flatMap((v, i) => (v && PEERS[i].some((j) => vals[j] === v) ? [i] : []))), [vals]);
  const input = (v) => {
    if (sel === null || game.puzzle[sel] || won) return;
    if (noteMode && v) { const n = notes.map((s) => new Set(s)); n[sel].has(v) ? n[sel].delete(v) : n[sel].add(v); setNotes(n); return; }
    const nv = [...vals]; nv[sel] = v; setVals(nv);
    if (v && v !== game.solution[sel]) { setMistakes((m) => m + 1); sfx.bad(); }
    else if (v) {
      sfx.click();
      const n = notes.map((s) => new Set(s)); PEERS[sel].forEach((j) => n[j].delete(v)); n[sel].clear(); setNotes(n);
    }
  };
  const hint = () => {
    const empty = vals.map((v, i) => (v !== game.solution[i] ? i : -1)).filter((i) => i >= 0);
    const i = sel !== null && vals[sel] !== game.solution[sel] ? sel : empty[Math.floor(Math.random() * empty.length)];
    if (i === undefined) return;
    const nv = [...vals]; nv[i] = game.solution[i]; setVals(nv); setSel(i); setHints((h) => h + 1); sfx.good();
  };
  useEffect(() => {
    const onKey = (e) => {
      if (/^[1-9]$/.test(e.key)) input(+e.key);
      else if (["Backspace", "Delete", "0"].includes(e.key)) input(0);
      else if (e.key === "n") setNoteMode((m) => !m);
      else if (sel !== null) {
        const m = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[e.key];
        if (m) { e.preventDefault(); setSel((s) => Math.min(80, Math.max(0, s + m))); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const selVal = sel !== null ? vals[sel] : 0;
  return (
    <GameShell stats={[["Time", fmt(secs), true], ["Mistakes", mistakes], ["Hints", hints], ["Level", level]]} onRestart={() => newGame()}
      toolbar={<Pill options={[{ label: "Easy", value: "easy" }, { label: "Medium", value: "medium" }, { label: "Hard", value: "hard" }]} value={level} onChange={newGame} />}
      overlay={won && <Overlay tone="win" title="Sudoku solved!" actions={<button className="game-btn primary big" onClick={() => newGame()}>New puzzle</button>}><p>{fmt(secs)} · {mistakes} mistake{mistakes === 1 ? "" : "s"} · {hints} hint{hints === 1 ? "" : "s"}</p></Overlay>}
    >
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, min(44px, calc((100vw - 104px) / 9)))", background: "#e2e8f0", border: "3px solid #1e293b", borderRadius: 10, overflow: "hidden" }}>
          {vals.map((v, i) => {
            const r = Math.floor(i / 9), c = i % 9, given = !!game.puzzle[i];
            const related = sel !== null && (PEERS[sel].includes(i) || i === sel);
            const same = selVal && v === selVal;
            const bad = conflicts.has(i) || (v && !given && v !== game.solution[i]);
            return (
              <button key={i} onClick={() => setSel(i)} aria-label={`Row ${r + 1} column ${c + 1}${v ? ` ${v}` : ""}`}
                style={{ aspectRatio: "1", border: 0, padding: 0, cursor: "pointer", position: "relative", fontSize: "min(1.4rem, 5vw)", fontWeight: given ? 800 : 600,
                  borderRight: c % 3 === 2 && c < 8 ? "2px solid #1e293b" : "1px solid #cbd5e1", borderBottom: r % 3 === 2 && r < 8 ? "2px solid #1e293b" : "1px solid #cbd5e1",
                  background: i === sel ? "#fde047" : same ? "#c7d2fe" : related ? "#e0e7ff" : "#f8fafc", color: bad ? "#dc2626" : given ? "#0f172a" : "#4f46e5" }}>
                {v || (notes[i].size > 0 && (
                  <span style={{ position: "absolute", inset: 2, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", fontSize: "min(.55rem, 2vw)", color: "#64748b", lineHeight: 1 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n}>{notes[i].has(n) ? n : ""}</span>)}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
        <div style={{ display: "grid", gap: 10, width: "min(240px, 100%)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <button key={n} className="game-btn" style={{ height: 54, fontSize: "1.4rem" }} onClick={() => input(n)}>{n}</button>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <button className={`game-btn ${noteMode ? "primary" : ""}`} onClick={() => setNoteMode(!noteMode)} title="Notes (N)"><Pencil size={16} /></button>
            <button className="game-btn" onClick={() => input(0)} title="Erase"><Eraser size={16} /></button>
            <button className="game-btn" onClick={hint} title="Hint"><Lightbulb size={16} /></button>
          </div>
          <small style={{ color: "var(--g-muted)", textAlign: "center" }}>{noteMode ? "Notes mode on — numbers become pencil marks" : "Tip: press N for notes"}</small>
        </div>
      </div>
    </GameShell>
  );
}
