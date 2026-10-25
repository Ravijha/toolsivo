"use client";
import { useEffect, useState } from "react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

// Everyday vocabulary grouped by theme.
const WORDS = {
  Animals: ["ELEPHANT", "GIRAFFE", "KANGAROO", "PEACOCK", "DOLPHIN", "PENGUIN", "TORTOISE", "LEOPARD", "SQUIRREL", "CROCODILE", "BUTTERFLY", "RHINOCEROS"],
  Fruits: ["MANGO", "PINEAPPLE", "POMEGRANATE", "WATERMELON", "STRAWBERRY", "BANANA", "PAPAYA", "GUAVA", "BLUEBERRY", "APRICOT", "COCONUT", "LYCHEE"],
  Countries: ["INDIA", "BRAZIL", "CANADA", "JAPAN", "AUSTRALIA", "GERMANY", "EGYPT", "MEXICO", "NORWAY", "PORTUGAL", "SINGAPORE", "ARGENTINA"],
  Technology: ["KEYBOARD", "INTERNET", "SOFTWARE", "PASSWORD", "BLUETOOTH", "BROWSER", "DATABASE", "ALGORITHM", "SMARTPHONE", "PROCESSOR", "WEBSITE", "DOWNLOAD"],
  Sports: ["CRICKET", "FOOTBALL", "BADMINTON", "HOCKEY", "TENNIS", "KABADDI", "SWIMMING", "ARCHERY", "WRESTLING", "VOLLEYBALL", "MARATHON", "CYCLING"],
};
const MAX = 6;
const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export default function Hangman() {
  const [theme, setTheme] = useState("Animals");
  const [word, setWord] = useState(() => WORDS.Animals[Math.floor(Math.random() * WORDS.Animals.length)]);
  const [guessed, setGuessed] = useState(new Set());
  const [streak, setStreak] = useState(0);
  const [wins, setWins] = useState(0);
  const misses = [...guessed].filter((l) => !word.includes(l)).length;
  const won = [...word].every((l) => guessed.has(l));
  const lost = misses >= MAX && !won;

  const newWord = (t = theme) => { const list = WORDS[t]; let w; do w = list[Math.floor(Math.random() * list.length)]; while (w === word && list.length > 1); setWord(w); setGuessed(new Set()); };
  const guess = (l) => {
    if (won || lost || guessed.has(l)) return;
    setGuessed(new Set([...guessed, l]));
    word.includes(l) ? sfx.good() : sfx.bad();
  };
  useEffect(() => { if (won) { sfx.win(); setWins((w) => w + 1); setStreak((s) => s + 1); } if (lost) { sfx.lose(); setStreak(0); } /* eslint-disable-next-line */ }, [won, lost]);
  useEffect(() => {
    const onKey = (e) => { if (/^[a-z]$/i.test(e.key)) guess(e.key.toUpperCase()); if (e.key === "Enter" && (won || lost)) newWord(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const parts = [
    <circle key="h" cx="150" cy="78" r="18" />, <line key="b" x1="150" y1="96" x2="150" y2="150" />, <line key="la" x1="150" y1="110" x2="128" y2="132" />,
    <line key="ra" x1="150" y1="110" x2="172" y2="132" />, <line key="ll" x1="150" y1="150" x2="132" y2="182" />, <line key="rl" x1="150" y1="150" x2="168" y2="182" />,
  ];
  return (
    <GameShell stats={[["Lives", MAX - misses, true], ["Wins", wins], ["Streak", streak]]} onRestart={() => newWord()}
      toolbar={<Pill options={Object.keys(WORDS)} value={theme} onChange={(t) => { setTheme(t); newWord(t); }} />}
      overlay={(won || lost) && <Overlay tone={won ? "win" : "lose"} title={won ? "You got it!" : "Out of tries"} actions={<button className="game-btn primary big" onClick={() => newWord()}>Next word</button>}><p>The word was <b style={{ color: "#fff", letterSpacing: ".1em" }}>{word}</b>.</p></Overlay>}
    >
      <div style={{ display: "flex", gap: 24, alignItems: "center", justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
        <svg viewBox="0 0 220 220" width="200" height="200" style={{ stroke: "#e0e7ff", strokeWidth: 5, strokeLinecap: "round", fill: "none" }}>
          <line x1="20" y1="205" x2="200" y2="205" stroke="#a78bfa" /><line x1="60" y1="205" x2="60" y2="22" stroke="#a78bfa" /><line x1="60" y1="22" x2="150" y2="22" stroke="#a78bfa" /><line x1="150" y1="22" x2="150" y2="60" stroke="#a78bfa" />
          <g stroke={lost ? "#f87171" : "#f9a8d4"}>{parts.slice(0, misses)}</g>
        </svg>
        <div style={{ flex: "1 1 320px", maxWidth: 560, textAlign: "center" }}>
          <p style={{ color: "var(--g-muted)", fontWeight: 700 }}>Theme: {theme} · {word.length} letters</p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", margin: "16px 0 22px" }}>
            {[...word].map((l, i) => (
              <span key={i} style={{ width: "min(40px, 8vw)", height: 50, borderBottom: "4px solid #a78bfa", display: "grid", placeItems: "center", fontSize: "1.7rem", fontWeight: 800, color: guessed.has(l) ? "#fff" : lost ? "#f87171" : "transparent" }}>{guessed.has(l) || lost ? l : "_"}</span>
            ))}
          </div>
          {ROWS.map((row) => (
            <div key={row} style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 6 }}>
              {[...row].map((l) => {
                const used = guessed.has(l), good = used && word.includes(l);
                return <button key={l} onClick={() => guess(l)} disabled={used || won || lost} className="game-btn" style={{ width: "min(40px, calc((100vw - 142px) / 10))", minWidth: 0, padding: 0, background: used ? (good ? "#16a34a" : "rgba(239,68,68,.35)") : undefined, opacity: used && !good ? 0.55 : 1 }}>{l}</button>;
              })}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
