"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, Eraser } from "lucide-react";
import { Stat, Msg, CopyBtn, Toggle } from "@/components/ui";

const SAMPLE = "Café ₹99 👍🏽 नमस्ते​ “quotes”";
// General categories, tested with the Unicode property escapes built into JavaScript
const GC = [
  ["Lu", "Uppercase letter"], ["Ll", "Lowercase letter"], ["Lt", "Titlecase letter"], ["Lm", "Modifier letter"], ["Lo", "Other letter"],
  ["Mn", "Non-spacing mark"], ["Mc", "Spacing mark"], ["Me", "Enclosing mark"], ["Nd", "Decimal digit"], ["Nl", "Letter number"], ["No", "Other number"],
  ["Pc", "Connector punctuation"], ["Pd", "Dash"], ["Ps", "Open punctuation"], ["Pe", "Close punctuation"], ["Pi", "Initial quote"], ["Pf", "Final quote"], ["Po", "Other punctuation"],
  ["Sm", "Math symbol"], ["Sc", "Currency symbol"], ["Sk", "Modifier symbol"], ["So", "Other symbol"], ["Zs", "Space separator"], ["Zl", "Line separator"], ["Zp", "Paragraph separator"],
  ["Cc", "Control character"], ["Cf", "Format character (invisible)"], ["Co", "Private use"], ["Cn", "Unassigned"],
].map(([k, n]) => [new RegExp(`^\\p{gc=${k}}$`, "u"), k, n]);
const SCRIPTS = ["Latin", "Devanagari", "Bengali", "Gurmukhi", "Gujarati", "Oriya", "Tamil", "Telugu", "Kannada", "Malayalam", "Arabic", "Hebrew", "Greek", "Cyrillic", "Han", "Hiragana", "Katakana", "Hangul", "Thai", "Common", "Inherited"]
  .map((s) => [new RegExp(`^\\p{sc=${s}}$`, "u"), s]);
const SPECIAL = {
  0x200b: "Zero-width space", 0x200c: "Zero-width non-joiner", 0x200d: "Zero-width joiner", 0x2060: "Word joiner", 0xfeff: "Byte order mark / zero-width no-break space",
  0x00a0: "No-break space", 0x202f: "Narrow no-break space", 0x2009: "Thin space", 0x00ad: "Soft hyphen", 0x200e: "Left-to-right mark", 0x200f: "Right-to-left mark",
  0x202a: "LTR embedding", 0x202b: "RTL embedding", 0x202c: "Pop directional formatting", 0x202d: "LTR override", 0x202e: "RTL override (can disguise text)", 0x0009: "Tab", 0x000a: "Line feed", 0x000d: "Carriage return",
};
const HIDDEN = new Set([0x200b, 0x200c, 0x2060, 0xfeff, 0x00ad, 0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e]);
const hex = (n, p = 4) => n.toString(16).toUpperCase().padStart(p, "0");
const utf8 = (c) => [...new TextEncoder().encode(c)].map((b) => hex(b, 2)).join(" ");
const utf16 = (c) => Array.from({ length: c.length }, (_, i) => hex(c.charCodeAt(i))).join(" ");

export default function UnicodeInspector() {
  const [text, setText] = useState(SAMPLE);
  const [graphemes, setGraphemes] = useState(false);

  const rows = useMemo(() => [...text].slice(0, 2000).map((c, i) => {
    const cp = c.codePointAt(0);
    return {
      i, c, cp,
      gc: GC.find(([re]) => re.test(c)) || [null, "?", "Unknown"],
      sc: (SCRIPTS.find(([re]) => re.test(c)) || [null, "Other"])[1],
      special: SPECIAL[cp], hidden: HIDDEN.has(cp) || /^\p{gc=Cf}$/u.test(c),
      emoji: /\p{Extended_Pictographic}/u.test(c),
    };
  }), [text]);

  const clusters = useMemo(() => (typeof Intl !== "undefined" && Intl.Segmenter ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].length : rows.length), [text, rows.length]);
  const hidden = rows.filter((r) => r.hidden || r.cp === 0xa0);
  const bytes = new TextEncoder().encode(text).length;
  const clean = text.replace(/[​‌⁠﻿­‎‏‪-‮]/g, "").replace(/[   ]/g, " ");

  const display = (r) => (r.cp < 32 || r.hidden ? <span className="muted">{r.special ? `‹${r.special.split(" ")[0]}›` : "‹ctrl›"}</span> : r.cp === 32 ? "␣" : r.c);

  return (
    <div className="stack">
      <textarea className="textarea" style={{ minHeight: 110, fontSize: "1.1rem" }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste any text, symbol or emoji…" spellCheck={false} />
      <div className="stats">
        <Stat label="Code points" value={rows.length.toLocaleString("en-IN")} />
        <Stat label="Visible characters" value={clusters.toLocaleString("en-IN")} sub="grapheme clusters" />
        <Stat label="UTF-8 size" value={`${bytes} bytes`} />
        <Stat hl={hidden.length > 0} label="Hidden / special" value={hidden.length} />
      </div>
      {hidden.length > 0 && (
        <div className="msg bad" style={{ alignItems: "center", flexWrap: "wrap" }}>
          <AlertTriangle size={17} />
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>Found {hidden.length} invisible or special space character{hidden.length > 1 ? "s" : ""}: {[...new Set(hidden.map((h) => h.special || `U+${hex(h.cp)}`))].join(", ")}. These can break searches, passwords and code.</div>
          <CopyBtn text={clean} label="Copy cleaned text" className="btn btn-sm" />
          <button className="btn btn-sm" onClick={() => setText(clean)}><Eraser size={14} /> Clean</button>
        </div>
      )}
      <div className="table-wrap" style={{ maxHeight: 560 }}>
        <table className="table">
          <thead><tr><th>#</th><th>Char</th><th>Code point</th><th>Category</th><th>Script</th><th>UTF-8</th><th>UTF-16</th><th>HTML</th><th>JS / CSS</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.i} style={r.hidden || r.cp === 0xa0 ? { background: "var(--bad-bg)" } : undefined}>
                <td className="muted">{r.i + 1}</td>
                <td style={{ fontSize: "1.3rem", textAlign: "center" }}>{display(r)}</td>
                <td style={{ fontFamily: "var(--mono)" }}>U+{hex(r.cp)}<br /><small className="muted">{r.cp}</small></td>
                <td style={{ textAlign: "left", whiteSpace: "normal" }}>{r.special || r.gc[2]}{r.emoji && " · Emoji"}<br /><small className="muted">{r.gc[1]}</small></td>
                <td style={{ textAlign: "left" }}>{r.sc}</td>
                <td style={{ fontFamily: "var(--mono)", fontSize: ".8rem" }}>{utf8(r.c)}</td>
                <td style={{ fontFamily: "var(--mono)", fontSize: ".8rem" }}>{utf16(r.c)}</td>
                <td style={{ fontFamily: "var(--mono)", fontSize: ".8rem" }}>&amp;#x{hex(r.cp, 1)};</td>
                <td style={{ fontFamily: "var(--mono)", fontSize: ".8rem" }}>{r.cp > 0xffff ? `\\u{${hex(r.cp, 1)}}` : `\\u${hex(r.cp)}`}<br /><span className="muted">\{hex(r.cp, 1)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {[...text].length > 2000 && <small className="muted">Showing the first 2,000 characters.</small>}
      <small className="muted">Categories and scripts come from the Unicode data built into your browser. Some emoji are made of several code points (for example 👍🏽 = 👍 + skin-tone modifier), which is why visible characters can be fewer than code points.</small>
    </div>
  );
}
