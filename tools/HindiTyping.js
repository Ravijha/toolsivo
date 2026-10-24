"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Download, Trash2, Keyboard, Wand2 } from "lucide-react";
import { Toggle, CopyBtn, Msg, Stat } from "@/components/ui";
import { downloadText } from "@/lib/file";
import { romanToHindi } from "@/lib/hindi";

const KEYS = [
  ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ", "ं", "ँ", "ः"],
  ["ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ", "्", "़", "।", "॥"],
  ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण"],
  ["त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व"],
  ["श", "ष", "स", "ह", "क्ष", "त्र", "ज्ञ", "श्र", "ड़", "ढ़", "ज़", "फ़", "०", "१", "२"],
];
const GUIDE = [
  ["aa / A", "आ ा"], ["i", "इ ि"], ["ee / I", "ई ी"], ["u", "उ ु"], ["oo / U", "ऊ ू"], ["e", "ए े"], ["ai", "ऐ ै"], ["o", "ओ ो"], ["au", "औ ौ"], ["Ri", "ऋ ृ"],
  ["k / kh", "क ख"], ["g / gh", "ग घ"], ["ch / chh", "च छ"], ["j / jh", "ज झ"], ["T / Th", "ट ठ"], ["D / Dh", "ड ढ"], ["R / Rh", "ड़ ढ़"], ["N", "ण"],
  ["t / th", "त थ"], ["d / dh", "द ध"], ["p / ph", "प फ"], ["b / bh", "ब भ"], ["sh / Sh", "श ष"], ["ksh / gy", "क्ष ज्ञ"], ["z / q", "ज़ क़"],
  ["M", "ं (anusvara)"], ["~", "ँ (chandrabindu)"], ["H", "ः (visarga)"], ["|", "।"], ["\\word", "keeps an English word"],
];
const EXAMPLE = "namaste! aap kaise hain? main hindi mein type kar rahaa hoon.";

export default function HindiTyping() {
  const [text, setText] = useState("");
  const [smart, setSmart] = useState(true);
  const [danda, setDanda] = useState(true);
  const [digits, setDigits] = useState(false);
  const [kb, setKb] = useState(false);
  const ref = useRef(null);
  const caret = useRef(null);
  // restore the cursor synchronously after a word is converted, before the next key press is handled
  useLayoutEffect(() => {
    if (caret.current != null && ref.current) { ref.current.setSelectionRange(caret.current, caret.current); caret.current = null; }
  }, [text]);
  const opts = { smartA: smart, danda, digits };

  // Convert the English word just before the cursor when a space, punctuation or Enter is typed.
  const onChange = (e) => {
    const el = e.target, v = el.value, pos = el.selectionStart;
    const typedChar = v[pos - 1];
    if (v.length > text.length && /[\s.,!?;:|)"'\-]/.test(typedChar || "")) {
      const before = v.slice(0, pos - 1);
      const m = before.match(/\\?[A-Za-z~][A-Za-z~0-9]*$/);
      if (m) {
        const conv = romanToHindi(m[0], { ...opts, danda: false });
        const sep = typedChar === "." && danda ? "।" : typedChar === "|" ? "।" : typedChar;
        caret.current = m.index + conv.length + sep.length;
        setText(before.slice(0, m.index) + conv + sep + v.slice(pos));
        return;
      }
    }
    setText(v);
  };

  const insert = (s) => {
    const el = ref.current, a = el.selectionStart ?? text.length, b = el.selectionEnd ?? text.length;
    const nv = text.slice(0, a) + s + text.slice(b);
    caret.current = a + s.length;
    setText(nv);
    el.focus();
  };

  // live preview of the word being typed
  const pending = useMemo(() => {
    const el = ref.current;
    const upto = el ? text.slice(0, el.selectionStart) : text;
    const m = upto.match(/\\?[A-Za-z~][A-Za-z~0-9]*$/);
    return m ? [m[0], romanToHindi(m[0], { ...opts, danda: false })] : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, smart, digits]);

  const convertAll = () => setText((t) => romanToHindi(t, opts));
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="field">
          <span className="label">Type in English letters — each word turns into Hindi when you press space</span>
          <textarea
            ref={ref}
            className="textarea prose hi"
            style={{ minHeight: 280, fontSize: "1.25rem", lineHeight: 1.8 }}
            value={text}
            onChange={onChange}
            placeholder="Try: namaste aap kaise hain"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          />
        </div>
        <div className="row" style={{ justifyContent: "space-between", minHeight: 40 }}>
          {pending ? <span className="chip hi" style={{ cursor: "default", fontSize: "1.05rem" }}>{pending[0]} → <b>{pending[1]}</b></span> : <small className="muted">Press space to convert the current word.</small>}
          <div className="actions">
            <CopyBtn text={text} label="Copy Hindi" />
            <button className="btn btn-sm" onClick={() => downloadText(text, "hindi-text.txt")} disabled={!text}><Download size={15} /> .txt</button>
            <button className="btn btn-sm" onClick={convertAll} title="Convert any remaining English letters"><Wand2 size={15} /> Convert all</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setText("")}><Trash2 size={15} /> Clear</button>
          </div>
        </div>
        {!text && <button className="btn btn-sm" style={{ alignSelf: "start" }} onClick={() => setText(romanToHindi(EXAMPLE, opts))}>Show an example</button>}
        <button className="btn btn-sm" style={{ alignSelf: "start" }} onClick={() => setKb(!kb)}><Keyboard size={15} /> {kb ? "Hide" : "Show"} Hindi keyboard</button>
        {kb && (
          <div className="panel stack hi" style={{ gap: 6 }}>
            {KEYS.map((row, r) => (
              <div key={r} className="row" style={{ gap: 5 }}>
                {row.map((k) => <button key={k} className="btn btn-sm" style={{ minWidth: 40, fontSize: "1.1rem", padding: "0 8px" }} onClick={() => insert(k)}>{k}</button>)}
              </div>
            ))}
            <div className="row" style={{ gap: 5 }}>
              <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => insert(" ")}>Space</button>
              <button className="btn btn-sm" onClick={() => setText((t) => [...t].slice(0, -1).join(""))}>⌫</button>
            </div>
          </div>
        )}
        <div className="stats">
          <Stat label="Words" value={words} />
          <Stat label="Characters" value={[...text].length} />
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Toggle label="Smart spelling (kya → क्या, main → मैं)" checked={smart} onChange={setSmart} />
          <Toggle label="Full stop as । (purna viram)" checked={danda} onChange={setDanda} />
          <Toggle label="Hindi digits (१२३)" checked={digits} onChange={setDigits} />
        </div>
        <div className="panel">
          <div className="panel-title">Typing guide</div>
          <div className="table-wrap" style={{ maxHeight: 380 }}>
            <table className="table"><tbody>
              {GUIDE.map(([k, v]) => <tr key={k}><td><code>{k}</code></td><td className="hi" style={{ textAlign: "left", fontSize: "1.05rem" }}>{v}</td></tr>)}
            </tbody></table>
          </div>
        </div>
        <Msg>Conversion happens on your device using our own phonetic rules — nothing you type is sent anywhere or saved.</Msg>
      </div>
    </div>
  );
}
