"use client";
import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { Seg, CopyBtn, Msg } from "@/components/ui";

export default function UrlCodec() {
  const [input, setInput] = useState("https://toolora.com/search?q=merge pdf&lang=हिन्दी&ref=home#top");
  const [dir, setDir] = useState("encode");
  const [scope, setScope] = useState("component");

  const res = useMemo(() => {
    try {
      if (dir === "encode") return { out: scope === "component" ? encodeURIComponent(input) : encodeURI(input) };
      return { out: scope === "component" ? decodeURIComponent(input.replace(/\+/g, " ")) : decodeURI(input) };
    } catch {
      return { error: "Malformed percent-encoding in input." };
    }
  }, [input, dir, scope]);

  const parsed = useMemo(() => {
    const src = dir === "decode" ? res.out : input;
    try {
      const u = new URL(src);
      return u;
    } catch { return null; }
  }, [input, res.out, dir]);

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="actions">
          <Seg options={[{ label: "Encode", value: "encode" }, { label: "Decode", value: "decode" }]} value={dir} onChange={setDir} />
          <Seg options={[{ label: "Component", value: "component" }, { label: "Full URL", value: "full" }]} value={scope} onChange={setScope} />
        </div>
        <div className="actions">
          <button className="btn btn-sm" disabled={!res.out} onClick={() => { setInput(res.out); setDir(dir === "encode" ? "decode" : "encode"); }}><ArrowDownUp size={15} /> Swap</button>
          <CopyBtn text={res.out} />
        </div>
      </div>
      <div className="grid-2">
        <div className="field"><span className="label">Input</span><textarea className="textarea" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} /></div>
        <div className="field"><span className="label">Output</span>{res.error ? <Msg type="bad">{res.error}</Msg> : <textarea className="textarea" readOnly value={res.out} />}</div>
      </div>
      <small className="muted"><b>Component</b> encodes everything including <code>/ ? & =</code> — use it for query values. <b>Full URL</b> keeps the URL structure intact.</small>
      {parsed && (
        <div className="panel">
          <div className="panel-title">URL breakdown</div>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {[["Protocol", parsed.protocol], ["Host", parsed.host], ["Path", decodeURIComponent(parsed.pathname)], ["Hash", parsed.hash || "—"]].map(([k, v]) => (
                  <tr key={k}><td style={{ fontWeight: 700 }}>{k}</td><td style={{ textAlign: "left", whiteSpace: "normal" }}>{v}</td></tr>
                ))}
                {[...parsed.searchParams].map(([k, v], i) => (
                  <tr key={i}><td style={{ fontWeight: 700, color: "var(--brand)" }}>?{k}</td><td style={{ textAlign: "left", whiteSpace: "normal" }}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
