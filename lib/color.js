export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s / 100);
  l = clamp(l / 100);
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
}

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const rgbToHex = (r, g, b) => "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");

export function hexToHsl(hex) {
  let [r, g, b] = hexToRgb(hex).map((x) => x / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const textOn = (hex) => (luminance(hex) > 0.42 ? "#111111" : "#ffffff");

const rnd = (a, b) => a + Math.random() * (b - a);

/** Generate n colours following a harmony rule. `locked` is an array of hex|null to keep. */
export function harmony(mode, n = 5) {
  const h = rnd(0, 360);
  const s = rnd(55, 85), l = rnd(45, 62);
  switch (mode) {
    case "analogous":
      return Array.from({ length: n }, (_, i) => hslToHex(h + (i - 2) * 22, s + rnd(-8, 8), l + (i - 2) * 6));
    case "complementary":
      return [hslToHex(h, s, l - 18), hslToHex(h, s, l), hslToHex(h, s - 25, 90), hslToHex(h + 180, s, l), hslToHex(h + 180, s, l - 18)];
    case "triadic":
      return [hslToHex(h, s, l), hslToHex(h + 120, s, l), hslToHex(h + 240, s, l), hslToHex(h, s - 30, 92), hslToHex(h + 120, s - 10, 25)];
    case "monochrome":
      return Array.from({ length: n }, (_, i) => hslToHex(h, s, 20 + i * 16));
    case "pastel":
      return Array.from({ length: n }, (_, i) => hslToHex(h + i * 55 + rnd(-10, 10), rnd(55, 75), rnd(80, 88)));
    default: {
      // "random" but pleasing: golden-angle hue spacing with gentle lightness spread
      return Array.from({ length: n }, (_, i) => hslToHex(h + i * 137.5, rnd(45, 85), rnd(35, 75)));
    }
  }
}

/** k-means on sampled pixels → k dominant colours (sorted by frequency). */
export function extractPalette(img, k = 5) {
  const S = 120;
  const r = Math.min(1, S / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * r));
  c.height = Math.max(1, Math.round(img.naturalHeight * r));
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const px = [];
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) px.push([d[i], d[i + 1], d[i + 2]]);
  if (!px.length) return [];
  let cent = Array.from({ length: k }, (_, i) => px[Math.floor(((i + 0.5) / k) * px.length)].slice());
  let counts = [];
  for (let it = 0; it < 12; it++) {
    const sums = cent.map(() => [0, 0, 0]);
    counts = cent.map(() => 0);
    for (const p of px) {
      let best = 0, bd = Infinity;
      for (let j = 0; j < cent.length; j++) {
        const dd = (p[0] - cent[j][0]) ** 2 + (p[1] - cent[j][1]) ** 2 + (p[2] - cent[j][2]) ** 2;
        if (dd < bd) { bd = dd; best = j; }
      }
      sums[best][0] += p[0]; sums[best][1] += p[1]; sums[best][2] += p[2];
      counts[best]++;
    }
    cent = cent.map((c0, j) => (counts[j] ? sums[j].map((v) => v / counts[j]) : c0));
  }
  return cent.map((c0, j) => ({ hex: rgbToHex(...c0), n: counts[j] })).sort((a, b) => b.n - a.n).map((x) => x.hex);
}
