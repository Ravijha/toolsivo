"use client";
import { useCallback, useState } from "react";
import { Seg, Field, Msg } from "@/components/ui";
import TypingEngine from "@/components/TypingEngine";
import { EN_PASSAGES, HI_PASSAGES, HI_PHONETIC_HINT, shuffle } from "@/lib/typingText";
import { romanToHindi } from "@/lib/hindi";

// One shuffled order per session so "New text" and the auto-extend never repeat too soon.
function makeDeck(list) {
  let deck = shuffle(list), i = 0;
  return () => { if (i >= deck.length) { deck = shuffle(list); i = 0; } return deck[i++]; };
}

export default function TypingTest({ lang = "en" }) {
  const hi = lang === "hi";
  const [deck] = useState(() => makeDeck(hi ? HI_PASSAGES : EN_PASSAGES));
  const [duration, setDuration] = useState(60);
  const [text, setText] = useState(() => deck());
  const [method, setMethod] = useState("phonetic");
  const [round, setRound] = useState(0);
  const phonetic = hi && method === "phonetic";
  const transform = useCallback((s) => romanToHindi(s, { smartA: true, danda: true }), []);

  const newText = () => { setText(deck()); setRound((r) => r + 1); };
  const pick = (d) => { setDuration(d); setRound((r) => r + 1); };

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <Field label="Test length">
          <Seg options={[{ label: "1 minute", value: 60 }, { label: "3 minutes", value: 180 }, { label: "5 minutes", value: 300 }]} value={duration} onChange={pick} />
        </Field>
        {hi && (
          <Field label="How will you type Hindi?">
            <Seg options={[{ label: "English letters (phonetic)", value: "phonetic" }, { label: "Hindi keyboard (InScript / IME)", value: "native" }]} value={method} onChange={(m) => { setMethod(m); setRound((r) => r + 1); }} />
          </Field>
        )}
      </div>
      {hi && method === "native" && <Msg>Turn on a Hindi keyboard on your device first (Windows: Settings → Time &amp; language → Language → Add Hindi; phones: add Hindi in keyboard settings). No Hindi keyboard? Choose “English letters”.</Msg>}
      <TypingEngine
        key={`${round}-${duration}-${method}`}
        text={text}
        mode={hi ? "words" : "chars"}
        lang={lang}
        duration={duration}
        more={deck}
        transform={phonetic ? transform : undefined}
        onNew={newText}
        hint={phonetic ? HI_PHONETIC_HINT : "Tip: the timer starts on your first key. Backspace is allowed — corrected mistakes still lower your accuracy."}
      />
    </div>
  );
}
