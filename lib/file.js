export function toast(msg) {
  window.dispatchEvent(new CustomEvent("toolsivo:toast", { detail: msg }));
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast(`Downloaded ${name}`);
}

export function downloadText(text, name, type = "text/plain") {
  downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), name);
}

export async function copyText(text, label = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  toast(label);
}

export function formatBytes(b) {
  if (!b && b !== 0) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

export function baseName(name) {
  return name.replace(/\.[^.]+$/, "");
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const url = typeof src === "string" ? src : URL.createObjectURL(src);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read this image"));
    img.src = url;
  });
}

export function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export const extFor = (mime) => ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" })[mime] || "png";

export function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

// Draw `img` into a w×h canvas, covering or containing it, with an optional fill or blurred backdrop.
export function drawFitted(ctx, img, w, h, { fit = "cover", zoom = 1, ox = 0.5, oy = 0.5, bg = "#ffffff", blurBg = false } = {}) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  if (fit === "contain") {
    if (blurBg) {
      const s = Math.max(w / iw, h / ih) * 1.1;
      ctx.save();
      ctx.filter = "blur(28px) brightness(0.85)";
      ctx.drawImage(img, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
      ctx.restore();
    } else if (bg !== "transparent") {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
    }
  }
  const base = fit === "cover" ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
  const s = base * zoom;
  const dw = iw * s, dh = ih * s;
  ctx.drawImage(img, (w - dw) * ox, (h - dh) * oy, dw, dh);
}

export const isImage = (f) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|bmp|avif|svg)$/i.test(f.name);
export const isPdf = (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);
