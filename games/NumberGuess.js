"use client";
import { useRef, useState } from "react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const RANGES = { 100: 100, 500: 500, 1000: 1000 };

export default function NumberGuess() {
  const [max, setMax] = useState(100);
  const [secret, setSecret] = useState(() => 1 + Math.floor(Math.random() * 100));
  const [guess, setGuess] = useState("");
  const [hist, setHist] = useState([]);
  const [lo, setLo] = useState(1);
  const [hi, setHi] = useState(100);
  const [best, setBest] = useState(null);
  const [won, setWon] = useState(false);
  const input = useRef(null);
  const optimal = Math.ceil(Math.log2(max + 1));

  const start = (m = max) => { setMax(m); setSecret(1 + Math.floor(Math.random() * m)); setHist([]); setLo(1); setHi(m); setGuess(""); setWon(false); setTimeout(() => input.current?.focus(), 0); };
  const submit = (e) => {
    e?.preventDefault();
    const g = Math.round(+guess);
    if (!g || g < 1 || g > max || won) return;
    const diff = Math.abs(g - secret);
    const res = g === secret ? "correct" : g < secret ? "higher" : "lower";
    setHist((h) => [{ g, res, heat: 1 - diff / max }, ...h]);
    if (res === "higher") setLo((l) => Math.max(l, g + 1));
    if (res === "lower") setHi((h) => Math.min(h, g - 1));
    if (res === "correct") { setWon(true); sfx.win(); setBest((b) => (b === null ? hist.length + 1 : Math.min(b, hist.length + 1))); }
    else (diff / max < 0.05 ? sfx.good : sfx.click)();
    setGuess("");
  };
  const heat = hist[0] && !won ? hist[0].heat : won ? 1 : 0;
  const heatLabel = !hist[0] ? "Make your first guess" : won ? "Got it!" : heat > 0.97 ? "🔥 Burning hot!" : heat > 0.9 ? "Hot" : heat > 0.75 ? "Warm" : heat > 0.5 ? "Cool" : "❄️ Cold";

  return (
    <GameShell
      stats={[["Guesses", hist.length, true], ["Range", `${lo}–${hi}`], ["Best", best ?? "—"], ["Perfect play", `≤ ${optimal}`]]}
      onRestart={() => start()}
      toolbar={<Pill options={Object.keys(RANGES).map((k) => ({ label: `1–${k}`, value: +k }))} value={max} onChange={(m) => start(m)} />}
      overlay={won && (
        <Overlay tone="win" title={`It was ${secret}!`} actions={<button className="game-btn primary big" onClick={() => start()}>Play again</button>}>
          <p>You found it in <b style={{ color: "#fff" }}>{hist.length}</b> guess{hist.length > 1 ? "es" : ""}. {hist.length <= optimal ? "That’s optimal play — brilliant!" : `With binary search you can always do it in ${optimal}.`}</p>
        </Overlay>
      )}
    >
      <div style={{ width: "100%", maxWidth: 520, textAlign: "center" }}>
        <p style={{ color: "var(--g-muted)" }}>I’m thinking of a number between <b style={{ color: "#fff" }}>1</b> and <b style={{ color: "#fff" }}>{max}</b>.</p>
        <form onSubmit={submit} style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <input ref={input} type="number" inputMode="numeric" min={1} max={max} value={guess} onChange={(e) => setGuess(e.target.value)} autoFocus placeholder="Your guess"
            style={{ flex: 1, minWidth: 0, height: 58, borderRadius: 16, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)", color: "#fff", fontSize: "1.6rem", fontWeight: 800, textAlign: "center", outline: "none" }} />
          <button className="game-btn primary big" type="submit" style={{ height: 58 }}>Guess</button>
        </form>
        <div style={{ marginTop: 20 }}>
          <div style={{ height: 14, borderRadius: 99, background: "linear-gradient(90deg, #38bdf8, #a78bfa, #f472b6, #f97316, #ef4444)", position: "relative" }}>
            <span style={{ position: "absolute", top: -6, left: `calc(${heat * 100}% - 13px)`, width: 26, height: 26, borderRadius: "50%", background: "#fff", boxShadow: "0 0 0 4px rgba(255,255,255,.25), 0 4px 10px rgba(0,0,0,.4)", transition: "left .5s cubic-bezier(.2,.9,.3,1.2)" }} />
          </div>
          <p style={{ marginTop: 14, fontWeight: 800, fontSize: "1.2rem" }}>{heatLabel}</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 16 }}>
          {hist.map((h, i) => (
            <span key={hist.length - i} style={{ padding: "6px 12px", borderRadius: 99, fontWeight: 700, background: h.res === "correct" ? "#16a34a" : "rgba(255,255,255,.08)", animation: i === 0 ? "pop .3s" : "none" }}>
              {h.g} {h.res === "higher" ? "↑" : h.res === "lower" ? "↓" : "✓"}
            </span>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
