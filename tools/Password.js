"use client";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Eye, EyeOff, ShieldCheck, ShieldAlert, Download } from "lucide-react";
import { Field, Range, Toggle, CopyBtn, NumInput } from "@/components/ui";
import { copyText, downloadText } from "@/lib/file";
import { generate, strength } from "@/lib/password";

const COLORS = ["#e5384f", "#f97316", "#eab308", "#22c55e", "#0aa874"];

function Meter({ s }) {
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ height: 8, borderRadius: 99, background: i <= s.score && s.bits ? COLORS[s.score] : "var(--border-strong)", transition: "background .3s" }} />
        ))}
      </div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong style={{ color: s.bits ? COLORS[s.score] : "var(--muted)" }}>{s.label}</strong>
        <small className="muted">{s.bits} bits of entropy</small>
      </div>
    </div>
  );
}

export default function Password() {
  const [opt, setOpt] = useState({ length: 16, upper: true, lower: true, digits: true, symbols: true, noSimilar: false });
  const [count, setCount] = useState("5");
  const [list, setList] = useState([]);
  const [check, setCheck] = useState("");
  const [show, setShow] = useState(false);

  const regen = () => setList(Array.from({ length: Math.min(50, Math.max(1, +count || 1)) }, () => generate(opt)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(regen, [opt, count]);

  const toggle = (k) => (v) => {
    const next = { ...opt, [k]: v };
    if (!next.upper && !next.lower && !next.digits && !next.symbols) return; // keep at least one set
    setOpt(next);
  };
  const main = list[0] || "";
  const s = useMemo(() => strength(main), [main]);
  const c = useMemo(() => strength(check), [check]);

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="panel stack" style={{ background: "var(--elev)" }}>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <code style={{ flex: 1, fontSize: "clamp(1rem, 2.4vw, 1.45rem)", fontWeight: 700, wordBreak: "break-all", lineHeight: 1.4, cursor: "pointer" }} onClick={() => copyText(main, "Password copied")} title="Click to copy">{main}</code>
            <button className="btn btn-icon" onClick={regen} aria-label="Generate new password"><RefreshCw size={18} /></button>
            <CopyBtn text={main} className="btn btn-primary" />
          </div>
          <Meter s={s} />
          <small className="muted">Time to crack (offline attack at 10 billion guesses/second): <b style={{ color: "var(--text)" }}>{s.crack}</b></small>
        </div>

        {list.length > 1 && (
          <div className="panel stack">
            <div className="toolbar" style={{ marginBottom: 0 }}>
              <h3>More passwords</h3>
              <div className="actions">
                <CopyBtn text={list.join("\n")} label="Copy all" />
                <button className="btn btn-sm" onClick={() => downloadText(list.join("\n"), "passwords.txt")}><Download size={15} /> .txt</button>
              </div>
            </div>
            {list.slice(1).map((p, i) => (
              <div key={i} className="row" style={{ flexWrap: "nowrap", padding: "8px 12px", borderRadius: 10, background: "var(--elev)", border: "1px solid var(--border)" }}>
                <code style={{ flex: 1, wordBreak: "break-all" }}>{p}</code>
                <CopyBtn text={p} className="btn btn-sm btn-ghost" label="" />
              </div>
            ))}
          </div>
        )}

        <div className="panel stack">
          <div className="panel-title">Check your own password</div>
          <div className="input-wrap has-suf no-pre">
            <input className="input" type={show ? "text" : "password"} value={check} onChange={(e) => setCheck(e.target.value)} placeholder="Type a password to test its strength" autoComplete="off" />
            <button type="button" className="btn btn-sm btn-ghost btn-icon" onClick={() => setShow(!show)} style={{ position: "absolute", right: 4 }} aria-label={show ? "Hide" : "Show"}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          {check && (
            <>
              <Meter s={c} />
              <small className="muted">Estimated time to crack: <b style={{ color: "var(--text)" }}>{c.crack}</b></small>
              {c.tips.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 6 }}>
                  {c.tips.map((t) => <li key={t} style={{ display: "flex", gap: 8, fontSize: ".9rem" }}><ShieldAlert size={16} color="#f97316" style={{ flex: "none", marginTop: 2 }} /> {t}</li>)}
                </ul>
              )}
              {c.score >= 3 && <small style={{ color: "var(--ok)", display: "flex", gap: 6 }}><ShieldCheck size={16} /> Great password — just don’t reuse it on other sites.</small>}
            </>
          )}
          <small className="muted">Checked entirely in your browser — nothing you type is sent anywhere.</small>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Range label="Length" value={opt.length} min={4} max={64} onChange={(v) => setOpt({ ...opt, length: v })} format={(v) => `${v} chars`} />
          <div className="seg">
            {[8, 12, 16, 24, 32].map((n) => <button key={n} className={opt.length === n ? "on" : ""} onClick={() => setOpt({ ...opt, length: n })}>{n}</button>)}
          </div>
          <Toggle label="Uppercase (A–Z)" checked={opt.upper} onChange={toggle("upper")} />
          <Toggle label="Lowercase (a–z)" checked={opt.lower} onChange={toggle("lower")} />
          <Toggle label="Numbers (0–9)" checked={opt.digits} onChange={toggle("digits")} />
          <Toggle label="Symbols (!@#$…)" checked={opt.symbols} onChange={toggle("symbols")} />
          <Toggle label="Avoid look-alikes (l, 1, O, 0)" checked={opt.noSimilar} onChange={(v) => setOpt({ ...opt, noSimilar: v })} />
          <Field label="How many passwords"><NumInput value={count} onChange={setCount} min={1} max={50} /></Field>
          <button className="btn btn-primary btn-lg" onClick={regen}><RefreshCw size={18} /> Generate</button>
        </div>
      </div>
    </div>
  );
}
