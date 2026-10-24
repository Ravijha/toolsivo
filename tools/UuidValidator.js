"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Stat, Msg, CopyBtn } from "@/components/ui";

const SAMPLE = `f47ac10b-58cc-4372-a567-0e02b2c3d479
0192b5a4-6e1c-7c3a-9f2d-3b8e5a1c7d40
6ba7b810-9dad-11d1-80b4-00c04fd430c8
{123e4567-e89b-12d3-a456-426614174000}
urn:uuid:550e8400-e29b-41d4-a716-446655440000
00000000-0000-0000-0000-000000000000
not-a-uuid-1234
f47ac10b58cc4372a5670e02b2c3d479`;

const VERSIONS = { 1: "Version 1 — time + MAC address", 2: "Version 2 — DCE security", 3: "Version 3 — name-based (MD5)", 4: "Version 4 — random", 5: "Version 5 — name-based (SHA-1)", 6: "Version 6 — reordered time", 7: "Version 7 — Unix time + random", 8: "Version 8 — custom" };
const GREG = 12219292800000n; // ms between 1582-10-15 and 1970-01-01

function check(raw) {
  const s = raw.trim();
  if (!s) return null;
  const core = s.replace(/^urn:uuid:/i, "").replace(/^\{(.*)\}$/, "$1");
  const hex = core.replace(/-/g, "");
  const canonical = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(core);
  if (!/^[0-9a-f]{32}$/i.test(hex) || (!canonical && core.includes("-"))) return { raw: s, valid: false, why: core.length !== 36 && hex.length !== 32 ? `Wrong length (${hex.replace(/[^0-9a-f]/gi, "").length} hex digits, need 32)` : "Contains characters that aren’t hex digits, or hyphens in the wrong place" };
  const h = hex.toLowerCase();
  const fmt = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  if (/^0+$/.test(h)) return { raw: s, valid: true, fmt, special: "Nil UUID (all zeros)", notes: [] };
  if (/^f+$/.test(h)) return { raw: s, valid: true, fmt, special: "Max UUID (all ones)", notes: [] };
  const version = parseInt(h[12], 16);
  const v = parseInt(h[16], 16);
  const variant = v < 8 ? "NCS (reserved, legacy)" : v < 12 ? "RFC 9562 / RFC 4122" : v < 14 ? "Microsoft (legacy GUID)" : "Reserved (future)";
  const notes = [];
  if (!canonical) notes.push(s.startsWith("{") ? "Braces format (Microsoft GUID style)" : s.toLowerCase().startsWith("urn:") ? "URN format" : "No hyphens — canonical form shown below");
  if (/[A-F]/.test(core)) notes.push("Uppercase — RFC 9562 recommends lowercase output");
  let time = null;
  try {
    if (version === 1 || version === 6) {
      const ts = version === 1 ? BigInt(`0x${h.slice(13, 16)}${h.slice(8, 12)}${h.slice(0, 8)}`) : BigInt(`0x${h.slice(0, 8)}${h.slice(8, 12)}${h.slice(13, 16)}`);
      time = new Date(Number(ts / 10000n - GREG));
      if (version === 1) notes.push(`Node (often the MAC address): ${h.slice(20).match(/../g).join(":")}`);
    }
    if (version === 7) time = new Date(parseInt(h.slice(0, 12), 16));
  } catch {}
  if (variant !== "RFC 9562 / RFC 4122") notes.push(`Variant: ${variant}`);
  return { raw: s, valid: true, fmt, version, vname: VERSIONS[version] || `Version ${version} (unknown)`, variant, time, notes };
}

export default function UuidValidator() {
  const [input, setInput] = useState(SAMPLE);
  const rows = useMemo(() => input.split(/\r?\n/).map(check).filter(Boolean), [input]);
  const valid = rows.filter((r) => r.valid);

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <textarea className="textarea" style={{ minHeight: 190 }} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste one or more UUIDs / GUIDs, one per line" spellCheck={false} />
        <div className="stats">
          <Stat label="Checked" value={rows.length} />
          <Stat label="Valid" value={<span style={{ color: "var(--ok)" }}>{valid.length}</span>} />
          <Stat label="Invalid" value={<span style={{ color: rows.length - valid.length ? "var(--bad)" : undefined }}>{rows.length - valid.length}</span>} />
        </div>
        <div className="file-list">
          {rows.map((r, i) => (
            <div key={i} className="panel" style={{ padding: 14 }}>
              <div className="row" style={{ flexWrap: "nowrap", gap: 10 }}>
                {r.valid ? <CheckCircle2 size={20} color="var(--ok)" style={{ flex: "none" }} /> : <XCircle size={20} color="var(--bad)" style={{ flex: "none" }} />}
                <code style={{ flex: 1, wordBreak: "break-all" }}>{r.raw}</code>
                {r.valid && <CopyBtn text={r.fmt} label="" className="btn btn-sm btn-ghost" />}
              </div>
              <div style={{ marginLeft: 30, marginTop: 6, fontSize: ".86rem", display: "grid", gap: 3 }}>
                {!r.valid && <span style={{ color: "var(--bad)" }}>{r.why}</span>}
                {r.special && <b>{r.special}</b>}
                {r.vname && <span><b>{r.vname}</b> · <span className="muted">{r.variant}</span></span>}
                {r.time && !isNaN(r.time) && <span className="muted">Created: <b style={{ color: "var(--text)" }}>{r.time.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" })}</b></span>}
                {r.valid && r.fmt !== r.raw && <span className="muted">Canonical: <code>{r.fmt}</code></span>}
                {r.notes?.map((n) => <span key={n} className="muted">• {n}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">UUID format</div>
          <code style={{ fontSize: ".85rem" }}>xxxxxxxx-xxxx-<b style={{ color: "var(--brand)" }}>V</b>xxx-<b style={{ color: "#e84bc7" }}>N</b>xxx-xxxxxxxxxxxx</code>
          <small className="muted"><b style={{ color: "var(--brand)" }}>V</b> = version (1–8). <b style={{ color: "#e84bc7" }}>N</b> = variant (8, 9, a or b for standard UUIDs). 32 hex digits in 5 groups of 8-4-4-4-12.</small>
        </div>
        <Msg>Need new UUIDs? Use the <Link href="/tools/uuid-generator/" style={{ textDecoration: "underline" }}>UUID Generator</Link>. Validation runs in your browser — nothing is uploaded.</Msg>
      </div>
    </div>
  );
}
