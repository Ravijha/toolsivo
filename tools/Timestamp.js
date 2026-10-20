"use client";
import { useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Field, Seg, CopyBtn, Msg } from "@/components/ui";

const rel = (ms) => {
  const s = Math.round((ms - Date.now()) / 1000);
  const units = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [u, n] of units) if (Math.abs(s) >= n || u === "second") return rtf.format(Math.round(s / n), u);
};
const pad = (n) => String(n).padStart(2, "0");
const localInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

export default function Timestamp() {
  const [now, setNow] = useState(null);
  const [live, setLive] = useState(true);
  const [ts, setTs] = useState("");
  const [unit, setUnit] = useState("auto");
  const [dt, setDt] = useState("");

  useEffect(() => {
    const n = Date.now();
    setNow(n);
    setTs(String(Math.floor(n / 1000)));
    setDt(localInput(new Date(n)));
  }, []);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [live]);

  const parsed = useMemo(() => {
    const v = ts.trim();
    if (!/^-?\d+(\.\d+)?$/.test(v)) return null;
    const n = +v;
    const isMs = unit === "ms" || (unit === "auto" && Math.abs(n) > 1e11);
    const d = new Date(isMs ? n : n * 1000);
    return isNaN(d) ? null : { d, isMs };
  }, [ts, unit]);

  const fromDate = useMemo(() => {
    const d = new Date(dt);
    return isNaN(d) ? null : d;
  }, [dt]);

  if (now == null) return null;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="stack">
      <div className="big-result">
        <span>Current Unix timestamp</span>
        <strong style={{ fontFamily: "var(--mono)" }}>{Math.floor(now / 1000)}</strong>
        <small>{new Date(now).toLocaleString()} · {tz}</small>
        <div className="row" style={{ justifyContent: "center", marginTop: 12 }}>
          <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.18)", color: "#fff", border: 0 }} onClick={() => setLive(!live)}>
            {live ? <Pause size={14} /> : <Play size={14} />} {live ? "Pause" : "Resume"}
          </button>
          <CopyBtn text={String(Math.floor(now / 1000))} className="btn btn-sm" />
        </div>
      </div>
      <div className="grid-2">
        <div className="panel stack">
          <div className="panel-title">Timestamp → date</div>
          <Field label="Unix timestamp"><input className="input" style={{ fontFamily: "var(--mono)" }} value={ts} onChange={(e) => setTs(e.target.value)} /></Field>
          <Seg options={[{ label: "Auto-detect", value: "auto" }, { label: "Seconds", value: "s" }, { label: "Milliseconds", value: "ms" }]} value={unit} onChange={setUnit} />
          {parsed ? (
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  {[
                    ["Detected", parsed.isMs ? "Milliseconds" : "Seconds"],
                    ["Local", parsed.d.toLocaleString()],
                    ["UTC", parsed.d.toUTCString()],
                    ["ISO 8601", parsed.d.toISOString()],
                    ["Relative", rel(parsed.d.getTime())],
                  ].map(([k, v]) => <tr key={k}><td style={{ fontWeight: 700 }}>{k}</td><td style={{ textAlign: "left", whiteSpace: "normal", fontFamily: "var(--mono)", fontSize: ".82rem" }}>{v}</td></tr>)}
                </tbody>
              </table>
            </div>
          ) : <Msg type="bad">Enter a numeric timestamp.</Msg>}
        </div>
        <div className="panel stack">
          <div className="panel-title">Date → timestamp</div>
          <Field label={`Date & time (${tz})`}><input type="datetime-local" step="1" className="input" value={dt} onChange={(e) => setDt(e.target.value)} /></Field>
          {fromDate && (
            <div className="stack">
              {[["Seconds", Math.floor(fromDate.getTime() / 1000)], ["Milliseconds", fromDate.getTime()], ["ISO 8601", fromDate.toISOString()]].map(([k, v]) => (
                <div key={k} className="row" style={{ justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, background: "var(--elev)", border: "1px solid var(--border)" }}>
                  <div><small className="muted">{k}</small><div style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{v}</div></div>
                  <CopyBtn text={String(v)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
