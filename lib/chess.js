// Minimal chess rules for puzzles: legal moves, check and checkmate (no castling / en passant needed).
// Board: 8×8 array, [0][0] = a8. Pieces: "wK", "bQ", … or null.

export function parseFen(fen) {
  const [place, side] = fen.split(" ");
  const b = place.split("/").map((row) => {
    const r = [];
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < +ch; i++) r.push(null);
      else r.push((ch === ch.toUpperCase() ? "w" : "b") + ch.toUpperCase());
    }
    return r;
  });
  return { b, side: side || "w" };
}

const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
const N = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const K = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const ROOK = [[-1, 0], [1, 0], [0, -1], [0, 1]], BISHOP = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

function pseudo(b, r, c) {
  const p = b[r][c]; if (!p) return [];
  const col = p[0], t = p[1], out = [];
  const add = (y, x) => { if (inside(y, x) && (!b[y][x] || b[y][x][0] !== col)) out.push([y, x]); };
  const slide = (dirs) => dirs.forEach(([dy, dx]) => { let y = r + dy, x = c + dx; while (inside(y, x)) { if (b[y][x]) { if (b[y][x][0] !== col) out.push([y, x]); break; } out.push([y, x]); y += dy; x += dx; } });
  if (t === "N") N.forEach(([dy, dx]) => add(r + dy, c + dx));
  if (t === "K") K.forEach(([dy, dx]) => add(r + dy, c + dx));
  if (t === "R") slide(ROOK);
  if (t === "B") slide(BISHOP);
  if (t === "Q") slide([...ROOK, ...BISHOP]);
  if (t === "P") {
    const d = col === "w" ? -1 : 1, start = col === "w" ? 6 : 1;
    if (inside(r + d, c) && !b[r + d][c]) { out.push([r + d, c]); if (r === start && !b[r + 2 * d][c]) out.push([r + 2 * d, c]); }
    for (const dc of [-1, 1]) if (inside(r + d, c + dc) && b[r + d][c + dc] && b[r + d][c + dc][0] !== col) out.push([r + d, c + dc]);
  }
  return out;
}

export function apply(b, [r, c], [y, x]) {
  const nb = b.map((row) => [...row]);
  let p = nb[r][c];
  if (p[1] === "P" && (y === 0 || y === 7)) p = p[0] + "Q"; // auto-promote to queen
  nb[y][x] = p; nb[r][c] = null;
  return nb;
}

export function attacked(b, r, c, by) {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const p = b[y][x];
    if (!p || p[0] !== by) continue;
    if (p[1] === "P") { const d = by === "w" ? -1 : 1; if (y + d === r && Math.abs(x - c) === 1) return true; continue; }
    if (pseudo(b, y, x).some(([yy, xx]) => yy === r && xx === c)) return true;
  }
  return false;
}
const kingOf = (b, col) => { for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (b[r][c] === col + "K") return [r, c]; return null; };
export const inCheck = (b, col) => { const k = kingOf(b, col); return k ? attacked(b, k[0], k[1], col === "w" ? "b" : "w") : false; };

export function legalMoves(b, r, c) {
  const p = b[r][c]; if (!p) return [];
  return pseudo(b, r, c).filter((to) => !inCheck(apply(b, [r, c], to), p[0]));
}
export function allMoves(b, col) {
  const out = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (b[r][c]?.[0] === col) legalMoves(b, r, c).forEach((to) => out.push([[r, c], to]));
  return out;
}
export const isMate = (b, col) => inCheck(b, col) && allMoves(b, col).length === 0;

export const sq = ([r, c]) => "abcdefgh"[c] + (8 - r);
export const GLYPH = { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" };
