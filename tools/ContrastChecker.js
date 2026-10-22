"use client";
import { useMemo, useState } from "react";
import { ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react";
import { Field, CopyBtn } from "@/components/ui";
import { luminance, hexToHsl, hslToHex } from "@/lib/color";

const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const norm = (v) => { const s = v.trim().replace(/^#?/, "#"); return /^#[0-9a-f]{3}$/i.test(s) ? "#" + s.slice(1).replace(/./g, "$&$&") : /^#[0-9a-f]{6}$/i.test(s) ? s.toLowerCase() : null; };

// Nudge lightness of `fg` (keeping hue/saturation) until it reaches `target` contrast on `bg`.
function suggest(fg, bg, target) {
  const [h, s, l] = hexToHsl(fg);
  let best = null;
  for (let d = 0; d <= 100; d++) {
    for (const L of [l - d, l + d]) {
      if (L < 0 || L > 100) continue;
      const c = hslToHex(h, s, L);
      if (ratio(c, bg) >= target) { best = c; break; }
    }
    if (best) break;
  }
  return best;
}

function ColorInput({ label, value, onChange }) {
  const [draft, setDraft] = useState(null);
  return (
    <Field label={label}>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <input className="input" style={{ fontFamily: "var(--mono)" }} value={draft ?? value.toUpperCase()} onChange={(e) => { setDraft(e.target.value); const n = norm(e.target.value); if (n) onChange(n); }} onBlur={() => setDraft(null)} />
      </div>
    </Field>
  );
}

export default function ContrastChecker() {
  const [fg, setFg] = useState("#7c8597");
  const [bg, setBg] = useState("#ffffff");
  const r = useMemo(() => ratio(fg, bg), [fg, bg]);
  const checks = [
    ["Normal text", "AA", 4.5], ["Normal text", "AAA", 7], ["Large text (18pt+ or 14pt bold)", "AA", 3], ["Large text", "AAA", 4.5], ["UI components & icons", "AA", 3],
  ];
  const fixAA = r < 4.5 ? suggest(fg, bg, 4.5) : null;
  const fixAAA = r < 7 ? suggest(fg, bg, 7) : null;
  const grade = r >= 7 ? "Excellent" : r >= 4.5 ? "Good" : r >= 3 ? "Large text only" : "Fails";

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div style={{ background: bg, color: fg, borderRadius: 20, padding: "32px 30px", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>Large heading text</div>
          <p style={{ fontSize: 16, marginTop: 10, lineHeight: 1.6 }}>This is normal body text. Good contrast helps everyone read comfortably — including people with low vision and anyone using a phone in bright sunlight.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Small print: terms, captions and footnotes.</p>
          <span style={{ display: "inline-block", marginTop: 14, padding: "9px 18px", borderRadius: 10, border: `2px solid ${fg}`, fontWeight: 700 }}>Button outline</span>
        </div>
        <div className="table-wrap" style={{ maxHeight: "none" }}>
          <table className="table">
            <thead><tr><th>Element</th><th>Level</th><th>Needs</th><th>Result</th></tr></thead>
            <tbody>
              {checks.map(([el, lvl, need]) => (
                <tr key={el + lvl}><td>{el}</td><td>{lvl}</td><td>{need}:1</td><td style={{ color: r >= need ? "var(--ok)" : "var(--bad)", fontWeight: 700 }}>{r >= need ? <><CheckCircle2 size={15} style={{ display: "inline", verticalAlign: "-3px" }} /> Pass</> : <><XCircle size={15} style={{ display: "inline", verticalAlign: "-3px" }} /> Fail</>}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="side">
        <div className="big-result" style={{ background: r >= 4.5 ? "linear-gradient(135deg,#00b37e,#00a3ff)" : r >= 3 ? "linear-gradient(135deg,#f59e0b,#f97316)" : "linear-gradient(135deg,#e5384f,#f97316)" }}>
          <span>Contrast ratio</span>
          <strong>{r.toFixed(2)}:1</strong>
          <small>{grade}</small>
        </div>
        <div className="panel stack">
          <ColorInput label="Text colour" value={fg} onChange={setFg} />
          <button className="btn btn-sm" onClick={() => { setFg(bg); setBg(fg); }}><ArrowLeftRight size={14} /> Swap colours</button>
          <ColorInput label="Background colour" value={bg} onChange={setBg} />
        </div>
        {(fixAA || fixAAA) && (
          <div className="panel stack">
            <div className="panel-title">Closest passing text colours</div>
            {[["AA (4.5:1)", fixAA], ["AAA (7:1)", fixAAA]].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} className="row" style={{ flexWrap: "nowrap" }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: v, border: "1px solid var(--border)", flex: "none" }} />
                <div style={{ flex: 1 }}><b style={{ fontFamily: "var(--mono)" }}>{v.toUpperCase()}</b><br /><small className="muted">{l} · {ratio(v, bg).toFixed(2)}:1</small></div>
                <button className="btn btn-sm" onClick={() => setFg(v)}>Use</button>
                <CopyBtn text={v.toUpperCase()} className="btn btn-sm btn-ghost" label="" />
              </div>
            ))}
          </div>
        )}
        <small className="muted">Calculated with the WCAG 2.2 relative-luminance formula.</small>
      </div>
    </div>
  );
}
