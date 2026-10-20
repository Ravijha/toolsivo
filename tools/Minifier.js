"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Seg, CopyBtn, Msg, Stat, Toggle } from "@/components/ui";
import { downloadText, formatBytes } from "@/lib/file";

export function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,>~])\s*/g, "$1")
    .replace(/:\s+/g, ":")
    .replace(/\s+:(?=[^{}]*;)/g, ":")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/;}/g, "}")
    .replace(/(^|[^\w.#-])0(?:px|em|rem)/g, "$10")
    .replace(/:\s*0\.(\d)/g, ":.$1")
    .trim();
}

function minifyHtml(html, { removeComments = true } = {}) {
  const keep = [];
  let s = html.replace(/<(pre|textarea|script)\b[\s\S]*?<\/\1>/gi, (m) => `\u0000${keep.push(m) - 1}\u0000`);
  s = s.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_, a, c) => `<style${a}>${minifyCss(c)}</style>`);
  if (removeComments) s = s.replace(/<!--(?!\[if)[\s\S]*?-->/g, "");
  s = s.replace(/\s+/g, " ").replace(/>\s+</g, "><").replace(/\s+\/>/g, "/>").trim();
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[+i]);
}

const samples = {
  html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Page title -->
    <title>Toolsivo demo</title>
    <style>
      body { margin: 0px; padding: 0px; font-family: system-ui, sans-serif; }
      .card  >  h1 { color : #7c5cff ; opacity: 0.9; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>   Hello, world!   </h1>
      <p>
        Minify me, please.
      </p>
    </div>
  </body>
</html>`,
  css: `/* Primary button */
.btn-primary {
  display: inline-flex;
  padding: 0px 18px;
  background: linear-gradient(120deg, #4f6bff, #a24bff);
  border-radius: 12px;
  opacity: 0.95;
}

.btn-primary:hover  ,  .btn-primary:focus {
  transform: translateY( -1px );
}`,
  js: `// Calculate monthly EMI
function calculateEmi(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) {
    return principal / months;
  }
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

console.log("EMI:", calculateEmi(500000, 8.5, 240).toFixed(2));`,
};

export default function Minifier() {
  const [lang, setLang] = useState("html");
  const [input, setInput] = useState(samples.html);
  const [out, setOut] = useState("");
  const [err, setErr] = useState(null);
  const [mangle, setMangle] = useState(true);

  const switchLang = (l) => { setLang(l); setInput(samples[l]); };

  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      setErr(null);
      try {
        let r;
        if (lang === "css") r = minifyCss(input);
        else if (lang === "html") r = minifyHtml(input);
        else {
          const { minify } = await import("terser");
          r = (await minify(input, { compress: true, mangle, format: { comments: false } })).code || "";
        }
        if (alive) setOut(r);
      } catch (e) {
        if (alive) { setErr(e.message); setOut(""); }
      }
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [input, lang, mangle]);

  const a = new Blob([input]).size, b = new Blob([out]).size;
  return (
    <div className="stack">
      <div className="toolbar">
        <div className="actions">
          <Seg options={[{ label: "HTML", value: "html" }, { label: "CSS", value: "css" }, { label: "JavaScript", value: "js" }]} value={lang} onChange={switchLang} />
          {lang === "js" && <Toggle label="Mangle names" checked={mangle} onChange={setMangle} />}
        </div>
        <div className="actions">
          <CopyBtn text={out} />
          <button className="btn btn-sm" disabled={!out} onClick={() => downloadText(out, `minified.${lang}`)}><Download size={15} /> Download</button>
        </div>
      </div>
      <div className="grid-2">
        <div className="field"><span className="label">Source</span><textarea className="textarea" style={{ minHeight: 400 }} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} /></div>
        <div className="field">
          <span className="label">Minified</span>
          {err ? <Msg type="bad">{err}</Msg> : <textarea className="textarea" style={{ minHeight: 400 }} readOnly value={out} />}
        </div>
      </div>
      <div className="stats">
        <Stat label="Original" value={formatBytes(a)} />
        <Stat label="Minified" value={formatBytes(b)} />
        <Stat hl label="Saved" value={a && out ? `${Math.round((1 - b / a) * 100)}%` : "—"} sub={formatBytes(Math.max(0, a - b))} />
      </div>
    </div>
  );
}
