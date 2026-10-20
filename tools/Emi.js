"use client";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Field, Seg, Range, NumInput, Stat, Donut, inr } from "@/components/ui";
import { downloadText } from "@/lib/file";

const presets = { home: { p: 5000000, r: 8.5, y: 20 }, car: { p: 800000, r: 9.5, y: 5 }, personal: { p: 300000, r: 12, y: 3 } };

export default function Emi() {
  const [type, setType] = useState("home");
  const [p, setP] = useState(presets.home.p);
  const [r, setR] = useState(presets.home.r);
  const [y, setY] = useState(presets.home.y);
  const [unit, setUnit] = useState("years");

  const pick = (t) => { setType(t); setP(presets[t].p); setR(presets[t].r); setY(presets[t].y); setUnit("years"); };
  const months = Math.max(1, Math.round(unit === "years" ? y * 12 : y));
  const mr = r / 12 / 100;
  const emi = mr ? (p * mr * Math.pow(1 + mr, months)) / (Math.pow(1 + mr, months) - 1) : p / months;
  const total = emi * months;
  const interest = total - p;

  const schedule = useMemo(() => {
    const rows = [];
    let bal = p;
    let yr = { year: 1, principal: 0, interest: 0 };
    for (let m = 1; m <= months; m++) {
      const int = bal * mr;
      const prin = emi - int;
      bal = Math.max(0, bal - prin);
      yr.principal += prin;
      yr.interest += int;
      if (m % 12 === 0 || m === months) {
        rows.push({ ...yr, balance: bal });
        yr = { year: yr.year + 1, principal: 0, interest: 0 };
      }
    }
    return rows;
  }, [p, mr, months, emi]);

  const csv = () => downloadText(
    "Year,Principal,Interest,Balance\n" + schedule.map((s) => [s.year, s.principal.toFixed(2), s.interest.toFixed(2), s.balance.toFixed(2)].join(",")).join("\n"),
    "emi-schedule.csv", "text/csv",
  );

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="big-result">
          <span>Monthly EMI</span>
          <strong>{inr(emi)}</strong>
          <small>for {months} months at {r}% p.a.</small>
        </div>
        <div className="stats">
          <Stat label="Principal" value={inr(p)} />
          <Stat label="Total interest" value={inr(interest)} />
          <Stat label="Total payment" value={inr(total)} />
        </div>
        <div className="panel">
          <div className="donut-wrap">
            <Donut parts={[{ label: "Principal", value: p, color: "#00b3b0" }, { label: "Interest", value: interest, color: "#ff4d8d" }]} center={`${Math.round((interest / total) * 100) || 0}%`} />
            <div className="legend">
              <div><i style={{ background: "#00b3b0" }} /> Principal <b>{inr(p)}</b></div>
              <div><i style={{ background: "#ff4d8d" }} /> Interest <b>{inr(interest)}</b></div>
              <small className="muted">Centre shows interest as a share of the total paid.</small>
            </div>
          </div>
        </div>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <h3>Year-wise amortisation</h3>
          <button className="btn btn-sm" onClick={csv}><Download size={15} /> CSV</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Year</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
            <tbody>
              {schedule.map((s) => (
                <tr key={s.year}><td>Year {s.year}</td><td>{inr(s.principal)}</td><td>{inr(s.interest)}</td><td>{inr(s.balance)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Seg options={[{ label: "Home", value: "home" }, { label: "Car", value: "car" }, { label: "Personal", value: "personal" }]} value={type} onChange={pick} />
          <Field label="Loan amount"><NumInput value={p} onChange={(v) => setP(+v)} prefix="₹" /></Field>
          <Range label="" value={Math.min(p, 20000000)} min={10000} max={20000000} step={10000} onChange={setP} format={() => ""} />
          <Field label="Interest rate (p.a.)"><NumInput value={r} onChange={(v) => setR(+v)} suffix="%" /></Field>
          <Range label="" value={Math.min(r, 30)} min={1} max={30} step={0.1} onChange={setR} format={() => ""} />
          <Field label="Tenure">
            <div className="row" style={{ flexWrap: "nowrap" }}>
              <div className="grow"><NumInput value={y} onChange={(v) => setY(+v)} /></div>
              <Seg options={[{ label: "Years", value: "years" }, { label: "Months", value: "months" }]} value={unit} onChange={(u) => { setUnit(u); setY(u === "months" ? y * 12 : Math.max(1, Math.round(y / 12))); }} />
            </div>
          </Field>
          <Range label="" value={Math.min(y, unit === "years" ? 30 : 360)} min={1} max={unit === "years" ? 30 : 360} onChange={setY} format={() => ""} />
        </div>
      </div>
    </div>
  );
}
