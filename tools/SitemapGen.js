"use client";
import { useMemo, useState } from "react";
import { Download, Wand2 } from "lucide-react";
import { Field, Seg, Toggle, CopyBtn, Msg, Stat } from "@/components/ui";
import { downloadText } from "@/lib/file";

const FREQS = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
const xmlEsc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const today = () => new Date().toISOString().slice(0, 10);

// Home page gets 1.0, then priority drops with path depth.
const autoPriority = (u) => {
  const depth = new URL(u).pathname.split("/").filter(Boolean).length;
  return Math.max(0.3, 1 - depth * 0.2).toFixed(1);
};

export default function SitemapGen() {
  const [domain, setDomain] = useState("https://example.com");
  const [input, setInput] = useState("/\n/about/\n/contact/\n/blog/\n/blog/how-to-compress-images/\n/products/\nhttps://example.com/products/blue-shoes/");
  const [freq, setFreq] = useState("weekly");
  const [prio, setPrio] = useState("auto");
  const [lastmod, setLastmod] = useState(today);
  const [useMod, setUseMod] = useState(true);
  const [useFreq, setUseFreq] = useState(true);

  const res = useMemo(() => {
    let origin = null;
    try { origin = new URL(domain).origin; } catch {}
    const seen = new Set(), urls = [], bad = [];
    for (const raw of input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
      try {
        const u = new URL(raw, origin || undefined);
        u.hash = "";
        if (!/^https?:$/.test(u.protocol)) throw new Error();
        const href = u.href;
        if (!seen.has(href)) { seen.add(href); urls.push(href); }
      } catch { bad.push(raw); }
    }
    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...urls.map((u) =>
        [
          `  <url>`,
          `    <loc>${xmlEsc(u)}</loc>`,
          useMod && lastmod && `    <lastmod>${lastmod}</lastmod>`,
          useFreq && `    <changefreq>${freq}</changefreq>`,
          prio !== "none" && `    <priority>${prio === "auto" ? autoPriority(u) : prio}</priority>`,
          `  </url>`,
        ].filter(Boolean).join("\n"),
      ),
      `</urlset>`,
    ].join("\n");
    return { urls, bad, xml, originOk: !!origin };
  }, [domain, input, freq, prio, lastmod, useMod, useFreq]);

  const tidy = () => setInput(res.urls.join("\n"));

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <Field label="Website address" hint="Used to complete relative paths like /about/">
          <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="https://example.com" />
        </Field>
        {!res.originOk && <Msg type="bad">Enter a full website address starting with https://</Msg>}
        <Field label="Page URLs or paths (one per line)">
          <textarea className="textarea" style={{ minHeight: 240 }} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        </Field>
        <div className="row">
          <button className="btn btn-sm" onClick={tidy}><Wand2 size={15} /> Clean up list (full URLs, no duplicates)</button>
        </div>
        {res.bad.length > 0 && <Msg type="bad">Skipped {res.bad.length} invalid line{res.bad.length > 1 ? "s" : ""}: {res.bad.slice(0, 3).join(", ")}{res.bad.length > 3 ? "…" : ""}</Msg>}
        <div className="stats">
          <Stat hl label="URLs" value={res.urls.length} sub={res.urls.length > 50000 ? "Over the 50,000 limit — split into several sitemaps" : "Limit: 50,000 per file"} />
          <Stat label="File size" value={`${(new Blob([res.xml]).size / 1024).toFixed(1)} KB`} sub="Limit: 50 MB" />
        </div>
        <div className="field">
          <span className="label">sitemap.xml <CopyBtn text={res.xml} /></span>
          <pre className="code-out" style={{ maxHeight: 360 }}>{res.xml}</pre>
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Toggle label="Include last modified date" checked={useMod} onChange={setUseMod} />
          {useMod && <input type="date" className="input" value={lastmod} onChange={(e) => setLastmod(e.target.value)} />}
          <Toggle label="Include change frequency" checked={useFreq} onChange={setUseFreq} />
          {useFreq && (
            <select className="select" value={freq} onChange={(e) => setFreq(e.target.value)}>
              {FREQS.map((f) => <option key={f}>{f}</option>)}
            </select>
          )}
          <Field label="Priority">
            <Seg options={[{ label: "Auto", value: "auto" }, { label: "1.0", value: "1.0" }, { label: "0.8", value: "0.8" }, { label: "0.5", value: "0.5" }, { label: "None", value: "none" }]} value={prio} onChange={setPrio} />
          </Field>
          {prio === "auto" && <small className="muted">Home page 1.0, then lower for deeper pages.</small>}
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => downloadText(res.xml, "sitemap.xml", "application/xml")} disabled={!res.urls.length}><Download size={18} /> Download sitemap.xml</button>
        <Msg>Upload it to your site root, add <code>Sitemap: https://yourdomain/sitemap.xml</code> to robots.txt, and submit it in Google Search Console.</Msg>
      </div>
    </div>
  );
}
