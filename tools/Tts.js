"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Square, Globe, Cpu } from "lucide-react";
import { Field, Range, Msg, Toggle } from "@/components/ui";

const SAMPLE = "Welcome to Toolsivo. This tool reads any text aloud using the voices that are already built into your device. Paste an article, your notes or an email, choose a voice, and press play. You can change the speed and pitch at any time.";

// Split into sentence-sized chunks; long utterances are cut off in some browsers.
function chunks(text) {
  const parts = text.replace(/\s+/g, " ").match(/[^.!?।]+[.!?।]*\s*/g) || [];
  const out = [];
  let offset = 0;
  for (const p of parts) {
    for (let i = 0; i < p.length; i += 220) out.push({ text: p.slice(i, i + 220), start: offset + i });
    offset += p.length;
  }
  return { list: out, normalised: text.replace(/\s+/g, " ") };
}

export default function Tts() {
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState("");
  const [text, setText] = useState(SAMPLE);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [onlyLocal, setOnlyLocal] = useState(true);
  const [state, setState] = useState("idle");
  const [pos, setPos] = useState(null);
  const run = useRef(0);

  useEffect(() => {
    if (!("speechSynthesis" in window)) { setSupported(false); return; }
    const load = () => {
      const v = speechSynthesis.getVoices();
      setVoices(v);
      setVoiceId((cur) => cur || (v.find((x) => x.localService && /^en-IN/i.test(x.lang)) || v.find((x) => x.localService && /^en/i.test(x.lang)) || v.find((x) => x.default) || v[0])?.voiceURI || "");
    };
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => { speechSynthesis.removeEventListener("voiceschanged", load); speechSynthesis.cancel(); };
  }, []);

  const shown = useMemo(() => voices.filter((v) => !onlyLocal || v.localService).sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name)), [voices, onlyLocal]);
  const voice = voices.find((v) => v.voiceURI === voiceId);
  const { list, normalised } = useMemo(() => chunks(text), [text]);

  const play = () => {
    if (state === "paused") { speechSynthesis.resume(); setState("playing"); return; }
    speechSynthesis.cancel();
    const id = ++run.current;
    setState("playing");
    list.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c.text);
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      u.rate = rate; u.pitch = pitch;
      u.onboundary = (e) => { if (id === run.current && e.name === "word") setPos({ start: c.start + e.charIndex, len: e.charLength || (c.text.slice(e.charIndex).match(/^\S+/) || [""])[0].length }); };
      if (i === list.length - 1) u.onend = () => { if (id === run.current) { setState("idle"); setPos(null); } };
      u.onerror = () => { if (id === run.current) { setState("idle"); setPos(null); } };
      speechSynthesis.speak(u);
    });
  };
  const pause = () => { speechSynthesis.pause(); setState("paused"); };
  const stopAll = () => { run.current++; speechSynthesis.cancel(); setState("idle"); setPos(null); };

  if (!supported) return <Msg type="bad">Your browser doesn’t support text to speech. Try the latest Chrome, Edge, Safari or Firefox.</Msg>;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        {state === "idle" ? (
          <Field label={`Text · ${words} words · about ${Math.max(1, Math.round(words / (150 * rate)))} min`}>
            <textarea className="textarea prose" style={{ minHeight: 320 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type the text you want to hear…" />
          </Field>
        ) : (
          <div className="panel" style={{ minHeight: 320, background: "var(--elev)", lineHeight: 1.9, fontSize: "1.05rem" }}>
            {pos ? <>{normalised.slice(0, pos.start)}<mark className="m">{normalised.slice(pos.start, pos.start + pos.len)}</mark>{normalised.slice(pos.start + pos.len)}</> : normalised}
          </div>
        )}
        <div className="row">
          {state !== "playing" ? <button className="btn btn-primary btn-lg" onClick={play} disabled={!text.trim()}><Play size={18} /> {state === "paused" ? "Resume" : "Play"}</button> : <button className="btn btn-primary btn-lg" onClick={pause}><Pause size={18} /> Pause</button>}
          <button className="btn btn-lg" onClick={stopAll} disabled={state === "idle"}><Square size={16} /> Stop</button>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label={`Voice (${shown.length} available)`}>
            <select className="select" value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
              {shown.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} — {v.lang}{v.localService ? "" : " (online)"}</option>)}
            </select>
          </Field>
          {voice && <small className="muted" style={{ display: "flex", gap: 6, alignItems: "center" }}>{voice.localService ? <><Cpu size={14} /> On-device voice — your text stays private.</> : <><Globe size={14} /> Online voice — your text is sent to the browser maker’s speech service.</>}</small>}
          <Toggle label="Only on-device voices (most private)" checked={onlyLocal} onChange={setOnlyLocal} />
          <Range label="Speed" value={rate} min={0.5} max={2} step={0.1} onChange={setRate} format={(v) => `${v.toFixed(1)}×`} />
          <Range label="Pitch" value={pitch} min={0.5} max={1.5} step={0.1} onChange={setPitch} format={(v) => v.toFixed(1)} />
        </div>
        <Msg>Voices come from your device and browser, so the list differs between Windows, Mac, Android and iPhone. Browsers don’t allow saving speech as an audio file, so this tool plays audio only.</Msg>
      </div>
    </div>
  );
}
