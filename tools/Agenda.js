"use client";
import { useState } from "react";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { Field, NumInput, CopyBtn } from "@/components/ui";
import PrintDoc, { esc, nl2br } from "@/components/PrintDoc";

let uid = 0;
const item = (topic = "", owner = "", mins = 10, notes = "") => ({ id: ++uid, topic, owner, mins, notes });
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fmt = (m) => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

export default function Agenda() {
  const [d, setD] = useState({ title: "Q4 Product Planning Meeting", date: new Date().toISOString().slice(0, 10), start: "10:00", place: "Conference Room B / Google Meet link", organiser: "Priya Sharma", attendees: "Priya Sharma, Rahul Mehta, Ananya Iyer, Vikram Singh", goal: "Agree the Q4 roadmap priorities and owners.", color: "#0ea5e9" });
  const [items, setItems] = useState([
    item("Welcome and objectives", "Priya", 5),
    item("Review of Q3 results", "Rahul", 15, "Key metrics and lessons learned"),
    item("Q4 roadmap proposals", "Ananya", 25, "Shortlist the top 5 initiatives"),
    item("Budget and resourcing", "Vikram", 15),
    item("Decisions, owners and next steps", "Priya", 10),
  ]);
  const set = (k) => (e) => setD((s) => ({ ...s, [k]: e.target.value }));
  const up = (id, k, v) => setItems((I) => I.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
  const move = (i, dir) => setItems((I) => { const a = [...I], j = i + dir; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });

  let t = toMin(d.start || "09:00");
  const timed = items.map((i) => { const s = t; t += Math.max(0, +i.mins || 0); return { ...i, from: s, to: t }; });
  const total = t - toMin(d.start || "09:00");
  const dateTxt = d.date ? new Date(d.date + "T00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";

  const text = [
    d.title.toUpperCase(), `${dateTxt} · ${fmt(timed[0]?.from ?? toMin(d.start))} – ${fmt(t)} (${total} min)`, d.place ? `Where: ${d.place}` : null, d.organiser ? `Organiser: ${d.organiser}` : null,
    d.attendees ? `Attendees: ${d.attendees}` : null, d.goal ? `Objective: ${d.goal}` : null, "", "AGENDA",
    ...timed.map((i, n) => `${n + 1}. ${fmt(i.from)} – ${i.topic}${i.owner ? ` (${i.owner})` : ""} · ${i.mins} min${i.notes ? `\n   ${i.notes}` : ""}`),
  ].filter((x) => x !== null).join("\n");

  const html = `
<div class="page">
  <div class="band"></div>
  <p class="kicker">Meeting agenda</p>
  <h1>${esc(d.title)}</h1>
  <div class="facts">
    <div><span>Date</span>${esc(dateTxt)}</div>
    <div><span>Time</span>${fmt(toMin(d.start))} – ${fmt(t)} · ${total} min</div>
    ${d.place ? `<div><span>Location</span>${esc(d.place)}</div>` : ""}
    ${d.organiser ? `<div><span>Organiser</span>${esc(d.organiser)}</div>` : ""}
  </div>
  ${d.attendees ? `<p class="att"><b>Attendees:</b> ${esc(d.attendees)}</p>` : ""}
  ${d.goal ? `<div class="goal"><span>Objective</span>${nl2br(d.goal)}</div>` : ""}
  <table>
    <thead><tr><th style="width:17%">Time</th><th>Topic</th><th style="width:18%">Owner</th><th style="width:10%" class="r">Mins</th></tr></thead>
    <tbody>${timed.map((i, n) => `<tr><td class="tm">${fmt(i.from)}</td><td><b>${n + 1}. ${esc(i.topic)}</b>${i.notes ? `<div class="nt">${nl2br(i.notes)}</div>` : ""}</td><td>${esc(i.owner)}</td><td class="r">${+i.mins || 0}</td></tr>`).join("")}</tbody>
  </table>
  <div class="notes"><span>Notes & action items</span>${"<div class='ln'></div>".repeat(8)}</div>
</div>`;
  const css = `
.band{position:absolute;left:0;top:0;bottom:0;width:6mm;background:${d.color}}
.kicker{font-size:9pt;text-transform:uppercase;letter-spacing:.14em;color:${d.color};font-weight:700}
h1{font-size:22pt;margin:4px 0 14px;line-height:1.15}
.facts{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;padding:12px 14px;background:#f4f6fa;border-radius:8px}
.facts span,.goal span,.notes span{display:block;font-size:7.5pt;text-transform:uppercase;letter-spacing:.1em;color:#6b7080;font-weight:700}
.att{margin:12px 0 0;color:#333}
.goal{margin-top:12px;border-left:3px solid ${d.color};padding:4px 12px}
table{margin-top:18px}
th{text-align:left;font-size:8pt;text-transform:uppercase;letter-spacing:.06em;color:#6b7080;border-bottom:2px solid ${d.color};padding:6px}
td{padding:9px 6px;border-bottom:1px solid #e6e8ef;vertical-align:top}
.tm{color:${d.color};font-weight:700;white-space:nowrap}
.nt{color:#5b6070;font-size:9pt;margin-top:2px}
.r{text-align:right}
.notes{margin-top:22px}
.ln{border-bottom:1px solid #d5d8e0;height:9mm}
`;

  return (
    <div className="tool-cols wide-side">
      <PrintDoc html={html} css={css} title={d.title || "Meeting agenda"} />
      <div className="side" style={{ position: "static" }}>
        <div className="panel stack">
          <Field label="Meeting title"><input className="input" value={d.title} onChange={set("title")} /></Field>
          <div className="grid-2">
            <Field label="Date"><input type="date" className="input" value={d.date} onChange={set("date")} /></Field>
            <Field label="Start time"><input type="time" className="input" value={d.start} onChange={set("start")} /></Field>
          </div>
          <Field label="Location or link"><input className="input" value={d.place} onChange={set("place")} /></Field>
          <Field label="Organiser"><input className="input" value={d.organiser} onChange={set("organiser")} /></Field>
          <Field label="Attendees"><textarea className="textarea prose" style={{ minHeight: 60 }} value={d.attendees} onChange={set("attendees")} /></Field>
          <Field label="Objective"><textarea className="textarea prose" style={{ minHeight: 60 }} value={d.goal} onChange={set("goal")} /></Field>
          <div className="row"><input type="color" value={d.color} onChange={set("color")} /><small className="muted">Accent colour</small></div>
        </div>
        <div className="panel stack">
          <div className="panel-title">Agenda items · {total} min total · ends {fmt(t)}</div>
          {timed.map((i, n) => (
            <div key={i.id} className="stack" style={{ gap: 6, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
              <div className="row" style={{ flexWrap: "nowrap", gap: 6 }}>
                <small style={{ fontWeight: 800, color: "var(--brand)", width: 64, flex: "none" }}>{fmt(i.from)}</small>
                <input className="input" value={i.topic} onChange={(e) => up(i.id, "topic", e.target.value)} placeholder="Topic" />
                <button className="btn btn-sm btn-ghost btn-icon" onClick={() => move(n, -1)} aria-label="Move up"><ArrowUp size={14} /></button>
                <button className="btn btn-sm btn-ghost btn-icon" onClick={() => move(n, 1)} aria-label="Move down"><ArrowDown size={14} /></button>
                <button className="btn btn-sm btn-ghost btn-icon btn-danger" onClick={() => setItems((I) => I.filter((x) => x.id !== i.id))} aria-label="Remove"><X size={14} /></button>
              </div>
              <div className="row" style={{ flexWrap: "nowrap", gap: 6 }}>
                <input className="input" value={i.owner} onChange={(e) => up(i.id, "owner", e.target.value)} placeholder="Owner" />
                <div style={{ width: 120, flex: "none" }}><NumInput value={i.mins} onChange={(v) => up(i.id, "mins", v)} suffix="min" min={0} /></div>
              </div>
              <input className="input" value={i.notes} onChange={(e) => up(i.id, "notes", e.target.value)} placeholder="Notes (optional)" />
            </div>
          ))}
          <button className="btn btn-sm" onClick={() => setItems((I) => [...I, item("", "", 10)])}><Plus size={15} /> Add item</button>
        </div>
        <CopyBtn text={text} label="Copy as text (for email or chat)" className="btn" />
      </div>
    </div>
  );
}
