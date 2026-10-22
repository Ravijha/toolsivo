"use client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, Download } from "lucide-react";
import { Dropzone, Field, Seg, CopyBtn, Msg, Spinner } from "@/components/ui";
import { formatBytes, downloadText } from "@/lib/file";

const ALGOS = ["SHA-256", "SHA-1", "SHA-384", "SHA-512"];
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const LIMIT = 2 * 1024 ** 3;

export default function Checksum() {
  const [tab, setTab] = useState("file");
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("Hello, Toolsivo!");
  const [textHashes, setTextHashes] = useState({});
  const [expected, setExpected] = useState("");

  const hashFiles = async (list) => {
    const added = list.map((f) => ({ id: Math.random().toString(36).slice(2), file: f, hashes: null, error: f.size > LIMIT ? "Files over 2 GB can’t be hashed in the browser." : null }));
    setFiles((F) => [...F, ...added]);
    for (const it of added) {
      if (it.error) continue;
      try {
        const buf = await it.file.arrayBuffer();
        const hashes = {};
        for (const a of ALGOS) hashes[a] = hex(await crypto.subtle.digest(a, buf));
        setFiles((F) => F.map((x) => (x.id === it.id ? { ...x, hashes } : x)));
      } catch {
        setFiles((F) => F.map((x) => (x.id === it.id ? { ...x, error: "Not enough memory to read this file." } : x)));
      }
    }
  };

  const hashText = async (t) => {
    setText(t);
    const buf = new TextEncoder().encode(t), out = {};
    for (const a of ALGOS) out[a] = hex(await crypto.subtle.digest(a, buf));
    setTextHashes(out);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === "text" && !textHashes["SHA-256"]) hashText(text); }, [tab]);

  const exp = expected.trim().toLowerCase().replace(/^sha\d+[:=\s]*/, "");
  const match = useMemo(() => {
    if (!exp) return null;
    const all = tab === "file" ? files.flatMap((f) => (f.hashes ? Object.entries(f.hashes).map(([a, h]) => ({ a, h, name: f.file.name })) : [])) : Object.entries(textHashes).map(([a, h]) => ({ a, h, name: "text" }));
    return all.find((x) => x.h === exp) || false;
  }, [exp, files, textHashes, tab]);

  const report = files.filter((f) => f.hashes).map((f) => `${f.hashes["SHA-256"]}  ${f.file.name}`).join("\n");

  const Hashes = ({ h }) => (
    <div className="stack" style={{ gap: 6 }}>
      {ALGOS.map((a) => (
        <div key={a} className="row" style={{ flexWrap: "nowrap", gap: 8 }}>
          <small style={{ width: 64, flex: "none", fontWeight: 800, color: a === "SHA-256" ? "var(--brand)" : "var(--muted)" }}>{a}</small>
          <code style={{ flex: 1, fontSize: ".8rem", wordBreak: "break-all", background: exp && h[a] === exp ? "var(--ok-bg)" : undefined, borderRadius: 4 }}>{h[a]}</code>
          <CopyBtn text={h[a]} className="btn btn-sm btn-ghost" label="" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div style={{ maxWidth: 280 }}><Seg options={[{ label: "Files", value: "file" }, { label: "Text", value: "text" }]} value={tab} onChange={setTab} /></div>
        {tab === "file" ? (
          <>
            <Dropzone multiple accept="*/*" onFiles={hashFiles} title="Drop files to hash" hint="Any file type — hashed on your device, never uploaded" compact={files.length > 0} />
            {files.map((f) => (
              <div key={f.id} className="panel stack">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <b style={{ wordBreak: "break-all" }}>{f.file.name}</b>
                  <small className="muted">{formatBytes(f.file.size)}</small>
                </div>
                {f.error ? <Msg type="bad">{f.error}</Msg> : f.hashes ? <Hashes h={f.hashes} /> : <div className="row"><Spinner dark /><small className="muted">Calculating…</small></div>}
              </div>
            ))}
          </>
        ) : (
          <>
            <Field label="Text"><textarea className="textarea" style={{ minHeight: 140 }} value={text} onChange={(e) => hashText(e.target.value)} /></Field>
            {textHashes["SHA-256"] && <div className="panel"><Hashes h={textHashes} /></div>}
          </>
        )}
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Compare with expected checksum" hint="Paste the hash published by the software vendor">
            <textarea className="textarea" style={{ minHeight: 80 }} value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="e.g. 9f86d081884c7d65…" spellCheck={false} />
          </Field>
          {match === false && <Msg type="bad"><XCircle size={15} style={{ display: "inline" }} /> No match. The file may be corrupted, incomplete or not the original — don’t open it.</Msg>}
          {match && <Msg type="ok"><CheckCircle2 size={15} style={{ display: "inline" }} /> Match! {match.a} of {match.name} is identical — the file is authentic.</Msg>}
        </div>
        {report && <button className="btn" onClick={() => downloadText(report + "\n", "SHA256SUMS.txt")}><Download size={16} /> Download SHA256SUMS</button>}
        {files.length > 0 && tab === "file" && <button className="btn" onClick={() => setFiles([])}><RefreshCw size={16} /> Clear</button>}
        <small className="muted">Uses your browser’s built-in Web Crypto. Each file is read fully into memory, so very large files (over ~2 GB) may not work on every device. MD5 is not offered because it is no longer secure.</small>
      </div>
    </div>
  );
}
