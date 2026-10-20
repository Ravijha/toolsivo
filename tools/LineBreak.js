"use client";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Seg, Toggle, CopyBtn, Field } from "@/components/ui";
import { downloadText } from "@/lib/file";

const sample = `This text was copied from a PDF, so every
line is broken in an awkward place and
reading it is painful.

This is a second paragraph that also has
hard line breaks right in the middle of
sentences.`;

export default function LineBreak() {
  const [text, setText] = useState(sample);
  const [mode, setMode] = useState("keep");
  const [sep, setSep] = useState(" ");
  const [spaces, setSpaces] = useState(true);
  const [hyph, setHyph] = useState(true);

  const out = useMemo(() => {
    let t = text.replace(/\r\n?/g, "\n");
    if (hyph) t = t.replace(/(\w)-\n(\w)/g, "$1$2");
    const join = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean).join(sep);
    let r = mode === "keep" ? t.split(/\n\s*\n/).map(join).filter(Boolean).join("\n\n") : join(t);
    if (spaces) r = r.replace(/[ \t]{2,}/g, " ");
    return r;
  }, [text, mode, sep, spaces, hyph]);

  return (
    <div className="stack">
      <div className="row">
        <Seg options={[{ label: "Keep paragraphs", value: "keep" }, { label: "Remove all breaks", value: "all" }]} value={mode} onChange={setMode} />
        <Toggle label="Collapse extra spaces" checked={spaces} onChange={setSpaces} />
        <Toggle label="Fix hyphenated words" checked={hyph} onChange={setHyph} />
      </div>
      <div style={{ maxWidth: 360 }}>
        <Field label="Replace line breaks with">
          <Seg options={[{ label: "Space", value: " " }, { label: "Nothing", value: "" }, { label: "Comma", value: ", " }, { label: "|", value: " | " }]} value={sep} onChange={setSep} />
        </Field>
      </div>
      <div className="grid-2">
        <div className="field"><span className="label">Input</span><textarea className="textarea prose" style={{ minHeight: 340 }} value={text} onChange={(e) => setText(e.target.value)} /></div>
        <div className="field"><span className="label">Output</span><textarea className="textarea prose" style={{ minHeight: 340 }} readOnly value={out} /></div>
      </div>
      <div className="actions">
        <CopyBtn text={out} label="Copy result" />
        <button className="btn btn-sm" onClick={() => downloadText(out, "cleaned-text.txt")}><Download size={15} /> Download</button>
      </div>
    </div>
  );
}
