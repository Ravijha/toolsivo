"use client";
import { useEffect, useRef, useState } from "react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { WORDS } from "@/lib/typingText";
import { sfx } from "@/lib/sfx";

const POOLS = { easy: WORDS.easy, medium: [...WORDS.easy, ...WORDS.intermediate], hard: [...WORDS.intermediate, ...WORDS.advanced] };
const pick = (pool, prev) => { let w; do w = pool[Math.floor(Math.random() * pool.length)]; while (w === prev && pool.length > 1); return w; };

export default function TypingChallenge() {
  const [level, setLevel] = useState("medium");
  const [phase, setPhase] = useState("idle");
  const [word, setWord] = useState("");
  const [nextW, setNextW] = useState("");
  const [input, setInput] = useState("");
  const [time, setTime] = useState(30);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({ ok: 0, bad: 0, chars: 0 });
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState(null);
  const field = useRef(null);

  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => setTime((s) => { if (s <= 0.1) { clearInterval(t); setPhase("over"); sfx.lose(); return 0; } return +(s - 0.1).toFixed(1); }), 100);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => { if (phase === "over") setBest((b) => Math.max(b, score)); }, [phase, score]);

  const start = () => {
    const pool = POOLS[level], w = pick(pool);
    setWord(w); setNextW(pick(pool, w)); setInput(""); setTime(30); setScore(0); setCombo(0); setStats({ ok: 0, bad: 0, chars: 0 }); setPhase("play");
    setTimeout(() => field.current?.focus(), 30);
  };
  const submit = () => {
    if (!input.trim()) return;
    const ok = input.trim() === word;
    if (ok) {
      const c = combo + 1, mult = 1 + Math.floor(c / 5) * 0.5;
      setScore((s) => s + Math.round(word.length * 10 * mult)); setCombo(c); setTime((t) => Math.min(60, +(t + 1 + word.length * 0.15).toFixed(1)));
      setStats((s) => ({ ...s, ok: s.ok + 1, chars: s.chars + word.length })); sfx.point();
    } else { setCombo(0); setStats((s) => ({ ...s, bad: s.bad + 1 })); sfx.bad(); }
    setFlash(ok ? "ok" : "bad"); setTimeout(() => setFlash(null), 250);
    setWord(nextW); setNextW(pick(POOLS[level], nextW)); setInput("");
  };
  const onKey = (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); submit(); } };

  const mult = 1 + Math.floor(combo / 5) * 0.5;
  return (
    <GameShell stats={[["Score", score, true], ["Time", `${time.toFixed(1)}s`], ["Combo", `${combo} ×${mult}`], ["Best", best]]} onRestart={start}
      toolbar={<Pill options={[{ label: "Easy", value: "easy" }, { label: "Medium", value: "medium" }, { label: "Hard", value: "hard" }]} value={level} onChange={(l) => { setLevel(l); setPhase("idle"); }} />}
      overlay={phase !== "play" && (
        <Overlay tone={phase === "over" ? "win" : ""} title={phase === "over" ? `Score: ${score}` : "Typing Challenge"} actions={<button className="game-btn primary big" onClick={start}>{phase === "over" ? "Play again" : "Start"}</button>}>
          <p>{phase === "over" ? `${stats.ok} words correct, ${stats.bad} mistakes · ${stats.ok + stats.bad ? Math.round((stats.ok / (stats.ok + stats.bad)) * 100) : 0}% accuracy` : "Type each word and press Space. Correct words add time — every 5 in a row boosts your multiplier!"}</p>
        </Overlay>
      )}
    >
      <div style={{ textAlign: "center", width: "100%", maxWidth: 560 }}>
        <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(time / 60) * 100}%`, background: time < 8 ? "#ef4444" : "linear-gradient(90deg,#22d3ee,#a855f7)", transition: "width .1s linear" }} />
        </div>
        <div style={{ fontSize: "clamp(2.4rem, 8vw, 3.6rem)", fontWeight: 800, margin: "30px 0 4px", letterSpacing: ".02em", fontFamily: "var(--mono)", color: flash === "bad" ? "#f87171" : flash === "ok" ? "#4ade80" : "#fff", transition: "color .15s" }}>
          {[...word].map((ch, i) => <span key={i} style={{ color: i < input.length ? (input[i] === ch ? "#4ade80" : "#f87171") : undefined }}>{ch}</span>)}
        </div>
        <p style={{ color: "var(--g-muted)", fontFamily: "var(--mono)" }}>next: {nextW}</p>
        <input ref={field} value={input} onChange={(e) => setInput(e.target.value.replace(/\s/g, ""))} onKeyDown={onKey} disabled={phase !== "play"} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} onPaste={(e) => e.preventDefault()}
          style={{ marginTop: 22, width: "100%", height: 58, borderRadius: 16, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: "1.5rem", textAlign: "center", fontFamily: "var(--mono)", outline: "none" }} aria-label="Type the word" />
      </div>
    </GameShell>
  );
}
