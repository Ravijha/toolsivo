"use client";
import { useMemo, useRef, useState } from "react";
import { Copy, Check, Code } from "lucide-react";
import { Field, Seg, Msg, CopyBtn } from "@/components/ui";
import { usePersist, esc } from "@/components/PrintDoc";
import { toast } from "@/lib/file";

const FONTS = ["Arial, Helvetica, sans-serif", "Verdana, Geneva, sans-serif", "Tahoma, Geneva, sans-serif", "'Trebuchet MS', sans-serif", "Georgia, serif"];
const SOCIAL = [["linkedin", "LinkedIn"], ["x", "X"], ["instagram", "Instagram"], ["facebook", "Facebook"], ["youtube", "YouTube"], ["github", "GitHub"]];
const url = (u) => (!u ? "" : /^https?:\/\//i.test(u) ? u : `https://${u}`);

export default function EmailSignature() {
  const [d, setD] = usePersist("toolsivo-signature", {
    name: "Your Name", title: "Your Job Title", company: "Your Company", phone: "+91 00000 00000", email: "you@example.com",
    website: "www.example.com", address: "Your City, India", photo: "", linkedin: "linkedin.com/in/your-profile", x: "", instagram: "", facebook: "", youtube: "", github: "",
    disclaimer: "", color: "#4f46e5", font: FONTS[0], layout: "classic",
  });
  const [copied, setCopied] = useState(false);
  const box = useRef(null);
  const set = (k) => (e) => setD((s) => ({ ...s, [k]: e.target.value }));
  const c = d.color, f = d.font;

  const html = useMemo(() => {
    const a = (href, text) => `<a href="${esc(href)}" style="color:${c};text-decoration:none">${esc(text)}</a>`;
    const contact = [
      d.phone && `<span style="color:#555">P:</span> ${a(`tel:${d.phone.replace(/[^\d+]/g, "")}`, d.phone)}`,
      d.email && `<span style="color:#555">E:</span> ${a(`mailto:${d.email}`, d.email)}`,
      d.website && `<span style="color:#555">W:</span> ${a(url(d.website), d.website.replace(/^https?:\/\//, ""))}`,
    ].filter(Boolean);
    const socials = SOCIAL.filter(([k]) => d[k]).map(([k, n]) => a(url(d[k]), n)).join(` <span style="color:#bbb">|</span> `);
    const photo = d.photo ? `<img src="${esc(d.photo)}" width="${d.layout === "compact" ? 56 : 84}" height="${d.layout === "compact" ? 56 : 84}" alt="${esc(d.name)}" style="display:block;border-radius:50%;object-fit:cover">` : "";
    const nameBlock = `<div style="font-size:${d.layout === "bold" ? 18 : 16}px;font-weight:bold;color:${d.layout === "bold" ? c : "#111"}">${esc(d.name)}</div>
      <div style="font-size:13px;color:#555;margin-top:2px">${esc([d.title, d.company].filter(Boolean).join(" · "))}</div>`;
    const details = `<div style="font-size:12.5px;line-height:1.7;margin-top:8px;color:#333">${contact.join("<br>")}${d.address ? `<br><span style="color:#777">${esc(d.address)}</span>` : ""}</div>
      ${socials ? `<div style="font-size:12.5px;margin-top:6px">${socials}</div>` : ""}`;
    const disclaimer = d.disclaimer ? `<tr><td colspan="2" style="padding-top:12px;font-size:10.5px;color:#999;line-height:1.5;max-width:520px">${esc(d.disclaimer)}</td></tr>` : "";
    if (d.layout === "compact")
      return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:${f};border-collapse:collapse"><tr>${photo ? `<td style="padding-right:12px;vertical-align:middle">${photo}</td>` : ""}<td style="vertical-align:middle">${nameBlock}<div style="font-size:12.5px;margin-top:4px;color:#333">${contact.join(` <span style="color:#bbb">|</span> `)}</div>${socials ? `<div style="font-size:12.5px;margin-top:3px">${socials}</div>` : ""}</td></tr>${disclaimer}</table>`;
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:${f};border-collapse:collapse">${d.layout === "bold" ? `<tr><td colspan="2" style="border-top:4px solid ${c};padding-bottom:12px"></td></tr>` : ""}<tr>${photo ? `<td style="padding-right:16px;vertical-align:top${d.layout === "classic" ? `;border-right:2px solid ${c}` : ""}">${photo}</td>` : ""}<td style="vertical-align:top${photo && d.layout === "classic" ? ";padding-left:16px" : ""}">${nameBlock}${details}</td></tr>${disclaimer}</table>`;
  }, [d, c, f]);

  const copyRich = async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([box.current.innerText], { type: "text/plain" }) })]);
    } catch {
      const r = document.createRange();
      r.selectNodeContents(box.current);
      const sel = getSelection();
      sel.removeAllRanges(); sel.addRange(r);
      document.execCommand("copy");
      sel.removeAllRanges();
    }
    setCopied(true);
    toast("Signature copied — paste it into your email settings");
    setTimeout(() => setCopied(false), 1800);
  };

  const localPhoto = d.photo.startsWith("data:");
  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="panel" style={{ background: "#fff", color: "#111", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", fontSize: 13, color: "#666" }}>New message · <b style={{ color: "#333" }}>Preview</b></div>
          <div style={{ padding: 22 }}>
            <p style={{ fontFamily: f, fontSize: 14, color: "#333", marginBottom: 18 }}>Hi Rahul,<br /><br />Thanks for your time today. Please find the proposal attached.<br /><br />Best regards,</p>
            <div ref={box} dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
        <div className="row">
          <button className="btn btn-primary btn-lg" onClick={copyRich}>{copied ? <Check size={18} /> : <Copy size={18} />} Copy signature</button>
          <CopyBtn text={html} label="Copy HTML code" className="btn btn-lg" />
        </div>
        {localPhoto && <Msg type="bad">Your photo is stored only in this browser. Email programs can’t show it to recipients — use a public image link (for example, your LinkedIn or company website photo URL).</Msg>}
        <div className="panel stack">
          <div className="panel-title">How to add it</div>
          <small className="muted" style={{ lineHeight: 1.8 }}>
            <b>Gmail:</b> Settings → See all settings → General → Signature → Create new → paste → Save changes.<br />
            <b>Outlook (web):</b> Settings → Mail → Compose and reply → Email signature → paste → Save.<br />
            <b>Outlook (Windows):</b> File → Options → Mail → Signatures → New → paste → OK.<br />
            <b>Apple Mail:</b> Settings → Signatures → + → paste (untick “Always match my default message font”).
          </small>
        </div>
      </div>
      <div className="side" style={{ position: "static" }}>
        <div className="panel stack">
          <Field label="Layout"><Seg options={[{ label: "Classic", value: "classic" }, { label: "Bold", value: "bold" }, { label: "Compact", value: "compact" }]} value={d.layout} onChange={(v) => setD((s) => ({ ...s, layout: v }))} /></Field>
          <div className="row"><input type="color" value={c} onChange={set("color")} /><select className="select" value={f} onChange={set("font")} style={{ flex: 1 }}>{FONTS.map((x) => <option key={x} value={x}>{x.split(",")[0].replace(/'/g, "")}</option>)}</select></div>
        </div>
        <div className="panel stack">
          {[["name", "Full name"], ["title", "Job title"], ["company", "Company"], ["phone", "Phone"], ["email", "Email"], ["website", "Website"], ["address", "Address (optional)"]].map(([k, l]) => (
            <Field key={k} label={l}><input className="input" value={d[k]} onChange={set(k)} /></Field>
          ))}
          <Field label="Photo or logo URL (optional)" hint="Must be a public https:// image link to show in recipients’ inboxes">
            <input className="input" value={localPhoto ? "(local preview image)" : d.photo} onChange={set("photo")} placeholder="https://…/photo.jpg" />
          </Field>
          <label className="btn btn-sm" style={{ cursor: "pointer" }}>Preview a local photo<input type="file" accept="image/*" hidden onChange={(e) => { const fl = e.target.files?.[0]; if (!fl) return; const r = new FileReader(); r.onload = () => setD((s) => ({ ...s, photo: r.result })); r.readAsDataURL(fl); }} /></label>
        </div>
        <div className="panel stack">
          <div className="panel-title">Social profiles (shown as text links)</div>
          {SOCIAL.map(([k, n]) => <Field key={k} label={n}><input className="input" value={d[k]} onChange={set(k)} placeholder={`${n} profile URL`} /></Field>)}
          <Field label="Disclaimer (optional)"><textarea className="textarea prose" style={{ minHeight: 60 }} value={d.disclaimer} onChange={set("disclaimer")} /></Field>
        </div>
      </div>
    </div>
  );
}
