import { copyFileSync, mkdirSync } from "node:fs";
mkdirSync("public/pdfjs", { recursive: true });
for (const f of ["pdf.min.mjs", "pdf.worker.min.mjs"]) {
  copyFileSync(`node_modules/pdfjs-dist/build/${f}`, `public/pdfjs/${f}`);
}
console.log("pdfjs copied to public/pdfjs");
