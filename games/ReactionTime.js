"use client";
import { useEffect, useRef, useState } from "react";
import GameShell from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const ROUNDS = 5;
const grade = (ms) => (ms < 200 ? ["Lightning fast ⚡", "#4ade80"] : ms < 250 ? ["Excellent", "#4ade80"] : ms < 300 ? ["Above average", "#a3e635"] : ms < 380 ? ["Average", "#facc15"] : ["Keep practising", "#fb923c"]);

export default function ReactionTime() {
  const [phase, setPhase] = useState("idle"); // idle | wait | go | early | result | done
  const [times, setTimes] = useState([]);
  const [last, setLast] = useState(null);
  const [best, setBest] = useState(null);
  const t0 = useRef(0), timer = useRef(null);

  const arm = () => {
    setPhase("wait");
    timer.current = setTimeout(() => { t0.current = performance.now(); setPhase("go"); sfx.point(); }, 1200 + Math.random() * 2800);
  };
  const hit = () => {
    if (phase === "idle" || phase === "done") { setTimes([]); setLast(null); return arm(); }
    if (phase === "wait") { clearTimeout(timer.current); setPhase("early"); sfx.bad(); return; }
    if (phase === "early" || phase === "result") return arm();
    if (phase === "go") {
      const ms = Math.round(performance.now() - t0.current);
      const next = [...times, ms];
      setTimes(next); setLast(ms); sfx.good();
      setBest((b) => (b === null ? ms : Math.min(b, ms)));
      setPhase(next.length >= ROUNDS ? "done" : "result");
    }
  };
  useEffect(() => {
    const onKey = (e) => { if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); hit(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  useEffect(() => () => clearTimeout(timer.current), []);

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
  const look = {
    idle: ["#4c1d95", "Reaction Time Test", "Click or press Space to start"],
    wait: ["#b91c1c", "Wait for green…", "Don’t click yet!"],
    go: ["#16a34a", "CLICK!", ""],
    early: ["#ea580c", "Too soon!", "Click to try this round again"],
    result: ["#1d4ed8", `${last} ms`, `Round ${times.length} of ${ROUNDS} — click to continue`],
    done: ["#6d28d9", `${avg} ms average`, `${grade(avg || 0)[0]} — click to play again`],
  }[phase];

  return (
    <GameShell stats={[["Average", avg ? `${avg} ms` : "—", true], ["Round", `${Math.min(times.length + (phase === "go" || phase === "wait" ? 1 : 0), ROUNDS)}/${ROUNDS}`], ["Best", best ? `${best} ms` : "—"]]} onRestart={() => { clearTimeout(timer.current); setPhase("idle"); setTimes([]); setLast(null); }}>
      <button onPointerDown={hit} style={{ width: "100%", minHeight: 340, border: 0, borderRadius: 16, cursor: "pointer", background: `radial-gradient(circle at 50% 40%, ${look[0]}, #0b0b1a 120%)`, color: "#fff", transition: "background .12s", userSelect: "none" }}>
        <div style={{ fontSize: "clamp(2rem, 7vw, 3.6rem)", fontWeight: 800, letterSpacing: "-.03em" }}>{look[1]}</div>
        <div style={{ opacity: 0.85, marginTop: 8, fontWeight: 600 }}>{look[2]}</div>
        {times.length > 0 && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
            {times.map((t, i) => <span key={i} style={{ padding: "5px 12px", borderRadius: 99, background: "rgba(255,255,255,.15)", fontWeight: 700 }}>{t} ms</span>)}
          </div>
        )}
        {phase === "done" && <div style={{ marginTop: 14, color: grade(avg)[1], fontWeight: 800 }}>Typical human reaction time is about 250 ms.</div>}
      </button>
    </GameShell>
  );
}
