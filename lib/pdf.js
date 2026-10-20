// PDF.js is served from /public/pdfjs (copied on install) and loaded at runtime,
// which sidesteps bundler issues with its ESM build.
let pdfjsPromise;

export function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(/* webpackIgnore: true */ "/pdfjs/pdf.min.mjs").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
      return lib;
    });
  }
  return pdfjsPromise;
}

export async function openPdfjs(bytes) {
  const lib = await getPdfjs();
  return lib.getDocument({ data: bytes.slice(0) }).promise;
}

export async function renderPage(doc, n, { scale, maxWidth, rotation = 0 } = {}) {
  const page = await doc.getPage(n);
  let viewport = page.getViewport({ scale: 1, rotation: (page.rotate + rotation) % 360 });
  const s = scale || (maxWidth ? maxWidth / viewport.width : 1);
  viewport = page.getViewport({ scale: s, rotation: (page.rotate + rotation) % 360 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

// Parse "1-3, 5, 8-" into sorted zero-based page indexes (or groups when keepGroups).
export function parseRanges(str, total, keepGroups = false) {
  const groups = [];
  for (const part of str.split(/[,;]+/)) {
    const p = part.trim();
    if (!p) continue;
    const m = p.match(/^(\d*)\s*-\s*(\d*)$/);
    let a, b;
    if (m) {
      a = m[1] ? +m[1] : 1;
      b = m[2] ? +m[2] : total;
    } else if (/^\d+$/.test(p)) {
      a = b = +p;
    } else throw new Error(`“${p}” is not a valid page or range`);
    if (a < 1 || b > total || a > b) throw new Error(`Range “${p}” is outside 1–${total}`);
    const g = [];
    for (let i = a; i <= b; i++) g.push(i - 1);
    groups.push(g);
  }
  if (keepGroups) return groups;
  return [...new Set(groups.flat())].sort((x, y) => x - y);
}
