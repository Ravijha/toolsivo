"use client";
import { useEffect, useState } from "react";
import { Download, Minimize2 } from "lucide-react";
import { Field, Seg, CopyBtn, Msg } from "@/components/ui";
import { downloadText } from "@/lib/file";

const DIALECTS = [["sql", "Standard SQL"], ["mysql", "MySQL"], ["mariadb", "MariaDB"], ["postgresql", "PostgreSQL"], ["sqlite", "SQLite"], ["tsql", "SQL Server"], ["plsql", "Oracle PL/SQL"], ["bigquery", "BigQuery"], ["snowflake", "Snowflake"], ["redshift", "Redshift"], ["spark", "Spark SQL"], ["db2", "IBM Db2"]];
const SAMPLE = "select u.id, u.name, count(o.id) as orders, sum(o.total) as revenue from users u left join orders o on o.user_id = u.id and o.status = 'paid' where u.created_at >= '2026-01-01' and u.country in ('IN','US') group by u.id, u.name having count(o.id) > 2 order by revenue desc limit 20;";

// Collapse whitespace outside string literals and comments for a one-line query
function compact(sql) {
  let out = "", i = 0;
  while (i < sql.length) {
    const c = sql[i];
    if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      while (j < sql.length && (sql[j] !== c || sql[j + 1] === c)) j += sql[j] === c ? 2 : 1;
      out += sql.slice(i, j + 1); i = j + 1;
    } else if (c === "-" && sql[i + 1] === "-") { while (i < sql.length && sql[i] !== "\n") i++; }
    else if (c === "/" && sql[i + 1] === "*") { const e = sql.indexOf("*/", i + 2); i = e < 0 ? sql.length : e + 2; }
    else if (/\s/.test(c)) { if (out && !/\s$/.test(out)) out += " "; i++; }
    else { out += c; i++; }
  }
  return out.replace(/\s*([(),;])\s*/g, (m, p) => (p === "," ? ", " : p)).trim();
}

export default function SqlFormat() {
  const [input, setInput] = useState(SAMPLE);
  const [dialect, setDialect] = useState("mysql");
  const [kw, setKw] = useState("upper");
  const [indent, setIndent] = useState("2");
  const [mode, setMode] = useState("format");
  const [res, setRes] = useState({ out: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (mode === "compact") return alive && setRes({ out: compact(input) });
        const { format } = await import("sql-formatter");
        const out = format(input, { language: dialect, keywordCase: kw, tabWidth: indent === "tab" ? 4 : +indent, useTabs: indent === "tab", linesBetweenQueries: 2 });
        if (alive) setRes({ out });
      } catch (e) {
        if (alive) setRes({ error: e.message.split("\n")[0] });
      }
    })();
    return () => { alive = false; };
  }, [input, dialect, kw, indent, mode]);

  return (
    <div className="stack">
      <div className="row">
        <Seg options={[{ label: "Beautify", value: "format" }, { label: <><Minimize2 size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Compact</>, value: "compact" }]} value={mode} onChange={setMode} />
        {mode === "format" && (
          <>
            <select className="select" style={{ width: 180 }} value={dialect} onChange={(e) => setDialect(e.target.value)}>{DIALECTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <Seg options={[{ label: "UPPER", value: "upper" }, { label: "lower", value: "lower" }, { label: "Keep", value: "preserve" }]} value={kw} onChange={setKw} />
            <Seg options={[{ label: "2 sp", value: "2" }, { label: "4 sp", value: "4" }, { label: "Tab", value: "tab" }]} value={indent} onChange={setIndent} />
          </>
        )}
      </div>
      <div className="grid-2">
        <Field label="SQL"><textarea className="textarea" style={{ minHeight: 420 }} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} /></Field>
        <div className="field">
          <span className="label">Result <span className="actions"><CopyBtn text={res.out} /><button className="btn btn-sm" disabled={!res.out} onClick={() => downloadText(res.out, "query.sql")}><Download size={15} /> .sql</button></span></span>
          {res.error ? <Msg type="bad">Couldn’t parse this query for {DIALECTS.find((d) => d[0] === dialect)[1]}: {res.error}. Try another dialect.</Msg> : <pre className="code-out" style={{ minHeight: 420 }}>{res.out}</pre>}
        </div>
      </div>
      <small className="muted">Formatting only changes whitespace and keyword case — it never runs or modifies your query logic.</small>
    </div>
  );
}
