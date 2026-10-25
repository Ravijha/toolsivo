"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import GameShell, { Overlay, Pill, useSwipe, KEYDIR } from "@/components/GameShell";
import { sfx } from "@/lib/sfx";

const N = 20;
const V = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: "down", down: "up", left: "right", right: "left" };

export default function Snake() {
  const cv = useRef(null), stage = useRef(null);
  const g = useRef(null);
  const [phase, setPhase] = useState("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [speed, setSpeed] = useState(110);
  const [wrap, setWrap] = useState(false);

  const food = (snake) => { let f; do f = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; while (snake.some(([x, y]) => x === f[0] && y === f[1])); return f; };
  const start = () => {
    const snake = [[9, 10], [8, 10], [7, 10]];
    g.current = { snake, dir: "right", queue: [], food: food(snake), score: 0, grow: 0, t: 0 };
    setScore(0); setPhase("play");
  };
  const turn = (d) => {
    if (!g.current || phase !== "play") return;
    const q = g.current.queue, last = q.length ? q[q.length - 1] : g.current.dir;
    if (d !== last && d !== OPP[last] && q.length < 3) q.push(d);
  };

  useEffect(() => {
    const c = cv.current, size = Math.min(480, c.parentElement.clientWidth - 4), dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = size * dpr; c.height = size * dpr; c.style.width = c.style.height = `${size}px`;
    const x = c.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = size / N;
    const draw = () => {
      x.fillStyle = "#0b1020"; x.fillRect(0, 0, size, size);
      x.fillStyle = "rgba(255,255,255,.03)";
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) x.fillRect(i * s, j * s, s, s);
      const st = g.current; if (!st) return;
      const t = performance.now() / 300;
      x.fillStyle = "#f43f5e"; x.shadowColor = "#f43f5e"; x.shadowBlur = 16;
      x.beginPath(); x.arc((st.food[0] + 0.5) * s, (st.food[1] + 0.5) * s, s * (0.32 + Math.sin(t) * 0.05), 0, 7); x.fill(); x.shadowBlur = 0;
      st.snake.forEach(([a, b], i) => {
        const k = 1 - i / (st.snake.length + 4);
        x.fillStyle = `hsl(${150 - i * 2}, 80%, ${45 + k * 15}%)`;
        x.beginPath(); x.roundRect(a * s + 1.5, b * s + 1.5, s - 3, s - 3, s * 0.32); x.fill();
      });
      const [hx, hy] = st.snake[0], [dx, dy] = V[st.dir];
      x.fillStyle = "#0b1020";
      for (const side of [-1, 1]) { x.beginPath(); x.arc((hx + 0.5 + dx * 0.18 + dy * 0.2 * side) * s, (hy + 0.5 + dy * 0.18 + dx * 0.2 * side) * s, s * 0.09, 0, 7); x.fill(); }
    };
    let raf, last = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const st = g.current;
      if (phase === "play" && st && now - last >= speed) {
        last = now;
        if (st.queue.length) st.dir = st.queue.shift();
        const [dx, dy] = V[st.dir];
        let [hx, hy] = st.snake[0]; hx += dx; hy += dy;
        if (wrap) { hx = (hx + N) % N; hy = (hy + N) % N; }
        const hitWall = hx < 0 || hy < 0 || hx >= N || hy >= N;
        const hitSelf = st.snake.slice(0, -1).some(([a, b]) => a === hx && b === hy);
        if (hitWall || hitSelf) { setPhase("over"); setBest((b) => Math.max(b, st.score)); sfx.lose(); }
        else {
          st.snake.unshift([hx, hy]);
          if (hx === st.food[0] && hy === st.food[1]) { st.score += 10; st.grow += 1; st.food = food(st.snake); setScore(st.score); sfx.point(); }
          if (st.grow > 0) st.grow--; else st.snake.pop();
        }
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, speed, wrap]);

  useEffect(() => {
    const onKey = (e) => {
      const d = KEYDIR[e.key];
      if (d) { e.preventDefault(); turn(d); }
      if ((e.key === " " || e.key === "p") && (phase === "play" || phase === "pause")) { e.preventDefault(); setPhase((p) => (p === "play" ? "pause" : "play")); }
      if (e.key === "Enter" && phase !== "play") start();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  useSwipe(stage, turn);

  return (
    <GameShell stats={[["Score", score, true], ["Length", g.current?.snake.length ?? 3], ["Best", best]]} onRestart={start}
      toolbar={<>
        <Pill options={[{ label: "Slow", value: 150 }, { label: "Normal", value: 110 }, { label: "Fast", value: 70 }]} value={speed} onChange={setSpeed} />
        <Pill options={[{ label: "Walls", value: false }, { label: "Wrap", value: true }]} value={wrap} onChange={setWrap} />
      </>}
      overlay={phase !== "play" && (
        <Overlay tone={phase === "over" ? "lose" : ""} title={phase === "over" ? "Game over" : phase === "pause" ? "Paused" : "Snake"} actions={phase === "pause" ? <button className="game-btn primary big" onClick={() => setPhase("play")}>Resume</button> : <button className="game-btn primary big" onClick={start}>{phase === "over" ? "Play again" : "Start"}</button>}>
          <p>{phase === "over" ? `You scored ${score}.` : phase === "pause" ? "Press Space to resume." : "Arrow keys, WASD or swipe to steer. Eat the red food to grow!"}</p>
        </Overlay>
      )}
    >
      <div ref={stage} style={{ width: "100%", display: "grid", placeItems: "center" }}>
        <canvas ref={cv} aria-label="Snake game" />
        <div className="dpad touch-only">
          <button className="up" onClick={() => turn("up")} aria-label="Up"><ArrowUp /></button>
          <button className="left" onClick={() => turn("left")} aria-label="Left"><ArrowLeft /></button>
          <button className="down" onClick={() => turn("down")} aria-label="Down"><ArrowDown /></button>
          <button className="right" onClick={() => turn("right")} aria-label="Right"><ArrowRight /></button>
        </div>
      </div>
    </GameShell>
  );
}
