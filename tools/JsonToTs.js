"use client";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Field, Seg, Toggle, CopyBtn, Msg } from "@/components/ui";
import { downloadText } from "@/lib/file";

const SAMPLE = `{
  "id": 1024,
  "name": "Toolsivo",
  "active": true,
  "rating": 4.9,
  "tags": ["tools", "free"],
  "owner": { "name": "Asha", "email": "asha@example.com", "phone": null },
  "tools": [
    { "slug": "merge-pdf", "popular": true, "uses": 1520 },
    { "slug": "json-formatter", "uses": 980, "beta": false }
  ],
  "created-at": "2026-10-22T10:00:00Z"
}`;

const pascal = (s) => (s.replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^./, (c) => c.toUpperCase()) || "Item").replace(/^(\d)/, "_$1");
const singular = (s) => (/ies$/i.test(s) ? s.replace(/ies$/i, "y") : /(ss|us)$/i.test(s) ? s : s.replace(/s$/i, ""));
const safeKey = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));

function generate(root, rootName, { useType, exported, optionalNull, readonly }) {
  const decls = new Map(); // name -> body
  const used = new Set();
  const unique = (base) => { let n = base, i = 2; while (used.has(n)) n = `${base}${i++}`; used.add(n); return n; };

  function typeOf(values, nameHint) {
    const kinds = new Set();
    const objs = [], arrs = [];
    for (const v of values) {
      if (v === null) kinds.add("null");
      else if (Array.isArray(v)) arrs.push(v);
      else if (typeof v === "object") objs.push(v);
      else kinds.add(typeof v);
    }
    const parts = [...kinds].filter((k) => k !== "null");
    if (objs.length) parts.push(objectType(objs, nameHint));
    if (arrs.length) {
      const one = singular(nameHint);
      const inner = typeOf(arrs.flat(), one === nameHint ? `${nameHint}Item` : one);
      parts.push(inner === "never" ? "unknown[]" : /[|&]/.test(inner) ? `(${inner})[]` : `${inner}[]`);
    }
    if (kinds.has("null")) parts.push("null");
    return parts.length ? [...new Set(parts)].join(" | ") : "never";
  }

  function objectType(objs, nameHint) {
    const name = unique(pascal(nameHint));
    const keys = [...new Set(objs.flatMap(Object.keys))];
    const lines = keys.map((k) => {
      const present = objs.filter((o) => k in o);
      const vals = present.map((o) => o[k]);
      let t = typeOf(vals, k);
      const optional = present.length < objs.length || (optionalNull && vals.every((v) => v === null));
      if (optionalNull && t.endsWith(" | null")) t = t.slice(0, -7);
      return `  ${readonly ? "readonly " : ""}${safeKey(k)}${optional ? "?" : ""}: ${t};`;
    });
    decls.set(name, lines.join("\n"));
    return name;
  }

  const rootT = typeOf([root], rootName);
  const ex = exported ? "export " : "";
  const out = [...decls.entries()].reverse().map(([n, body]) => (useType ? `${ex}type ${n} = {\n${body}\n};` : `${ex}interface ${n} {\n${body}\n}`));
  if (!decls.has(rootT)) out.unshift(`${ex}type ${pascal(rootName)} = ${rootT};`);
  return out.join("\n\n");
}

export default function JsonToTs() {
  const [input, setInput] = useState(SAMPLE);
  const [name, setName] = useState("Root");
  const [useType, setUseType] = useState(false);
  const [exported, setExported] = useState(true);
  const [optionalNull, setOptionalNull] = useState(false);
  const [readonly, setReadonly] = useState(false);

  const res = useMemo(() => {
    try { return { out: generate(JSON.parse(input), name || "Root", { useType, exported, optionalNull, readonly }) }; }
    catch (e) { return { error: e.message }; }
  }, [input, name, useType, exported, optionalNull, readonly]);

  return (
    <div className="stack">
      <div className="row">
        <div style={{ width: 200 }}><Field label="Root type name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field></div>
        <Seg options={[{ label: "interface", value: false }, { label: "type", value: true }]} value={useType} onChange={setUseType} />
        <Toggle label="export" checked={exported} onChange={setExported} />
        <Toggle label="null → optional" checked={optionalNull} onChange={setOptionalNull} />
        <Toggle label="readonly" checked={readonly} onChange={setReadonly} />
      </div>
      <div className="grid-2">
        <Field label="JSON"><textarea className="textarea" style={{ minHeight: 440 }} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} /></Field>
        <div className="field">
          <span className="label">TypeScript <span className="actions"><CopyBtn text={res.out} /><button className="btn btn-sm" disabled={!res.out} onClick={() => downloadText(res.out, `${(name || "types").toLowerCase()}.ts`)}><Download size={15} /> .ts</button></span></span>
          {res.error ? <Msg type="bad">Invalid JSON: {res.error}</Msg> : <pre className="code-out" style={{ minHeight: 440 }}>{res.out}</pre>}
        </div>
      </div>
      <small className="muted">Types are inferred from your sample — fields missing from some array items become optional. Review the result before using it in production.</small>
    </div>
  );
}
