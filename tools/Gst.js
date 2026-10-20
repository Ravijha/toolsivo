"use client";
import { useState } from "react";
import { Field, Seg, NumInput, Stat, Donut, inr } from "@/components/ui";

const rates = [0.25, 3, 5, 12, 18, 28, 40];

export default function Gst() {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState(18);
  const [custom, setCustom] = useState("");
  const [mode, setMode] = useState("add");
  const [supply, setSupply] = useState("intra");

  const r = custom !== "" ? +custom : rate;
  const a = +amount || 0;
  const base = mode === "add" ? a : a / (1 + r / 100);
  const gst = mode === "add" ? (a * r) / 100 : a - base;
  const total = base + gst;

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="big-result">
          <span>{mode === "add" ? "Total amount (incl. GST)" : "Original amount (excl. GST)"}</span>
          <strong>{inr(mode === "add" ? total : base, 2)}</strong>
          <small>GST @ {r}% = {inr(gst, 2)}</small>
        </div>
        <div className="stats">
          <Stat label="Net amount" value={inr(base, 2)} />
          <Stat label="Total GST" value={inr(gst, 2)} />
          {supply === "intra" ? (
            <>
              <Stat label={`CGST ${r / 2}%`} value={inr(gst / 2, 2)} />
              <Stat label={`SGST ${r / 2}%`} value={inr(gst / 2, 2)} />
            </>
          ) : (
            <Stat label={`IGST ${r}%`} value={inr(gst, 2)} />
          )}
          <Stat label="Gross amount" value={inr(total, 2)} />
        </div>
        <div className="panel">
          <div className="donut-wrap">
            <Donut parts={[{ label: "Net", value: base, color: "#00b3b0" }, { label: "GST", value: gst, color: "#7c5cff" }]} center={`${r}%`} />
            <div className="legend">
              <div><i style={{ background: "#00b3b0" }} /> Net amount <b>{inr(base, 2)}</b></div>
              <div><i style={{ background: "#7c5cff" }} /> GST <b>{inr(gst, 2)}</b></div>
            </div>
          </div>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Calculation">
            <Seg options={[{ label: "Add GST", value: "add" }, { label: "Remove GST", value: "remove" }]} value={mode} onChange={setMode} />
          </Field>
          <Field label={mode === "add" ? "Amount (excluding GST)" : "Amount (including GST)"}>
            <NumInput value={amount} onChange={setAmount} prefix="₹" />
          </Field>
          <Field label="GST rate">
            <div className="seg">
              {rates.map((x) => (
                <button key={x} className={custom === "" && rate === x ? "on" : ""} onClick={() => { setRate(x); setCustom(""); }}>{x}%</button>
              ))}
            </div>
          </Field>
          <Field label="Custom rate (optional)"><NumInput value={custom} onChange={setCustom} suffix="%" placeholder="e.g. 7.5" /></Field>
          <Field label="Type of supply">
            <Seg options={[{ label: "Within state", value: "intra" }, { label: "Inter-state", value: "inter" }]} value={supply} onChange={setSupply} />
          </Field>
        </div>
      </div>
    </div>
  );
}
