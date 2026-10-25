"use client";
import { useEffect, useRef, useState } from "react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { beep, sfx } from "@/lib/sfx";

const PADS = [
  { c: "#22c55e", on: "#86efac", f: 392 }, { c: "#ef4444", on: "#fca5a5", f: 330 },
  { c: "#eab308", on: "#fde68a", f: 262 }, { c: "#3b82f6", on: "#93c5fd", f: 523 },
];

export default function MemorySequence() {
  const [seq, setSeq] = useState([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | show | input | over
  const [lit, setLit] = useState(null);
  const [best, setBest] = useState(0);
  const [strict, setStrict] = useState(true);
  const [retried, setRetried] = useState(false);
  const timers = useRef([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);

  const flash = (i, ms = 380) => { setLit(i); beep(PADS[i].f, ms / 1000, "triangle", 0.09); timers.current.push(setTimeout(() => setLit(null), ms)); };
  const play = (s) => {
    setPhase("show"); setStep(0);
    const speed = Math.max(220, 620 - s.length * 25);
    s.forEach((p, k) => timers.current.push(setTimeout(() => flash(p, speed * 0.7), 600 + k * speed)));
    timers.current.push(setTimeout(() => setPhase("input"), 600 + s.length * speed));
  };
  const start = () => { clear(); const s = [Math.floor(Math.random() * 4)]; setSeq(s); setRetried(false); play(s); };
  const press = (i) => {
    if (phase !== "input") return;
    flash(i, 220);
    if (seq[step] !== i) {
      if (!strict && !retried) { setRetried(true); sfx.bad(); timers.current.push(setTimeout(() => play(seq), 500)); return; }
      setPhase("over"); sfx.lose(); setBest((b) => Math.max(b, seq.length - 1)); return;
    }
    if (step + 1 === seq.length) {
      setBest((b) => Math.max(b, seq.length));
      const next = [...seq, Math.floor(Math.random() * 4)];
      setSeq(next); setPhase("show");
      timers.current.push(setTimeout(() => play(next), 700));
    } else setStep(step + 1);
  };
  useEffect(() => {
    const onKey = (e) => { const k = "1234".indexOf(e.key); if (k >= 0) press(k); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const level = Math.max(0, seq.length - (phase === "over" ? 1 : 0));
  return (
    <GameShell stats={[["Level", level, true], ["Best", best], ["Mode", strict ? "Strict" : "1 retry"]]} onRestart={start}
      toolbar={<Pill options={[{ label: "Strict", value: true }, { label: "Allow 1 retry", value: false }]} value={strict} onChange={(v) => { setStrict(v); clear(); setPhase("idle"); setSeq([]); }} />}
      overlay={(phase === "idle" || phase === "over") && (
        <Overlay tone={phase === "over" ? "lose" : ""} title={phase === "over" ? `Game over — level ${seq.length - 1}` : "Memory Sequence"} actions={<button className="game-btn primary big" onClick={start}>{phase === "over" ? "Play again" : "Start"}</button>}>
          <p>{phase === "over" ? "The sequence was one step too long this time." : "Watch the pads, then repeat the pattern. It grows every round."}</p>
        </Overlay>
      )}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--g-muted)", fontWeight: 800, marginBottom: 16, letterSpacing: ".06em" }}>{phase === "show" ? "WATCH…" : phase === "input" ? `YOUR TURN · ${step}/${seq.length}` : " "}</p>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(2, min(150px, calc((100vw - 150px) / 2)))", gap: 14, padding: 14, borderRadius: "50%", background: "#0b0b1a", boxShadow: "0 0 0 8px rgba(255,255,255,.05)" }}>
          {PADS.map((p, i) => (
            <button key={i} onPointerDown={() => press(i)} aria-label={`Pad ${i + 1}`}
              style={{ aspectRatio: "1", border: 0, cursor: phase === "input" ? "pointer" : "default", background: lit === i ? p.on : p.c, boxShadow: lit === i ? `0 0 40px ${p.on}` : "inset 0 -6px 0 rgba(0,0,0,.25)",
                borderRadius: ["100% 12px 12px 12px", "12px 100% 12px 12px", "12px 12px 12px 100%", "12px 12px 100% 12px"][i], transition: "background .08s, box-shadow .08s", opacity: phase === "show" && lit !== i ? 0.75 : 1 }} />
          ))}
          <div style={{ position: "absolute", inset: "35%", borderRadius: "50%", background: "#0b0b1a", display: "grid", placeItems: "center", fontWeight: 900, fontSize: "1.6rem", boxShadow: "0 0 0 6px rgba(255,255,255,.06)", pointerEvents: "none" }}>{level || ""}</div>
        </div>
        <p style={{ color: "var(--g-muted)", fontSize: ".82rem", marginTop: 14 }}>Keyboard: 1 2 / 3 4</p>
      </div>
    </GameShell>
  );
}
