"use client";
import { useEffect, useState } from "react";
import GameShell, { Overlay, Pill } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const ICONS = ["🍎", "🚀", "🎸", "🐼", "🌵", "⚽", "🎈", "🦋", "🍕", "🌙", "🐙", "🎲", "🍉", "🦄"];
const deal = (pairs) => [...ICONS].sort(() => Math.random() - 0.5).slice(0, pairs).flatMap((e, i) => [{ id: i * 2, e }, { id: i * 2 + 1, e }]).sort(() => Math.random() - 0.5);
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function MemoryMatch() {
  const [pairs, setPairs] = useState(8);
  const [cards, setCards] = useState(() => deal(8));
  const [open, setOpen] = useState([]);
  const [done, setDone] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [start, setStart] = useState(null);
  const [now, setNow] = useState(0);
  const [best, setBest] = useState({});
  const won = done.size === cards.length;
  const secs = start ? Math.floor(((won ? now : now || Date.now()) - start) / 1000) : 0;

  useEffect(() => { if (!start || won) return; const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, [start, won]);
  useEffect(() => { if (won) { setNow(Date.now()); sfx.win(); setBest((b) => ({ ...b, [pairs]: Math.min(b[pairs] ?? Infinity, moves) })); } /* eslint-disable-next-line */ }, [won]);

  const reset = (p = pairs) => { setPairs(p); setCards(deal(p)); setOpen([]); setDone(new Set()); setMoves(0); setStart(null); setNow(0); };
  const flip = (i) => {
    if (open.length === 2 || open.includes(i) || done.has(cards[i].id)) return;
    if (!start) setStart(Date.now());
    const o = [...open, i]; setOpen(o); sfx.click();
    if (o.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = o;
      if (cards[a].e === cards[b].e) { setTimeout(() => { setDone((d) => new Set([...d, cards[a].id, cards[b].id])); setOpen([]); sfx.good(); }, 350); }
      else setTimeout(() => { setOpen([]); }, 800);
    }
  };
  const cols = pairs === 6 ? 4 : pairs === 8 ? 4 : 6;

  return (
    <GameShell stats={[["Moves", moves, true], ["Pairs", `${done.size / 2}/${pairs}`], ["Time", fmt(secs)], ["Best", best[pairs] ? `${best[pairs]} moves` : "—"]]} onRestart={() => reset()}
      toolbar={<Pill options={[{ label: "12 cards", value: 6 }, { label: "16 cards", value: 8 }, { label: "24 cards", value: 12 }]} value={pairs} onChange={reset} />}
      overlay={won && <Overlay tone="win" title="All pairs found!" actions={<button className="game-btn primary big" onClick={() => reset()}>Play again</button>}><p>{moves} moves in {fmt(secs)}. {moves <= pairs * 1.5 ? "Incredible memory!" : ""}</p></Overlay>}
    >
      <style>{`.mm-card{perspective:600px}.mm-in{position:relative;width:100%;height:100%;transition:transform .45s cubic-bezier(.2,.8,.2,1);transform-style:preserve-3d}.mm-card.up .mm-in{transform:rotateY(180deg)}.mm-f,.mm-b{position:absolute;inset:0;border-radius:16px;backface-visibility:hidden;display:grid;place-items:center}.mm-b{background:linear-gradient(135deg,#7c3aed,#ec4899);box-shadow:inset 0 2px 0 rgba(255,255,255,.25)}.mm-b::after{content:"?";color:rgba(255,255,255,.55);font-weight:900;font-size:1.6rem}.mm-f{transform:rotateY(180deg);background:#f8fafc;font-size:clamp(1.6rem,6vw,2.6rem)}.mm-card.done .mm-f{background:#bbf7d0;box-shadow:0 0 0 3px #22c55e}`}</style>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, min(86px, calc((100vw - ${96 + (cols - 1) * 10}px) / ${cols})))`, gap: 10 }}>
        {cards.map((c, i) => {
          const up = open.includes(i) || done.has(c.id);
          return (
            <button key={c.id} onClick={() => flip(i)} className={`mm-card ${up ? "up" : ""} ${done.has(c.id) ? "done" : ""}`} style={{ aspectRatio: "3 / 4", border: 0, padding: 0, background: "none", cursor: "pointer" }} aria-label={up ? c.e : "Hidden card"}>
              <div className="mm-in"><div className="mm-b" /><div className="mm-f">{c.e}</div></div>
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
