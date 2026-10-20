"use client";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Toggle, Seg, CopyBtn, Stat } from "@/components/ui";
import { downloadText } from "@/lib/file";

const sample = "apple\nbanana\nApple\ncherry\nbanana\n  cherry  \n\ndate\napple";

export default function Dedupe() {
  const [text, setText] = useState(sample);
  const [ci, setCi] = useState(false);
  const [trim, setTrim] = useState(true);
  const [dropEmpty, setDropEmpty] = useState(true);
  const [sort, setSort] = useState("none");

  const r = useMemo(() => {
    const lines = text.split(/\r?\n/);
    const seen = new Set();
    let out = [];
    for (const l of lines) {
      const v = trim ? l.trim() : l;
      if (dropEmpty && !v) continue;
      const k = ci ? v.toLowerCase() : v;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(v);
    }
    if (sort === "az") out.sort((a, b) => a.localeCompare(b));
    if (sort === "za") out.sort((a, b) => b.localeCompare(a));
    if (sort === "len") out.sort((a, b) => a.length - b.length);
    return { out: out.join("\n"), before: lines.length, after: out.length };
  }, [text, ci, trim, dropEmpty, sort]);

  return (
    <div className="stack">
      <div className="row">
        <Toggle label="Ignore case" checked={ci} onChange={setCi} />
        <Toggle label="Trim whitespace" checked={trim} onChange={setTrim} />
        <Toggle label="Remove empty lines" checked={dropEmpty} onChange={setDropEmpty} />
        <Seg options={[{ label: "Keep order", value: "none" }, { label: "A→Z", value: "az" }, { label: "Z→A", value: "za" }, { label: "Length", value: "len" }]} value={sort} onChange={setSort} />
      </div>
      <div className="grid-2">
        <div className="field"><span className="label">Input <em>{r.before} lines</em></span><textarea className="textarea" style={{ minHeight: 360 }} value={text} onChange={(e) => setText(e.target.value)} /></div>
        <div className="field">
          <span className="label">Unique lines <em>{r.after} lines</em></span>
          <textarea className="textarea" style={{ minHeight: 360 }} readOnly value={r.out} />
        </div>
      </div>
      <div className="toolbar">
        <div className="stats" style={{ flex: 1 }}>
          <Stat label="Lines before" value={r.before} />
          <Stat label="Lines after" value={r.after} />
          <Stat hl label="Removed" value={r.before - r.after} />
        </div>
      </div>
      <div className="actions">
        <CopyBtn text={r.out} label="Copy result" />
        <button className="btn btn-sm" onClick={() => downloadText(r.out, "unique-lines.txt")}><Download size={15} /> Download</button>
      </div>
    </div>
  );
}
