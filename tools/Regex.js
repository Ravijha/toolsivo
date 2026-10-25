"use client";
import { useMemo, useState } from "react";
import { Field, Msg, CopyBtn } from "@/components/ui";

const FLAGS = [["g", "global"], ["i", "ignore case"], ["m", "multiline"], ["s", "dotAll"], ["u", "unicode"], ["y", "sticky"]];
const library = [
  ["Email", "[\\w.+-]+@[\\w-]+\\.[\\w.-]+"],
  ["URL", "https?:\\/\\/[^\\s/$.?#].[^\\s]*"],
  ["Indian mobile", "(?:\\+91[\\s-]?)?[6-9]\\d{9}"],
  ["PIN code", "\\b[1-9]\\d{5}\\b"],
  ["Date (DD/MM/YYYY)", "\\b(0?[1-9]|[12]\\d|3[01])\\/(0?[1-9]|1[0-2])\\/(\\d{4})\\b"],
  ["Hex colour", "#(?:[0-9a-fA-F]{3}){1,2}\\b"],
  ["Numbers", "-?\\d+(?:\\.\\d+)?"],
  ["Words", "\\b\\w+\\b"],
];
const sample = `Contact us at hello@toolsivo.com or support@example.co.in
Call +91 90000 00000 or 9000000000 — office PIN 110001.
Visit https://toolsivo.com/tools on 15/08/2026. Brand colour: #7c5cff`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function Regex() {
  const [pattern, setPattern] = useState("[\\w.+-]+@[\\w-]+\\.[\\w.-]+");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState(sample);
  const [replace, setReplace] = useState("<$&>");

  const res = useMemo(() => {
    if (!pattern) return { matches: [], html: esc(text) };
    let re;
    try {
      re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    } catch (e) {
      return { error: e.message };
    }
    const matches = [];
    let html = "", last = 0;
    for (const m of text.matchAll(re)) {
      if (matches.length >= 2000) break;
      matches.push(m);
      html += esc(text.slice(last, m.index));
      html += m[0].length ? `<mark class="m${matches.length % 2 ? "" : " alt"}">${esc(m[0])}</mark>` : "";
      last = m.index + m[0].length;
      if (!flags.includes("g")) break;
    }
    html += esc(text.slice(last));
    let replaced = "";
    try { replaced = text.replace(new RegExp(pattern, flags), replace); } catch {}
    return { matches, html, replaced };
  }, [pattern, flags, text, replace]);

  const toggle = (f) => setFlags((s) => (s.includes(f) ? s.replace(f, "") : s + f));

  return (
    <div className="stack">
      <div className="field">
        <span className="label">Regular expression</span>
        <div className="row" style={{ flexWrap: "nowrap", gap: 0, border: "1px solid var(--border-strong)", borderRadius: 12, background: "var(--elev)", overflow: "hidden" }}>
          <span style={{ padding: "0 10px 0 14px", fontFamily: "var(--mono)", color: "var(--muted)", fontSize: "1.1rem" }}>/</span>
          <input className="input" style={{ border: 0, boxShadow: "none", fontFamily: "var(--mono)", padding: "12px 0" }} value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} />
          <span style={{ padding: "0 14px 0 10px", fontFamily: "var(--mono)", color: "var(--brand)", fontSize: "1.1rem", fontWeight: 700 }}>/{flags}</span>
        </div>
      </div>
      <div className="row">
        {FLAGS.map(([f, name]) => (
          <button key={f} className={`chip ${flags.includes(f) ? "active" : ""}`} onClick={() => toggle(f)} title={name}>
            <code>{f}</code> {name}
          </button>
        ))}
      </div>
      <div className="row" style={{ gap: 6 }}>
        <small className="muted" style={{ fontWeight: 700 }}>Quick patterns:</small>
        {library.map(([n, p]) => <button key={n} className="btn btn-sm" onClick={() => setPattern(p)}>{n}</button>)}
      </div>
      {res.error && <Msg type="bad">{res.error}</Msg>}
      <div className="grid-2">
        <div className="field">
          <span className="label">Test string</span>
          <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} style={{ minHeight: 260 }} />
        </div>
        <div className="field">
          <span className="label">Highlighted matches <em>{res.matches?.length || 0} match{res.matches?.length === 1 ? "" : "es"}</em></span>
          <pre className="code-out" style={{ minHeight: 260 }} dangerouslySetInnerHTML={{ __html: res.html || "" }} />
        </div>
      </div>
      {res.matches?.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>#</th><th style={{ textAlign: "left" }}>Match</th><th>Index</th><th style={{ textAlign: "left" }}>Groups</th></tr></thead>
            <tbody>
              {res.matches.slice(0, 200).map((m, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ textAlign: "left", fontFamily: "var(--mono)" }}>{m[0] || <i className="muted">empty</i>}</td>
                  <td>{m.index}</td>
                  <td style={{ textAlign: "left", fontFamily: "var(--mono)", whiteSpace: "normal" }}>
                    {m.length > 1 ? m.slice(1).map((g, j) => <span key={j} style={{ marginRight: 10 }}><b className="muted">${j + 1}</b> {g ?? "—"}</span>) : "—"}
                    {m.groups && Object.entries(m.groups).map(([k, v]) => <span key={k} style={{ marginRight: 10 }}><b className="muted">{k}</b> {v}</span>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="grid-2">
        <Field label="Replace with" hint="Use $1, $2 for groups and $& for the whole match">
          <input className="input" style={{ fontFamily: "var(--mono)" }} value={replace} onChange={(e) => setReplace(e.target.value)} />
        </Field>
        <div className="field">
          <span className="label">Result <CopyBtn text={res.replaced} /></span>
          <pre className="code-out" style={{ maxHeight: 200 }}>{res.replaced}</pre>
        </div>
      </div>
    </div>
  );
}
