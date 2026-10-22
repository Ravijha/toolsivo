"use client";
import { useMemo, useState } from "react";
import { Download, ArrowRight } from "lucide-react";
import { Dropzone, Field, Seg, Msg, Stat, NumInput } from "@/components/ui";
import { downloadText, baseName } from "@/lib/file";

/* ---------- time helpers (milliseconds) ---------- */
function parseTime(t) {
  const m = t.trim().match(/(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:[.,](\d{1,3}))?/);
  if (!m) return NaN;
  const ms = m[4] ? +m[4].padEnd(3, "0") : 0;
  return ((+(m[1] || 0) * 60 + +m[2]) * 60 + +m[3]) * 1000 + ms;
}
const pad = (n, l = 2) => String(Math.max(0, Math.floor(n))).padStart(l, "0");
function fmt(ms, sep = ",", hourDigits = 2) {
  ms = Math.max(0, Math.round(ms));
  const h = ms / 3600000, m = (ms / 60000) % 60, s = (ms / 1000) % 60;
  return `${pad(h, hourDigits)}:${pad(m)}:${pad(s)}${sep}${pad(ms % 1000, 3)}`;
}
const fmtAss = (ms) => { ms = Math.max(0, Math.round(ms)); return `${Math.floor(ms / 3600000)}:${pad((ms / 60000) % 60)}:${pad((ms / 1000) % 60)}.${pad((ms % 1000) / 10)}`; };

/* ---------- parsers → [{start, end, text}] ---------- */
function detect(src) {
  if (/^\uFEFF?WEBVTT/.test(src)) return "vtt";
  if (/\[Script Info\]|^Dialogue:/m.test(src)) return "ass";
  if (/^\d+:\d{2}:\d{2}\.\d{3},\d+:\d{2}:\d{2}\.\d{3}/m.test(src)) return "sbv";
  if (/-->/.test(src)) return "srt";
  return null;
}
function parseArrows(src) {
  const cues = [];
  for (const block of src.replace(/\r/g, "").split(/\n\s*\n/)) {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i < 0) continue;
    const [a, b] = lines[i].split("-->");
    const start = parseTime(a), end = parseTime(b);
    if (isNaN(start) || isNaN(end)) continue;
    cues.push({ start, end, text: lines.slice(i + 1).join("\n").replace(/<\/?(?:c|v|i|b|u)[^>]*>/g, (t) => (/^<\/?[ibu]>$/.test(t) ? t : "")) });
  }
  return cues;
}
function parseSbv(src) {
  const cues = [];
  for (const block of src.replace(/\r/g, "").split(/\n\s*\n/)) {
    const [head, ...text] = block.trim().split("\n");
    const m = head?.match(/^([\d:.]+),([\d:.]+)$/);
    if (m) cues.push({ start: parseTime(m[1]), end: parseTime(m[2]), text: text.join("\n") });
  }
  return cues;
}
function parseAss(src) {
  const cues = [];
  let fields = ["Layer", "Start", "End", "Style", "Name", "MarginL", "MarginR", "MarginV", "Effect", "Text"];
  for (const line of src.replace(/\r/g, "").split("\n")) {
    if (/^Format:/i.test(line) && /Text/.test(line)) fields = line.slice(7).split(",").map((s) => s.trim());
    if (!/^Dialogue:/i.test(line)) continue;
    const parts = line.slice(9).split(",");
    const row = {};
    fields.forEach((f, i) => { row[f] = i === fields.length - 1 ? parts.slice(i).join(",") : parts[i]; });
    cues.push({
      start: parseTime(row.Start), end: parseTime(row.End),
      text: (row.Text || "").replace(/\{[^}]*\}/g, "").replace(/\\N/gi, "\n").trim(),
    });
  }
  return cues;
}
const PARSERS = { srt: parseArrows, vtt: parseArrows, sbv: parseSbv, ass: parseAss };

/* ---------- writers ---------- */
const WRITERS = {
  srt: (c) => c.map((q, i) => `${i + 1}\n${fmt(q.start)} --> ${fmt(q.end)}\n${q.text}`).join("\n\n") + "\n",
  vtt: (c) => "WEBVTT\n\n" + c.map((q) => `${fmt(q.start, ".")} --> ${fmt(q.end, ".")}\n${q.text}`).join("\n\n") + "\n",
  sbv: (c) => c.map((q) => `${fmt(q.start, ".", 1)},${fmt(q.end, ".", 1)}\n${q.text}`).join("\n\n") + "\n",
  ass: (c) => `[Script Info]
Title: Converted by Toolsivo
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,60,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,3,1,2,40,40,50,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${c.map((q) => `Dialogue: 0,${fmtAss(q.start)},${fmtAss(q.end)},Default,,0,0,0,,${q.text.replace(/<\/?[^>]+>/g, "").replace(/\n/g, "\\N")}`).join("\n")}
`,
  txt: (c) => c.map((q) => q.text.replace(/<\/?[^>]+>/g, "")).join("\n") + "\n",
};
const LABELS = { srt: "SRT", vtt: "WebVTT", sbv: "SBV (YouTube)", ass: "ASS/SSA", txt: "Plain text" };

const SAMPLE = `1
00:00:01,000 --> 00:00:03,500
Welcome to Toolsivo!

2
00:00:04,000 --> 00:00:07,250
Convert subtitles between SRT, VTT,
SBV and ASS in one click.
`;

export default function Subtitles() {
  const [src, setSrc] = useState(SAMPLE);
  const [name, setName] = useState("subtitles.srt");
  const [to, setTo] = useState("vtt");
  const [shift, setShift] = useState("0");

  const res = useMemo(() => {
    const from = detect(src);
    if (!from) return { error: src.trim() ? "Couldn’t recognise this format. Supported: SRT, VTT, SBV, ASS/SSA." : null };
    const off = Math.round((+shift || 0) * 1000);
    const cues = PARSERS[from](src).map((c) => ({ ...c, start: Math.max(0, c.start + off), end: Math.max(0, c.end + off) }));
    if (!cues.length) return { error: "No subtitle cues found in this file." };
    return { from, cues, out: WRITERS[to](cues), dur: cues[cues.length - 1].end };
  }, [src, to, shift]);

  const open = ([f]) => {
    const r = new FileReader();
    r.onload = () => { setSrc(String(r.result)); setName(f.name); };
    r.readAsText(f);
  };

  return (
    <div className="stack">
      <Dropzone compact accept=".srt,.vtt,.sbv,.ass,.ssa,.txt,text/vtt" onFiles={open} title="Open a subtitle file" hint="SRT, VTT, SBV, ASS or SSA — or paste the text below" />
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row">
          <span className="chip active" style={{ cursor: "default" }}>{res.from ? LABELS[res.from] : "?"}</span>
          <ArrowRight size={18} className="muted" />
          <Seg options={Object.entries(LABELS).map(([k, l]) => ({ label: l, value: k }))} value={to} onChange={setTo} />
        </div>
        <div style={{ width: 230 }}>
          <Field label="Shift timing" hint="Negative = earlier, positive = later"><NumInput value={shift} onChange={setShift} suffix="sec" step={0.1} /></Field>
        </div>
      </div>
      {res.error && <Msg type="bad">{res.error}</Msg>}
      <div className="grid-2">
        <div className="field"><span className="label">Input · {name}</span><textarea className="textarea" style={{ minHeight: 380 }} value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} /></div>
        <div className="field"><span className="label">Output · {LABELS[to]}</span><textarea className="textarea" style={{ minHeight: 380 }} readOnly value={res.out || ""} /></div>
      </div>
      {res.cues && (
        <div className="toolbar">
          <div className="stats" style={{ flex: 1 }}>
            <Stat label="Subtitle cues" value={res.cues.length} />
            <Stat label="Ends at" value={fmt(res.dur).slice(0, 8)} />
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => downloadText(res.out, `${baseName(name)}.${to === "ass" ? "ass" : to}`, to === "vtt" ? "text/vtt" : "text/plain")}>
            <Download size={18} /> Download .{to}
          </button>
        </div>
      )}
    </div>
  );
}
