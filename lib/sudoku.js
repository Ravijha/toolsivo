// Sudoku generator and solver. Grids are flat arrays of 81 numbers (0 = empty).
const rowOf = (i) => Math.floor(i / 9), colOf = (i) => i % 9, boxOf = (i) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);
export const PEERS = Array.from({ length: 81 }, (_, i) => [...Array(81).keys()].filter((j) => j !== i && (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === boxOf(i))));

export const canPlace = (g, i, v) => PEERS[i].every((j) => g[j] !== v);
const shuffled = () => [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

/** Counts solutions up to `limit` (used to guarantee a unique solution). */
export function countSolutions(g, limit = 2) {
  // Branch on the empty cell with the fewest candidates.
  let best = -1, opts = null;
  for (let i = 0; i < 81; i++) {
    if (g[i]) continue;
    const o = [];
    for (let v = 1; v <= 9; v++) if (canPlace(g, i, v)) o.push(v);
    if (!o.length) return 0;
    if (!opts || o.length < opts.length) { best = i; opts = o; if (o.length === 1) break; }
  }
  if (best < 0) return 1;
  let n = 0;
  for (const v of opts) { if (n >= limit) break; g[best] = v; n += countSolutions(g, limit - n); g[best] = 0; }
  return n;
}

function fill(g) {
  const i = g.indexOf(0);
  if (i < 0) return true;
  for (const v of shuffled()) if (canPlace(g, i, v)) { g[i] = v; if (fill(g)) return true; g[i] = 0; }
  return false;
}

const CLUES = { easy: 40, medium: 32, hard: 27 };
export function generate(level = "easy") {
  const solution = Array(81).fill(0);
  fill(solution);
  const puzzle = [...solution];
  const target = CLUES[level];
  let filled = 81;
  for (const i of [...Array(81).keys()].sort(() => Math.random() - 0.5)) {
    if (filled <= target) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (countSolutions([...puzzle]) !== 1) puzzle[i] = keep; else filled--;
  }
  return { puzzle, solution };
}
