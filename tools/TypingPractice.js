"use client";
import { useMemo, useState } from "react";
import { CalendarDays, Trophy } from "lucide-react";
import { Seg, Field, Stat } from "@/components/ui";
import TypingEngine from "@/components/TypingEngine";
import { WORDS, SENTENCES, EN_PASSAGES, seeded, shuffle } from "@/lib/typingText";

const LEVELS = [{ label: "Beginner", value: "beginner" }, { label: "Easy", value: "easy" }, { label: "Intermediate", value: "intermediate" }, { label: "Advanced", value: "advanced" }];
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function build(level, kind, rnd = Math.random) {
  if (kind === "words") {
    const pool = level === "beginner" ? WORDS.beginner : level === "easy" ? WORDS.easy : level === "intermediate" ? [...WORDS.easy, ...WORDS.intermediate] : [...WORDS.intermediate, ...WORDS.advanced];
    return Array.from({ length: level === "beginner" ? 20 : 30 }, () => pool[Math.floor(rnd() * pool.length)]).join(" ");
  }
  if (kind === "sentences") return shuffle(SENTENCES[level], rnd).slice(0, 4).join(" ");
  const p = EN_PASSAGES[Math.floor(rnd() * EN_PASSAGES.length)];
  return level === "beginner" || level === "easy" ? p.split(". ").slice(0, 2).join(". ").replace(/\.?$/, ".") : p;
}

/** Score rewards speed but punishes inaccuracy heavily: net WPM × accuracy² × 10. */
const score = (wpm, acc) => Math.round(wpm * Math.pow(acc / 100, 2) * 10);

export default function TypingPractice() {
  const [level, setLevel] = useState("easy");
  const [kind, setKind] = useState("words");
  const [daily, setDaily] = useState(false);
  const [round, setRound] = useState(0);
  const [last, setLast] = useState(null);
  const [best, setBest] = useState(0); // this visit only — nothing is saved

  const date = today();
  const text = useMemo(() => {
    if (daily) {
      const rnd = seeded(`toolsivo-${date}`);
      const lv = ["easy", "intermediate", "advanced"][Math.floor(rnd() * 3)];
      return `${build(lv, "sentences", rnd)} ${build(lv, "words", rnd)}`;
    }
    return build(level, kind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, kind, daily, round, date]);

  const finish = (s) => {
    const sc = score(s.net, s.acc);
    setLast({ sc, wpm: Math.round(s.net), acc: Math.round(s.acc) });
    setBest((b) => Math.max(b, sc));
  };
  const reset = (fn) => (v) => { fn(v); setLast(null); setRound((r) => r + 1); };

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="row">
          <button className={`btn ${daily ? "btn-primary" : ""}`} onClick={() => { setDaily(!daily); setLast(null); setRound((r) => r + 1); }}>
            <CalendarDays size={16} /> {daily ? "Daily challenge on" : "Today’s daily challenge"}
          </button>
          {daily && <small className="muted">Challenge for {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} — the same text for everyone today.</small>}
        </div>
        <TypingEngine key={`${round}-${level}-${kind}-${daily}`} text={text} mode="chars" duration={0} onNew={daily ? undefined : () => { setLast(null); setRound((r) => r + 1); }} onDone={finish} />
      </div>
      <div className="side">
        {!daily && (
          <div className="panel stack">
            <Field label="Level"><Seg options={LEVELS} value={level} onChange={reset(setLevel)} /></Field>
            <Field label="Practise"><Seg options={[{ label: "Words", value: "words" }, { label: "Sentences", value: "sentences" }, { label: "Paragraph", value: "paragraph" }]} value={kind} onChange={reset(setKind)} /></Field>
            <small className="muted">
              {level === "beginner" && "Home-row letters only (a s d f g h j k l) — perfect for learning finger placement."}
              {level === "easy" && "Short, everyday words."}
              {level === "intermediate" && "Longer common words, sentences with numbers."}
              {level === "advanced" && "Long words, punctuation, numbers and symbols."}
            </small>
          </div>
        )}
        <div className="panel stack">
          <div className="panel-title"><Trophy size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Score</div>
          {last ? (
            <div className="big-result" style={{ padding: 18 }}><span>Your score</span><strong style={{ fontSize: "2.2rem" }}>{last.sc}</strong><small>{last.wpm} WPM · {last.acc}% accuracy</small></div>
          ) : <small className="muted">Finish the text to get your score.</small>}
          <div className="stats"><Stat label="Best this visit" value={best || "—"} /></div>
          <small className="muted">Score = net WPM × accuracy² × 10, so accurate typing scores much higher than fast, careless typing. Scores are not saved.</small>
        </div>
      </div>
    </div>
  );
}
