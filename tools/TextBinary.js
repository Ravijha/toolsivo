"use client";
import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { Seg, CopyBtn, Msg, Field } from "@/components/ui";

const BASES = { binary: [2, 8], hex: [16, 2], octal: [8, 3], decimal: [10, 0] };
const SEPS = { space: " ", none: "", comma: ", ", newline: "\n" };

function encode(text, base, sep, prefix) {
  const [radix, width] = BASES[base];
  const pre = prefix ? { binary: "0b", hex: "0x", octal: "0o", decimal: "" }[base] : "";
  return [...new TextEncoder().encode(text)].map((b) => pre + b.toString(radix).toUpperCase().padStart(width, "0")).join(SEPS[sep]);
}

function decode(src, base) {
  const [radix, width] = BASES[base];
  let s = src.trim().replace(/0[bxo]/gi, (m) => (m.toLowerCase() === `0${{ binary: "b", hex: "x", octal: "o" }[base]}` ? " " : m));
  let parts = s.split(/[\s,;]+/).filter(Boolean);
  // allow an unseparated stream, e.g. 0100100001101001
  if (parts.length === 1 && width && parts[0].length > width && parts[0].length % width === 0) parts = parts[0].match(new RegExp(`.{${width}}`, "g"));
  const valid = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^[0-9a-f]+$/i }[radix];
  const bad = parts.find((p) => !valid.test(p) || parseInt(p, radix) > 255);
  if (bad) throw new Error(`“${bad}” is not a valid ${base} byte (0–255).`);
  return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(parts.map((p) => parseInt(p, radix))));
}

export default function TextBinary() {
  const [dir, setDir] = useState("encode");
  const [base, setBase] = useState("binary");
  const [sep, setSep] = useState("space");
  const [prefix, setPrefix] = useState(false);
  const [input, setInput] = useState("Hi Toolsivo! नमस्ते");

  const res = useMemo(() => {
    try { return { out: dir === "encode" ? encode(input, base, sep, prefix) : decode(input, base) }; }
    catch (e) { return { error: e.message.includes("decode") || e.name === "TypeError" ? "These bytes are not valid UTF-8 text." : e.message }; }
  }, [input, dir, base, sep, prefix]);

  const swap = () => { if (res.out != null) { setInput(res.out); setDir(dir === "encode" ? "decode" : "encode"); } };
  const bytes = dir === "encode" ? new TextEncoder().encode(input).length : null;

  return (
    <div className="stack">
      <div className="toolbar" style={{ marginBottom: 0 }}>
        <div className="actions">
          <Seg options={[{ label: "Text → code", value: "encode" }, { label: "Code → text", value: "decode" }]} value={dir} onChange={setDir} />
          <Seg options={[{ label: "Binary", value: "binary" }, { label: "Hex", value: "hex" }, { label: "Octal", value: "octal" }, { label: "Decimal", value: "decimal" }]} value={base} onChange={setBase} />
        </div>
        <div className="actions">
          <button className="btn btn-sm" onClick={swap}><ArrowDownUp size={15} /> Swap</button>
          <CopyBtn text={res.out} />
        </div>
      </div>
      {dir === "encode" && (
        <div className="row">
          <Field label="Separator"><Seg options={[{ label: "Space", value: "space" }, { label: "None", value: "none" }, { label: "Comma", value: "comma" }, { label: "New line", value: "newline" }]} value={sep} onChange={setSep} /></Field>
          {base !== "decimal" && <Field label="Prefix"><Seg options={[{ label: "None", value: false }, { label: base === "binary" ? "0b" : base === "hex" ? "0x" : "0o", value: true }]} value={prefix} onChange={setPrefix} /></Field>}
        </div>
      )}
      <div className="grid-2">
        <Field label={dir === "encode" ? "Text" : `${base[0].toUpperCase() + base.slice(1)} bytes`}>
          <textarea className="textarea" style={{ minHeight: 260 }} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        </Field>
        <Field label={dir === "encode" ? `${base[0].toUpperCase() + base.slice(1)}${bytes != null ? ` · ${bytes} bytes` : ""}` : "Text"}>
          {res.error ? <Msg type="bad">{res.error}</Msg> : <textarea className="textarea" style={{ minHeight: 260 }} readOnly value={res.out} />}
        </Field>
      </div>
      <small className="muted">Text is encoded as UTF-8, so English letters use 1 byte each while Hindi letters and emoji use 3–4 bytes. Example: “A” = 01000001 = 0x41 = 65.</small>
    </div>
  );
}
