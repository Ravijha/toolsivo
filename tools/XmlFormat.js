"use client";
import { useMemo, useState } from "react";
import { Download, Wand2, Minimize2, CheckCircle2 } from "lucide-react";
import { Seg, CopyBtn, Msg, Stat, Toggle } from "@/components/ui";
import { downloadText, formatBytes } from "@/lib/file";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?><catalog><!-- Toolsivo sample --><tool id="1" category="pdf"><name>Merge PDF</name><free>true</free></tool><tool id="2" category="developer"><name>XML Formatter</name><tags><tag>xml</tag><tag>validator</tag></tags><notes><![CDATA[Supports <special> characters & more]]></notes></tool></catalog>`;

const escText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => escText(s).replace(/"/g, "&quot;");

// Serialise a DOM tree with indentation (keeps comments, CDATA and processing instructions).
function pretty(doc, indent, keepComments) {
  const out = [];
  const pad = (d) => indent.repeat(d);
  const attrs = (el) => [...el.attributes].map((a) => ` ${a.name}="${escAttr(a.value)}"`).join("");
  const walk = (n, d) => {
    switch (n.nodeType) {
      case 1: {
        const kids = [...n.childNodes].filter((c) => !(c.nodeType === 3 && !c.nodeValue.trim()) && (keepComments || c.nodeType !== 8));
        if (!kids.length) return out.push(`${pad(d)}<${n.nodeName}${attrs(n)}/>`);
        if (kids.length === 1 && kids[0].nodeType === 3) return out.push(`${pad(d)}<${n.nodeName}${attrs(n)}>${escText(kids[0].nodeValue.trim())}</${n.nodeName}>`);
        out.push(`${pad(d)}<${n.nodeName}${attrs(n)}>`);
        kids.forEach((k) => walk(k, d + 1));
        return out.push(`${pad(d)}</${n.nodeName}>`);
      }
      case 3: return out.push(pad(d) + escText(n.nodeValue.trim()));
      case 4: return out.push(`${pad(d)}<![CDATA[${n.nodeValue}]]>`);
      case 7: return out.push(`${pad(d)}<?${n.target} ${n.data}?>`);
      case 8: return out.push(`${pad(d)}<!--${n.nodeValue}-->`);
      case 10: return out.push(`<!DOCTYPE ${n.name}>`);
    }
  };
  [...doc.childNodes].forEach((n) => walk(n, 0));
  return out.join("\n");
}

function stats(doc) {
  let elements = 0, attributes = 0, depth = 0;
  const walk = (n, d) => { if (n.nodeType === 1) { elements++; attributes += n.attributes.length; depth = Math.max(depth, d); } [...n.childNodes].forEach((c) => walk(c, d + 1)); };
  walk(doc.documentElement, 1);
  return { elements, attributes, depth, root: doc.documentElement.nodeName };
}

export default function XmlFormat() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState("format");
  const [indent, setIndent] = useState("2");
  const [comments, setComments] = useState(true);

  const res = useMemo(() => {
    if (!input.trim()) return { empty: true };
    const doc = new DOMParser().parseFromString(input, "application/xml");
    const err = doc.getElementsByTagName("parsererror")[0];
    if (err) {
      const msg = err.textContent.replace(/\s+/g, " ").replace(/^This page contains the following errors:\s*/i, "").replace(/Below is a rendering.*$/i, "").trim();
      const loc = msg.match(/line (\d+)(?: at|, )?\s*column (\d+)/i) || msg.match(/(\d+):(\d+)/);
      return { error: msg, line: loc ? +loc[1] : null, col: loc ? +loc[2] : null };
    }
    const decl = (input.match(/^\s*<\?xml[^?]*\?>/) || [""])[0].trim();
    const body = pretty(doc, indent === "tab" ? "\t" : " ".repeat(+indent), comments);
    const out = mode === "minify" ? (decl + body.split("\n").map((l) => l.trim()).join("")).trim() : (decl ? `${decl}\n` : "") + body;
    return { out, ...stats(doc) };
  }, [input, mode, indent, comments]);

  return (
    <div className="stack">
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <div className="actions">
          <Seg options={[{ label: <><Wand2 size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Format</>, value: "format" }, { label: <><Minimize2 size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Minify</>, value: "minify" }]} value={mode} onChange={setMode} />
          {mode === "format" && <Seg options={[{ label: "2 spaces", value: "2" }, { label: "4 spaces", value: "4" }, { label: "Tab", value: "tab" }]} value={indent} onChange={setIndent} />}
          <Toggle label="Keep comments" checked={comments} onChange={setComments} />
        </div>
        <div className="actions">
          <CopyBtn text={res.out} />
          <button className="btn btn-sm" disabled={!res.out} onClick={() => downloadText(res.out, "formatted.xml", "application/xml")}><Download size={15} /> .xml</button>
        </div>
      </div>
      <div className="grid-2">
        <div className="field"><span className="label">XML input</span><textarea className="textarea" style={{ minHeight: 420 }} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} placeholder="Paste XML here…" /></div>
        <div className="field">
          <span className="label">Result</span>
          {res.error ? (
            <div className="stack">
              <Msg type="bad"><b>Invalid XML</b>{res.line && <> — line {res.line}{res.col ? `, column ${res.col}` : ""}</>}<br /><span style={{ fontFamily: "var(--mono)", fontSize: ".82rem" }}>{res.error}</span></Msg>
              {res.line && (
                <pre className="code-out" style={{ maxHeight: 200 }}>
                  {input.split("\n").slice(Math.max(0, res.line - 3), res.line + 2).map((l, i) => {
                    const n = Math.max(0, res.line - 3) + i + 1;
                    return <div key={n} style={n === res.line ? { background: "var(--bad-bg)", color: "var(--bad)" } : null}>{String(n).padStart(4)} │ {l}</div>;
                  })}
                </pre>
              )}
            </div>
          ) : <pre className="code-out" style={{ minHeight: 420 }}>{res.out || ""}</pre>}
        </div>
      </div>
      {res.out && (
        <div className="stats">
          <Stat label="Status" value={<span style={{ color: "var(--ok)" }}><CheckCircle2 size={18} style={{ display: "inline", verticalAlign: "-3px" }} /> Well-formed</span>} />
          <Stat label="Root element" value={`<${res.root}>`} />
          <Stat label="Elements" value={res.elements} sub={`${res.attributes} attributes`} />
          <Stat label="Size" value={formatBytes(new Blob([res.out]).size)} sub={`input ${formatBytes(new Blob([input]).size)}`} />
        </div>
      )}
      <small className="muted">Checks that the XML is well-formed using your browser’s built-in parser (no upload). It does not validate against an XSD or DTD schema.</small>
    </div>
  );
}
