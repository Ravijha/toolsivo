"use client";
import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Seg, Toggle, Stat, Msg } from "@/components/ui";

// Line-level LCS diff → [{ type: 'eq'|'add'|'del', a?, b?, text }]
function diff(A, B) {
  const n = A.length, m = B.length;
  if (n * m > 4_000_000) return null;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ type: "eq", a: i + 1, b: j + 1, text: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: "del", a: i + 1, text: A[i] }); i++; }
    else { out.push({ type: "add", b: j + 1, text: B[j] }); j++; }
  }
  while (i < n) { out.push({ type: "del", a: i + 1, text: A[i] }); i++; }
  while (j < m) { out.push({ type: "add", b: j + 1, text: B[j] }); j++; }
  return out;
}

const left = `Toolsivo is a collection of online tools.
It works in your browser.
Files are processed locally.
Pricing: free for everyone.
Contact: hello@toolsivo.com`;
const right = `Toolsivo is a collection of 40+ online tools.
It works in your browser.
Files are processed locally and never uploaded.
Pricing: free for everyone.
No sign-up required.
Contact: hello@toolsivo.com`;

export default function TextCompare() {
  const [a, setA] = useState(left);
  const [b, setB] = useState(right);
  const [ci, setCi] = useState(false);
  const [ws, setWs] = useState(false);
  const [view, setView] = useState("unified");

  const rows = useMemo(() => {
    const norm = (s) => { let x = s; if (ws) x = x.replace(/\s+/g, " ").trim(); if (ci) x = x.toLowerCase(); return x; };
    const A = a.split(/\r?\n/), B = b.split(/\r?\n/);
    const d = diff(A.map(norm), B.map(norm));
    if (!d) return null;
    return d.map((r) => ({ ...r, text: r.type === "add" ? B[r.b - 1] : A[r.a - 1] }));
  }, [a, b, ci, ws]);

  const added = rows?.filter((r) => r.type === "add").length || 0;
  const removed = rows?.filter((r) => r.type === "del").length || 0;
  const same = rows?.filter((r) => r.type === "eq").length || 0;

  // pair rows for side-by-side view
  const pairs = useMemo(() => {
    if (!rows) return [];
    const out = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.type === "eq") out.push([r, r]);
      else {
        const dels = [], adds = [];
        while (i < rows.length && rows[i].type !== "eq") { (rows[i].type === "del" ? dels : adds).push(rows[i]); i++; }
        i--;
        for (let k = 0; k < Math.max(dels.length, adds.length); k++) out.push([dels[k] || null, adds[k] || null]);
      }
    }
    return out;
  }, [rows]);

  return (
    <div className="stack">
      <div className="grid-2">
        <div className="field"><span className="label">Original text</span><textarea className="textarea" value={a} onChange={(e) => setA(e.target.value)} /></div>
        <div className="field"><span className="label">Changed text <button className="btn btn-sm btn-ghost" onClick={() => { setA(b); setB(a); }}><ArrowLeftRight size={14} /> Swap</button></span><textarea className="textarea" value={b} onChange={(e) => setB(e.target.value)} /></div>
      </div>
      <div className="toolbar">
        <div className="actions">
          <Seg options={[{ label: "Unified", value: "unified" }, { label: "Side by side", value: "split" }]} value={view} onChange={setView} />
          <Toggle label="Ignore case" checked={ci} onChange={setCi} />
          <Toggle label="Ignore whitespace" checked={ws} onChange={setWs} />
        </div>
      </div>
      {!rows ? (
        <Msg type="bad">These texts are too large to compare in the browser.</Msg>
      ) : (
        <>
          <div className="stats">
            <Stat label="Added lines" value={<span style={{ color: "var(--ok)" }}>+{added}</span>} />
            <Stat label="Removed lines" value={<span style={{ color: "var(--bad)" }}>−{removed}</span>} />
            <Stat label="Unchanged" value={same} />
          </div>
          {added + removed === 0 && <Msg type="ok">The two texts are identical.</Msg>}
          <div className="diff">
            <table>
              <tbody>
                {view === "unified"
                  ? rows.map((r, i) => (
                      <tr key={i} className={r.type}>
                        <td className="ln">{r.a || ""}</td>
                        <td className="ln">{r.b || ""}</td>
                        <td className="sign">{r.type === "add" ? "+" : r.type === "del" ? "−" : " "}</td>
                        <td>{r.text || " "}</td>
                      </tr>
                    ))
                  : pairs.map(([l, r], i) => (
                      <tr key={i}>
                        <td className="ln" style={l && l.type === "del" ? { background: "var(--bad-bg)" } : null}>{l?.a || ""}</td>
                        <td style={{ width: "50%", background: l?.type === "del" ? "var(--bad-bg)" : undefined, borderRight: "1px solid var(--border)" }}>{l ? l.text || " " : ""}</td>
                        <td className="ln" style={r && r.type === "add" ? { background: "var(--ok-bg)" } : null}>{r?.b || ""}</td>
                        <td style={{ width: "50%", background: r?.type === "add" ? "var(--ok-bg)" : undefined }}>{r ? r.text || " " : ""}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
