"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCheck, Eye, Shuffle } from "lucide-react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

// Original clues written for Toolsivo.
const SETS = {
  "Around the house": [["KITCHEN", "Room where meals are cooked"], ["PILLOW", "Soft thing for your head in bed"], ["WINDOW", "Glass opening in a wall"], ["MIRROR", "It shows your reflection"], ["CURTAIN", "Fabric that covers a window"], ["BUCKET", "Pail for carrying water"], ["SOFA", "Comfy seat for two or three people"], ["LAMP", "Gives light on a desk"], ["CLOCK", "It tells the time on the wall"], ["DOOR", "You open it to enter a room"], ["TOWEL", "Used to dry yourself"], ["BROOM", "Sweeps the floor"]],
  "Nature": [["MOUNTAIN", "Very high natural land"], ["RIVER", "Flowing water that reaches the sea"], ["FOREST", "Large area full of trees"], ["DESERT", "Dry, sandy region"], ["ISLAND", "Land with water all around"], ["THUNDER", "Loud sound after lightning"], ["RAINBOW", "Seven-coloured arc in the sky"], ["VALLEY", "Low land between hills"], ["OCEAN", "The largest bodies of salt water"], ["CLOUD", "White puff in the sky"], ["LEAF", "Green part of a plant"], ["STORM", "Strong wind and heavy rain"]],
  "Food & kitchen": [["TOMATO", "Red fruit used like a vegetable"], ["ONION", "It can make you cry when you chop it"], ["GINGER", "Spicy root often added to tea"], ["PEPPER", "Black spice from a shaker"], ["BUTTER", "Yellow spread made from cream"], ["PLATE", "You eat your meal from it"], ["SPOON", "Used to eat soup"], ["RICE", "Small white grains, a staple food"], ["HONEY", "Sweet syrup made by bees"], ["LEMON", "Sour yellow citrus fruit"], ["OVEN", "Used to bake a cake"], ["SUGAR", "Sweetener in many desserts"]],
  "School days": [["TEACHER", "Person who helps students learn"], ["PENCIL", "Writing tool with an eraser"], ["LIBRARY", "Room full of books to borrow"], ["HOMEWORK", "Tasks to finish after school"], ["SCIENCE", "Subject with experiments"], ["ERASER", "It rubs out mistakes"], ["RULER", "Used to draw straight lines"], ["EXAM", "Test at the end of a term"], ["CHALK", "Writes on a blackboard"], ["BELL", "Rings when class is over"], ["MATHS", "Subject with numbers and sums"], ["DESK", "Table where a student sits"]],
  "Travel": [["AIRPORT", "Where planes take off and land"], ["TICKET", "Pass you need to board"], ["PASSPORT", "Booklet for international travel"], ["LUGGAGE", "Bags and suitcases"], ["TRAIN", "It runs on rails"], ["HOTEL", "Place to stay for the night"], ["MAP", "Shows roads and places"], ["BEACH", "Sandy shore by the sea"], ["CAMERA", "Takes holiday photos"], ["PILOT", "Person who flies a plane"], ["JOURNEY", "A trip from one place to another"], ["TAXI", "Car you hire for a ride"]],
};

function build(list) {
  let best = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const words = [...list].sort((a, b) => b[0].length - a[0].length + (attempt ? Math.random() - 0.5 : 0) * 4);
    const G = new Map(), key = (r, c) => `${r},${c}`, placed = [];
    const get = (r, c) => G.get(key(r, c));
    const canPlace = (w, r, c, dr, dc) => {
      if (get(r - dr, c - dc) || get(r + dr * w.length, c + dc * w.length)) return -1;
      let cross = 0;
      for (let i = 0; i < w.length; i++) {
        const y = r + dr * i, x = c + dc * i, cell = get(y, x);
        if (cell) { if (cell.ch !== w[i] || cell.dirs.has(dr ? "d" : "a")) return -1; cross++; }
        else if (get(y + dc, x + dr) || get(y - dc, x - dr)) return -1;
      }
      return cross;
    };
    const place = (w, clue, r, c, dr, dc) => {
      for (let i = 0; i < w.length; i++) {
        const k = key(r + dr * i, c + dc * i);
        const cell = G.get(k) || { ch: w[i], dirs: new Set() };
        cell.dirs.add(dr ? "d" : "a"); G.set(k, cell);
      }
      placed.push({ w, clue, r, c, dir: dr ? "down" : "across" });
    };
    place(words[0][0], words[0][1], 0, 0, 0, 1);
    for (const [w, clue] of words.slice(1)) {
      let bestPos = null;
      for (const p of placed) for (let i = 0; i < p.w.length; i++) for (let j = 0; j < w.length; j++) {
        if (p.w[i] !== w[j]) continue;
        const [pr, pc] = p.dir === "across" ? [p.r, p.c + i] : [p.r + i, p.c];
        const [dr, dc] = p.dir === "across" ? [1, 0] : [0, 1];
        const r = pr - dr * j, c = pc - dc * j, score = canPlace(w, r, c, dr, dc);
        if (score > 0 && (!bestPos || score > bestPos.score)) bestPos = { r, c, dr, dc, score };
      }
      if (bestPos) place(w, clue, bestPos.r, bestPos.c, bestPos.dr, bestPos.dc);
    }
    // Prefer layouts that place every word, then the most compact (narrow grids fit phones).
    const ks = [...G.keys()].map((k) => k.split(",").map(Number));
    const span = (i) => Math.max(...ks.map((x) => x[i])) - Math.min(...ks.map((x) => x[i])) + 1;
    const score = placed.length * 1000 - Math.min(span(0), span(1)) * 20 - span(0) * span(1) / 10;
    if (!best || score > best.score) best = { placed, G, score };
  }
  let cells = [...best.G.entries()].map(([k, v]) => [...k.split(",").map(Number), v.ch]);
  let placedWords = best.placed;
  const spanOf = (i) => Math.max(...cells.map((x) => x[i])) - Math.min(...cells.map((x) => x[i]));
  if (spanOf(1) > spanOf(0)) { // turn wide grids on their side: across becomes down
    cells = cells.map(([r, c, ch]) => [c, r, ch]);
    placedWords = placedWords.map((p) => ({ ...p, r: p.c, c: p.r, dir: p.dir === "across" ? "down" : "across" }));
  }
  const minR = Math.min(...cells.map((x) => x[0])), minC = Math.min(...cells.map((x) => x[1]));
  const rows = Math.max(...cells.map((x) => x[0])) - minR + 1, cols = Math.max(...cells.map((x) => x[1])) - minC + 1;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (const [r, c, ch] of cells) grid[r - minR][c - minC] = ch;
  const words = placedWords.map((p) => ({ ...p, r: p.r - minR, c: p.c - minC }));
  // numbering in reading order
  const starts = [...new Set(words.map((w) => `${w.r},${w.c}`))].map((s) => s.split(",").map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const num = {}; starts.forEach(([r, c], i) => (num[`${r},${c}`] = i + 1));
  words.forEach((w) => (w.n = num[`${w.r},${w.c}`]));
  words.sort((a, b) => a.n - b.n);
  return { grid, rows, cols, words, num };
}

export default function Crossword() {
  const names = Object.keys(SETS);
  const [set, setSet] = useState(names[0]);
  const [seed, setSeed] = useState(0);
  const puzzle = useMemo(() => build(SETS[set]), [set, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [fill, setFill] = useState({});
  const [cur, setCur] = useState(null);
  const [dir, setDir] = useState("across");
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const refs = useRef({});

  useEffect(() => { setFill({}); setCur(null); setChecked(false); setRevealed(0); }, [puzzle]);
  const { grid, rows, cols, words, num } = puzzle;
  const k = (r, c) => `${r},${c}`;
  const isCell = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols && grid[r][c];
  const wordAt = (r, c, d) => words.find((w) => w.dir === d && (d === "across" ? w.r === r && c >= w.c && c < w.c + w.w.length : w.c === c && r >= w.r && r < w.r + w.w.length));
  const active = cur && (wordAt(cur[0], cur[1], dir) || wordAt(cur[0], cur[1], dir === "across" ? "down" : "across"));
  const inActive = (r, c) => active && (active.dir === "across" ? r === active.r && c >= active.c && c < active.c + active.w.length : c === active.c && r >= active.r && r < active.r + active.w.length);
  const complete = Object.keys(num).length && grid.every((row, r) => row.every((ch, c) => !ch || fill[k(r, c)] === ch));

  useEffect(() => { if (complete) sfx.win(); }, [complete]);
  const focus = (r, c) => { setCur([r, c]); refs.current[k(r, c)]?.focus(); };
  const select = (r, c) => {
    if (cur && cur[0] === r && cur[1] === c) setDir((d) => (wordAt(r, c, d === "across" ? "down" : "across") ? (d === "across" ? "down" : "across") : d));
    else if (!wordAt(r, c, dir)) setDir(dir === "across" ? "down" : "across");
    focus(r, c);
  };
  const step = (r, c, delta) => { const [dr, dc] = (active?.dir || dir) === "across" ? [0, delta] : [delta, 0]; if (isCell(r + dr, c + dc)) focus(r + dr, c + dc); };
  const onKey = (e, r, c) => {
    const L = e.key.toUpperCase();
    if (/^[A-Z]$/.test(L)) { e.preventDefault(); setFill((f) => ({ ...f, [k(r, c)]: L })); setChecked(false); sfx.click(); step(r, c, 1); }
    else if (e.key === "Backspace") { e.preventDefault(); if (fill[k(r, c)]) setFill((f) => ({ ...f, [k(r, c)]: "" })); else step(r, c, -1); }
    else if (e.key === " ") { e.preventDefault(); select(r, c); }
    else { const m = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[e.key]; if (m) { e.preventDefault(); setDir(m[0] ? "down" : "across"); if (isCell(r + m[0], c + m[1])) focus(r + m[0], c + m[1]); } }
  };
  const reveal = (all) => {
    if (all) { const f = {}; grid.forEach((row, r) => row.forEach((ch, c) => ch && (f[k(r, c)] = ch))); setFill(f); setRevealed(99); return; }
    if (!cur) return;
    setFill((f) => ({ ...f, [k(cur[0], cur[1])]: grid[cur[0]][cur[1]] })); setRevealed((n) => n + 1); step(cur[0], cur[1], 1);
  };
  const size = Math.max(26, Math.min(40, Math.floor(560 / Math.max(cols, 1))));

  return (
    <GameShell
      stats={[["Words", words.length, true], ["Filled", `${Object.values(fill).filter(Boolean).length}/${grid.flat().filter(Boolean).length}`], ["Hints used", revealed >= 99 ? "all" : revealed]]}
      onRestart={() => { setFill({}); setChecked(false); setRevealed(0); }}
      toolbar={<>
        <Pill options={names} value={set} onChange={(s) => { setSet(s); setSeed((x) => x + 1); }} />
        <button className="game-btn" onClick={() => setChecked(true)}><CheckCheck size={16} /> Check</button>
        <button className="game-btn" onClick={() => reveal(false)} disabled={!cur}><Eye size={16} /> Letter</button>
        <button className="game-btn" onClick={() => setSeed((x) => x + 1)} title="Rearrange the grid"><Shuffle size={16} /></button>
      </>}
      overlay={complete && <Overlay tone="win" title="Crossword complete!" actions={<><button className="game-btn primary big" onClick={() => { const i = names.indexOf(set); setSet(names[(i + 1) % names.length]); setSeed((x) => x + 1); }}>Next puzzle</button></>}><p>{revealed ? `Solved with ${revealed >= 99 ? "the answers revealed" : `${revealed} revealed letter${revealed > 1 ? "s" : ""}`}.` : "Solved without any hints — superb!"}</p></Overlay>}
    >
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", width: "100%" }}>
        <div style={{ overflowX: "auto", maxWidth: "100%" }}>
          <div style={{ "--s": `max(22px, min(${size}px, calc((100vw - 112px) / ${cols} - 2px)))`, display: "grid", gridTemplateColumns: `repeat(${cols}, var(--s))`, gap: 2 }}>
            {grid.map((row, r) => row.map((ch, c) => {
              if (!ch) return <div key={k(r, c)} style={{ width: "var(--s)", height: "var(--s)" }} />;
              const val = fill[k(r, c)] || "", wrong = checked && val && val !== ch, isCur = cur && cur[0] === r && cur[1] === c;
              return (
                <div key={k(r, c)} style={{ position: "relative", width: "var(--s)", height: "var(--s)" }}>
                  {num[k(r, c)] && <small style={{ position: "absolute", left: 2, top: 0, fontSize: 9, fontWeight: 800, color: "#475569", pointerEvents: "none", zIndex: 1 }}>{num[k(r, c)]}</small>}
                  <input ref={(el) => (refs.current[k(r, c)] = el)} value={val} onKeyDown={(e) => onKey(e, r, c)} onClick={() => select(r, c)} inputMode="text" aria-label={`Row ${r + 1} column ${c + 1}`}
                    onChange={(e) => { const L = e.currentTarget.value.slice(-1).toUpperCase(); if (/^[A-Z]$/.test(L)) onKey({ key: L, preventDefault() {} }, r, c); }}
                    style={{ width: "100%", height: "100%", border: 0, borderRadius: 5, textAlign: "center", fontWeight: 800, fontSize: "calc(var(--s) * .5)", paddingTop: 4, textTransform: "uppercase", outline: "none", caretColor: "transparent", cursor: "pointer",
                      color: wrong ? "#dc2626" : "#111827", background: isCur ? "#fde047" : inActive(r, c) ? "#c7d2fe" : wrong ? "#fee2e2" : "#f8fafc" }} />
                </div>
              );
            }))}
          </div>
        </div>
        <div style={{ flex: "1 1 260px", maxWidth: 380, display: "grid", gap: 14, maxHeight: 460, overflowY: "auto" }}>
          {["across", "down"].map((d) => (
            <div key={d}>
              <div style={{ fontSize: ".75rem", fontWeight: 800, letterSpacing: ".12em", color: "var(--g-muted)", marginBottom: 6 }}>{d.toUpperCase()}</div>
              {words.filter((w) => w.dir === d).map((w) => {
                const on = active === w, done = [...w.w].every((ch, i) => fill[k(w.r + (d === "down" ? i : 0), w.c + (d === "across" ? i : 0))] === ch);
                return (
                  <button key={`${d}${w.n}`} onClick={() => { setDir(d); focus(w.r, w.c); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 10, border: 0, cursor: "pointer", marginBottom: 2, background: on ? "rgba(167,139,250,.25)" : "transparent", color: done ? "#86efac" : "#e0e7ff", textDecoration: done ? "line-through" : "none", fontSize: ".9rem" }}>
                    <b>{w.n}.</b> {w.clue} <span style={{ color: "var(--g-muted)" }}>({w.w.length})</span>
                  </button>
                );
              })}
            </div>
          ))}
          <button className="game-btn" onClick={() => reveal(true)}>Reveal all answers</button>
        </div>
      </div>
    </GameShell>
  );
}
