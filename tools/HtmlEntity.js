"use client";
import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { Field, Seg, CopyBtn } from "@/components/ui";

const NAMED = {
  "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "apos", " ": "nbsp", "©": "copy", "®": "reg", "™": "trade", "€": "euro", "£": "pound", "¥": "yen", "¢": "cent",
  "₹": null, "§": "sect", "¶": "para", "°": "deg", "±": "plusmn", "×": "times", "÷": "divide", "…": "hellip", "—": "mdash", "–": "ndash", "‘": "lsquo", "’": "rsquo",
  "“": "ldquo", "”": "rdquo", "•": "bull", "·": "middot", "«": "laquo", "»": "raquo", "½": "frac12", "¼": "frac14", "¾": "frac34", "←": "larr", "→": "rarr", "↑": "uarr",
  "↓": "darr", "♥": "hearts", "µ": "micro", "¿": "iquest", "¡": "iexcl", "é": "eacute", "è": "egrave", "ê": "ecirc", "á": "aacute", "à": "agrave", "ñ": "ntilde", "ü": "uuml", "ö": "ouml", "ä": "auml", "ç": "ccedil", "ß": "szlig",
};
const BASIC = /[&<>"']/g;

function encode(s, mode, fmt) {
  const num = (cp) => (fmt === "hex" ? `&#x${cp.toString(16).toUpperCase()};` : `&#${cp};`);
  if (mode === "basic") return s.replace(BASIC, (c) => `&${NAMED[c]};`);
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (/[&<>"']/.test(ch)) out += `&${NAMED[ch]};`;
    else if (cp < 128 && ch !== " ") out += ch;
    else if (fmt === "named" && NAMED[ch]) out += `&${NAMED[ch]};`;
    else out += num(cp);
  }
  return out;
}

// Decoding uses the browser's own entity table via a <textarea>, which never executes markup.
function decode(s) {
  const ta = document.createElement("textarea");
  ta.innerHTML = s;
  return ta.value;
}

export default function HtmlEntity() {
  const [input, setInput] = useState('<p class="price">Café & Bistro — ₹499 “special” © 2026</p>');
  const [dir, setDir] = useState("encode");
  const [mode, setMode] = useState("all");
  const [fmt, setFmt] = useState("named");
  const out = useMemo(() => (dir === "encode" ? encode(input, mode, fmt) : decode(input)), [input, dir, mode, fmt]);

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="actions">
          <Seg options={[{ label: "Encode", value: "encode" }, { label: "Decode", value: "decode" }]} value={dir} onChange={setDir} />
          {dir === "encode" && (
            <>
              <Seg options={[{ label: "Only & < > \" '", value: "basic" }, { label: "+ non-ASCII", value: "all" }]} value={mode} onChange={setMode} />
              {mode === "all" && <Seg options={[{ label: "Named", value: "named" }, { label: "Decimal", value: "dec" }, { label: "Hex", value: "hex" }]} value={fmt} onChange={setFmt} />}
            </>
          )}
        </div>
        <div className="actions">
          <button className="btn btn-sm" onClick={() => { setInput(out); setDir(dir === "encode" ? "decode" : "encode"); }}><ArrowDownUp size={15} /> Swap</button>
          <CopyBtn text={out} />
        </div>
      </div>
      <div className="grid-2">
        <Field label={dir === "encode" ? "Text / HTML" : "Encoded HTML"}><textarea className="textarea" style={{ minHeight: 260 }} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} /></Field>
        <Field label="Result"><textarea className="textarea" style={{ minHeight: 260 }} readOnly value={out} /></Field>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Character</th><th>Named</th><th>Decimal</th><th>Use</th></tr></thead>
          <tbody>
            {[["&", "Ampersand"], ["<", "Less than"], [">", "Greater than"], ['"', "Double quote"], ["'", "Apostrophe"], [" ", "Non-breaking space"], ["©", "Copyright"], ["₹", "Indian rupee"], ["—", "Em dash"], ["…", "Ellipsis"]].map(([c, u]) => (
              <tr key={u}><td style={{ fontSize: "1.1rem" }}>{c === " " ? "␣" : c}</td><td><code>{NAMED[c] ? `&${NAMED[c]};` : "—"}</code></td><td><code>&amp;#{c.codePointAt(0)};</code></td><td>{u}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
