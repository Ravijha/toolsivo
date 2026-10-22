"use client";
import { useMemo, useState } from "react";
import { Field, CopyBtn, Msg } from "@/components/ui";

const FIELDS = [
  { key: "min", label: "Minute", min: 0, max: 59 },
  { key: "hour", label: "Hour", min: 0, max: 23 },
  { key: "dom", label: "Day of month", min: 1, max: 31 },
  { key: "mon", label: "Month", min: 1, max: 12, names: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] },
  { key: "dow", label: "Day of week", min: 0, max: 6, names: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] },
];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MACROS = { "@yearly": "0 0 1 1 *", "@annually": "0 0 1 1 *", "@monthly": "0 0 1 * *", "@weekly": "0 0 * * 0", "@daily": "0 0 * * *", "@midnight": "0 0 * * *", "@hourly": "0 * * * *" };
const PRESETS = [
  ["Every minute", "* * * * *"], ["Every 5 minutes", "*/5 * * * *"], ["Every 15 minutes", "*/15 * * * *"], ["Every hour", "0 * * * *"],
  ["Every day at midnight", "0 0 * * *"], ["Every day at 9:30 AM", "30 9 * * *"], ["Weekdays at 9 AM", "0 9 * * 1-5"], ["Every Sunday at 6 PM", "0 18 * * 0"],
  ["1st of every month", "0 0 1 * *"], ["Every quarter", "0 0 1 1,4,7,10 *"], ["Every 6 hours", "0 */6 * * *"], ["Business hours, hourly", "0 9-18 * * 1-5"],
];

function parseField(src, f) {
  let s = src.toUpperCase();
  f.names?.forEach((n, i) => { s = s.replace(new RegExp(`\\b${n}\\b`, "g"), String(i + f.min)); });
  if (f.key === "dow") s = s.replace(/\b7\b/g, "0");
  const set = new Set();
  for (const part of s.split(",")) {
    const m = part.match(/^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/);
    if (!m) throw new Error(`“${src}” is not valid for ${f.label.toLowerCase()}`);
    let [a, b] = m[1] === "*" ? [f.min, f.max] : m[1].split("-").map(Number);
    if (b === undefined) b = m[2] ? f.max : a;
    const step = m[2] ? +m[2] : 1;
    if (a < f.min || b > f.max || a > b || step < 1) throw new Error(`${f.label} must be between ${f.min} and ${f.max}`);
    for (let v = a; v <= b; v += step) set.add(v);
  }
  return { set, any: src.trim() === "*" };
}

const t2 = (h, m) => `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
const listWords = (arr) => (arr.length < 2 ? arr.join("") : `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`);

function describe(p, raw) {
  const [mi, ho, dm, mo, dw] = p;
  const r = raw.split(/\s+/);
  let time;
  if (mi.set.size === 1 && ho.set.size === 1) time = `at ${t2([...ho.set][0], [...mi.set][0])}`;
  else if (mi.any && ho.any) time = "every minute";
  else if (/^\*\/\d+$/.test(r[0]) && ho.any) time = `every ${r[0].slice(2)} minutes`;
  else if (mi.set.size === 1 && ho.any) time = `at minute ${[...mi.set][0]} of every hour`;
  else if (mi.set.size === 1 && /^\*\/\d+$/.test(r[1])) time = `at minute ${[...mi.set][0]} past every ${r[1].slice(2)} hours`;
  else time = `at minute ${listWords([...mi.set].map(String))} past hour ${listWords([...ho.set].map(String))}`;
  const bits = [time];
  if (!dm.any) bits.push(`on day ${listWords([...dm.set].map(String))} of the month`);
  if (!dw.any) bits.push(`${dm.any ? "on" : "or on"} ${listWords([...dw.set].map((d) => DAYS[d]))}`);
  if (!mo.any) bits.push(`in ${listWords([...mo.set].map((m) => MONTHS[m - 1]))}`);
  const s = bits.join(", ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

function nextRuns(p, count = 8) {
  const [mi, ho, dm, mo, dw] = p;
  const out = [];
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  // standard cron: if both day fields are restricted, a day matches either one
  const dayOk = (x) => (dm.any || dw.any ? dm.set.has(x.getDate()) && dw.set.has(x.getDay()) : dm.set.has(x.getDate()) || dw.set.has(x.getDay()));
  for (let guard = 0; out.length < count && guard < 600000; guard++) {
    if (!mo.set.has(d.getMonth() + 1) || !dayOk(d)) { d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); continue; }
    if (!ho.set.has(d.getHours())) { d.setHours(d.getHours() + 1, 0, 0, 0); continue; }
    if (!mi.set.has(d.getMinutes())) { d.setMinutes(d.getMinutes() + 1); continue; }
    out.push(new Date(d));
    d.setMinutes(d.getMinutes() + 1);
  }
  return out;
}

export default function Cron() {
  const [parts, setParts] = useState(["0", "9", "*", "*", "1-5"]);
  const expr = parts.join(" ");

  const res = useMemo(() => {
    try {
      const p = FIELDS.map((f, i) => parseField(parts[i] || "", f));
      return { desc: describe(p, expr), runs: nextRuns(p) };
    } catch (e) { return { error: e.message }; }
  }, [parts, expr]);

  const setExpr = (s) => {
    const e = MACROS[s.trim().toLowerCase()] || s;
    const a = e.trim().split(/\s+/);
    setParts(FIELDS.map((_, i) => a[i] ?? "*"));
  };

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="panel stack" style={{ background: "var(--elev)" }}>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input className="input" style={{ fontFamily: "var(--mono)", fontSize: "1.4rem", fontWeight: 700, textAlign: "center" }} value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false} aria-label="Cron expression" />
            <CopyBtn text={expr} className="btn btn-primary" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {FIELDS.map((f, i) => (
              <Field key={f.key} label={<small>{f.label}</small>}>
                <input className="input" style={{ fontFamily: "var(--mono)", textAlign: "center" }} value={parts[i]} onChange={(e) => setParts((P) => P.map((x, j) => (j === i ? e.target.value.replace(/\s/g, "") : x)))} />
              </Field>
            ))}
          </div>
        </div>
        {res.error ? <Msg type="bad">{res.error}</Msg> : <div className="big-result" style={{ textAlign: "left" }}><span>In plain English</span><strong style={{ fontSize: "1.35rem", lineHeight: 1.35 }}>{res.desc}</strong></div>}
        {res.runs && (
          <div className="panel stack">
            <div className="panel-title">Next runs (your local time)</div>
            {res.runs.length === 0 && <small className="muted">This schedule never runs in the next year — check the day and month fields.</small>}
            {res.runs.map((d) => <div key={d.getTime()} style={{ fontFamily: "var(--mono)", fontSize: ".9rem" }}>{d.toLocaleString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>)}
          </div>
        )}
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Common schedules</div>
          {PRESETS.map(([n, e]) => (
            <button key={e} className={`btn btn-sm ${expr === e ? "btn-dark" : ""}`} style={{ justifyContent: "space-between" }} onClick={() => setExpr(e)}>
              <span>{n}</span><code style={{ opacity: 0.7 }}>{e}</code>
            </button>
          ))}
        </div>
        <div className="panel">
          <div className="panel-title">Syntax</div>
          <small className="muted" style={{ lineHeight: 1.8, display: "block" }}>
            <code>*</code> any value · <code>5</code> exact · <code>1-5</code> range · <code>1,15</code> list · <code>*/10</code> every 10 · <code>MON</code>, <code>JAN</code> names. Standard 5-field Unix cron. Some platforms (Quartz, AWS) use 6–7 fields.
          </small>
        </div>
      </div>
    </div>
  );
}
