"use client";
import { useState } from "react";
import { Field, NumInput, Stat, Seg, inr } from "@/components/ui";

export default function Discount() {
  const [price, setPrice] = useState("2499");
  const [d1, setD1] = useState("20");
  const [d2, setD2] = useState("");
  const [kind, setKind] = useState("pct");
  const [tax, setTax] = useState("");

  const p = +price || 0;
  const after1 = kind === "pct" ? p * (1 - (+d1 || 0) / 100) : Math.max(0, p - (+d1 || 0));
  const after2 = after1 * (1 - (+d2 || 0) / 100);
  const taxAmt = after2 * ((+tax || 0) / 100);
  const final = after2 + taxAmt;
  const saved = p - after2;
  const effective = p ? (saved / p) * 100 : 0;

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="big-result">
          <span>Final price</span>
          <strong>{inr(final, 2)}</strong>
          <small>You save {inr(saved, 2)} ({effective.toFixed(1)}% off)</small>
        </div>
        <div className="stats">
          <Stat label="Original price" value={inr(p, 2)} />
          <Stat label="After discount" value={inr(after2, 2)} />
          <Stat label="You save" value={inr(saved, 2)} />
          {+tax > 0 && <Stat label={`Tax ${tax}%`} value={inr(taxAmt, 2)} />}
          <Stat label="Effective discount" value={`${effective.toFixed(2)}%`} />
        </div>
        <div className="panel">
          <div className="panel-title">Price breakdown</div>
          <div style={{ height: 16, borderRadius: 99, overflow: "hidden", display: "flex", background: "var(--surface-2)" }}>
            <div style={{ width: `${p ? (after2 / p) * 100 : 0}%`, background: "linear-gradient(90deg,#00c896,#00a3ff)", transition: "width .4s" }} />
            <div style={{ width: `${p ? (saved / p) * 100 : 0}%`, background: "repeating-linear-gradient(45deg,#ff4d8d,#ff4d8d 6px,#ff7aa8 6px,#ff7aa8 12px)", transition: "width .4s" }} />
          </div>
          <div className="row" style={{ justifyContent: "space-between", marginTop: 8, fontSize: ".85rem" }}>
            <span>Pay {inr(after2)}</span><span style={{ color: "#ff4d8d", fontWeight: 700 }}>Save {inr(saved)}</span>
          </div>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Original price"><NumInput value={price} onChange={setPrice} prefix="₹" /></Field>
          <Field label="Discount type"><Seg options={[{ label: "Percent", value: "pct" }, { label: "Flat ₹", value: "flat" }]} value={kind} onChange={setKind} /></Field>
          <Field label="Discount"><NumInput value={d1} onChange={setD1} suffix={kind === "pct" ? "%" : "₹"} /></Field>
          <Field label="Extra discount (optional)" hint="Applied on the already-discounted price"><NumInput value={d2} onChange={setD2} suffix="%" placeholder="e.g. 10" /></Field>
          <Field label="Tax / GST (optional)"><NumInput value={tax} onChange={setTax} suffix="%" placeholder="e.g. 18" /></Field>
        </div>
      </div>
    </div>
  );
}
