"use client";
import { useMemo, useState } from "react";
import { Field, NumInput, CopyBtn, Seg } from "@/components/ui";

const UNI = { "½": 0.5, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25, "¾": 0.75, "⅕": 0.2, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875 };
const METRIC = /^(g|gm|gms|grams?|kg|kgs|ml|l|ltr|litres?|liters?|mg)\b/i;
// "1 1/2", "1½", "3/4", "2.5", "2-3", "2 to 3"
const QTY = /^\s*(\d+\s+\d+\/\d+|\d+\s*[½⅓⅔¼¾⅕⅛⅜⅝⅞]|[½⅓⅔¼¾⅕⅛⅜⅝⅞]|\d+\/\d+|\d+(?:\.\d+)?)(\s*(?:-|–|to)\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?))?/;

function num(s) {
  s = s.trim();
  let m = s.match(/^(\d+)\s*([½⅓⅔¼¾⅕⅛⅜⅝⅞])$/);
  if (m) return +m[1] + UNI[m[2]];
  if (UNI[s] != null) return UNI[s];
  m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return +m[1] + +m[2] / +m[3];
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return +m[1] / +m[2];
  return +s;
}
const FR = [[1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [3 / 8, "⅜"], [1 / 2, "½"], [5 / 8, "⅝"], [2 / 3, "⅔"], [3 / 4, "¾"], [7 / 8, "⅞"]];
function pretty(v, metric) {
  if (metric || v >= 20) return String(Math.round(v * (v < 10 ? 10 : 1)) / (v < 10 ? 10 : 1));
  const whole = Math.floor(v), frac = v - whole;
  if (frac < 0.06) return String(whole || (v > 0 ? "a pinch of" : 0));
  if (frac > 0.94) return String(whole + 1);
  const [, sym] = FR.reduce((best, f) => (Math.abs(f[0] - frac) < Math.abs(best[0] - frac) ? f : best));
  return whole ? `${whole}${sym}` : sym;
}

const SAMPLE = `2 cups basmati rice
3½ cups water
1 1/2 tbsp ghee
1 tsp cumin seeds
2 bay leaves
1/2 tsp salt
250 g paneer, cubed
1 medium onion, sliced
Salt to taste`;

export default function Recipe() {
  const [text, setText] = useState(SAMPLE);
  const [from, setFrom] = useState("4");
  const [to, setTo] = useState("6");
  const [mode, setMode] = useState("servings");
  const [mult, setMult] = useState("2");
  const k = mode === "servings" ? (+to || 0) / (+from || 1) : +mult || 0;

  const out = useMemo(() => text.split("\n").map((line) => {
    const m = line.match(QTY);
    if (!m || !line.trim()) return { line, changed: false };
    const rest = line.slice(m[0].length);
    const metric = METRIC.test(rest.trim());
    let q = pretty(num(m[1]) * k, metric);
    if (m[3]) q += `–${pretty(num(m[3]) * k, metric)}`;
    return { line: q + rest, changed: true };
  }), [text, k]);
  const result = out.map((o) => o.line).join("\n");

  return (
    <div className="tool-cols">
      <div className="grid-2">
        <Field label="Original recipe (one ingredient per line)">
          <textarea className="textarea prose" style={{ minHeight: 340 }} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <div className="field">
          <span className="label">Scaled recipe <CopyBtn text={result} /></span>
          <div className="panel" style={{ minHeight: 340, background: "var(--elev)", lineHeight: 1.9 }}>
            {out.map((o, i) => <div key={i} style={{ color: o.changed ? "var(--text)" : "var(--muted)" }}>{o.changed ? <><b style={{ color: "var(--brand)" }}>{o.line.match(/^\S+(?:\s(?:of))?/)[0]}</b>{o.line.slice(o.line.match(/^\S+(?:\s(?:of))?/)[0].length)}</> : o.line || " "}</div>)}
          </div>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Seg options={[{ label: "By servings", value: "servings" }, { label: "By multiplier", value: "mult" }]} value={mode} onChange={setMode} />
          {mode === "servings" ? (
            <div className="grid-2">
              <Field label="Recipe serves"><NumInput value={from} onChange={setFrom} min={1} /></Field>
              <Field label="I want to serve"><NumInput value={to} onChange={setTo} min={1} /></Field>
            </div>
          ) : (
            <>
              <Field label="Multiply by"><NumInput value={mult} onChange={setMult} suffix="×" /></Field>
              <div className="seg">{["0.5", "1.5", "2", "3"].map((m) => <button key={m} className={mult === m ? "on" : ""} onClick={() => setMult(m)}>{m}×</button>)}</div>
            </>
          )}
          <div className="big-result" style={{ padding: 16 }}><span>Scale factor</span><strong style={{ fontSize: "2rem" }}>{(Math.round(k * 100) / 100) || 0}×</strong></div>
        </div>
        <small className="muted">Cup and spoon amounts are rounded to kitchen fractions; grams and millilitres to sensible decimals. Lines without a number (like “salt to taste”) stay as they are. Adjust spices and baking times to taste.</small>
      </div>
    </div>
  );
}
