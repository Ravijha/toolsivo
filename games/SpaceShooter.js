"use client";
import { useEffect, useRef, useState } from "react";
import GameShell, { Overlay } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const W = 600, H = 560;

function wave(n) {
  const out = [], rows = Math.min(2 + Math.floor(n / 2), 5), cols = Math.min(5 + n, 9);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    out.push({ x: 60 + c * ((W - 120) / Math.max(1, cols - 1)), y: -40 - r * 50, ty: 60 + r * 46, hp: r === 0 && n > 2 ? 2 : 1, kind: r % 3, phase: Math.random() * 6 });
  return out;
}

export default function SpaceShooter() {
  const cv = useRef(null);
  const g = useRef(null);
  const keys = useRef({});
  const touch = useRef(false);
  const [phase, setPhase] = useState("idle");
  const [hud, setHud] = useState({ score: 0, lives: 3, wave: 1 });
  const [best, setBest] = useState(0);

  const start = () => {
    g.current = { x: W / 2, shots: [], enemies: wave(1), eshots: [], parts: [], stars: Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 2 + 0.5 })), score: 0, lives: 3, wave: 1, cool: 0, inv: 0, t: 0 };
    setHud({ score: 0, lives: 3, wave: 1 }); setPhase("play");
  };

  useEffect(() => {
    const c = cv.current, wpx = Math.min(W, c.parentElement.clientWidth - 4), k = wpx / W, dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = wpx * dpr; c.height = H * k * dpr; c.style.width = `${wpx}px`; c.style.height = `${H * k}px`;
    const x = c.getContext("2d"); x.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    const boom = (px, py, col) => { for (let i = 0; i < 14; i++) g.current.parts.push({ x: px, y: py, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 28, c: col }); };
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      x.fillStyle = "#03030c"; x.fillRect(0, 0, W, H);
      const st = g.current; if (!st) return;
      for (const s of st.stars) { s.y += s.s * (phase === "play" ? 1 : 0.3); if (s.y > H) { s.y = 0; s.x = Math.random() * W; } x.fillStyle = `rgba(255,255,255,${0.3 + s.s / 3})`; x.fillRect(s.x, s.y, s.s, s.s); }
      if (phase === "play") {
        st.t++;
        if (keys.current.left) st.x -= 7; if (keys.current.right) st.x += 7;
        st.x = Math.max(24, Math.min(W - 24, st.x));
        if (st.cool > 0) st.cool--;
        if ((keys.current.fire || touch.current) && st.cool === 0) { st.shots.push({ x: st.x, y: H - 70 }); st.cool = 11; sfx.hit(); }
        for (const s of st.shots) s.y -= 10;
        st.shots = st.shots.filter((s) => s.y > -20);
        const alive = st.enemies.filter((e) => e.hp > 0);
        for (const e of alive) {
          e.y += (e.ty - e.y) * 0.04;
          e.x += Math.sin(st.t / 40 + e.phase) * (0.6 + st.wave * 0.12);
          if (Math.random() < 0.0016 + st.wave * 0.0006) st.eshots.push({ x: e.x, y: e.y + 14, vy: 3.5 + st.wave * 0.25 });
          for (const s of st.shots) if (!s.hit && Math.abs(s.x - e.x) < 18 && Math.abs(s.y - e.y) < 14) {
            s.hit = true; e.hp--;
            if (e.hp <= 0) { st.score += 100 + st.wave * 10; boom(e.x, e.y, ["#f472b6", "#34d399", "#fbbf24"][e.kind]); sfx.point(); }
          }
        }
        st.shots = st.shots.filter((s) => !s.hit);
        for (const b of st.eshots) b.y += b.vy;
        st.eshots = st.eshots.filter((b) => b.y < H + 10);
        if (st.inv > 0) st.inv--;
        else for (const b of st.eshots) if (Math.abs(b.x - st.x) < 18 && Math.abs(b.y - (H - 50)) < 18) {
          b.y = H + 20; st.lives--; st.inv = 90; boom(st.x, H - 50, "#22d3ee"); sfx.bad();
          if (st.lives <= 0) { setPhase("over"); setBest((v) => Math.max(v, st.score)); sfx.lose(); }
          break;
        }
        if (st.enemies.every((e) => e.hp <= 0)) { st.wave++; st.enemies = wave(st.wave); st.eshots = []; sfx.win(); }
        if (st.t % 5 === 0) setHud({ score: st.score, lives: st.lives, wave: st.wave });
      }
      // enemies: three original drone designs
      for (const e of st.enemies) if (e.hp > 0) {
        const col = ["#f472b6", "#34d399", "#fbbf24"][e.kind];
        x.fillStyle = col; x.shadowColor = col; x.shadowBlur = 12;
        x.beginPath();
        if (e.kind === 0) { x.moveTo(e.x, e.y + 14); x.lineTo(e.x - 18, e.y - 8); x.lineTo(e.x, e.y - 2); x.lineTo(e.x + 18, e.y - 8); }
        else if (e.kind === 1) { x.ellipse(e.x, e.y, 18, 10, 0, 0, 7); }
        else { x.moveTo(e.x, e.y - 14); x.lineTo(e.x + 16, e.y); x.lineTo(e.x, e.y + 14); x.lineTo(e.x - 16, e.y); }
        x.fill(); x.shadowBlur = 0;
        x.fillStyle = "#0b0b1a"; x.beginPath(); x.arc(e.x, e.y, 4, 0, 7); x.fill();
        if (e.hp > 1) { x.strokeStyle = "#fff"; x.lineWidth = 2; x.beginPath(); x.arc(e.x, e.y, 22, 0, 7); x.stroke(); }
      }
      x.fillStyle = "#67e8f9"; for (const s of st.shots) x.fillRect(s.x - 2, s.y - 8, 4, 14);
      x.fillStyle = "#fb7185"; for (const b of st.eshots) { x.beginPath(); x.arc(b.x, b.y, 4, 0, 7); x.fill(); }
      st.parts = st.parts.filter((p) => p.life-- > 0);
      for (const p of st.parts) { p.x += p.vx; p.y += p.vy; x.globalAlpha = p.life / 28; x.fillStyle = p.c; x.fillRect(p.x, p.y, 3, 3); }
      x.globalAlpha = st.inv && Math.floor(st.inv / 6) % 2 ? 0.3 : 1;
      // player ship
      const sy = H - 50;
      x.fillStyle = "#22d3ee"; x.shadowColor = "#22d3ee"; x.shadowBlur = 16;
      x.beginPath(); x.moveTo(st.x, sy - 22); x.lineTo(st.x + 20, sy + 16); x.lineTo(st.x, sy + 8); x.lineTo(st.x - 20, sy + 16); x.fill();
      x.shadowBlur = 0; x.fillStyle = "#a855f7"; x.beginPath(); x.arc(st.x, sy - 2, 5, 0, 7); x.fill();
      x.fillStyle = `rgba(251,146,60,${0.6 + Math.random() * 0.4})`; x.beginPath(); x.moveTo(st.x - 6, sy + 10); x.lineTo(st.x, sy + 24 + Math.random() * 8); x.lineTo(st.x + 6, sy + 10); x.fill();
      x.globalAlpha = 1;
    };
    raf = requestAnimationFrame(loop);
    const move = (cx) => { const r = c.getBoundingClientRect(); if (g.current) g.current.x = ((cx - r.left) / r.width) * W; };
    const ts = (e) => { e.preventDefault(); touch.current = true; move(e.touches[0].clientX); };
    const tm = (e) => { e.preventDefault(); move(e.touches[0].clientX); };
    const te = () => { touch.current = false; };
    c.addEventListener("touchstart", ts, { passive: false }); c.addEventListener("touchmove", tm, { passive: false }); c.addEventListener("touchend", te);
    return () => { cancelAnimationFrame(raf); c.removeEventListener("touchstart", ts); c.removeEventListener("touchmove", tm); c.removeEventListener("touchend", te); };
  }, [phase]);

  useEffect(() => {
    const set = (v) => (e) => {
      const kk = e.key;
      if (["ArrowLeft", "a", "A"].includes(kk)) keys.current.left = v;
      if (["ArrowRight", "d", "D"].includes(kk)) keys.current.right = v;
      if (kk === " ") { e.preventDefault(); keys.current.fire = v; if (v && phase !== "play") start(); }
    };
    const d = set(true), u = set(false);
    window.addEventListener("keydown", d); window.addEventListener("keyup", u);
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  });

  return (
    <GameShell stats={[["Score", hud.score, true], ["Shields", "◆".repeat(Math.max(0, hud.lives)) || "—"], ["Wave", hud.wave], ["Best", best]]} onRestart={start}
      overlay={phase !== "play" && (
        <Overlay tone={phase === "over" ? "lose" : ""} title={phase === "over" ? "Ship destroyed" : "Space Shooter"} actions={<button className="game-btn primary big" onClick={start}>{phase === "over" ? "Fly again" : "Launch"}</button>}>
          <p>{phase === "over" ? `Score ${hud.score} · reached wave ${hud.wave}.` : "← → or A/D to move, hold Space to fire. On touch screens, drag to move — firing is automatic."}</p>
        </Overlay>
      )}
    >
      <canvas ref={cv} aria-label="Space shooter game" />
    </GameShell>
  );
}
