"use client";
import { useMemo, useState } from "react";
import { ArrowDownUp, Download } from "lucide-react";
import { Seg, Toggle, CopyBtn, Msg, Dropzone } from "@/components/ui";
import { downloadBlob, formatBytes } from "@/lib/file";

const encUtf8 = (s) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const decBytes = (b64) => {
  const clean = b64.replace(/^data:[^,]*,/, "").replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = clean + "===".slice((clean.length + 3) % 4);
  const bin = atob(pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

function TextMode() {
  const [input, setInput] = useState("Hello, Toolora! नमस्ते 👋");
  const [dir, setDir] = useState("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const res = useMemo(() => {
    try {
      if (dir === "encode") {
        let o = encUtf8(input);
        if (urlSafe) o = o.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        return { out: o };
      }
      return { out: new TextDecoder("utf-8", { fatal: false }).decode(decBytes(input)) };
    } catch {
      return { error: "That doesn’t look like valid Base64." };
    }
  }, [input, dir, urlSafe]);

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="actions">
          <Seg options={[{ label: "Encode", value: "encode" }, { label: "Decode", value: "decode" }]} value={dir} onChange={setDir} />
          {dir === "encode" && <Toggle label="URL-safe" checked={urlSafe} onChange={setUrlSafe} />}
        </div>
        <div className="actions">
          <button className="btn btn-sm" disabled={!res.out} onClick={() => { setInput(res.out); setDir(dir === "encode" ? "decode" : "encode"); }}><ArrowDownUp size={15} /> Swap</button>
          <CopyBtn text={res.out} />
        </div>
      </div>
      <div className="grid-2">
        <div className="field"><span className="label">{dir === "encode" ? "Plain text" : "Base64"}</span><textarea className="textarea" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} /></div>
        <div className="field">
          <span className="label">{dir === "encode" ? "Base64" : "Plain text"}</span>
          {res.error ? <Msg type="bad">{res.error}</Msg> : <textarea className="textarea" readOnly value={res.out} />}
        </div>
      </div>
    </div>
  );
}

function FileMode() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState("");
  const [paste, setPaste] = useState("");
  const [err, setErr] = useState(null);
  const open = ([f]) => {
    const r = new FileReader();
    r.onload = () => { setFile(f); setData(r.result); };
    r.readAsDataURL(f);
  };
  const decode = () => {
    try {
      const mime = paste.match(/^data:([^;,]+)/)?.[1] || "application/octet-stream";
      const ext = mime.split("/")[1]?.replace("jpeg", "jpg").replace("octet-stream", "bin") || "bin";
      downloadBlob(new Blob([decBytes(paste)], { type: mime }), `decoded.${ext}`);
      setErr(null);
    } catch { setErr("Invalid Base64 data."); }
  };
  return (
    <div className="grid-2">
      <div className="stack">
        <span className="label">File → Base64</span>
        <Dropzone compact accept="*/*" onFiles={open} title="Choose any file" hint="Get its Base64 / data URL" />
        {file && (
          <>
            <small className="muted">{file.name} · {formatBytes(file.size)} → {formatBytes(data.length)} encoded</small>
            {file.type.startsWith("image/") && <img src={data} alt="" style={{ maxHeight: 120, borderRadius: 10, background: "var(--checker)" }} />}
            <textarea className="textarea" readOnly value={data} style={{ minHeight: 160 }} />
            <div className="actions"><CopyBtn text={data} label="Copy data URL" /><CopyBtn text={data.split(",")[1]} label="Copy Base64 only" /></div>
          </>
        )}
      </div>
      <div className="stack">
        <span className="label">Base64 → File</span>
        <textarea className="textarea" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste Base64 or a data: URL…" style={{ minHeight: 200 }} />
        {err && <Msg type="bad">{err}</Msg>}
        <button className="btn btn-primary" onClick={decode} disabled={!paste.trim()}><Download size={16} /> Decode & download</button>
      </div>
    </div>
  );
}

export default function Base64() {
  const [tab, setTab] = useState("text");
  return (
    <div className="stack">
      <div style={{ maxWidth: 300 }}><Seg options={[{ label: "Text", value: "text" }, { label: "File", value: "file" }]} value={tab} onChange={setTab} /></div>
      {tab === "text" ? <TextMode /> : <FileMode />}
    </div>
  );
}
