"use client";
import { useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Field, Stat, Seg, Toggle, NumInput, num } from "@/components/ui";
import { parseDate, toInput, today, ymd, dayDiff, businessDays, pretty } from "@/lib/dates";

function Between() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [incl, setIncl] = useState(false);
  useEffect(() => {
    const t = today();
    setFrom(toInput(t));
    setTo(toInput(new Date(t.getFullYear(), 11, 31)));
  }, []);
  let a = parseDate(from), b = parseDate(to);
  if (!a || !b) return null;
  const neg = b < a;
  if (neg) [a, b] = [b, a];
  const end = incl ? new Date(b.getFullYear(), b.getMonth(), b.getDate() + 1) : b;
  const d = dayDiff(a, end);
  const c = ymd(a, end);
  const bd = businessDays(a, incl ? b : new Date(b.getFullYear(), b.getMonth(), b.getDate() - 1));

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="big-result">
          <span>Difference</span>
          <strong>{num(d, 0)} days</strong>
          <small>{c.y} years, {c.m} months, {c.d} days{neg ? " (end date is before start)" : ""}</small>
        </div>
        <div className="stats">
          <Stat label="Weeks" value={`${Math.floor(d / 7)}w ${d % 7}d`} />
          <Stat label="Months" value={num(c.y * 12 + c.m, 0)} sub={`+ ${c.d} days`} />
          <Stat label="Working days" value={num(bd, 0)} sub="Mon–Fri" />
          <Stat label="Weekend days" value={num(d - bd, 0)} />
          <Stat label="Hours" value={num(d * 24, 0)} />
          <Stat label="Minutes" value={num(d * 1440, 0)} />
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Start date"><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <button className="btn btn-sm" onClick={() => { setFrom(to); setTo(from); }}><ArrowLeftRight size={14} /> Swap</button>
          <Field label="End date"><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          <Toggle label="Include end date" checked={incl} onChange={setIncl} />
        </div>
      </div>
    </div>
  );
}

function AddSub() {
  const [start, setStart] = useState("");
  const [op, setOp] = useState("add");
  const [y, setY] = useState("0");
  const [m, setM] = useState("0");
  const [w, setW] = useState("0");
  const [d, setD] = useState("30");
  useEffect(() => setStart(toInput(today())), []);
  const s = parseDate(start);
  if (!s) return null;
  const k = op === "add" ? 1 : -1;
  const r = new Date(s.getFullYear() + k * (+y || 0), s.getMonth() + k * (+m || 0), s.getDate() + k * ((+w || 0) * 7 + (+d || 0)));
  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="big-result">
          <span>Result date</span>
          <strong>{pretty(r)}</strong>
          <small>{toInput(r)}</small>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Start date"><input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
          <Seg options={[{ label: "Add", value: "add" }, { label: "Subtract", value: "sub" }]} value={op} onChange={setOp} />
          <div className="grid-2">
            <Field label="Years"><NumInput value={y} onChange={setY} /></Field>
            <Field label="Months"><NumInput value={m} onChange={setM} /></Field>
            <Field label="Weeks"><NumInput value={w} onChange={setW} /></Field>
            <Field label="Days"><NumInput value={d} onChange={setD} /></Field>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DateDiff() {
  const [tab, setTab] = useState("between");
  return (
    <div className="stack">
      <div style={{ maxWidth: 420 }}>
        <Seg options={[{ label: "Days between dates", value: "between" }, { label: "Add / subtract", value: "add" }]} value={tab} onChange={setTab} />
      </div>
      {tab === "between" ? <Between /> : <AddSub />}
    </div>
  );
}
