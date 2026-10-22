"use client";
import { Plus, X, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Field, Seg, Msg } from "@/components/ui";
import PrintDoc, { esc, usePersist } from "@/components/PrintDoc";

let uid = 1000;
const nid = () => ++uid;
const EXAMPLE = {
  name: "Aarav Sharma", title: "Senior Frontend Developer", email: "aarav.sharma@email.com", phone: "+91 98765 43210", location: "Pune, India",
  links: "linkedin.com/in/aaravsharma\ngithub.com/aaravsharma",
  summary: "Frontend developer with 6+ years of experience building fast, accessible web applications with React and TypeScript. Led a team of 4 to rebuild a checkout flow that lifted conversion by 18%.",
  experience: [
    { id: 1, role: "Senior Frontend Developer", company: "Brightcart Technologies", place: "Pune", start: "Jan 2022", end: "Present", bullets: "Led the redesign of the checkout flow, increasing conversion by 18%\nCut page load time by 45% through code-splitting and image optimisation\nMentored 4 developers and introduced code-review guidelines" },
    { id: 2, role: "Frontend Developer", company: "Nimbus Software", place: "Bengaluru", start: "Jul 2019", end: "Dec 2021", bullets: "Built a reusable component library used across 6 products\nImplemented WCAG 2.1 AA accessibility fixes across the main dashboard" },
  ],
  education: [{ id: 3, degree: "B.Tech, Computer Science", school: "College of Engineering, Pune", year: "2019", score: "CGPA 8.6" }],
  skills: "React, TypeScript, JavaScript, Next.js, HTML, CSS, Tailwind, Redux, Jest, Git, Accessibility, Performance optimisation",
  projects: [{ id: 4, name: "Open-source date picker", link: "github.com/aaravsharma/datepick", desc: "Lightweight accessible date picker with 1,200+ GitHub stars." }],
  certs: "AWS Certified Cloud Practitioner (2023)",
  languages: "English, Hindi, Marathi",
  template: "modern", color: "#2563eb",
};
const EMPTY = { ...EXAMPLE, name: "", title: "", email: "", phone: "", location: "", links: "", summary: "", experience: [], education: [], skills: "", projects: [], certs: "", languages: "" };

const lines = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean);

export default function Resume() {
  const [r, setR] = usePersist("toolsivo-resume", EXAMPLE);
  const set = (k) => (e) => setR((s) => ({ ...s, [k]: e.target.value }));
  const upList = (key, id, k, v) => setR((s) => ({ ...s, [key]: s[key].map((x) => (x.id === id ? { ...x, [k]: v } : x)) }));
  const add = (key, obj) => setR((s) => ({ ...s, [key]: [...s[key], { id: nid(), ...obj }] }));
  const del = (key, id) => setR((s) => ({ ...s, [key]: s[key].filter((x) => x.id !== id) }));
  const move = (key, i, d) => setR((s) => { const a = [...s[key]], j = i + d; if (j < 0 || j >= a.length) return s; [a[i], a[j]] = [a[j], a[i]]; return { ...s, [key]: a }; });

  const c = r.color, tpl = r.template;
  const contact = [r.email, r.phone, r.location, ...lines(r.links)].filter(Boolean).map(esc).join(" &nbsp;|&nbsp; ");
  const sec = (title, body) => (body ? `<section><h2>${title}</h2>${body}</section>` : "");
  const html = `
<div class="page">
  <header>
    <h1>${esc(r.name || "Your Name")}</h1>
    ${r.title ? `<p class="role">${esc(r.title)}</p>` : ""}
    ${contact ? `<p class="contact">${contact}</p>` : ""}
  </header>
  ${sec("Summary", r.summary ? `<p>${esc(r.summary)}</p>` : "")}
  ${sec("Experience", r.experience.map((e) => `<div class="entry"><div class="row"><b>${esc(e.role)}</b><span>${esc([e.start, e.end].filter(Boolean).join(" – "))}</span></div><div class="sub">${esc([e.company, e.place].filter(Boolean).join(", "))}</div>${lines(e.bullets).length ? `<ul>${lines(e.bullets).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}</div>`).join(""))}
  ${sec("Education", r.education.map((e) => `<div class="entry"><div class="row"><b>${esc(e.degree)}</b><span>${esc(e.year)}</span></div><div class="sub">${esc([e.school, e.score].filter(Boolean).join(" · "))}</div></div>`).join(""))}
  ${sec("Skills", r.skills ? `<p>${r.skills.split(",").map((s) => s.trim()).filter(Boolean).map(esc).join(" · ")}</p>` : "")}
  ${sec("Projects", r.projects.map((p) => `<div class="entry"><div class="row"><b>${esc(p.name)}</b><span>${esc(p.link)}</span></div>${p.desc ? `<p>${esc(p.desc)}</p>` : ""}</div>`).join(""))}
  ${sec("Certifications", lines(r.certs).length ? `<ul>${lines(r.certs).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "")}
  ${sec("Languages", r.languages ? `<p>${esc(r.languages)}</p>` : "")}
</div>`;

  const css = `
.page{padding:${tpl === "minimal" ? "14mm 16mm" : "16mm 18mm"};font-size:${tpl === "minimal" ? "9.8pt" : "10.3pt"};${tpl === "classic" ? "font-family:Georgia,'Times New Roman',serif;" : ""}}
header{${tpl === "classic" ? "text-align:center;border-bottom:1.5px solid #222;padding-bottom:10px;" : tpl === "modern" ? `border-left:5px solid ${c};padding-left:14px;` : ""}margin-bottom:12px}
h1{font-size:${tpl === "minimal" ? "20pt" : "24pt"};letter-spacing:${tpl === "classic" ? ".04em" : "-.01em"};${tpl === "modern" ? `color:${c};` : ""}line-height:1.1}
.role{font-size:11.5pt;color:#444;margin-top:3px}
.contact{font-size:9pt;color:#555;margin-top:5px}
section{margin-top:${tpl === "minimal" ? "9px" : "13px"}}
h2{font-size:10pt;text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px;padding-bottom:3px;${tpl === "modern" ? `color:${c};border-bottom:1px solid ${c}55;` : tpl === "classic" ? "border-bottom:1px solid #999;" : "color:#333;"}}
.entry{margin-bottom:8px;break-inside:avoid}
.row{display:flex;justify-content:space-between;gap:12px}
.row span{color:#555;font-size:9.3pt;white-space:nowrap}
.sub{color:#444;font-style:${tpl === "classic" ? "italic" : "normal"};font-size:9.6pt}
ul{margin:4px 0 0;padding-left:16px}
li{margin:1.5px 0}
p{margin:0}
`;

  // plain render helper (not a component) so inputs keep focus while typing
  const list = ({ k, fields, empty, title }) => (
    <div className="panel stack">
      <div className="panel-title">{title}</div>
      {r[k].map((x, i) => (
        <div key={x.id} className="stack" style={{ gap: 6, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          <div className="row" style={{ justifyContent: "flex-end", gap: 2 }}>
            <button className="btn btn-sm btn-ghost btn-icon" onClick={() => move(k, i, -1)} aria-label="Move up"><ArrowUp size={14} /></button>
            <button className="btn btn-sm btn-ghost btn-icon" onClick={() => move(k, i, 1)} aria-label="Move down"><ArrowDown size={14} /></button>
            <button className="btn btn-sm btn-ghost btn-icon btn-danger" onClick={() => del(k, x.id)} aria-label="Remove"><X size={14} /></button>
          </div>
          {fields.map(([f, label, multi, half]) => multi
            ? <textarea key={f} className="textarea prose" style={{ minHeight: 80 }} value={x[f]} onChange={(e) => upList(k, x.id, f, e.target.value)} placeholder={label} />
            : <input key={f} className="input" value={x[f]} onChange={(e) => upList(k, x.id, f, e.target.value)} placeholder={label} style={half ? { width: "calc(50% - 3px)", display: "inline-block", marginRight: half === 1 ? 6 : 0 } : undefined} />)}
        </div>
      ))}
      <button className="btn btn-sm" onClick={() => add(k, empty)}><Plus size={15} /> Add</button>
    </div>
  );

  return (
    <div className="tool-cols wide-side">
      <PrintDoc html={html} css={css} title={`${r.name || "Resume"} - Resume`} label="Save résumé as PDF" />
      <div className="side" style={{ position: "static" }}>
        <div className="panel stack">
          <Field label="Layout"><Seg options={[{ label: "Modern", value: "modern" }, { label: "Classic", value: "classic" }, { label: "Minimal", value: "minimal" }]} value={tpl} onChange={(v) => setR((s) => ({ ...s, template: v }))} /></Field>
          {tpl === "modern" && <div className="row"><input type="color" value={c} onChange={set("color")} /><small className="muted">Accent colour</small></div>}
          <Msg>Your résumé is saved automatically in this browser only — nothing is uploaded.</Msg>
        </div>
        <div className="panel stack">
          <div className="panel-title">Personal details</div>
          <Field label="Full name"><input className="input" value={r.name} onChange={set("name")} /></Field>
          <Field label="Job title"><input className="input" value={r.title} onChange={set("title")} /></Field>
          <div className="grid-2">
            <Field label="Email"><input className="input" value={r.email} onChange={set("email")} /></Field>
            <Field label="Phone"><input className="input" value={r.phone} onChange={set("phone")} /></Field>
          </div>
          <Field label="Location"><input className="input" value={r.location} onChange={set("location")} /></Field>
          <Field label="Links (one per line)"><textarea className="textarea prose" style={{ minHeight: 56 }} value={r.links} onChange={set("links")} /></Field>
          <Field label="Professional summary" value={`${r.summary.length} chars`}><textarea className="textarea prose" style={{ minHeight: 100 }} value={r.summary} onChange={set("summary")} /></Field>
        </div>
        {list({ k: "experience", title: "Experience", empty: { role: "", company: "", place: "", start: "", end: "", bullets: "" },
          fields: [["role", "Job title"], ["company", "Company"], ["place", "City"], ["start", "Start (e.g. Jan 2022)", false, 1], ["end", "End (or Present)", false, 2], ["bullets", "Achievements — one per line, start with a verb and include numbers", true]] })}
        {list({ k: "education", title: "Education", empty: { degree: "", school: "", year: "", score: "" },
          fields: [["degree", "Degree"], ["school", "Institution"], ["year", "Year", false, 1], ["score", "Grade / CGPA", false, 2]] })}
        <div className="panel stack">
          <Field label="Skills (comma separated)"><textarea className="textarea prose" style={{ minHeight: 70 }} value={r.skills} onChange={set("skills")} /></Field>
        </div>
        {list({ k: "projects", title: "Projects", empty: { name: "", link: "", desc: "" }, fields: [["name", "Project name"], ["link", "Link (optional)"], ["desc", "One-line description", true]] })}
        <div className="panel stack">
          <Field label="Certifications (one per line)"><textarea className="textarea prose" style={{ minHeight: 56 }} value={r.certs} onChange={set("certs")} /></Field>
          <Field label="Languages"><input className="input" value={r.languages} onChange={set("languages")} /></Field>
        </div>
        <div className="row">
          <button className="btn btn-sm" onClick={() => setR(EXAMPLE)}>Load example</button>
          <button className="btn btn-sm btn-ghost btn-danger" onClick={() => confirm("Clear all résumé fields?") && setR(EMPTY)}><Trash2 size={15} /> Clear all</button>
        </div>
      </div>
    </div>
  );
}
