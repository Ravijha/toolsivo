"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Field, Seg, Stat, Toggle, NumInput, inr } from "@/components/ui";

const pad = (n) => String(n).padStart(2, "0");
const hms = (sec) => { const s = Math.abs(Math.round(sec)); return `${sec < 0 ? "−" : ""}${Math.floor(s / 3600)}h ${pad(Math.floor(s / 60) % 60)}m ${pad(s % 60)}s`; };
const clock = (sec) => { const s = Math.abs(Math.round(sec)); return `${sec < 0 ? "−" : ""}${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; };
const toSec = (t) => { const [h = 0, m = 0, s = 0] = t.split(":").map(Number); return h * 3600 + m * 60 + s; };

function Between() {
  const [start, setStart] = useState("09:30");
  const [end, setEnd] = useState("18:15");
  const [multi, setMulti] = useState(false);
  const [d1, setD1] = useState("2026-10-22");
  const [d2, setD2] = useState("2026-10-23");
  const [brk, setBrk] = useState("45");
  const [rate, setRate] = useState("");

  let sec = toSec(end) - toSec(start);
  if (multi) sec += Math.round((Date.parse(d2) - Date.parse(d1)) / 1000);
  const overnight = !multi && sec < 0;
  if (overnight) sec += 86400;
  const net = Math.max(0, sec - (+brk || 0) * 60);

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="big-result">
          <span>Duration{+brk ? " (after break)" : ""}</span>
          <strong>{hms(net)}</strong>
          <small>{overnight ? "Crosses midnight · " : ""}{(net / 3600).toFixed(2)} hours in decimal</small>
        </div>
        <div className="stats">
          <Stat label="Total time" value={clock(sec)} sub="before break" />
          <Stat label="Decimal hours" value={(net / 3600).toFixed(2)} />
          <Stat label="Minutes" value={Math.round(net / 60).toLocaleString("en-IN")} />
          <Stat label="Seconds" value={net.toLocaleString("en-IN")} />
          {+rate > 0 && <Stat hl label="Earnings" value={inr((net / 3600) * +rate, 2)} sub={`at ${inr(+rate)}/hour`} />}
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="grid-2">
            <Field label="Start time"><input type="time" step="1" className="input" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
            <Field label="End time"><input type="time" step="1" className="input" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
          </div>
          <Toggle label="Spans multiple days" checked={multi} onChange={setMulti} />
          {multi && (
            <div className="grid-2">
              <Field label="Start date"><input type="date" className="input" value={d1} onChange={(e) => setD1(e.target.value)} /></Field>
              <Field label="End date"><input type="date" className="input" value={d2} onChange={(e) => setD2(e.target.value)} /></Field>
            </div>
          )}
          <Field label="Break (minutes)"><NumInput value={brk} onChange={setBrk} suffix="min" min={0} /></Field>
          <Field label="Hourly rate (optional)"><NumInput value={rate} onChange={setRate} prefix="₹" placeholder="e.g. 500" /></Field>
        </div>
      </div>
    </div>
  );
}

let uid = 0;
const row = (h = "", m = "", s = "", sign = 1) => ({ id: ++uid, h, m, s, sign });

function Sum() {
  const [rows, setRows] = useState([row("2", "45", "0"), row("1", "30", "20"), row("0", "50", "40")]);
  const up = (id, k, v) => setRows((R) => R.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const total = rows.reduce((t, r) => t + r.sign * ((+r.h || 0) * 3600 + (+r.m || 0) * 60 + (+r.s || 0)), 0);

  return (
    <div className="tool-cols">
      <div className="stack">
        {rows.map((r, i) => (
          <div key={r.id} className="row" style={{ flexWrap: "nowrap", gap: 8 }}>
            <button className="btn btn-icon" onClick={() => up(r.id, "sign", -r.sign)} disabled={i === 0} title="Add or subtract" style={{ fontWeight: 800, fontSize: "1.1rem" }}>{r.sign > 0 ? "+" : "−"}</button>
            <NumInput value={r.h} onChange={(v) => up(r.id, "h", v)} suffix="h" min={0} />
            <NumInput value={r.m} onChange={(v) => up(r.id, "m", v)} suffix="m" min={0} />
            <NumInput value={r.s} onChange={(v) => up(r.id, "s", v)} suffix="s" min={0} />
            <button className="btn btn-icon btn-ghost btn-danger" onClick={() => setRows((R) => R.filter((x) => x.id !== r.id))} disabled={rows.length < 2} aria-label="Remove"><X size={16} /></button>
          </div>
        ))}
        <div><button className="btn btn-sm" onClick={() => setRows((R) => [...R, row()])}><Plus size={15} /> Add time</button></div>
      </div>
      <div className="side">
        <div className="big-result">
          <span>Total</span>
          <strong>{clock(total)}</strong>
          <small>{hms(total)} · {(total / 3600).toFixed(2)} h</small>
        </div>
        <div className="stats">
          <Stat label="Minutes" value={Math.round(total / 60).toLocaleString("en-IN")} />
          <Stat label="Days" value={(total / 86400).toFixed(2)} />
        </div>
      </div>
    </div>
  );
}

export default function TimeDuration() {
  const [tab, setTab] = useState("between");
  return (
    <div className="stack">
      <div style={{ maxWidth: 420 }}><Seg options={[{ label: "Time between", value: "between" }, { label: "Add / subtract times", value: "sum" }]} value={tab} onChange={setTab} /></div>
      {tab === "between" ? <Between /> : <Sum />}
    </div>
  );
}
