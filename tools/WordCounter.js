"use client";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Stat, CopyBtn } from "@/components/ui";

const STOP = new Set("a an the and or but if of to in on at by for with from as is are was were be been it its this that these those i you he she we they them his her our your their not no so do does did have has had will would can could should may might just than then there here what which who whom when where why how all any each few more most other some such only own same too very s t into over under about up out".split(" "));
const sample = "Toolsivo brings together fast, private tools for everyday tasks. Count words, characters and sentences instantly. Your text never leaves your browser, so it stays private.\n\nPaste an essay, a blog post or a tweet to see reading time, speaking time and keyword density at a glance.";

export default function WordCounter() {
  const [text, setText] = useState(sample);
  const s = useMemo(() => {
    const words = text.match(/[\p{L}\p{N}'’-]+/gu) || [];
    const sentences = text.split(/[.!?।]+(?:\s|$)/).filter((x) => x.trim()).length;
    const paragraphs = text.split(/\n\s*\n/).filter((x) => x.trim()).length;
    const freq = {};
    for (const w of words) {
      const k = w.toLowerCase();
      if (k.length > 2 && !STOP.has(k)) freq[k] = (freq[k] || 0) + 1;
    }
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      words: words.length,
      chars: [...text].length,
      noSpace: [...text.replace(/\s/g, "")].length,
      sentences,
      paragraphs,
      lines: text ? text.split("\n").length : 0,
      read: Math.ceil(words.length / 230),
      speak: Math.ceil(words.length / 140),
      avg: words.length ? (words.reduce((a, w) => a + w.length, 0) / words.length).toFixed(1) : 0,
      top,
    };
  }, [text]);

  const limits = [["Tweet / X post", 280], ["Meta description", 160], ["SMS", 160], ["Instagram caption", 2200]];

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="stats">
          <Stat hl label="Words" value={s.words.toLocaleString()} />
          <Stat label="Characters" value={s.chars.toLocaleString()} sub={`${s.noSpace.toLocaleString()} without spaces`} />
          <Stat label="Sentences" value={s.sentences} />
          <Stat label="Paragraphs" value={s.paragraphs} />
        </div>
        <textarea className="textarea prose" style={{ minHeight: 380 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Start typing or paste your text…" />
        <div className="actions">
          <CopyBtn text={text} />
          <button className="btn btn-sm" onClick={() => setText("")}><Trash2 size={15} /> Clear</button>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Details</div>
          {[["Reading time", `~${s.read} min`], ["Speaking time", `~${s.speak} min`], ["Lines", s.lines], ["Avg. word length", `${s.avg} chars`]].map(([k, v]) => (
            <div key={k} className="row" style={{ justifyContent: "space-between" }}><span className="muted">{k}</span><b>{v}</b></div>
          ))}
        </div>
        <div className="panel stack">
          <div className="panel-title">Character limits</div>
          {limits.map(([k, n]) => {
            const p = Math.min(100, (s.chars / n) * 100);
            return (
              <div key={k} className="field">
                <span className="label" style={{ fontWeight: 600 }}>{k} <em style={{ color: s.chars > n ? "var(--bad)" : undefined }}>{s.chars}/{n}</em></span>
                <div className="progress"><i style={{ width: `${p}%`, background: s.chars > n ? "var(--bad)" : undefined }} /></div>
              </div>
            );
          })}
        </div>
        <div className="panel stack">
          <div className="panel-title">Top keywords</div>
          {s.top.length === 0 && <small className="muted">Keywords appear as you type.</small>}
          {s.top.map(([w, n]) => (
            <div key={w} className="row" style={{ justifyContent: "space-between" }}>
              <span>{w}</span><small className="muted">{n}× · {((n / s.words) * 100).toFixed(1)}%</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
