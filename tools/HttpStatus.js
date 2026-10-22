"use client";
import { useState } from "react";
import { Activity, CheckCircle2, AlertTriangle, XCircle, HelpCircle, Download } from "lucide-react";
import { Field, Msg, Stat, Spinner } from "@/components/ui";
import { downloadText } from "@/lib/file";

const REASONS = {
  200: "OK", 201: "Created", 204: "No Content", 301: "Moved Permanently", 302: "Found (temporary redirect)", 304: "Not Modified",
  307: "Temporary Redirect", 308: "Permanent Redirect", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
  405: "Method Not Allowed", 410: "Gone", 429: "Too Many Requests", 500: "Internal Server Error", 502: "Bad Gateway",
  503: "Service Unavailable", 504: "Gateway Timeout",
};

function seoReview(raw) {
  const out = [];
  let u;
  try { u = new URL(raw); } catch { return { url: null, notes: [{ ok: false, t: "Not a valid URL — include https://" }] }; }
  out.push(u.protocol === "https:" ? { ok: true, t: "Uses HTTPS" } : { ok: false, t: "Not HTTPS — Google prefers secure pages" });
  out.push(raw.length <= 75 ? { ok: true, t: `Length ${raw.length} chars (good)` } : { ok: false, t: `Long URL (${raw.length} chars) — under 75 is ideal` });
  if (/[A-Z]/.test(u.pathname)) out.push({ ok: false, t: "Contains uppercase letters — use lowercase" });
  if (/_/.test(u.pathname)) out.push({ ok: false, t: "Uses underscores — hyphens are better for SEO" });
  if (/%20|\s/.test(u.pathname)) out.push({ ok: false, t: "Contains spaces" });
  if ([...u.searchParams].length > 2) out.push({ ok: false, t: `${[...u.searchParams].length} query parameters — keep URLs clean` });
  if (u.pathname.split("/").filter(Boolean).length > 4) out.push({ ok: false, t: "Deep folder structure (over 4 levels)" });
  if (/\.(php|aspx?|jsp)$/i.test(u.pathname)) out.push({ ok: false, t: "Shows a file extension — consider clean URLs" });
  if (out.every((n) => n.ok)) out.push({ ok: true, t: "Clean, readable structure" });
  return { url: u, notes: out };
}

async function check(raw) {
  const { url, notes } = seoReview(raw);
  if (!url) return { raw, kind: "invalid", notes };
  if (location.protocol === "https:" && url.protocol === "http:")
    return { raw, kind: "unknown", detail: "Browsers block checking http:// pages from a secure site. Try the https:// version.", notes };
  const t0 = performance.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    // Readable only if the site allows cross-origin requests (CORS)
    const res = await fetch(url.href, { method: "GET", redirect: "follow", cache: "no-store", signal: ctrl.signal });
    clearTimeout(timer);
    return {
      raw, kind: "status", status: res.status, text: res.statusText || REASONS[res.status] || "", ms: Math.round(performance.now() - t0),
      redirected: res.redirected, final: res.url, type: res.headers.get("content-type"), server: res.headers.get("server"), notes,
    };
  } catch (e) {
    if (e.name === "AbortError") return { raw, kind: "down", detail: "Timed out after 15 seconds.", notes };
    try {
      // Opaque request: we can't read the status, but a response proves the server is up
      const t1 = performance.now();
      await fetch(url.href, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
      clearTimeout(timer);
      return { raw, kind: "up", ms: Math.round(performance.now() - t1), notes };
    } catch (e2) {
      clearTimeout(timer);
      return { raw, kind: "down", detail: e2.name === "AbortError" ? "Timed out after 15 seconds." : "No response — the domain may not exist, the server may be down, or the SSL certificate is invalid.", notes };
    }
  }
}

function Badge({ r }) {
  const s = r.status;
  const style = (bg, fg) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 99, fontWeight: 800, fontSize: ".85rem", background: bg, color: fg, whiteSpace: "nowrap" });
  if (r.kind === "status") {
    const ok = s < 300, redirect = s >= 300 && s < 400;
    return <span style={style(ok ? "var(--ok-bg)" : redirect ? "rgba(234,179,8,.15)" : "var(--bad-bg)", ok ? "var(--ok)" : redirect ? "var(--warn)" : "var(--bad)")}>{ok ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />} {s} {r.text}</span>;
  }
  if (r.kind === "up") return <span style={style("var(--ok-bg)", "var(--ok)")}><CheckCircle2 size={15} /> Online</span>;
  if (r.kind === "down") return <span style={style("var(--bad-bg)", "var(--bad)")}><XCircle size={15} /> Unreachable</span>;
  if (r.kind === "invalid") return <span style={style("var(--bad-bg)", "var(--bad)")}><XCircle size={15} /> Invalid URL</span>;
  return <span style={style("var(--surface-2)", "var(--muted)")}><HelpCircle size={15} /> Can’t check</span>;
}

export default function HttpStatus() {
  const [input, setInput] = useState("https://toolsivo.com/\nhttps://www.google.com/\nhttps://api.github.com/\nhttps://api.github.com/this-page-does-not-exist\nhttps://no-such-domain-toolsivo-test.com/");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    const list = [...new Set(input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))].slice(0, 50)
      .map((l) => (/^[a-z][\w+.-]*:\/\//i.test(l) ? l : `https://${l}`));
    setBusy(true);
    setResults(list.map((raw) => ({ raw, kind: "pending" })));
    await Promise.all(list.map(async (raw, i) => {
      const r = await check(raw);
      setResults((R) => R.map((x, j) => (j === i ? r : x)));
    }));
    setBusy(false);
  };

  const done = results.filter((r) => r.kind !== "pending");
  const live = done.filter((r) => r.kind === "up" || (r.kind === "status" && r.status < 400)).length;
  const broken = done.filter((r) => r.kind === "down" || (r.kind === "status" && r.status >= 400)).length;
  const csv = () => downloadText(
    "URL,Result,Status,Response ms,Final URL\n" + done.map((r) => [r.raw, r.kind === "status" ? "status" : r.kind, r.status || "", r.ms || "", r.final || ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n"),
    "url-status-report.csv", "text/csv",
  );

  return (
    <div className="stack">
      <div className="tool-cols">
        <Field label="URLs to check (one per line, up to 50)">
          <textarea className="textarea" style={{ minHeight: 170 }} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        </Field>
        <div className="side" style={{ position: "static" }}>
          <button className="btn btn-primary btn-lg" onClick={run} disabled={busy}>{busy ? <Spinner /> : <Activity size={18} />} Check URLs</button>
          <Msg>
            Checks run from your browser. Sites that allow it (CORS) show the exact status code and redirects; for others we can confirm whether the server responds, but browsers hide the code.
          </Msg>
        </div>
      </div>
      {done.length > 0 && (
        <div className="stats">
          <Stat label="Checked" value={`${done.length}/${results.length}`} />
          <Stat label="Online" value={<span style={{ color: "var(--ok)" }}>{live}</span>} />
          <Stat label="Broken / unreachable" value={<span style={{ color: broken ? "var(--bad)" : undefined }}>{broken}</span>} />
        </div>
      )}
      {results.length > 0 && (
        <div className="file-list">
          {results.map((r, i) => (
            <div key={i} className="panel" style={{ padding: 16, animation: "rise .3s both" }}>
              <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <a href={r.raw} target="_blank" rel="noopener noreferrer nofollow" style={{ fontWeight: 700, wordBreak: "break-all", flex: 1, minWidth: 200 }}>{r.raw}</a>
                {r.kind === "pending" ? <Spinner dark /> : <Badge r={r} />}
              </div>
              {r.kind !== "pending" && (
                <div style={{ marginTop: 10, display: "grid", gap: 6, fontSize: ".86rem" }}>
                  <div className="row" style={{ gap: 16, color: "var(--muted)" }}>
                    {r.ms != null && <span>⏱ {r.ms} ms</span>}
                    {r.redirected && <span>↪ Redirected to <b style={{ color: "var(--text)", wordBreak: "break-all" }}>{r.final}</b></span>}
                    {r.type && <span>{r.type.split(";")[0]}</span>}
                    {r.server && <span>Server: {r.server}</span>}
                    {r.kind === "up" && <span>Server responded — exact status hidden by the site’s security settings (CORS).</span>}
                    {r.detail && <span>{r.detail}</span>}
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    {r.notes?.map((n) => (
                      <span key={n.t} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 8, fontSize: ".78rem", fontWeight: 600, background: n.ok ? "var(--ok-bg)" : "rgba(234,179,8,.13)", color: n.ok ? "var(--ok)" : "var(--warn)" }}>
                        {n.ok ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />} {n.t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {done.length > 0 && !busy && <div><button className="btn btn-sm" onClick={csv}><Download size={15} /> Download report (CSV)</button></div>}
    </div>
  );
}
