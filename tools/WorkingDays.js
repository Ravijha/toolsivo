"use client";
import { useEffect, useMemo, useState } from "react";
import { Field, Seg, Stat, Toggle, NumInput, Msg } from "@/components/ui";
import { parseDate, toInput, today, pretty, dayDiff } from "@/lib/dates";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Fixed-date national holidays in India (other festivals change every year — add them below)
const INDIA_FIXED = (y) => [`${y}-01-26 Republic Day`, `${y}-08-15 Independence Day`, `${y}-10-02 Gandhi Jayanti`, `${y}-12-25 Christmas`];

function parseHolidays(text) {
  const out = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/(\d{4})-(\d{1,2})-(\d{1,2})|(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
    if (!m) continue;
    const d = m[1] ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(+m[6], +m[5] - 1, +m[4]);
    if (!isNaN(d)) out.set(toInput(d), line.replace(m[0], "").trim() || "Holiday");
  }
  return out;
}

export default function WorkingDays() {
  const [mode, setMode] = useState("between");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [n, setN] = useState("10");
  const [weekend, setWeekend] = useState([0, 6]);
  const [incl, setIncl] = useState(true);
  const [hol, setHol] = useState("");

  useEffect(() => {
    const t = today();
    setFrom(toInput(t));
    setTo(toInput(new Date(t.getFullYear(), t.getMonth() + 1, 0)));
    setHol(INDIA_FIXED(t.getFullYear()).join("\n"));
  }, []);

  const holidays = useMemo(() => parseHolidays(hol), [hol]);
  const isWork = (d) => !weekend.includes(d.getDay()) && !holidays.has(toInput(d));

  const res = useMemo(() => {
    let a = parseDate(from), b = parseDate(to);
    if (!a || weekend.length >= 7) return null;
    if (mode === "add") {
      const steps = Math.max(-20000, Math.min(20000, Math.round(+n || 0))), dir = steps < 0 ? -1 : 1;
      const d = new Date(a);
      let left = Math.abs(steps), skipped = 0;
      while (left > 0 && skipped < 100000) {
        d.setDate(d.getDate() + dir);
        if (isWork(d)) left--; else skipped++;
      }
      return { date: d, skipped };
    }
    if (!b) return null;
    if (b < a) [a, b] = [b, a];
    let work = 0, wkend = 0;
    const hit = [];
    const d = new Date(a);
    const end = incl ? b : new Date(b.getFullYear(), b.getMonth(), b.getDate() - 1);
    while (d <= end) {
      const key = toInput(d);
      if (weekend.includes(d.getDay())) wkend++;
      else if (holidays.has(key)) hit.push([key, holidays.get(key)]);
      else work++;
      d.setDate(d.getDate() + 1);
    }
    return { work, wkend, hit, total: dayDiff(a, end) + 1 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, from, to, n, weekend, incl, holidays]);

  if (!from) return null;
  const toggleDay = (i) => setWeekend((W) => (W.includes(i) ? W.filter((x) => x !== i) : [...W, i]));

  return (
    <div className="stack">
      <div style={{ maxWidth: 440 }}><Seg options={[{ label: "Working days between dates", value: "between" }, { label: "Add working days", value: "add" }]} value={mode} onChange={setMode} /></div>
      <div className="tool-cols">
        <div className="stack">
          {res && mode === "between" && (
            <>
              <div className="big-result"><span>Working days</span><strong>{res.work}</strong><small>out of {res.total} calendar days</small></div>
              <div className="stats">
                <Stat label="Weekend days" value={res.wkend} />
                <Stat label="Holidays on weekdays" value={res.hit.length} />
                <Stat label="Working weeks" value={(res.work / (7 - weekend.length || 1)).toFixed(1)} />
                <Stat label="Working hours" value={(res.work * 8).toLocaleString("en-IN")} sub="at 8 h/day" />
              </div>
              {res.hit.length > 0 && (
                <div className="panel stack">
                  <div className="panel-title">Holidays excluded</div>
                  {res.hit.map(([k, name]) => <div key={k} className="row" style={{ justifyContent: "space-between" }}><span>{name}</span><small className="muted">{pretty(parseDate(k))}</small></div>)}
                </div>
              )}
            </>
          )}
          {res && mode === "add" && (
            <div className="big-result"><span>{+n < 0 ? `${Math.abs(+n)} working days before` : `${+n} working days after`} {pretty(parseDate(from))}</span><strong>{pretty(res.date)}</strong><small>{res.skipped} weekend/holiday days skipped</small></div>
          )}
        </div>
        <div className="side">
          <div className="panel stack">
            <Field label={mode === "add" ? "Start date" : "From"}><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            {mode === "between" ? (
              <>
                <Field label="To"><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
                <Toggle label="Include end date" checked={incl} onChange={setIncl} />
              </>
            ) : (
              <Field label="Working days to add" hint="Use a negative number to go back"><NumInput value={n} onChange={setN} /></Field>
            )}
            <Field label="Weekend days">
              <div className="seg">{DAYS.map((d, i) => <button key={d} className={weekend.includes(i) ? "on" : ""} onClick={() => toggleDay(i)}>{d}</button>)}</div>
            </Field>
            {weekend.length === 7 && <Msg type="bad">At least one day must be a working day.</Msg>}
          </div>
          <div className="panel stack">
            <Field label="Holidays (one per line)" hint="Format: 2026-11-08 Diwali or 08/11/2026">
              <textarea className="textarea" style={{ minHeight: 140 }} value={hol} onChange={(e) => setHol(e.target.value)} />
            </Field>
            <small className="muted">{holidays.size} holiday{holidays.size === 1 ? "" : "s"} recognised.</small>
          </div>
        </div>
      </div>
    </div>
  );
}
