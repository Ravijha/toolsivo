"use client";
import { useMemo, useState } from "react";
import { Seg, Toggle, CopyBtn, Field, NumInput } from "@/components/ui";

const STOP = new Set("a an the and or but of to in on at by for with is are was be".split(" "));
const map = { "&": " and ", "@": " at ", "₹": " rupees ", "$": " dollars ", "%": " percent ", "+": " plus " };

export function slugify(s, { sep = "-", lower = true, stop = false, max = 0 } = {}) {
  let t = s.replace(/[&@₹$%+]/g, (c) => map[c]).normalize("NFKD").replace(/[̀-ͯ]/g, "");
  let w = t.replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (stop && w.length > 2) w = w.filter((x) => !STOP.has(x.toLowerCase()));
  let out = w.join(sep);
  if (lower) out = out.toLowerCase();
  if (max && out.length > max) out = out.slice(0, max).replace(new RegExp(`\\${sep}[^\\${sep}]*$`), "") || out.slice(0, max);
  return out;
}

export default function Slug() {
  const [text, setText] = useState("10 Best Free Online Tools for Students & Creators in 2026!\nHow to Compress a PDF — Without Losing Quality\nCafé Déjà Vu: A Résumé Guide");
  const [sep, setSep] = useState("-");
  const [lower, setLower] = useState(true);
  const [stop, setStop] = useState(false);
  const [max, setMax] = useState("");
  const [base, setBase] = useState("https://toolora.com/blog/");

  const slugs = useMemo(() => text.split("\n").filter((l) => l.trim()).map((l) => slugify(l, { sep, lower, stop, max: +max || 0 })), [text, sep, lower, stop, max]);

  return (
    <div className="tool-cols">
      <div className="stack">
        <Field label="Titles (one per line)">
          <textarea className="textarea prose" style={{ minHeight: 180 }} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <div className="toolbar" style={{ marginBottom: 0 }}><h3>{slugs.length} slug{slugs.length === 1 ? "" : "s"}</h3><CopyBtn text={slugs.join("\n")} label="Copy all" /></div>
        <div className="file-list">
          {slugs.map((s, i) => (
            <div key={i} className="file-item">
              <div className="meta">
                <strong style={{ fontFamily: "var(--mono)", fontSize: ".9rem" }}>{s}</strong>
                <small>{base}{s}</small>
              </div>
              <CopyBtn text={s} />
            </div>
          ))}
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Separator"><Seg options={[{ label: "hyphen -", value: "-" }, { label: "underscore _", value: "_" }, { label: "dot .", value: "." }]} value={sep} onChange={setSep} /></Field>
          <Toggle label="Lowercase" checked={lower} onChange={setLower} />
          <Toggle label="Remove stop words (a, the, of…)" checked={stop} onChange={setStop} />
          <Field label="Max length (optional)"><NumInput value={max} onChange={setMax} placeholder="e.g. 60" /></Field>
          <Field label="Preview base URL"><input className="input" value={base} onChange={(e) => setBase(e.target.value)} /></Field>
        </div>
      </div>
    </div>
  );
}
