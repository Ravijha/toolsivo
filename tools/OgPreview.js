"use client";
import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Field, Seg, CopyBtn, Msg, Dropzone } from "@/components/ui";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const host = (u) => { try { return new URL(u).host.replace(/^www\./, ""); } catch { return "example.com"; } };

function Img({ src, ratio = "1.91 / 1", radius = 0 }) {
  return src ? (
    <img src={src} alt="" style={{ width: "100%", aspectRatio: ratio, objectFit: "cover", display: "block", borderRadius: radius, background: "#ddd" }} />
  ) : (
    <div style={{ aspectRatio: ratio, display: "grid", placeItems: "center", background: "#e4e6eb", color: "#8a8d91", borderRadius: radius }}><ImageIcon size={36} /></div>
  );
}

export default function OgPreview() {
  const [d, setD] = useState({
    title: "Toolsivo — 50+ Free Online Tools",
    desc: "Compress images, merge PDFs, calculate GST and EMI, format JSON and more. Fast, free and private — everything runs in your browser.",
    url: "https://toolsivo.com/",
    image: "https://toolsivo.com/og-image.png",
    site: "Toolsivo",
    type: "website",
    twitter: "",
  });
  const [preview, setPreview] = useState(null);
  const [tab, setTab] = useState("facebook");
  const set = (k) => (e) => setD((s) => ({ ...s, [k]: e.target.value }));
  const img = preview || d.image;
  const h = host(d.url);

  const code = [
    `<!-- Open Graph -->`,
    `<meta property="og:type" content="${esc(d.type)}">`,
    `<meta property="og:url" content="${esc(d.url)}">`,
    `<meta property="og:title" content="${esc(d.title)}">`,
    `<meta property="og:description" content="${esc(d.desc)}">`,
    d.image ? `<meta property="og:image" content="${esc(d.image)}">` : null,
    d.image ? `<meta property="og:image:width" content="1200">` : null,
    d.image ? `<meta property="og:image:height" content="630">` : null,
    d.site ? `<meta property="og:site_name" content="${esc(d.site)}">` : null,
    ``,
    `<!-- Twitter / X -->`,
    `<meta name="twitter:card" content="${d.image ? "summary_large_image" : "summary"}">`,
    d.twitter ? `<meta name="twitter:site" content="${esc(d.twitter.startsWith("@") ? d.twitter : "@" + d.twitter)}">` : null,
    `<meta name="twitter:title" content="${esc(d.title)}">`,
    `<meta name="twitter:description" content="${esc(d.desc)}">`,
    d.image ? `<meta name="twitter:image" content="${esc(d.image)}">` : null,
  ].filter((x) => x !== null).join("\n");

  const warn = [];
  if (d.title.length > 60) warn.push(`Title is ${d.title.length} characters — keep it under 60 so it isn't cut off.`);
  if (d.desc.length > 160) warn.push(`Description is ${d.desc.length} characters — around 110–160 works best.`);
  if (!d.image) warn.push("Add an image — posts with a 1200×630 image get far more clicks.");
  if (d.image && !/^https?:\/\//.test(d.image)) warn.push("The og:image must be an absolute URL (https://…).");

  const line = (n) => ({ display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical", overflow: "hidden" });
  const frame = { background: "#fff", color: "#050505", borderRadius: 12, overflow: "hidden", border: "1px solid #dadde1", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", maxWidth: 520, boxShadow: "var(--shadow)" };

  const cards = {
    facebook: (
      <div style={frame}>
        <Img src={img} />
        <div style={{ padding: "10px 12px", background: "#f0f2f5", borderTop: "1px solid #dadde1" }}>
          <div style={{ fontSize: 12, color: "#65676b", textTransform: "uppercase" }}>{h}</div>
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, margin: "3px 0", ...line(2) }}>{d.title}</div>
          <div style={{ fontSize: 14, color: "#65676b", ...line(1) }}>{d.desc}</div>
        </div>
      </div>
    ),
    x: (
      <div style={{ ...frame, borderRadius: 16, border: "1px solid #cfd9de", position: "relative" }}>
        <Img src={img} />
        <span style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(0,0,0,.77)", color: "#fff", fontSize: 13, padding: "2px 6px", borderRadius: 4, maxWidth: "80%", ...line(1) }}>{d.title}</span>
        <div style={{ padding: "6px 2px 0", color: "#536471", fontSize: 13, position: "absolute", top: "100%" }}>From {h}</div>
      </div>
    ),
    linkedin: (
      <div style={{ ...frame, borderRadius: 8 }}>
        <Img src={img} />
        <div style={{ padding: "10px 12px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35, ...line(2) }}>{d.title}</div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{h}</div>
        </div>
      </div>
    ),
    whatsapp: (
      <div style={{ background: "#e5ddd5", padding: 16, borderRadius: 14, maxWidth: 420 }}>
        <div style={{ background: "#d9fdd3", borderRadius: 10, padding: 4, boxShadow: "0 1px 1px rgba(0,0,0,.1)" }}>
          <div style={{ background: "#d1f4cc", borderRadius: 8, overflow: "hidden", display: "flex", gap: 8 }}>
            <div style={{ width: 90, flex: "none" }}><Img src={img} ratio="1 / 1" /></div>
            <div style={{ padding: "8px 8px 8px 0", minWidth: 0, color: "#111", fontFamily: "system-ui, sans-serif" }}>
              <div style={{ fontSize: 14, fontWeight: 600, ...line(2) }}>{d.title}</div>
              <div style={{ fontSize: 12.5, color: "#555", ...line(2) }}>{d.desc}</div>
              <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{h}</div>
            </div>
          </div>
          <div style={{ padding: "6px 6px 2px", fontSize: 14, color: "#027eb5", wordBreak: "break-all", fontFamily: "system-ui, sans-serif" }}>{d.url}</div>
        </div>
      </div>
    ),
  };

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <Seg options={[{ label: "Facebook", value: "facebook" }, { label: "X / Twitter", value: "x" }, { label: "LinkedIn", value: "linkedin" }, { label: "WhatsApp", value: "whatsapp" }]} value={tab} onChange={setTab} />
        <div className="panel" style={{ display: "grid", placeItems: "center", padding: "30px 20px 44px" }}>{cards[tab]}</div>
        {warn.map((w) => <Msg key={w} type="bad">{w}</Msg>)}
        <div className="field">
          <span className="label">Meta tags for your &lt;head&gt; <CopyBtn text={code} label="Copy tags" /></span>
          <pre className="code-out">{code}</pre>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Title" value={`${d.title.length}/60`}><input className="input" value={d.title} onChange={set("title")} /></Field>
          <Field label="Description" value={`${d.desc.length}/160`}><textarea className="textarea prose" style={{ minHeight: 110 }} value={d.desc} onChange={set("desc")} /></Field>
          <Field label="Page URL"><input className="input" value={d.url} onChange={set("url")} /></Field>
          <Field label="Image URL" hint="Recommended size: 1200 × 630 px"><input className="input" value={d.image} onChange={(e) => { setPreview(null); set("image")(e); }} /></Field>
          <Dropzone compact onFiles={([f]) => setPreview(URL.createObjectURL(f))} title="Or preview a local image" hint="Only for the preview — use a public URL in your tags" />
          <div className="grid-2">
            <Field label="Site name"><input className="input" value={d.site} onChange={set("site")} /></Field>
            <Field label="X handle"><input className="input" value={d.twitter} onChange={set("twitter")} placeholder="@yourbrand" /></Field>
          </div>
          <Field label="Type"><Seg options={[{ label: "website", value: "website" }, { label: "article", value: "article" }, { label: "product", value: "product" }]} value={d.type} onChange={(v) => setD((s) => ({ ...s, type: v }))} /></Field>
        </div>
      </div>
    </div>
  );
}
