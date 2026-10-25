import { copyFileSync, mkdirSync } from "node:fs";
// Serve the OCR engine from our own site instead of a third-party CDN.
mkdirSync("public/tesseract", { recursive: true });
copyFileSync("node_modules/tesseract.js/dist/worker.min.js", "public/tesseract/worker.min.js");
for (const f of ["tesseract-core-lstm.wasm.js", "tesseract-core-simd-lstm.wasm.js"]) {
  copyFileSync(`node_modules/tesseract.js-core/${f}`, `public/tesseract/${f}`);
}
console.log("tesseract copied to public/tesseract");
