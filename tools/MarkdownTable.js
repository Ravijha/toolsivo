"use client";
import { useMemo, useState } from "react";
import { Plus, Minus, AlignLeft, AlignCenter, AlignRight, ClipboardPaste, Download } from "lucide-react";
import { Toggle, CopyBtn, Msg } from "@/components/ui";
import { downloadText } from "@/lib/file";

const INIT = [["Tool", "Category", "Price"], ["Merge PDF", "PDF", "Free"], ["EMI Calculator", "Calculators", "Free"], ["JSON Formatter", "Developer", "Free"]];
const width = (s) => [...s].length;

// Minimal CSV / TSV parser with quoted-field support
export function parseDelimited(text) {
  const d = text.includes("\t") ? "\t" : (text.split("\n")[0].match(/;/g) || []).length > (text.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === d) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

export default function MarkdownTable() {
  const [grid, setGrid] = useState(INIT);
  const [align, setAlign] = useState(["left", "left", "center"]);
  const [pretty, setPretty] = useState(true);
  const [paste, setPaste] = useState("");
  const cols = Math.max(...grid.map((r) => r.length));

  const md = useMemo(() => {
    const cell = (s) => (s ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>").trim();
    const rows = grid.map((r) => Array.from({ length: cols }, (_, i) => cell(r[i])));
    const w = Array.from({ length: cols }, (_, i) => Math.max(3, ...rows.map((r) => width(r[i]))));
    const pad = (s, i) => {
      if (!pretty) return s;
      const extra = w[i] - width(s);
      return align[i] === "right" ? " ".repeat(extra) + s : align[i] === "center" ? " ".repeat(Math.floor(extra / 2)) + s + " ".repeat(Math.ceil(extra / 2)) : s + " ".repeat(extra);
    };
    const sep = w.map((n, i) => {
      const len = pretty ? n : 3, a = align[i] || "left";
      return a === "center" ? `:${"-".repeat(Math.max(1, len - 2))}:` : a === "right" ? `${"-".repeat(Math.max(1, len - 1))}:` : `:${"-".repeat(Math.max(1, len - 1))}`;
    });
    const line = (cells) => `| ${cells.join(" | ")} |`;
    return [line(rows[0].map(pad)), line(sep), ...rows.slice(1).map((r) => line(r.map(pad)))].join("\n");
  }, [grid, cols, align, pretty]);

  const setCell = (r, c, v) => setGrid((G) => G.map((row, i) => (i === r ? Array.from({ length: cols }, (_, j) => (j === c ? v : row[j] ?? "")) : row)));
  const addCol = () => { setGrid((G) => G.map((r, i) => [...r, i === 0 ? `Column ${cols + 1}` : ""])); setAlign((A) => [...A, "left"]); };
  const delCol = () => cols > 1 && (setGrid((G) => G.map((r) => r.slice(0, cols - 1))), setAlign((A) => A.slice(0, cols - 1)));
  const importData = () => {
    const rows = parseDelimited(paste);
    if (!rows.length) return;
    const n = Math.max(...rows.map((r) => r.length));
    setGrid(rows.map((r) => Array.from({ length: n }, (_, i) => r[i] ?? "")));
    setAlign(Array(n).fill("left"));
    setPaste("");
  };

  return (
    <div className="stack">
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <div className="actions">
          <button className="btn btn-sm" onClick={() => setGrid((G) => [...G, Array(cols).fill("")])}><Plus size={14} /> Row</button>
          <button className="btn btn-sm" onClick={() => grid.length > 2 && setGrid((G) => G.slice(0, -1))}><Minus size={14} /> Row</button>
          <button className="btn btn-sm" onClick={addCol}><Plus size={14} /> Column</button>
          <button className="btn btn-sm" onClick={delCol}><Minus size={14} /> Column</button>
          <Toggle label="Align columns in source" checked={pretty} onChange={setPretty} />
        </div>
      </div>
      <div className="table-wrap" style={{ maxHeight: "none" }}>
        <table className="table">
          <thead>
            <tr>{Array.from({ length: cols }, (_, c) => (
              <th key={c} style={{ textAlign: "center", padding: 6 }}>
                <div className="seg" style={{ display: "inline-flex", padding: 2 }}>
                  {[["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]].map(([a, I]) => (
                    <button key={a} className={(align[c] || "left") === a ? "on" : ""} onClick={() => setAlign((A) => Array.from({ length: cols }, (_, j) => (j === c ? a : A[j] || "left")))} style={{ padding: "4px 7px" }} aria-label={`Align ${a}`}><I size={13} /></button>
                  ))}
                </div>
              </th>
            ))}</tr>
          </thead>
          <tbody>
            {grid.map((r, ri) => (
              <tr key={ri}>{Array.from({ length: cols }, (_, c) => (
                <td key={c} style={{ padding: 4 }}>
                  <input className="input" style={{ fontWeight: ri === 0 ? 700 : 400, textAlign: align[c] || "left", padding: "7px 9px" }} value={r[c] ?? ""} onChange={(e) => setCell(ri, c, e.target.value)} placeholder={ri === 0 ? "Header" : ""} />
                </td>
              ))}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid-2">
        <div className="field">
          <span className="label">Markdown <span className="actions"><CopyBtn text={md} /><button className="btn btn-sm" onClick={() => downloadText(md, "table.md")}><Download size={15} /> .md</button></span></span>
          <pre className="code-out" style={{ minHeight: 160 }}>{md}</pre>
        </div>
        <div className="field">
          <span className="label">Import from CSV, Excel or Google Sheets</span>
          <textarea className="textarea" style={{ minHeight: 120 }} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste cells copied from a spreadsheet, or CSV text…" />
          <button className="btn btn-sm" onClick={importData} disabled={!paste.trim()}><ClipboardPaste size={15} /> Import into table</button>
          <Msg>The first row becomes the header. Works with GitHub, GitLab, Notion and most Markdown editors.</Msg>
        </div>
      </div>
    </div>
  );
}
