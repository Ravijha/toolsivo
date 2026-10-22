"use client";
import { useMemo, useState } from "react";
import { Field, Seg, NumInput, Stat, Msg, inr } from "@/components/ui";

const emiFor = (p, r, n) => (r ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n);

// Month-by-month simulation with optional lump-sum, monthly and yearly prepayments.
function simulate({ P, rate, months, lump, lumpAt, monthly, yearly, strategy }) {
  const r = rate / 1200;
  let emi = emiFor(P, r, months), bal = P, interest = 0, m = 0;
  const years = [];
  let y = { principal: 0, interest: 0, prepaid: 0 };
  while (bal > 0.5 && m < 1200) {
    m++;
    const int = bal * r;
    const pay = Math.min(emi, bal + int);
    bal -= pay - int;
    interest += int;
    y.principal += pay - int; y.interest += int;
    let extra = (m === lumpAt ? lump : 0) + monthly + (m % 12 === 0 ? yearly : 0);
    extra = Math.min(extra, bal);
    bal -= extra;
    y.prepaid += extra;
    // reduce-EMI strategy: keep the original end date, recompute the instalment
    if (extra > 0 && strategy === "emi" && m < months && bal > 0) emi = emiFor(bal, r, months - m);
    if (m % 12 === 0 || bal <= 0.5) { years.push({ ...y, balance: Math.max(0, bal) }); y = { principal: 0, interest: 0, prepaid: 0 }; }
  }
  return { months: m, interest, emi, years };
}

const ym = (m) => `${Math.floor(m / 12)}y ${m % 12}m`;

export default function LoanPrepay() {
  const [P, setP] = useState("5000000");
  const [rate, setRate] = useState("8.5");
  const [years, setYears] = useState("20");
  const [lump, setLump] = useState("500000");
  const [lumpAt, setLumpAt] = useState("24");
  const [monthly, setMonthly] = useState("0");
  const [yearly, setYearly] = useState("0");
  const [strategy, setStrategy] = useState("tenure");

  const months = Math.max(1, Math.round(+years * 12));
  const base = useMemo(() => simulate({ P: +P, rate: +rate, months, lump: 0, lumpAt: 0, monthly: 0, yearly: 0 }), [P, rate, months]);
  const pre = useMemo(() => simulate({ P: +P, rate: +rate, months, lump: +lump || 0, lumpAt: +lumpAt || 1, monthly: +monthly || 0, yearly: +yearly || 0, strategy }), [P, rate, months, lump, lumpAt, monthly, yearly, strategy]);
  const saved = base.interest - pre.interest;
  const prepaidTotal = pre.years.reduce((s, y) => s + y.prepaid, 0);
  const valid = +P > 0 && +rate >= 0 && months > 0;
  const maxY = Math.max(base.years.length, pre.years.length);

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        {valid && (
          <>
            <div className="big-result">
              <span>Interest you save</span>
              <strong>{inr(Math.max(0, saved))}</strong>
              <small>{strategy === "tenure" ? `Loan closes ${ym(Math.max(0, base.months - pre.months))} earlier` : `EMI drops from ${inr(base.emi)} to ${inr(pre.emi)}`}</small>
            </div>
            <div className="stats">
              <Stat label="Original EMI" value={inr(base.emi)} />
              <Stat label={strategy === "tenure" ? "New tenure" : "Final EMI"} value={strategy === "tenure" ? ym(pre.months) : inr(pre.emi)} sub={strategy === "tenure" ? `was ${ym(base.months)}` : undefined} />
              <Stat label="Interest without prepaying" value={inr(base.interest)} />
              <Stat label="Interest with prepaying" value={inr(pre.interest)} />
              <Stat label="Total prepaid" value={inr(prepaidTotal)} />
              <Stat hl label="Return on prepayment" value={prepaidTotal ? `${((saved / prepaidTotal) * 100).toFixed(0)}%` : "—"} sub="interest saved ÷ amount prepaid" />
            </div>
            <div className="panel">
              <div className="panel-title">Total interest comparison</div>
              {[["Without prepayment", base.interest, "#ff4d8d"], ["With prepayment", pre.interest, "#00b3b0"]].map(([l, v, c]) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <div className="row" style={{ justifyContent: "space-between", fontSize: ".86rem" }}><span>{l}</span><b>{inr(v)}</b></div>
                  <div style={{ height: 14, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden", marginTop: 4 }}>
                    <div style={{ width: `${(v / base.interest) * 100 || 0}%`, height: "100%", background: c, transition: "width .4s" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Year</th><th>Balance (no prepay)</th><th>Balance (with prepay)</th><th>Prepaid</th><th>Interest paid</th></tr></thead>
                <tbody>
                  {Array.from({ length: maxY }, (_, i) => (
                    <tr key={i}>
                      <td>Year {i + 1}</td>
                      <td>{inr(base.years[i]?.balance ?? 0)}</td>
                      <td>{pre.years[i] ? inr(pre.years[i].balance) : <span style={{ color: "var(--ok)", fontWeight: 700 }}>Closed ✓</span>}</td>
                      <td>{pre.years[i]?.prepaid ? inr(pre.years[i].prepaid) : "—"}</td>
                      <td>{inr(pre.years[i]?.interest ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {!valid && <Msg type="bad">Enter a loan amount, interest rate and tenure.</Msg>}
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Loan</div>
          <Field label="Loan amount"><NumInput value={P} onChange={setP} prefix="₹" /></Field>
          <div className="grid-2">
            <Field label="Interest rate"><NumInput value={rate} onChange={setRate} suffix="%" /></Field>
            <Field label="Tenure"><NumInput value={years} onChange={setYears} suffix="yrs" /></Field>
          </div>
        </div>
        <div className="panel stack">
          <div className="panel-title">Prepayments</div>
          <div className="grid-2">
            <Field label="One-time amount"><NumInput value={lump} onChange={setLump} prefix="₹" /></Field>
            <Field label="Paid in month"><NumInput value={lumpAt} onChange={setLumpAt} min={1} /></Field>
          </div>
          <Field label="Extra every month"><NumInput value={monthly} onChange={setMonthly} prefix="₹" /></Field>
          <Field label="Extra every year"><NumInput value={yearly} onChange={setYearly} prefix="₹" /></Field>
          <Field label="After prepaying, reduce">
            <Seg options={[{ label: "Tenure", value: "tenure" }, { label: "EMI", value: "emi" }]} value={strategy} onChange={setStrategy} />
          </Field>
          <small className="muted">Reducing tenure saves more interest; reducing EMI lowers your monthly outgo.</small>
        </div>
      </div>
    </div>
  );
}
