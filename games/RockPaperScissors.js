"use client";
import { useState } from "react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const MOVES = { rock: { e: "✊", beats: "scissors" }, paper: { e: "✋", beats: "rock" }, scissors: { e: "✌️", beats: "paper" } };
const KEYS = Object.keys(MOVES);
const counter = (m) => KEYS.find((k) => MOVES[k].beats === m);

// Smart mode: predict the player's next move from what they usually play after their previous move.
function predict(history) {
  if (history.length < 3) return KEYS[Math.floor(Math.random() * 3)];
  const last = history[history.length - 1], counts = { rock: 0, paper: 0, scissors: 0 };
  for (let i = 0; i < history.length - 1; i++) if (history[i] === last) counts[history[i + 1]]++;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const guess = total ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] : history.reduce((a, m) => (history.filter((x) => x === m).length > history.filter((x) => x === a).length ? m : a), history[0]);
  return Math.random() < 0.15 ? KEYS[Math.floor(Math.random() * 3)] : counter(guess);
}

export default function RockPaperScissors() {
  const [mode, setMode] = useState("smart");
  const [match, setMatch] = useState("bo5");
  const [score, setScore] = useState({ you: 0, cpu: 0, draw: 0 });
  const [hist, setHist] = useState([]);
  const [last, setLast] = useState(null);
  const [shaking, setShaking] = useState(false);
  const target = match === "bo5" ? 3 : Infinity;
  const over = score.you >= target || score.cpu >= target;

  const play = (m) => {
    if (shaking || over) return;
    setShaking(true); setLast(null); sfx.click();
    setTimeout(() => {
      const cpu = mode === "smart" ? predict(hist) : KEYS[Math.floor(Math.random() * 3)];
      const res = m === cpu ? "draw" : MOVES[m].beats === cpu ? "win" : "lose";
      setHist((h) => [...h, m]);
      setScore((s) => ({ ...s, [res === "win" ? "you" : res === "lose" ? "cpu" : "draw"]: s[res === "win" ? "you" : res === "lose" ? "cpu" : "draw"] + 1 }));
      setLast({ m, cpu, res });
      setShaking(false);
      res === "win" ? sfx.good() : res === "lose" ? sfx.bad() : sfx.click();
    }, 650);
  };
  const reset = () => { setScore({ you: 0, cpu: 0, draw: 0 }); setLast(null); setHist([]); };
  const hand = (e, flip, active) => <div style={{ fontSize: "clamp(4rem, 12vw, 6.5rem)", transform: `${flip ? "scaleX(-1)" : ""}`, animation: active ? "rpsShake .65s ease-in-out" : "pop .3s", lineHeight: 1 }}>{e}</div>;

  return (
    <GameShell
      stats={[["You", score.you, true], ["Computer", score.cpu], ["Draws", score.draw], ["Played", hist.length]]}
      onRestart={reset}
      toolbar={<>
        <Pill options={[{ label: "Smart AI", value: "smart" }, { label: "Random", value: "random" }]} value={mode} onChange={(m) => { setMode(m); reset(); }} />
        <Pill options={[{ label: "Best of 5", value: "bo5" }, { label: "Free play", value: "free" }]} value={match} onChange={(m) => { setMatch(m); reset(); }} />
      </>}
      overlay={over && (
        <Overlay tone={score.you > score.cpu ? "win" : "lose"} title={score.you > score.cpu ? "You won the match!" : "Computer wins the match"} actions={<button className="game-btn primary big" onClick={reset}>Play again</button>}>
          <p>Final score {score.you} – {score.cpu}{mode === "smart" && score.cpu > score.you ? ". The smart AI spotted a pattern in your moves!" : ""}</p>
        </Overlay>
      )}
    >
      <style>{`@keyframes rpsShake{0%,100%{transform:translateY(0)}20%,60%{transform:translateY(-22px) rotate(-8deg)}40%,80%{transform:translateY(6px)}}`}</style>
      <div style={{ textAlign: "center", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "clamp(20px, 8vw, 80px)", minHeight: 150 }}>
          <div><small style={{ color: "var(--g-muted)", fontWeight: 800 }}>YOU</small>{hand(shaking ? "✊" : last ? MOVES[last.m].e : "❔", false, shaking)}</div>
          <b style={{ fontSize: "1.4rem", color: "var(--g-muted)" }}>VS</b>
          <div><small style={{ color: "var(--g-muted)", fontWeight: 800 }}>COMPUTER</small>{hand(shaking ? "✊" : last ? MOVES[last.cpu].e : "❔", true, shaking)}</div>
        </div>
        <p style={{ fontSize: "1.5rem", fontWeight: 800, minHeight: 40, marginTop: 6, color: last?.res === "win" ? "#86efac" : last?.res === "lose" ? "#fda4af" : "#e0e7ff" }}>
          {shaking ? "Rock… paper… scissors…" : last ? (last.res === "win" ? "You win this round!" : last.res === "lose" ? "Computer wins this round" : "Draw!") : "Choose your move"}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
          {KEYS.map((k) => (
            <button key={k} onClick={() => play(k)} disabled={shaking || over} className="game-btn" style={{ height: 96, width: 110, flexDirection: "column", fontSize: "2.4rem", borderRadius: 20 }}>
              {MOVES[k].e}<small style={{ fontSize: ".8rem", textTransform: "capitalize" }}>{k}</small>
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
