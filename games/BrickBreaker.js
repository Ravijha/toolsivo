"use client";
import { useEffect, useRef, useState } from "react";
import GameShell, { Overlay } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const W = 640, H = 460, PW = 96, PH = 12, BR = 7;
const COLORS = ["#f43f5e", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#8b5cf6"];

function bricksFor(level) {
  const rows = Math.min(4 + level, 8), cols = 10, bw = (W - 40) / cols, out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    // a few different layouts so levels feel distinct
    if (level % 3 === 2 && (r + c) % 2) continue;
    if (level % 3 === 0 && level > 0 && Math.abs(c - 4.5) < r * 0.5 - 1) continue;
    const hp = r < Math.floor(level / 2) ? 2 : 1;
    out.push({ x: 20 + c * bw + 2, y: 50 + r * 24, w: bw - 4, h: 18, hp, max: hp, color: COLORS[r % COLORS.length] });
  }
  return out;
}

export default function BrickBreaker() {
  const cv = useRef(null);
  const g = useRef(null);
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1 });
  const [phase, setPhase] = useState("idle");
  const [best, setBest] = useState(0);
  const keys = useRef({});

  const newGame = () => { g.current = { px: W / 2, ball: null, bricks: bricksFor(0), score: 0, lives: 3, level: 0, parts: [] }; setHud({ score: 0, lives: 3, level: 1 }); setPhase("ready"); };
  const launch = () => {
    const st = g.current; if (!st || st.ball) return;
    const sp = 5 + st.level * 0.5, a = (-Math.PI / 2) + (Math.random() - 0.5) * 0.8;
    st.ball = { x: st.px, y: H - 40, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp };
    setPhase("play");
  };

  useEffect(() => {
    const c = cv.current, wpx = Math.min(W, c.parentElement.clientWidth - 4), k = wpx / W, dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = wpx * dpr; c.height = H * k * dpr; c.style.width = `${wpx}px`; c.style.height = `${H * k}px`;
    const x = c.getContext("2d"); x.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const st = g.current;
      const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#120c2e"); bg.addColorStop(1, "#05050f");
      x.fillStyle = bg; x.fillRect(0, 0, W, H);
      if (!st) return;
      if (keys.current.left) st.px -= 9; if (keys.current.right) st.px += 9;
      st.px = Math.max(PW / 2, Math.min(W - PW / 2, st.px));
      const b = st.ball;
      if (phase === "play" && b) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < BR || b.x > W - BR) { b.vx *= -1; b.x = Math.max(BR, Math.min(W - BR, b.x)); sfx.hit(); }
        if (b.y < BR) { b.vy = Math.abs(b.vy); sfx.hit(); }
        // paddle: bounce angle depends on where the ball hits
        if (b.vy > 0 && b.y > H - 34 - BR && b.y < H - 20 && Math.abs(b.x - st.px) < PW / 2 + BR) {
          const rel = (b.x - st.px) / (PW / 2), sp = Math.hypot(b.vx, b.vy) * 1.01, ang = -Math.PI / 2 + rel * 1.05;
          b.vx = Math.cos(ang) * sp; b.vy = Math.sin(ang) * sp; sfx.click();
        }
        for (const br of st.bricks) {
          if (br.hp <= 0) continue;
          if (b.x + BR > br.x && b.x - BR < br.x + br.w && b.y + BR > br.y && b.y - BR < br.y + br.h) {
            const ox = Math.min(b.x + BR - br.x, br.x + br.w - (b.x - BR)), oy = Math.min(b.y + BR - br.y, br.y + br.h - (b.y - BR));
            ox < oy ? (b.vx *= -1) : (b.vy *= -1);
            br.hp--; st.score += br.hp ? 5 : 10; sfx.point();
            if (!br.hp) for (let i = 0; i < 8; i++) st.parts.push({ x: br.x + br.w / 2, y: br.y + br.h / 2, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 30, c: br.color });
            setHud((h) => ({ ...h, score: st.score }));
            break;
          }
        }
        if (b.y > H + 20) {
          st.lives--; st.ball = null; setHud((h) => ({ ...h, lives: st.lives })); sfx.bad();
          if (st.lives <= 0) { setPhase("over"); setBest((v) => Math.max(v, st.score)); sfx.lose(); } else setPhase("ready");
        }
        if (st.bricks.every((br) => br.hp <= 0)) {
          st.level++; st.bricks = bricksFor(st.level); st.ball = null; setHud((h) => ({ ...h, level: st.level + 1 })); setPhase("ready"); sfx.win();
        }
      }
      for (const br of st.bricks) if (br.hp > 0) {
        x.fillStyle = br.color; x.globalAlpha = br.hp < br.max ? 0.55 : 1;
        x.beginPath(); x.roundRect(br.x, br.y, br.w, br.h, 5); x.fill();
        x.fillStyle = "rgba(255,255,255,.25)"; x.fillRect(br.x + 3, br.y + 2, br.w - 6, 3); x.globalAlpha = 1;
      }
      st.parts = st.parts.filter((p) => p.life-- > 0);
      for (const p of st.parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.15; x.globalAlpha = p.life / 30; x.fillStyle = p.c; x.fillRect(p.x, p.y, 4, 4); }
      x.globalAlpha = 1;
      const pg = x.createLinearGradient(st.px - PW / 2, 0, st.px + PW / 2, 0); pg.addColorStop(0, "#22d3ee"); pg.addColorStop(1, "#a855f7");
      x.fillStyle = pg; x.shadowColor = "#a855f7"; x.shadowBlur = 14; x.beginPath(); x.roundRect(st.px - PW / 2, H - 32, PW, PH, 6); x.fill();
      const bx = b ? b.x : st.px, by = b ? b.y : H - 32 - BR - 1;
      x.fillStyle = "#fff"; x.shadowColor = "#fff"; x.beginPath(); x.arc(bx, by, BR, 0, 7); x.fill(); x.shadowBlur = 0;
    };
    raf = requestAnimationFrame(loop);
    const toGame = (cx) => { const r = c.getBoundingClientRect(); if (g.current) g.current.px = ((cx - r.left) / r.width) * W; };
    const mm = (e) => toGame(e.clientX), tm = (e) => { e.preventDefault(); toGame(e.touches[0].clientX); };
    const td = (e) => { tm(e); if (phase === "ready") launch(); };
    c.addEventListener("mousemove", mm); c.addEventListener("touchmove", tm, { passive: false }); c.addEventListener("touchstart", td, { passive: false });
    const ck = () => phase === "ready" && launch();
    c.addEventListener("click", ck);
    return () => { cancelAnimationFrame(raf); c.removeEventListener("mousemove", mm); c.removeEventListener("touchmove", tm); c.removeEventListener("touchstart", td); c.removeEventListener("click", ck); };
  }, [phase]);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = true;
      if (e.key === " ") { e.preventDefault(); phase === "ready" ? launch() : phase === "play" ? setPhase("pause") : phase === "pause" && setPhase("play"); }
    };
    const up = (e) => { if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = false; if (e.key === "ArrowRight" || e.key === "d") keys.current.right = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  });

  return (
    <GameShell stats={[["Score", hud.score, true], ["Lives", "♥".repeat(Math.max(0, hud.lives)) || "—"], ["Level", hud.level], ["Best", best]]} onRestart={newGame}
      overlay={(phase === "idle" || phase === "over" || phase === "pause") && (
        <Overlay tone={phase === "over" ? "lose" : ""} title={phase === "over" ? "Game over" : phase === "pause" ? "Paused" : "Brick Breaker"}
          actions={phase === "pause" ? <button className="game-btn primary big" onClick={() => setPhase("play")}>Resume</button> : <button className="game-btn primary big" onClick={newGame}>{phase === "over" ? "Play again" : "Start"}</button>}>
          <p>{phase === "over" ? `Final score ${hud.score} — you reached level ${hud.level}.` : phase === "pause" ? "Press Space to continue." : "Move the paddle with your mouse, finger or arrow keys. Press Space or tap to launch."}</p>
        </Overlay>
      )}
    >
      <div style={{ width: "100%", display: "grid", placeItems: "center" }}>
        <canvas ref={cv} style={{ cursor: "none" }} aria-label="Brick breaker game" />
        {phase === "ready" && <p style={{ color: "var(--g-muted)", marginTop: 10, fontWeight: 700 }}>Press Space or tap to launch</p>}
      </div>
    </GameShell>
  );
}
