"use client";
import { useMemo, useState } from "react";
import { Download, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { Seg, CopyBtn, Msg, Field } from "@/components/ui";
import { downloadText } from "@/lib/file";
import { hindiToRoman } from "@/lib/hindi";

const SAMPLE = "नमस्ते! आप कैसे हैं? मुझे हिन्दी भाषा बहुत अच्छी लगती है। भारत एक सुंदर देश है।";

export default function HindiToEnglish() {
  const [text, setText] = useState(SAMPLE);
  const [scheme, setScheme] = useState("hinglish");
  const [cap, setCap] = useState("sentence");
  const out = useMemo(() => {
    let r = hindiToRoman(text, scheme);
    if (cap === "sentence") r = r.replace(/(^\s*|[.!?]\s+)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
    if (cap === "words") r = r.replace(/(^|\s)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
    return r;
  }, [text, scheme, cap]);

  return (
    <div className="stack">
      <Msg>This tool <b>transliterates</b> — it writes Hindi words in English letters (नमस्ते → namaste) so anyone can read them aloud. It does not translate the meaning into English.</Msg>
      <div className="row">
        <Seg options={[{ label: "Hinglish (everyday)", value: "hinglish" }, { label: "IAST (academic)", value: "iast" }]} value={scheme} onChange={setScheme} />
        <Seg options={[{ label: "Sentence case", value: "sentence" }, { label: "Title Case", value: "words" }, { label: "lowercase", value: "none" }]} value={cap} onChange={setCap} />
      </div>
      <div className="grid-2">
        <Field label="Hindi (देवनागरी)">
          <textarea className="textarea prose hi" style={{ minHeight: 300, fontSize: "1.2rem", lineHeight: 1.8 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="यहाँ हिन्दी लिखें या पेस्ट करें…" />
        </Field>
        <Field label="English letters (Roman)">
          <textarea className="textarea prose" style={{ minHeight: 300, fontSize: "1.1rem", lineHeight: 1.8 }} readOnly value={out} />
        </Field>
      </div>
      <div className="row">
        <CopyBtn text={out} label="Copy result" className="btn" />
        <button className="btn" onClick={() => downloadText(out, "hindi-in-english-letters.txt")} disabled={!out}><Download size={16} /> Download .txt</button>
        <Link className="btn" href="/tools/english-to-hindi-typing/"><ArrowLeftRight size={16} /> Need to type Hindi? English to Hindi typing</Link>
      </div>
      <small className="muted">Hinglish drops the silent “a” at the end of words (राम → ram), the way most people write Hindi in chats. IAST is the standard academic scheme with marks such as ā, ī, ṭ and ś. Everything happens on your device.</small>
    </div>
  );
}
