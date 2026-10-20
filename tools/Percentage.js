"use client";
import { useState } from "react";
import { NumInput, num } from "@/components/ui";

const modes = [
  { id: "of", title: "What is X% of Y?", a: "Percentage", b: "Of value", aSuf: "%", calc: (a, b) => ({ v: (a / 100) * b, text: `${num(a)}% of ${num(b)} is` }) },
  { id: "what", title: "X is what % of Y?", a: "Value", b: "Total", bSuf: "", calc: (a, b) => ({ v: (a / b) * 100, unit: "%", text: `${num(a)} is this percent of ${num(b)}` }) },
  { id: "change", title: "% change from X to Y", a: "From", b: "To", calc: (a, b) => { const v = ((b - a) / Math.abs(a)) * 100; return { v, unit: "%", text: v >= 0 ? "Increase of" : "Decrease of", abs: true }; } },
  { id: "inc", title: "Increase X by Y%", a: "Value", b: "Increase", bSuf: "%", calc: (a, b) => ({ v: a * (1 + b / 100), text: `${num(a)} + ${num(b)}% =` }) },
  { id: "dec", title: "Decrease X by Y%", a: "Value", b: "Decrease", bSuf: "%", calc: (a, b) => ({ v: a * (1 - b / 100), text: `${num(a)} − ${num(b)}% =` }) },
  { id: "rev", title: "X is Y% of what?", a: "Value", b: "Percentage", bSuf: "%", calc: (a, b) => ({ v: a / (b / 100), text: `${num(a)} is ${num(b)}% of` }) },
];

function Card({ m }) {
  const [a, setA] = useState(m.id === "change" ? "80" : "20");
  const [b, setB] = useState(m.id === "change" ? "100" : "250");
  const r = a !== "" && b !== "" ? m.calc(+a, +b) : null;
  const ok = r && isFinite(r.v);
  return (
    <div className="panel stack" style={{ background: "var(--elev)" }}>
      <strong>{m.title}</strong>
      <div className="grid-2">
        <div className="field"><span className="label">{m.a}</span><NumInput value={a} onChange={setA} suffix={m.aSuf} /></div>
        <div className="field"><span className="label">{m.b}</span><NumInput value={b} onChange={setB} suffix={m.bSuf} /></div>
      </div>
      <div style={{ padding: "14px 16px", borderRadius: 14, background: "color-mix(in srgb, var(--c) 10%, transparent)" }}>
        <small className="muted">{ok ? r.text : "Enter both values"}</small>
        <div style={{ fontSize: "1.7rem", fontWeight: 800, letterSpacing: "-.03em", color: "var(--c)" }}>
          {ok ? `${num(r.abs ? Math.abs(r.v) : r.v, 4)}${r.unit || ""}` : "—"}
        </div>
      </div>
    </div>
  );
}

export default function Percentage() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
      {modes.map((m) => <Card key={m.id} m={m} />)}
    </div>
  );
}
