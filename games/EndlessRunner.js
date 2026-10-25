"use client";
import { useEffect, useRef, useState } from "react";
import GameShell, { Overlay } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const W = 760, H = 300, GROUND = 250;

export default function EndlessRunner() {
  const cv = useRef(null);
  const g = useRef(null);
  const [phase, setPhase] = useState("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [coins, setCoins] = useState(0);

  const start = () => {
    g.current = { y: 0, vy: 0, jumps: 0, duck: false, speed: 6, dist: 0, obs: [], coins: [], next: 60, coinNext: 90, score: 0, coinCount: 0, t: 0 };
    setScore(0); setCoins(0); setPhase("play");
  };
  const jump = () => {
    const st = g.current;
    if (phase !== "play") return;
    if (st.jumps < 2) { st.vy = st.jumps ? 9 : 11.5; st.jumps++; sfx.click(); }
  };

  useEffect(() => {
    const c = cv.current, wpx = Math.min(W, c.parentElement.clientWidth - 4), k = wpx / W, dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = wpx * dpr; c.height = H * k * dpr; c.style.width = `${wpx}px`; c.style.height = `${H * k}px`;
    const x = c.getContext("2d"); x.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const st = g.current, t = (st?.t || 0);
      // sky + parallax hills
      const sky = x.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#1e1b4b"); sky.addColorStop(1, "#7c3aed");
      x.fillStyle = sky; x.fillRect(0, 0, W, H);
      x.fillStyle = "rgba(255,255,255,.7)"; for (let i = 0; i < 30; i++) x.fillRect((i * 97 - t * 0.2) % W + (i * 97 - t * 0.2 < 0 ? W : 0), (i * 53) % 140, 2, 2);
      x.fillStyle = "#4c1d95"; x.beginPath(); x.moveTo(0, GROUND);
      for (let i = 0; i <= W; i += 20) x.lineTo(i, GROUND - 40 - Math.sin((i + t * 0.6) / 70) * 22); x.lineTo(W, GROUND); x.fill();
      x.fillStyle = "#1e1b4b"; x.fillRect(0, GROUND, W, H - GROUND);
      x.strokeStyle = "#a78bfa"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, GROUND); x.lineTo(W, GROUND); x.stroke();
      x.strokeStyle = "rgba(167,139,250,.35)"; for (let i = 0; i < W + 40; i += 40) { const px = i - (t * (st?.speed || 6)) % 40; x.beginPath(); x.moveTo(px, GROUND + 8); x.lineTo(px - 20, H); x.stroke(); }
      if (!st) return;

      if (phase === "play") {
        st.t++; st.dist += st.speed; st.speed = Math.min(15, 6 + st.dist / 2500);
        st.vy -= 0.6; st.y = Math.max(0, st.y + st.vy); if (st.y === 0) { st.jumps = 0; st.vy = 0; }
        if (--st.next <= 0) {
          const fly = st.dist > 1500 && Math.random() < 0.35;
          st.obs.push(fly ? { x: W + 20, y: GROUND - 62 - Math.random() * 10, w: 38, h: 18, fly: true } : { x: W + 20, y: GROUND - 34 - (Math.random() < 0.3 ? 18 : 0), w: 28 + Math.random() * 18, h: 0 });
          const o = st.obs[st.obs.length - 1]; if (!o.fly) o.h = GROUND - o.y;
          st.next = 50 + Math.random() * 60 - st.speed * 1.5;
        }
        if (--st.coinNext <= 0) { st.coins.push({ x: W + 20, y: GROUND - 40 - Math.random() * 90 }); st.coinNext = 60 + Math.random() * 80; }
        const ph = st.duck && st.y === 0 ? 26 : 46, px = 90, py = GROUND - st.y - ph;
        for (const o of st.obs) {
          o.x -= st.speed;
          if (px + 26 > o.x + 4 && px + 4 < o.x + o.w - 4 && py + ph > o.y + 4 && py < o.y + o.h) {
            setPhase("over"); setBest((b) => Math.max(b, st.score)); sfx.lose();
          }
        }
        for (const cn of st.coins) {
          cn.x -= st.speed;
          if (!cn.got && Math.abs(cn.x - (px + 15)) < 22 && Math.abs(cn.y - (py + ph / 2)) < 30) { cn.got = true; st.coinCount++; st.score += 50; setCoins(st.coinCount); sfx.point(); }
        }
        st.obs = st.obs.filter((o) => o.x > -60); st.coins = st.coins.filter((cn) => cn.x > -30 && !cn.got);
        st.score += 1; if (st.t % 6 === 0) setScore(st.score);
      }
      // coins
      for (const cn of st.coins) { x.fillStyle = "#facc15"; x.shadowColor = "#facc15"; x.shadowBlur = 10; x.beginPath(); x.ellipse(cn.x, cn.y, 8 * Math.abs(Math.cos(st.t / 8)) + 2, 9, 0, 0, 7); x.fill(); }
      x.shadowBlur = 0;
      // obstacles: crates and flying drones (original art)
      for (const o of st.obs) {
        if (o.fly) {
          x.fillStyle = "#f43f5e"; x.beginPath(); x.roundRect(o.x, o.y, o.w, o.h, 8); x.fill();
          x.fillStyle = "#fde68a"; x.fillRect(o.x + 6, o.y + 6, 6, 6);
          x.strokeStyle = "#fecdd3"; x.lineWidth = 2; const sp = st.t % 6 < 3 ? 14 : 8;
          x.beginPath(); x.moveTo(o.x + o.w / 2 - sp, o.y - 4); x.lineTo(o.x + o.w / 2 + sp, o.y - 4); x.stroke();
        } else {
          x.fillStyle = "#f97316"; x.fillRect(o.x, o.y, o.w, o.h);
          x.strokeStyle = "#7c2d12"; x.lineWidth = 3; x.strokeRect(o.x + 1.5, o.y + 1.5, o.w - 3, o.h - 3);
          x.beginPath(); x.moveTo(o.x, o.y); x.lineTo(o.x + o.w, o.y + o.h); x.stroke();
        }
      }
      // the robot runner
      const ducking = st.duck && st.y === 0, ph = ducking ? 26 : 46, px = 90, py = GROUND - st.y - ph, leg = st.y ? 0 : Math.sin(st.t / 3) * 6;
      x.fillStyle = "#22d3ee"; x.beginPath(); x.roundRect(px, py, 30, ph - 10, 8); x.fill();
      x.fillStyle = "#0e7490"; x.beginPath(); x.roundRect(px + 6, py + 6, 18, 10, 4); x.fill();
      x.fillStyle = "#f0abfc"; x.fillRect(px + 16, py + 9, 5, 4);
      x.strokeStyle = "#22d3ee"; x.lineWidth = 5; x.lineCap = "round";
      x.beginPath(); x.moveTo(px + 9, py + ph - 10); x.lineTo(px + 9 + leg, py + ph); x.moveTo(px + 21, py + ph - 10); x.lineTo(px + 21 - leg, py + ph); x.stroke();
      x.strokeStyle = "#a5f3fc"; x.lineWidth = 2; x.beginPath(); x.moveTo(px + 15, py); x.lineTo(px + 15, py - 8); x.stroke();
      x.fillStyle = "#f472b6"; x.beginPath(); x.arc(px + 15, py - 9, 3, 0, 7); x.fill();
    };
    raf = requestAnimationFrame(loop);
    const tap = (e) => { e.preventDefault(); phase === "play" ? jump() : null; };
    c.addEventListener("touchstart", tap, { passive: false }); c.addEventListener("mousedown", tap);
    return () => { cancelAnimationFrame(raf); c.removeEventListener("touchstart", tap); c.removeEventListener("mousedown", tap); };
  }, [phase]);

  useEffect(() => {
    const down = (e) => {
      if ([" ", "ArrowUp", "w"].includes(e.key)) { e.preventDefault(); phase === "play" ? jump() : start(); }
      if (["ArrowDown", "s"].includes(e.key) && g.current) { e.preventDefault(); g.current.duck = true; }
    };
    const up = (e) => { if (["ArrowDown", "s"].includes(e.key) && g.current) g.current.duck = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  });

  return (
    <GameShell stats={[["Score", score, true], ["Coins", coins], ["Best", best]]} onRestart={start}
      overlay={phase !== "play" && (
        <Overlay tone={phase === "over" ? "lose" : ""} title={phase === "over" ? "Crashed!" : "Endless Runner"} actions={<button className="game-btn primary big" onClick={start}>{phase === "over" ? "Run again" : "Start running"}</button>}>
          <p>{phase === "over" ? `Score ${score} · ${coins} coins collected.` : "Space / ↑ / tap to jump (twice for a double jump). ↓ to duck under drones."}</p>
        </Overlay>
      )}
    >
      <canvas ref={cv} aria-label="Endless runner game" />
    </GameShell>
  );
}
