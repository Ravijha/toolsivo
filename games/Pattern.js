"use client";
import { useEffect, useState } from "react";
import GameShell, { Overlay } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const QUESTIONS = 10;
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#0ea5e9", "#a855f7", "#ec4899"];
const SHAPES = ["circle", "square", "triangle", "diamond", "star", "hexagon"];

function Shape({ s, c, rot = 0, size = 46 }) {
  const p = { circle: <circle cx="25" cy="25" r="19" />, square: <rect x="7" y="7" width="36" height="36" rx="4" />, triangle: <polygon points="25,5 45,43 5,43" />,
    diamond: <polygon points="25,3 47,25 25,47 3,25" />, star: <polygon points="25,3 31,19 48,19 34,29 39,46 25,36 11,46 16,29 2,19 19,19" />, hexagon: <polygon points="13,5 37,5 48,25 37,45 13,45 2,25" />, arrow: <polygon points="25,3 45,25 33,25 33,47 17,47 17,25 5,25" /> }[s];
  return <svg viewBox="0 0 50 50" width={size} height={size} style={{ transform: `rotate(${rot}deg)`, fill: c, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.4))" }}>{p}</svg>;
}

function makeQuestion() {
  const t = ri(0, 6);
  if (t <= 3) { // number sequences
    let seq, kind;
    if (t === 0) { const a = ri(1, 20), d = ri(2, 12); seq = [0, 1, 2, 3, 4].map((i) => a + i * d); kind = `add ${d} each time`; }
    if (t === 1) { const a = ri(1, 4), r = ri(2, 3); seq = [0, 1, 2, 3, 4].map((i) => a * r ** i); kind = `multiply by ${r}`; }
    if (t === 2) { const o = ri(1, 5); seq = [0, 1, 2, 3, 4].map((i) => (i + o) ** 2); kind = "square numbers"; }
    if (t === 3) { const a = ri(1, 5), b = ri(2, 6); seq = [a, b]; while (seq.length < 5) seq.push(seq.at(-1) + seq.at(-2)); kind = "each number is the sum of the two before it"; }
    const answer = seq[4];
    const opts = new Set([answer]);
    while (opts.size < 4) opts.add(answer + ri(-12, 12) || answer + 1);
    return { type: "num", show: seq.slice(0, 4), answer: String(answer), options: shuffle([...opts].map(String)), why: kind };
  }
  if (t === 4) { // rotating shape
    // an arrow has no rotational symmetry, so every rotation looks different
    const s = "arrow", c = COLORS[ri(0, 5)], step = [45, 60, 90][ri(0, 2)];
    const show = [0, 1, 2, 3].map((i) => ({ s, c, rot: i * step }));
    const answer = { s, c, rot: 4 * step };
    const wrong = [{ s, c, rot: 5 * step }, { s, c, rot: 3 * step }, { s, c, rot: 4 * step + 180 }].filter((w) => ((w.rot - 4 * step) % 360 + 360) % 360 !== 0);
    while (wrong.length < 3) wrong.push({ s, c, rot: 4 * step + 90 * wrong.length + 30 });
    return { type: "shape", show, answer: JSON.stringify(answer), options: shuffle([answer, ...wrong].map((o) => JSON.stringify(o))), why: `rotates ${step}° each step` };
  }
  if (t === 5) { // colour + shape cycle
    const sh = shuffle(SHAPES).slice(0, 3), co = shuffle(COLORS).slice(0, 3);
    const seq = [0, 1, 2, 3, 4].map((i) => ({ s: sh[i % 3], c: co[i % 3], rot: 0 }));
    const answer = seq[4];
    const wrong = [{ s: sh[1], c: co[0], rot: 0 }, { s: sh[2], c: co[2], rot: 0 }, { s: sh[0], c: co[1], rot: 0 }];
    return { type: "shape", show: seq.slice(0, 4), answer: JSON.stringify(answer), options: shuffle([answer, ...wrong].map((o) => JSON.stringify(o))), why: "repeats every three" };
  }
  // symbol pattern like A B B A B B …
  const syms = shuffle(["▲", "●", "■", "★", "◆", "♥"]).slice(0, 3);
  const unit = [syms[0], syms[1], syms[1], syms[2]];
  const seq = [...unit, ...unit].slice(0, 7);
  const answer = unit[7 % 4];
  return { type: "sym", show: seq, answer, options: shuffle([...new Set([answer, ...syms, "✚"])].slice(0, 4)), why: `the block ${unit.join(" ")} repeats` };
}

export default function Pattern() {
  const [qs, setQs] = useState(() => Array.from({ length: QUESTIONS }, makeQuestion));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState(null);
  const [t0, setT0] = useState(Date.now());
  const done = i >= QUESTIONS;
  const q = qs[i];

  useEffect(() => { if (done) correct >= 7 ? sfx.win() : sfx.lose(); }, [done, correct]);
  const restart = () => { setQs(Array.from({ length: QUESTIONS }, makeQuestion)); setI(0); setScore(0); setCorrect(0); setPicked(null); setT0(Date.now()); };
  const choose = (o) => {
    if (picked) return;
    setPicked(o);
    const ok = o === q.answer;
    if (ok) { const secs = (Date.now() - t0) / 1000; setScore((s) => s + 100 + Math.max(0, Math.round(50 - secs * 5))); setCorrect((c) => c + 1); sfx.good(); } else sfx.bad();
    setTimeout(() => { setI((n) => n + 1); setPicked(null); setT0(Date.now()); }, ok ? 700 : 1700);
  };
  const render = (val, big) => {
    if (q.type === "shape") { const o = typeof val === "string" ? JSON.parse(val) : val; return <Shape {...o} size={big ? 54 : 46} />; }
    return <span style={{ fontSize: big ? "2rem" : "1.6rem", fontWeight: 800 }}>{val}</span>;
  };

  return (
    <GameShell stats={[["Score", score, true], ["Question", `${Math.min(i + 1, QUESTIONS)}/${QUESTIONS}`], ["Correct", correct]]} onRestart={restart}
      overlay={done && <Overlay tone={correct >= 7 ? "win" : "lose"} title={`${correct}/${QUESTIONS} correct`} actions={<button className="game-btn primary big" onClick={restart}>Play again</button>}><p>Score {score}. {correct >= 9 ? "Outstanding pattern spotting!" : correct >= 7 ? "Great logic skills." : "Keep practising — patterns get easier with time."}</p></Overlay>}>
      {q && (
        <div style={{ textAlign: "center", width: "100%" }}>
          <p style={{ color: "var(--g-muted)", fontWeight: 700 }}>What comes next?</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap", margin: "18px 0 26px" }}>
            {q.show.map((v, k) => <div key={k} style={{ minWidth: 70, height: 76, borderRadius: 16, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", display: "grid", placeItems: "center", padding: "0 10px" }}>{render(v, true)}</div>)}
            <div style={{ minWidth: 70, height: 76, borderRadius: 16, border: "2px dashed #a78bfa", display: "grid", placeItems: "center", fontSize: "2rem", fontWeight: 800, color: "#a78bfa" }}>?</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12, maxWidth: 560, margin: "0 auto" }}>
            {q.options.map((o) => {
              const state = picked && (o === q.answer ? "#16a34a" : o === picked ? "#dc2626" : null);
              return <button key={o} onClick={() => choose(o)} className="game-btn" style={{ height: 84, borderRadius: 18, background: state || undefined, border: state ? 0 : undefined }}>{render(o)}</button>;
            })}
          </div>
          <p style={{ minHeight: 28, marginTop: 16, color: picked === q.answer ? "#86efac" : "#fda4af", fontWeight: 700 }}>{picked ? (picked === q.answer ? "Correct!" : `The rule: ${q.why}`) : ""}</p>
        </div>
      )}
    </GameShell>
  );
}
