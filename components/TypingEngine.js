"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Shuffle, Trophy } from "lucide-react";
import { Stat } from "./ui";

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const nfc = (s) => s.normalize("NFC");

/** Grade a result against common benchmarks (e.g. many government typing tests ask for 35 WPM English / 30 WPM Hindi). */
export function rating(wpm, acc) {
  if (acc < 85) return ["Focus on accuracy", "Slow down a little — accuracy above 95% matters more than raw speed."];
  if (wpm >= 70) return ["Excellent", "Professional-level typing. Keep it up!"];
  if (wpm >= 50) return ["Fast", "Faster than most people. Great work."];
  if (wpm >= 35) return ["Good", "You meet the speed most typing exams ask for."];
  if (wpm >= 20) return ["Average", "A solid start — daily practice will lift your speed quickly."];
  return ["Beginner", "Practise the home row and common words for a few minutes every day."];
}

/**
 * Typing test.
 * mode "chars": character-by-character comparison (English).
 * mode "words": word-by-word comparison (Hindi), optionally converting phonetic input with `transform`.
 * duration: seconds, or 0 for untimed (ends when the text is finished).
 * more(): returns extra text to append so timed tests never run out.
 */
export default function TypingEngine({ text: initial, mode = "chars", duration = 60, more, transform, lang = "en", onNew, onDone, hint }) {
  const [text, setText] = useState(initial);
  const [input, setInput] = useState("");
  const [start, setStart] = useState(null);
  const [now, setNow] = useState(0);
  const [done, setDone] = useState(false);
  const [errorsMade, setErrorsMade] = useState(0);
  const [keys, setKeys] = useState(0);
  const box = useRef(null);
  const field = useRef(null);
  const reported = useRef(false);

  const elapsed = start ? Math.min((now - start) / 1000, duration || Infinity) : 0;
  const left = duration ? Math.max(0, duration - elapsed) : null;

  useEffect(() => {
    if (!start || done) return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [start, done]);
  useEffect(() => { if (duration && start && elapsed >= duration) setDone(true); }, [elapsed, duration, start]);

  const typed = useMemo(() => (transform ? transform(input) : input), [input, transform]);

  const stats = useMemo(() => {
    const mins = Math.max(elapsed, 1) / 60;
    if (mode === "words") {
      const target = nfc(text).split(/\s+/);
      const parts = nfc(typed).split(/\s+/);
      const finished = /\s$/.test(typed) ? parts.filter(Boolean) : parts.slice(0, -1);
      let correct = 0;
      const wrong = [];
      finished.forEach((w, i) => (w === target[i] ? correct++ : wrong.push([target[i], w])));
      const n = finished.length;
      return { gross: n / mins, net: correct / mins, acc: n ? (correct / n) * 100 : 100, errors: wrong.length, correct, typedUnits: n, wrong, unit: "words" };
    }
    let correct = 0;
    for (let i = 0; i < input.length; i++) if (input[i] === text[i]) correct++;
    const uncorrected = input.length - correct;
    const gross = input.length / 5 / mins;
    const wrongWords = [];
    const tw = text.slice(0, input.length).split(" "), iw = input.split(" ");
    tw.forEach((w, i) => { if (iw[i] !== undefined && iw[i] !== w && i < iw.length - 1) wrongWords.push([w, iw[i]]); });
    return {
      gross, net: Math.max(0, gross - uncorrected / mins), acc: keys ? Math.max(0, ((keys - errorsMade) / keys) * 100) : 100,
      errors: uncorrected, corrected: Math.max(0, errorsMade - uncorrected), correct, typedUnits: input.length, wrong: wrongWords, unit: "characters",
    };
  }, [mode, text, typed, input, elapsed, keys, errorsMade]);

  // untimed: finish when the whole text has been typed
  useEffect(() => {
    if (duration || done || !start) return;
    if (mode === "chars" ? input.length >= text.length : nfc(typed).trim().split(/\s+/).length >= nfc(text).split(/\s+/).length && /\S$/.test(typed) && nfc(typed).trim().split(/\s+/).pop() === nfc(text).split(/\s+/).pop())
      setDone(true);
  }, [input, typed, text, mode, duration, done, start]);

  useEffect(() => {
    if (done && !reported.current) { reported.current = true; onDone?.(stats, elapsed); }
  }, [done, stats, elapsed, onDone]);

  const onChange = (e) => {
    if (done) return;
    const v = e.target.value;
    if (!start) { setStart(Date.now()); setNow(Date.now()); }
    if (v.length > input.length) {
      setKeys((k) => k + (v.length - input.length));
      if (mode === "chars") for (let i = input.length; i < v.length; i++) if (v[i] !== text[i]) setErrorsMade((n) => n + 1);
    }
    setInput(v);
    // timed tests: keep adding text so a fast typist never runs out
    if (duration && more && v.length > text.length * 0.8) setText((t) => `${t} ${more()}`);
  };

  // keep the current position in view
  useEffect(() => { box.current?.querySelector("[data-cur]")?.scrollIntoView({ block: "nearest" }); }, [input]);

  const restart = (fresh) => {
    setInput(""); setStart(null); setNow(0); setDone(false); setErrorsMade(0); setKeys(0); reported.current = false;
    if (fresh) onNew?.(); else setText(initial);
    setTimeout(() => field.current?.focus(), 0);
  };
  useEffect(() => { setText(initial); }, [initial]);

  const render = () => {
    if (mode === "words") {
      const target = nfc(text).split(/\s+/);
      const parts = nfc(typed).split(/\s+/);
      const cur = parts.length - 1;
      return target.map((w, i) => {
        const state = i < cur ? (parts[i] === w ? "ok" : "bad") : i === cur ? "cur" : "";
        return <span key={i} data-cur={i === cur ? "" : undefined} className={`tt-word ${state}`}>{w} </span>;
      });
    }
    return [...text].map((ch, i) => {
      const state = i < input.length ? (input[i] === ch ? "ok" : "bad") : i === input.length ? "cur" : "";
      return <span key={i} data-cur={i === input.length ? "" : undefined} className={`tt-ch ${state}`}>{ch}</span>;
    });
  };

  const [label, advice] = rating(stats.net, stats.acc);
  return (
    <div className="stack">
      <div className="stats">
        <Stat hl label={duration ? "Time left" : "Time"} value={fmtTime(duration ? left : elapsed)} />
        <Stat label="Speed" value={`${Math.round(stats.net)} WPM`} sub={`gross ${Math.round(stats.gross)}`} />
        <Stat label="Accuracy" value={`${Math.round(stats.acc)}%`} />
        <Stat label="Errors" value={stats.errors} sub={mode === "chars" ? `${stats.corrected} corrected` : "wrong words"} />
      </div>
      {duration > 0 && <div className="progress"><i style={{ width: `${(elapsed / duration) * 100}%` }} /></div>}
      <div ref={box} className={`tt-text ${lang === "hi" ? "hi" : ""}`} onClick={() => field.current?.focus()}>{render()}</div>
      {!done ? (
        <>
          <textarea
            ref={field}
            className={`textarea prose ${lang === "hi" ? "hi" : ""}`}
            style={{ minHeight: 110, fontSize: "1.05rem" }}
            value={input}
            onChange={onChange}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            autoFocus
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            placeholder={start ? "" : "Start typing here — the timer begins with your first key…"}
            aria-label="Type the passage here"
          />
          {transform && input && <div className="panel hi" style={{ padding: "10px 14px", fontSize: "1.05rem" }}><small className="muted">You typed: </small>{typed}</div>}
          {hint && <small className="muted">{hint}</small>}
        </>
      ) : (
        <div className="panel stack" style={{ background: "var(--elev)" }}>
          <div className="row" style={{ gap: 14 }}>
            <span className="icon-tile" style={{ background: "var(--grad)", "--s": "52px" }}><Trophy /></span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "1.4rem" }}>{Math.round(stats.net)} WPM · {Math.round(stats.acc)}% accuracy — {label}</h3>
              <p className="muted">{advice}</p>
            </div>
          </div>
          <div className="stats">
            <Stat label="Net speed" value={`${Math.round(stats.net)} WPM`} />
            <Stat label="Gross speed" value={`${Math.round(stats.gross)} WPM`} />
            <Stat label="Accuracy" value={`${stats.acc.toFixed(1)}%`} />
            <Stat label={mode === "chars" ? "Characters typed" : "Words typed"} value={stats.typedUnits} sub={`${stats.correct} correct`} />
            <Stat label="Errors" value={stats.errors} />
            <Stat label="Time" value={fmtTime(elapsed)} />
          </div>
          {stats.wrong.length > 0 && (
            <div>
              <div className="panel-title">Words to practise</div>
              <div className={`row ${lang === "hi" ? "hi" : ""}`} style={{ gap: 6 }}>
                {stats.wrong.slice(0, 12).map(([want, got], i) => (
                  <span key={i} className="chip" style={{ cursor: "default" }} title={`You typed: ${got}`}>{want}</span>
                ))}
              </div>
            </div>
          )}
          <small className="muted">Net WPM = typed characters ÷ 5 per minute, minus uncorrected errors per minute{mode === "words" ? " (Hindi: correct words per minute)" : ""}. Results are shown only on your screen and are not saved.</small>
        </div>
      )}
      <div className="row">
        <button className="btn" onClick={() => restart(false)}><RotateCcw size={16} /> Restart</button>
        {onNew && <button className="btn" onClick={() => restart(true)}><Shuffle size={16} /> New text</button>}
      </div>
    </div>
  );
}
