"use client";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Toggle, Seg, Stat, CopyBtn } from "@/components/ui";
import { downloadText } from "@/lib/file";

const SAMPLE = "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs! नमस्ते दुनिया 123";
const segment = (t) => (typeof Intl !== "undefined" && Intl.Segmenter ? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(t)].map((s) => s.segment) : [...t]);
const shown = (c) => (c === " " ? "␣ space" : c === "\n" ? "↵ new line" : c === "\t" ? "⇥ tab" : c);

export default function CharFrequency() {
  const [text, setText] = useState(SAMPLE);
  const [caseSens, setCaseSens] = useState(false);
  const [ignoreSpaces, setIgnoreSpaces] = useState(true);
  const [ignorePunct, setIgnorePunct] = useState(false);
  const [lettersOnly, setLettersOnly] = useState(false);
  const [sort, setSort] = useState("count");

  const r = useMemo(() => {
    const m = new Map();
    let total = 0;
    for (let c of segment(text)) {
      if (ignoreSpaces && /^\s+$/u.test(c)) continue;
      if (ignorePunct && /^[\p{P}\p{S}]+$/u.test(c)) continue;
      if (lettersOnly && !/\p{L}/u.test(c)) continue;
      if (!caseSens) c = c.toLowerCase();
      m.set(c, (m.get(c) || 0) + 1);
      total++;
    }
    let rows = [...m.entries()];
    rows.sort(sort === "count" ? (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]) : (a, b) => a[0].localeCompare(b[0]));
    const max = Math.max(1, ...rows.map((x) => x[1]));
    const latin = [..."abcdefghijklmnopqrstuvwxyz"].filter((c) => !m.has(c) && !m.has(c.toUpperCase()));
    return { rows, total, max, unique: rows.length, latin };
  }, [text, caseSens, ignoreSpaces, ignorePunct, lettersOnly, sort]);

  const csv = "Character,Code point,Count,Percent\n" + r.rows.map(([c, n]) => `"${c.replace(/"/g, '""')}",U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")},${n},${((n / r.total) * 100).toFixed(2)}`).join("\n");

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <textarea className="textarea prose" style={{ minHeight: 170 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste text to count every character…" />
        <div className="stats">
          <Stat label="Characters counted" value={r.total.toLocaleString("en-IN")} />
          <Stat label="Unique characters" value={r.unique} />
          <Stat hl label="Most common" value={r.rows[0] ? shown(r.rows[0][0]) : "—"} sub={r.rows[0] ? `${r.rows[0][1]} times` : ""} />
        </div>
        <div className="table-wrap" style={{ maxHeight: 520 }}>
          <table className="table">
            <thead><tr><th>Character</th><th>Code</th><th style={{ textAlign: "left", width: "45%" }}>Frequency</th><th>Count</th><th>%</th></tr></thead>
            <tbody>
              {r.rows.map(([c, n]) => (
                <tr key={c}>
                  <td style={{ fontSize: "1.15rem", fontWeight: 700 }}>{shown(c)}</td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: ".78rem" }}>U+{c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}</td>
                  <td style={{ textAlign: "left" }}><div style={{ height: 10, borderRadius: 99, background: "var(--grad)", width: `${(n / r.max) * 100}%`, minWidth: 4 }} /></td>
                  <td>{n}</td>
                  <td>{((n / r.total) * 100).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Toggle label="Case-sensitive (A ≠ a)" checked={caseSens} onChange={setCaseSens} />
          <Toggle label="Ignore spaces & line breaks" checked={ignoreSpaces} onChange={setIgnoreSpaces} />
          <Toggle label="Ignore punctuation & symbols" checked={ignorePunct} onChange={setIgnorePunct} />
          <Toggle label="Letters only" checked={lettersOnly} onChange={setLettersOnly} />
          <Seg options={[{ label: "Most frequent", value: "count" }, { label: "A → Z", value: "alpha" }]} value={sort} onChange={setSort} />
        </div>
        <div className="panel stack">
          <div className="panel-title">Missing English letters</div>
          {r.latin.length ? <div style={{ fontFamily: "var(--mono)", fontSize: "1.05rem", letterSpacing: ".15em" }}>{r.latin.join(" ")}</div> : <small style={{ color: "var(--ok)", fontWeight: 700 }}>None — your text is a pangram (uses every letter A–Z).</small>}
        </div>
        <div className="grid-2">
          <CopyBtn text={csv} label="Copy CSV" className="btn" />
          <button className="btn" onClick={() => downloadText(csv, "character-frequency.csv", "text/csv")}><Download size={16} /> CSV</button>
        </div>
        <small className="muted">Emoji and combined letters (like हि or 👍🏽) are counted as single characters, the way people see them.</small>
      </div>
    </div>
  );
}
