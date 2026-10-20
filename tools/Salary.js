"use client";
import { useState } from "react";
import { Field, Seg, NumInput, Stat, Donut, Msg, Toggle, inr } from "@/components/ui";

// FY 2025-26 (AY 2026-27) slabs
const NEW = [[400000, 0], [800000, 5], [1200000, 10], [1600000, 15], [2000000, 20], [2400000, 25], [Infinity, 30]];
const OLD = [[250000, 0], [500000, 5], [1000000, 20], [Infinity, 30]];

function slabTax(income, slabs) {
  let tax = 0, prev = 0;
  for (const [limit, rate] of slabs) {
    if (income > prev) tax += ((Math.min(income, limit) - prev) * rate) / 100;
    prev = limit;
  }
  return tax;
}

function incomeTax(taxable, regime) {
  let tax = slabTax(taxable, regime === "new" ? NEW : OLD);
  if (regime === "new") {
    if (taxable <= 1200000) tax = 0; // 87A rebate
    else tax = Math.min(tax, taxable - 1200000); // marginal relief
  } else if (taxable <= 500000) tax = 0;
  // surcharge for high incomes
  let sur = 0;
  if (taxable > 5000000) sur = taxable > 50000000 && regime === "old" ? 0.37 : taxable > 20000000 ? 0.25 : taxable > 10000000 ? 0.15 : 0.1;
  tax += tax * sur;
  return tax * 1.04; // 4% health & education cess
}

export default function Salary() {
  const [ctc, setCtc] = useState("1200000");
  const [basicPct, setBasicPct] = useState("50");
  const [regime, setRegime] = useState("new");
  const [pfCap, setPfCap] = useState(true);
  const [pt, setPt] = useState("2400");
  const [bonus, setBonus] = useState("0");
  const [ded, setDed] = useState("150000");
  const [hra, setHra] = useState("0");

  const C = +ctc || 0;
  const basic = (C * (+basicPct || 0)) / 100;
  const pfMonthly = Math.min((basic / 12) * 0.12, pfCap ? 1800 : Infinity);
  const pfEmployer = pfMonthly * 12;
  const pfEmployee = pfMonthly * 12;
  const gratuity = basic * 0.0481;
  const gross = C - pfEmployer - gratuity - (+bonus || 0);
  const profTax = +pt || 0;

  const calc = (r) => {
    const std = r === "new" ? 75000 : 50000;
    const deductions = r === "old" ? Math.min(+ded || 0, 150000) + (+hra || 0) + profTax : 0;
    const taxable = Math.max(0, gross + (+bonus || 0) - std - deductions);
    return { taxable, tax: incomeTax(taxable, r) };
  };
  const cur = calc(regime);
  const other = calc(regime === "new" ? "old" : "new");
  const B = +bonus || 0;
  const inHandYear = gross + B - pfEmployee - profTax - cur.tax;
  // monthly pay excludes the bonus; spread tax in proportion to fixed vs variable income
  const fixedShare = gross + B > 0 ? gross / (gross + B) : 1;
  const inHand = (gross - pfEmployee - profTax - cur.tax * fixedShare) / 12;
  const better = cur.tax <= other.tax ? regime : regime === "new" ? "old" : "new";

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="big-result">
          <span>Monthly take-home</span>
          <strong>{inr(inHand)}</strong>
          <small>{inr(inHandYear)} per year{B ? " incl. bonus" : ""} · {regime === "new" ? "New" : "Old"} regime</small>
        </div>
        <div className="stats">
          <Stat label="Gross salary" value={inr(gross)} sub="per year" />
          <Stat label="Income tax" value={inr(cur.tax)} sub={`${inr(cur.tax / 12)}/month`} />
          <Stat label="Employee PF" value={inr(pfEmployee)} sub={`${inr(pfMonthly)}/month`} />
          <Stat label="Taxable income" value={inr(cur.taxable)} />
        </div>
        <Msg type={better === regime ? "ok" : "info"}>
          {better === regime
            ? `The ${regime} regime is better for you — you pay ${inr(other.tax - cur.tax)} less tax than the ${regime === "new" ? "old" : "new"} regime.`
            : `Switching to the ${better} regime could save you ${inr(cur.tax - other.tax)} in tax per year.`}
        </Msg>
        <div className="panel">
          <div className="panel-title">Where your CTC goes</div>
          <div className="donut-wrap">
            <Donut
              size={200}
              parts={[
                { label: "Take-home", value: inHandYear, color: "#00b3b0" },
                { label: "Income tax", value: cur.tax, color: "#ff4d8d" },
                { label: "PF (both)", value: pfEmployee + pfEmployer, color: "#7c5cff" },
                { label: "Gratuity", value: gratuity, color: "#f9a826" },
                { label: "Professional tax", value: profTax, color: "#2d8cff" },
              ]}
              center={`${C ? Math.round((inHandYear / C) * 100) : 0}%`}
            />
            <div className="legend">
              <div><i style={{ background: "#00b3b0" }} /> Take-home <b>{inr(inHandYear)}</b></div>
              <div><i style={{ background: "#ff4d8d" }} /> Income tax <b>{inr(cur.tax)}</b></div>
              <div><i style={{ background: "#7c5cff" }} /> PF (employee + employer) <b>{inr(pfEmployee + pfEmployer)}</b></div>
              <div><i style={{ background: "#f9a826" }} /> Gratuity <b>{inr(gratuity)}</b></div>
              <div><i style={{ background: "#2d8cff" }} /> Professional tax <b>{inr(profTax)}</b></div>
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Component</th><th>Monthly</th><th>Yearly</th></tr></thead>
            <tbody>
              {[
                ["Cost to company (CTC)", C],
                ["Basic salary", basic],
                ["Employer PF", pfEmployer],
                ["Gratuity (4.81% of basic)", gratuity],
                ["Variable / bonus", +bonus || 0],
                ["Gross salary", gross],
                ["Employee PF", -pfEmployee],
                ["Professional tax", -profTax],
                ["Income tax (incl. cess)", -cur.tax],
                ["Net take-home (incl. bonus)", inHandYear],
              ].map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{inr(v / 12)}</td><td>{inr(v)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <small className="muted">Estimates for FY 2025-26 using standard assumptions. Actual pay depends on your company&apos;s salary structure.</small>
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Annual CTC"><NumInput value={ctc} onChange={setCtc} prefix="₹" /></Field>
          <Field label="Tax regime"><Seg options={[{ label: "New regime", value: "new" }, { label: "Old regime", value: "old" }]} value={regime} onChange={setRegime} /></Field>
          <Field label="Basic salary (% of CTC)"><NumInput value={basicPct} onChange={setBasicPct} suffix="%" /></Field>
          <Field label="Variable pay / bonus (yearly)" hint="Paid separately, excluded from monthly pay"><NumInput value={bonus} onChange={setBonus} prefix="₹" /></Field>
          <Field label="Professional tax (yearly)"><NumInput value={pt} onChange={setPt} prefix="₹" /></Field>
          <Toggle label="Cap PF at ₹1,800/month" checked={pfCap} onChange={setPfCap} />
        </div>
        {regime === "old" && (
          <div className="panel stack">
            <div className="panel-title">Old regime deductions</div>
            <Field label="80C investments (max ₹1.5L)"><NumInput value={ded} onChange={setDed} prefix="₹" /></Field>
            <Field label="HRA exemption + other deductions"><NumInput value={hra} onChange={setHra} prefix="₹" /></Field>
          </div>
        )}
      </div>
    </div>
  );
}
