"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Download } from "lucide-react";
import { Field, Toggle, CopyBtn, NumInput, Seg } from "@/components/ui";
import { copyText, downloadText } from "@/lib/file";

const v4 = () => (crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));

// v7: 48-bit unix ms timestamp + random — sortable by creation time
const v7 = () => {
  const b = crypto.getRandomValues(new Uint8Array(16));
  let ts = Date.now();
  for (let i = 5; i >= 0; i--) { b[i] = ts & 0xff; ts = Math.floor(ts / 256); }
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

export default function Uuid() {
  const [count, setCount] = useState("10");
  const [ver, setVer] = useState("v4");
  const [upper, setUpper] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [braces, setBraces] = useState(false);
  const [list, setList] = useState([]);

  const gen = () => {
    const n = Math.min(10000, Math.max(1, +count || 1));
    setList(Array.from({ length: n }, () => {
      let u = ver === "v4" ? v4() : v7();
      if (!hyphens) u = u.replace(/-/g, "");
      if (upper) u = u.toUpperCase();
      if (braces) u = `{${u}}`;
      return u;
    }));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(gen, [ver, upper, hyphens, braces]);

  const text = list.join("\n");
  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="big-result" style={{ cursor: "pointer" }} onClick={() => copyText(list[0])} title="Click to copy">
          <span>Your UUID {ver}</span>
          <strong style={{ fontSize: "clamp(1rem, 2.6vw, 1.6rem)", fontFamily: "var(--mono)" }}>{list[0]}</strong>
          <small>Click to copy</small>
        </div>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <h3>{list.length} UUIDs</h3>
          <div className="actions">
            <CopyBtn text={text} label="Copy all" />
            <button className="btn btn-sm" onClick={() => downloadText(text, "uuids.txt")}><Download size={15} /> .txt</button>
          </div>
        </div>
        <textarea className="textarea" readOnly value={text} style={{ minHeight: 320 }} />
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Version"><Seg options={[{ label: "v4 · random", value: "v4" }, { label: "v7 · time-ordered", value: "v7" }]} value={ver} onChange={setVer} /></Field>
          <Field label="How many?"><NumInput value={count} onChange={setCount} min={1} max={10000} /></Field>
          <Toggle label="Uppercase" checked={upper} onChange={setUpper} />
          <Toggle label="Hyphens" checked={hyphens} onChange={setHyphens} />
          <Toggle label="Wrap in { braces }" checked={braces} onChange={setBraces} />
          <button className="btn btn-primary btn-lg" onClick={gen}><RefreshCw size={18} /> Generate</button>
        </div>
      </div>
    </div>
  );
}
