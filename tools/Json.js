"use client";
import { useMemo, useState } from "react";
import { Download, Wand2, Minimize2, Trash2 } from "lucide-react";
import { Seg, Toggle, CopyBtn, Msg, Stat } from "@/components/ui";
import { downloadText, formatBytes } from "@/lib/file";

const sample = '{"name":"Toolsivo","tools":42,"free":true,"categories":["image","pdf","calculators"],"meta":{"private":true,"uploads":null,"rating":4.9}}';

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function highlight(json) {
  return esc(json).replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (m) => {
      let color = "#ff8a3d"; // number
      if (/^"/.test(m)) color = /:$/.test(m) ? "#8f7bff" : "#00b386";
      else if (/true|false/.test(m)) color = "#ff4d8d";
      else if (/null/.test(m)) color = "#9a9db4";
      return `<span style="color:${color}">${m}</span>`;
    },
  );
}

const sortKeys = (v) => (Array.isArray(v) ? v.map(sortKeys) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])])) : v);
function stats(v, d = 1) {
  if (Array.isArray(v)) return v.reduce((a, x) => { const s = stats(x, d + 1); return { keys: a.keys + s.keys, depth: Math.max(a.depth, s.depth) }; }, { keys: 0, depth: d });
  if (v && typeof v === "object") return Object.values(v).reduce((a, x) => { const s = stats(x, d + 1); return { keys: a.keys + s.keys, depth: Math.max(a.depth, s.depth) }; }, { keys: Object.keys(v).length, depth: d });
  return { keys: 0, depth: d - 1 };
}

function locate(text, msg) {
  let pos = msg.match(/position (\d+)/)?.[1];
  const lc = msg.match(/line (\d+) column (\d+)/);
  if (lc) return { line: +lc[1], col: +lc[2] };
  if (pos == null) return null;
  pos = +pos;
  const before = text.slice(0, pos).split("\n");
  return { line: before.length, col: before[before.length - 1].length + 1 };
}

export default function Json() {
  const [input, setInput] = useState(sample);
  const [indent, setIndent] = useState("2");
  const [sort, setSort] = useState(false);
  const [mode, setMode] = useState("format");

  const res = useMemo(() => {
    if (!input.trim()) return { empty: true };
    try {
      let v = JSON.parse(input);
      if (sort) v = sortKeys(v);
      const out = mode === "minify" ? JSON.stringify(v) : JSON.stringify(v, null, indent === "tab" ? "\t" : +indent);
      return { out, ...stats(v) };
    } catch (e) {
      return { error: e.message, loc: locate(input, e.message) };
    }
  }, [input, indent, sort, mode]);

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="actions">
          <Seg options={[{ label: <><Wand2 size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Beautify</>, value: "format" }, { label: <><Minimize2 size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Minify</>, value: "minify" }]} value={mode} onChange={setMode} />
          {mode === "format" && <Seg options={[{ label: "2 spaces", value: "2" }, { label: "4 spaces", value: "4" }, { label: "Tab", value: "tab" }]} value={indent} onChange={setIndent} />}
          <Toggle label="Sort keys" checked={sort} onChange={setSort} />
        </div>
        <div className="actions">
          <CopyBtn text={res.out} />
          <button className="btn btn-sm" disabled={!res.out} onClick={() => downloadText(res.out, "formatted.json", "application/json")}><Download size={15} /> Download</button>
        </div>
      </div>
      <div className="grid-2">
        <div className="field">
          <span className="label">Input <button className="btn btn-sm btn-ghost" onClick={() => setInput("")}><Trash2 size={14} /> Clear</button></span>
          <textarea className="textarea" style={{ minHeight: 440 }} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} placeholder="Paste JSON here…" />
        </div>
        <div className="field">
          <span className="label">Output</span>
          {res.error ? (
            <div className="stack">
              <Msg type="bad">
                <b>Invalid JSON</b>{res.loc && <> at line {res.loc.line}, column {res.loc.col}</>}<br />
                <span style={{ fontFamily: "var(--mono)", fontSize: ".82rem" }}>{res.error}</span>
              </Msg>
              {res.loc && (
                <pre className="code-out" style={{ maxHeight: 200 }}>
                  {input.split("\n").slice(Math.max(0, res.loc.line - 3), res.loc.line + 2).map((l, i, arr) => {
                    const n = Math.max(0, res.loc.line - 3) + i + 1;
                    return <div key={n} style={n === res.loc.line ? { background: "var(--bad-bg)", color: "var(--bad)" } : null}>{String(n).padStart(4)} │ {l}</div>;
                  })}
                </pre>
              )}
            </div>
          ) : res.empty ? (
            <div className="code-out muted" style={{ minHeight: 440 }}>Output appears here.</div>
          ) : (
            <pre className="code-out" style={{ minHeight: 440 }} dangerouslySetInnerHTML={{ __html: highlight(res.out) }} />
          )}
        </div>
      </div>
      {res.out && (
        <div className="stats">
          <Stat label="Status" value="✓ Valid" />
          <Stat label="Keys" value={res.keys} />
          <Stat label="Depth" value={res.depth} />
          <Stat label="Size" value={formatBytes(new Blob([res.out]).size)} sub={`input ${formatBytes(new Blob([input]).size)}`} />
        </div>
      )}
    </div>
  );
}
