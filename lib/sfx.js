// Tiny synthesised sound effects (Web Audio) — no audio files, nothing to license.
let ctx = null;
let muted = false;

export const setMuted = (m) => { muted = m; };
export const isMuted = () => muted;

export function beep(freq = 440, dur = 0.08, type = "sine", vol = 0.08) {
  if (muted || typeof window === "undefined") return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  } catch {}
}

export const sfx = {
  click: () => beep(520, 0.05, "triangle", 0.06),
  good: () => { beep(660, 0.08, "sine"); setTimeout(() => beep(880, 0.1, "sine"), 70); },
  bad: () => beep(160, 0.18, "sawtooth", 0.05),
  hit: () => beep(300, 0.05, "square", 0.04),
  point: () => beep(980, 0.06, "sine", 0.05),
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.14, "triangle", 0.08), i * 110)),
  lose: () => [392, 330, 262].forEach((f, i) => setTimeout(() => beep(f, 0.18, "sawtooth", 0.05), i * 140)),
};
