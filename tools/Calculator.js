"use client";
import { useEffect, useMemo, useState } from "react";
import { Delete, History, Trash2 } from "lucide-react";
import { Seg, CopyBtn } from "@/components/ui";
import { evaluate, formatNumber } from "@/lib/calc";

const BASIC = [
  ["AC", "clr"], ["⌫", "fn"], ["%", "op"], ["÷", "op"],
  ["7"], ["8"], ["9"], ["×", "op"],
  ["4"], ["5"], ["6"], ["−", "op"],
  ["1"], ["2"], ["3"], ["+", "op"],
  ["±", "fn"], ["0"], ["."], ["=", "eq"],
];
const SCI = [
  ["sin", "fn"], ["cos", "fn"], ["tan", "fn"], ["π", "fn"], ["e", "fn"],
  ["sin⁻¹", "fn"], ["cos⁻¹", "fn"], ["tan⁻¹", "fn"], ["(", "fn"], [")", "fn"],
  ["x²", "fn"], ["xʸ", "fn"], ["√", "fn"], ["ln", "fn"], ["log", "fn"],
  ["x!", "fn"], ["1/x", "fn"], ["eˣ", "fn"], ["10ˣ", "fn"], ["|x|", "fn"],
];
const INSERT = { "sin": "sin(", "cos": "cos(", "tan": "tan(", "sin⁻¹": "asin(", "cos⁻¹": "acos(", "tan⁻¹": "atan(", "√": "√(", "ln": "ln(", "log": "log(", "eˣ": "e^(", "10ˣ": "10^(", "|x|": "abs(", "π": "π", "e": "e", "(": "(", ")": ")", "x²": "^2", "xʸ": "^", "x!": "!" };
const show = (n) => { const s = formatNumber(n); return /e|∞|Error/.test(s) ? s : Number(s).toLocaleString("en-IN", { maximumFractionDigits: 10 }); };

export default function Calculator() {
  const [mode, setMode] = useState("basic");
  const [deg, setDeg] = useState(true);
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mem, setMem] = useState(0);
  const [hist, setHist] = useState([]); // this visit only — not saved

  const preview = useMemo(() => {
    if (!expr || /[+\-×÷^(−]$/.test(expr)) return null;
    try { return evaluate(expr, { deg }); } catch { return null; }
  }, [expr, deg]);

  const equals = () => {
    if (!expr) return;
    try {
      const v = evaluate(expr, { deg });
      setHist((h) => [{ expr, v }, ...h].slice(0, 25));
      setResult(v); setError(null); setExpr(formatNumber(v).replace("∞", ""));
    } catch (e) { setError(e.message); }
  };

  const toggleSign = () => setExpr((x) => {
    const m = x.match(/(\(−)?(\d*\.?\d+)\)?$/);
    if (!m) return x ? `−(${x})` : "−";
    return m[1] ? x.slice(0, m.index) + m[2] : x.slice(0, m.index) + `(−${m[2]})`;
  });

  const press = (k) => {
    setError(null);
    if (result !== null && /^[0-9.]$/.test(k)) { setResult(null); setExpr(k); return; }
    setResult(null);
    if (k === "AC") return setExpr("");
    if (k === "⌫") return setExpr((x) => x.replace(/(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|log\(|ln\(|abs\(|√\(|.)$/, ""));
    if (k === "=") return equals();
    if (k === "±") return toggleSign();
    if (k === "1/x") return setExpr((x) => (x ? `1/(${x})` : "1/"));
    if (INSERT[k]) return setExpr((x) => x + INSERT[k]);
    setExpr((x) => {
      // replace a trailing operator instead of stacking two (5 + × 3)
      if (/^[+−×÷]$/.test(k) && /[+−×÷]$/.test(x)) return x.slice(0, -1) + k;
      if (/^[+×÷%]$/.test(k) && !x) return preview !== null ? formatNumber(preview) + k : "";
      return x + k;
    });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, select") || e.ctrlKey || e.metaKey || e.altKey) return;
      const map = { "*": "×", "/": "÷", "-": "−", Enter: "=", "=": "=", Backspace: "⌫", Escape: "AC", Delete: "AC" };
      const k = map[e.key] || e.key;
      if (/^[0-9.+%()^!]$/.test(k) || ["×", "÷", "−", "=", "⌫", "AC"].includes(k)) { e.preventDefault(); press(k); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const current = result ?? preview;
  const memPress = (op) => {
    const v = current ?? 0;
    if (op === "MC") setMem(0);
    if (op === "MR") { setExpr((x) => (result !== null ? "" : x) + formatNumber(mem)); setResult(null); }
    if (op === "M+") setMem((m) => m + v);
    if (op === "M−") setMem((m) => m - v);
  };

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="calc" style={{ maxWidth: mode === "sci" ? 560 : 460 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <Seg options={[{ label: "Basic", value: "basic" }, { label: "Scientific", value: "sci" }]} value={mode} onChange={setMode} />
            {mode === "sci" && <Seg options={[{ label: "DEG", value: true }, { label: "RAD", value: false }]} value={deg} onChange={setDeg} />}
          </div>
          <div className="calc-screen" aria-live="polite">
            <div className="calc-expr">{mem !== 0 && <span style={{ float: "left", color: "var(--brand)", fontWeight: 700 }}>M</span>}{result !== null ? hist[0]?.expr + " =" : expr || " "}</div>
            <div className="calc-val" style={{ color: error ? "var(--bad)" : undefined, fontSize: error ? "1.3rem" : undefined }}>
              {error || (current !== null ? show(current) : expr ? "…" : "0")}
            </div>
          </div>
          <div className="calc-keys" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 10 }}>
            {["MC", "MR", "M+", "M−"].map((m) => <button key={m} className="fn" style={{ height: 40 }} onClick={() => memPress(m)}>{m}</button>)}
          </div>
          {mode === "sci" && (
            <div className="calc-keys" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
              {SCI.map(([k, c]) => <button key={k} className={c} style={{ height: 46 }} onClick={() => press(k)}>{k}</button>)}
            </div>
          )}
          <div className="calc-keys" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {BASIC.map(([k, c]) => <button key={k} className={c || ""} onClick={() => press(k)} aria-label={k === "⌫" ? "Backspace" : k}>{k === "⌫" ? <Delete size={20} style={{ margin: "0 auto" }} /> : k}</button>)}
          </div>
        </div>
        <small className="muted" style={{ textAlign: "center" }}>Keyboard works too: numbers, + − * / ^ % ( ), Enter for =, Backspace and Esc.</small>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="panel-title" style={{ margin: 0 }}><History size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> History</div>
            {hist.length > 0 && <button className="btn btn-sm btn-ghost" onClick={() => setHist([])}><Trash2 size={14} /> Clear</button>}
          </div>
          {hist.length === 0 && <small className="muted">Your calculations appear here. Tap one to use the result again. History is not saved.</small>}
          {hist.map((h, i) => (
            <button key={i} className="btn btn-ghost" style={{ height: "auto", padding: "8px 10px", flexDirection: "column", alignItems: "flex-end", gap: 2 }} onClick={() => { setExpr(formatNumber(h.v)); setResult(null); }}>
              <small className="muted" style={{ fontFamily: "var(--mono)" }}>{h.expr} =</small>
              <b style={{ fontSize: "1.1rem" }}>{show(h.v)}</b>
            </button>
          ))}
        </div>
        {current !== null && <CopyBtn text={formatNumber(current)} label="Copy result" className="btn" />}
      </div>
    </div>
  );
}
