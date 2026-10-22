"use client";
import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, Download, RefreshCw, Search } from "lucide-react";
import { Dropzone, Seg, Toggle, Stat, Msg, Spinner } from "@/components/ui";
import { downloadText, formatBytes, baseName } from "@/lib/file";

const PAGE = 100;
const DELIMS = { auto: "Auto", ",": "Comma", ";": "Semicolon", "\t": "Tab", "|": "Pipe" };

function detect(sample) {
  const line = sample.split(/\r?\n/).slice(0, 5).join("\n");
  return [",", ";", "\t", "|"].map((d) => [d, line.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
}

// RFC 4180 parser: quoted fields, escaped quotes and newlines inside quotes
function parse(text, d) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"' && cell === "") q = true;
    else if (c === d) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const toCsv = (rows) => rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n");
const isNum = (s) => s !== "" && !isNaN(+s.replace(/,/g, ""));

const SAMPLE = `Name,City,Tool,Uses,Joined
Ananya Iyer,Bengaluru,Merge PDF,142,2026-01-14
Rahul Mehta,Mumbai,EMI Calculator,87,2025-11-02
"Kavita Rao, MD",Delhi,Image Compressor,310,2026-03-21
Arjun Nair,Kochi,JSON Formatter,56,2026-05-09
Sara Khan,Hyderabad,QR Code Generator,198,2026-02-27`;

export default function CsvViewer() {
  const [raw, setRaw] = useState(null);
  const [name, setName] = useState("");
  const [delim, setDelim] = useState("auto");
  const [header, setHeader] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);

  const open = async ([f]) => {
    setBusy(true);
    const t = (await f.text()).replace(/^﻿/, "");
    setRaw(t); setName(f.name); setPage(0); setSort(null); setQ(""); setBusy(false);
  };

  const data = useMemo(() => {
    if (raw == null) return null;
    const d = delim === "auto" ? detect(raw.slice(0, 5000)) : delim;
    const rows = parse(raw, d).filter((r) => r.some((c) => c !== ""));
    const cols = Math.max(0, ...rows.map((r) => r.length));
    const head = header && rows.length ? rows[0] : Array.from({ length: cols }, (_, i) => `Column ${i + 1}`);
    const body = header ? rows.slice(1) : rows;
    return { d, head: Array.from({ length: cols }, (_, i) => head[i] || `Column ${i + 1}`), body, cols };
  }, [raw, delim, header]);

  const view = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    let rows = s ? data.body.filter((r) => r.some((c) => c.toLowerCase().includes(s))) : data.body;
    if (sort) {
      const { i, dir } = sort;
      const numeric = rows.every((r) => r[i] === undefined || r[i] === "" || isNum(r[i]));
      rows = [...rows].sort((a, b) => {
        const x = a[i] ?? "", y = b[i] ?? "";
        return (numeric ? (+x.replace(/,/g, "") || 0) - (+y.replace(/,/g, "") || 0) : x.localeCompare(y, undefined, { numeric: true })) * dir;
      });
    }
    return rows;
  }, [data, q, sort]);

  if (raw == null)
    return (
      <div className="stack">
        <Dropzone accept=".csv,.tsv,.txt,text/csv" onFiles={open} title="Drop a CSV file to view" hint="Opened on your device — nothing is uploaded" />
        {busy && <Spinner dark />}
        <button className="btn btn-sm" style={{ alignSelf: "start" }} onClick={() => { setRaw(SAMPLE); setName("sample.csv"); }}>Try a sample file</button>
      </div>
    );

  const pages = Math.max(1, Math.ceil(view.length / PAGE));
  const p = Math.min(page, pages - 1);
  const numericCols = data.head.map((_, i) => data.body.length > 0 && data.body.every((r) => !r[i] || isNum(r[i])));

  return (
    <div className="stack">
      <div className="stats">
        <Stat label="Rows" value={data.body.length.toLocaleString("en-IN")} sub={q ? `${view.length.toLocaleString("en-IN")} match` : name} />
        <Stat label="Columns" value={data.cols} />
        <Stat label="Delimiter" value={DELIMS[data.d] || data.d} />
        <Stat label="Size" value={formatBytes(raw.length)} />
      </div>
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <div className="actions" style={{ flex: 1 }}>
          <div className="input-wrap" style={{ flex: 1, minWidth: 200, maxWidth: 360 }}><Search size={16} className="pre" style={{ left: 12 }} /><input className="input" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search all cells…" /></div>
          <Seg options={Object.entries(DELIMS).map(([v, l]) => ({ label: l, value: v }))} value={delim} onChange={setDelim} />
          <Toggle label="First row is header" checked={header} onChange={setHeader} />
        </div>
        <div className="actions">
          <button className="btn btn-sm" onClick={() => downloadText(toCsv([data.head, ...view]), `${baseName(name)}-${q || sort ? "filtered" : "export"}.csv`, "text/csv")}><Download size={15} /> {q || sort ? "Export view" : "Export CSV"}</button>
          <button className="btn btn-sm" onClick={() => setRaw(null)}><RefreshCw size={15} /> Another file</button>
        </div>
      </div>
      {data.cols === 0 ? <Msg type="bad">This file appears to be empty.</Msg> : (
        <div className="table-wrap" style={{ maxHeight: 600 }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 1 }}>#</th>
                {data.head.map((h, i) => (
                  <th key={i} style={{ cursor: "pointer", textAlign: numericCols[i] ? "right" : "left", userSelect: "none" }} onClick={() => setSort((s) => (s?.i === i ? (s.dir === 1 ? { i, dir: -1 } : null) : { i, dir: 1 }))}>
                    {h} {sort?.i === i && (sort.dir === 1 ? <ArrowUp size={12} style={{ display: "inline" }} /> : <ArrowDown size={12} style={{ display: "inline" }} />)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.slice(p * PAGE, (p + 1) * PAGE).map((r, ri) => (
                <tr key={ri}>
                  <td className="muted">{p * PAGE + ri + 1}</td>
                  {data.head.map((_, i) => <td key={i} style={{ textAlign: numericCols[i] ? "right" : "left", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis" }} title={r[i]}>{r[i] ?? ""}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn btn-sm" disabled={p === 0} onClick={() => setPage(p - 1)}>Previous</button>
          <small className="muted">Page {p + 1} of {pages.toLocaleString("en-IN")}</small>
          <button className="btn btn-sm" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Next</button>
        </div>
      )}
      <small className="muted">Click a column header to sort. Files are processed in your browser, so very large files (over ~100 MB) may be slow on some devices.</small>
    </div>
  );
}
