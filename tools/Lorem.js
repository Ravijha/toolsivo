"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Download } from "lucide-react";
import { Seg, Toggle, CopyBtn, Range } from "@/components/ui";
import { downloadText } from "@/lib/file";

const W = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nulla gravida orci a odio nullam varius turpis et commodo pharetra est eros bibendum elit nec luctus magna felis sollicitudin mauris integer in mauris eu nibh euismod gravida".split(" ");
const pick = () => W[(Math.random() * W.length) | 0];
const sentence = () => {
  const n = 7 + ((Math.random() * 10) | 0);
  const w = Array.from({ length: n }, pick);
  if (n > 10) w[(n / 2) | 0] += ",";
  const s = w.join(" ");
  return s[0].toUpperCase() + s.slice(1) + ".";
};
const paragraph = () => Array.from({ length: 4 + ((Math.random() * 4) | 0) }, sentence).join(" ");
const CLASSIC = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export default function Lorem() {
  const [unit, setUnit] = useState("paragraphs");
  const [count, setCount] = useState(3);
  const [classic, setClassic] = useState(true);
  const [html, setHtml] = useState(false);
  const [out, setOut] = useState("");

  const gen = () => {
    let parts;
    if (unit === "paragraphs") parts = Array.from({ length: count }, paragraph);
    else if (unit === "sentences") parts = [Array.from({ length: count }, sentence).join(" ")];
    else {
      const w = Array.from({ length: count }, pick).join(" ");
      parts = [w[0].toUpperCase() + w.slice(1) + "."];
    }
    if (classic) parts[0] = unit === "words" ? `Lorem ipsum ${parts[0].split(" ").slice(2).join(" ")}` : `${CLASSIC} ${parts[0]}`;
    setOut(html ? parts.map((p) => `<p>${p}</p>`).join("\n") : parts.join("\n\n"));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(gen, [unit, count, classic, html]);

  const max = unit === "paragraphs" ? 20 : unit === "sentences" ? 50 : 500;
  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <h3>{out.split(/\s+/).filter(Boolean).length} words · {out.length} characters</h3>
          <div className="actions">
            <CopyBtn text={out} />
            <button className="btn btn-sm" onClick={() => downloadText(out, html ? "lorem.html" : "lorem.txt")}><Download size={15} /> Download</button>
          </div>
        </div>
        <div className="panel" style={{ background: "var(--elev)", whiteSpace: "pre-wrap", lineHeight: 1.75, minHeight: 340, fontFamily: html ? "var(--mono)" : undefined, fontSize: html ? ".85rem" : undefined }}>{out}</div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Seg options={[{ label: "Paragraphs", value: "paragraphs" }, { label: "Sentences", value: "sentences" }, { label: "Words", value: "words" }]} value={unit} onChange={(u) => { setUnit(u); setCount(u === "paragraphs" ? 3 : u === "sentences" ? 5 : 50); }} />
          <Range label="Amount" value={Math.min(count, max)} min={1} max={max} onChange={setCount} />
          <Toggle label='Start with "Lorem ipsum…"' checked={classic} onChange={setClassic} />
          <Toggle label="Wrap in <p> tags" checked={html} onChange={setHtml} />
          <button className="btn btn-primary btn-lg" onClick={gen}><RefreshCw size={18} /> Regenerate</button>
        </div>
      </div>
    </div>
  );
}
