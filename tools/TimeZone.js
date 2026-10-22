"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, X, Clock } from "lucide-react";
import { Field, CopyBtn } from "@/components/ui";

const DEFAULTS = ["Asia/Kolkata", "UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Dubai", "Asia/Singapore", "Australia/Sydney"];
const NICK = {
  "Asia/Kolkata": "IST · India", UTC: "UTC", "America/New_York": "ET · New York", "America/Los_Angeles": "PT · Los Angeles", "America/Chicago": "CT · Chicago",
  "Europe/London": "UK · London", "Europe/Paris": "CET · Paris", "Europe/Berlin": "CET · Berlin", "Asia/Dubai": "GST · Dubai", "Asia/Singapore": "SGT · Singapore",
  "Australia/Sydney": "AET · Sydney", "Asia/Tokyo": "JST · Tokyo", "Asia/Shanghai": "CST · China", "Asia/Karachi": "PKT · Pakistan", "Asia/Dhaka": "BST · Bangladesh",
  "Asia/Kathmandu": "NPT · Nepal", "Europe/Moscow": "MSK · Moscow", "America/Toronto": "ET · Toronto", "America/Sao_Paulo": "BRT · São Paulo", "Africa/Johannesburg": "SAST · Johannesburg",
};

const ALIAS = { "Asia/Calcutta": "Asia/Kolkata", "Asia/Katmandu": "Asia/Kathmandu", "Asia/Saigon": "Asia/Ho_Chi_Minh", "Asia/Rangoon": "Asia/Yangon", "Europe/Kiev": "Europe/Kyiv", "America/Buenos_Aires": "America/Argentina/Buenos_Aires" };

const partsFmt = {};
function wall(epoch, tz) {
  partsFmt[tz] ||= new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const p = Object.fromEntries(partsFmt[tz].formatToParts(epoch).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
}
const offsetMs = (epoch, tz) => wall(epoch, tz) - Math.floor(epoch / 1000) * 1000;
// Wall-clock time in `tz` → exact instant (re-checks the offset so DST changes are handled).
function toEpoch(y, mo, d, h, mi, tz) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const e1 = guess - offsetMs(guess, tz);
  return guess - offsetMs(e1, tz);
}
const fmtOffset = (ms) => { const m = Math.round(ms / 60000), s = m < 0 ? "−" : "+", a = Math.abs(m); return `UTC${s}${Math.floor(a / 60)}${a % 60 ? ":" + String(a % 60).padStart(2, "0") : ""}`; };
const pad = (n) => String(n).padStart(2, "0");

export default function TimeZone() {
  const [zones, setZones] = useState(DEFAULTS);
  const [from, setFrom] = useState("Asia/Kolkata");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [h24, setH24] = useState(false);
  const [add, setAdd] = useState("");
  const all = useMemo(() => {
    let list = DEFAULTS;
    try { list = Intl.supportedValuesOf("timeZone"); } catch {}
    // browsers still report some legacy names (e.g. Asia/Calcutta) — show the modern ones
    return [...new Set([...DEFAULTS, ...Object.keys(NICK), ...list.map((z) => ALIAS[z] || z)])].sort();
  }, []);

  useEffect(() => {
    const raw = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const local = ALIAS[raw] || raw;
    if (all.includes(local)) setFrom(local);
    const n = new Date();
    setDate(`${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`);
    setTime(`${pad(n.getHours())}:${pad(n.getMinutes())}`);
  }, [all]);

  if (!date || !time) return null;
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const epoch = toEpoch(y, mo, d, h, mi, from);
  const srcDay = Date.UTC(y, mo - 1, d);

  const rows = [from, ...zones.filter((z) => z !== from)].map((tz) => {
    const w = wall(epoch, tz);
    const dayDiff = Math.round((Date.UTC(new Date(w).getUTCFullYear(), new Date(w).getUTCMonth(), new Date(w).getUTCDate()) - srcDay) / 864e5);
    const hour = new Date(w).getUTCHours();
    return {
      tz, label: NICK[tz] || tz.split("/").pop().replace(/_/g, " "),
      time: new Intl.DateTimeFormat("en-IN", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: !h24 }).format(epoch),
      day: new Intl.DateTimeFormat("en-IN", { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(epoch),
      off: fmtOffset(offsetMs(epoch, tz)), dayDiff, work: hour >= 9 && hour < 18, night: hour < 6 || hour >= 22,
    };
  });
  const summary = rows.map((r) => `${r.label}: ${r.time}, ${r.day} (${r.off})`).join("\n");
  const setNow = () => { const n = new Date(); const w = new Date(wall(n.getTime(), from)); setDate(`${w.getUTCFullYear()}-${pad(w.getUTCMonth() + 1)}-${pad(w.getUTCDate())}`); setTime(`${pad(w.getUTCHours())}:${pad(w.getUTCMinutes())}`); };

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="file-list">
          {rows.map((r, i) => (
            <div key={r.tz} className="file-item" style={{ padding: "14px 16px", borderColor: i === 0 ? "var(--brand)" : undefined }}>
              <span className="icon-soft" style={{ "--c": r.night ? "#6366f1" : r.work ? "#0aa874" : "#f59e0b", "--s": "40px" }}><Clock /></span>
              <div className="meta">
                <strong>{r.label}{i === 0 && <span className="badge" style={{ position: "static", marginLeft: 8, "--c": "var(--brand)" }}>source</span>}</strong>
                <small>{r.tz} · {r.off}</small>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums" }}>{r.time}</div>
                <small className="muted">{r.day}{r.dayDiff ? ` (${r.dayDiff > 0 ? "+" : ""}${r.dayDiff} day)` : ""}</small>
              </div>
              {i > 0 && <button className="btn btn-sm btn-ghost btn-icon btn-danger" onClick={() => setZones((Z) => Z.filter((z) => z !== r.tz))} aria-label="Remove"><X size={15} /></button>}
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 14, fontSize: ".8rem", color: "var(--muted)" }}>
          <span><span style={{ color: "#0aa874" }}>●</span> Working hours (9–6)</span>
          <span><span style={{ color: "#f59e0b" }}>●</span> Early/evening</span>
          <span><span style={{ color: "#6366f1" }}>●</span> Night</span>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Convert from">
            <select className="select" value={from} onChange={(e) => setFrom(e.target.value)}>
              {all.map((z) => <option key={z} value={z}>{NICK[z] ? `${NICK[z]} (${z})` : z}</option>)}
            </select>
          </Field>
          <div className="grid-2">
            <Field label="Date"><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Time"><input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          </div>
          <div className="grid-2">
            <button className="btn btn-sm" onClick={setNow}>Now</button>
            <button className="btn btn-sm" onClick={() => setH24(!h24)}>{h24 ? "12-hour" : "24-hour"}</button>
          </div>
        </div>
        <div className="panel stack">
          <Field label="Add a time zone">
            <div className="row" style={{ flexWrap: "nowrap" }}>
              <input className="input" list="tz-list" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Search e.g. Tokyo, Berlin…" />
              <button className="btn btn-icon" disabled={!all.includes(add)} onClick={() => { setZones((Z) => [...new Set([...Z, add])]); setAdd(""); }} aria-label="Add"><Plus size={16} /></button>
            </div>
            <datalist id="tz-list">{all.map((z) => <option key={z} value={z}>{NICK[z] || ""}</option>)}</datalist>
          </Field>
          <div className="row" style={{ gap: 6 }}>
            {Object.keys(NICK).filter((z) => !zones.includes(z) && z !== from).slice(0, 8).map((z) => (
              <button key={z} className="btn btn-sm" onClick={() => setZones((Z) => [...Z, z])}>+ {NICK[z].split(" · ").pop()}</button>
            ))}
          </div>
        </div>
        <CopyBtn text={summary} label="Copy all times" className="btn" />
      </div>
    </div>
  );
}
