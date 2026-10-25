"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Link as LinkIcon, Wifi, Mail, Phone, Type, MessageSquare } from "lucide-react";
import QRCode from "qrcode";
import { Field, Seg, Range, Toggle, Msg, CopyBtn } from "@/components/ui";
import { downloadBlob, downloadText, canvasToBlob } from "@/lib/file";

const TYPES = [
  { id: "url", label: "URL", icon: LinkIcon },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "text", label: "Text", icon: Type },
];
const PRESETS = [["#111827", "#ffffff"], ["#4f46e5", "#ffffff"], ["#be185d", "#fff1f7"], ["#065f46", "#ecfdf5"], ["#ffffff", "#111827"]];

// Wi-Fi QR strings need \ ; , : " escaped
const esc = (s) => s.replace(/([\\;,:"])/g, "\\$1");

function payload(type, d) {
  switch (type) {
    case "url": {
      const u = d.url.trim();
      return u && !/^[a-z][\w+.-]*:/i.test(u) ? `https://${u}` : u;
    }
    case "wifi":
      return d.ssid ? `WIFI:T:${d.enc === "nopass" ? "nopass" : d.enc};S:${esc(d.ssid)};${d.enc !== "nopass" ? `P:${esc(d.pass)};` : ""}${d.hidden ? "H:true;" : ""};` : "";
    case "email": {
      if (!d.email) return "";
      const q = [d.subject && `subject=${encodeURIComponent(d.subject)}`, d.body && `body=${encodeURIComponent(d.body)}`].filter(Boolean).join("&");
      return `mailto:${d.email}${q ? `?${q}` : ""}`;
    }
    case "phone":
      return d.phone ? `tel:${d.phone.replace(/[^\d+]/g, "")}` : "";
    case "sms":
      return d.phone ? `SMSTO:${d.phone.replace(/[^\d+]/g, "")}:${d.body}` : "";
    default:
      return d.text;
  }
}

export default function QrCodeTool() {
  const [type, setType] = useState("url");
  const [d, setD] = useState({ url: "https://toolsivo.com", ssid: "", pass: "", enc: "WPA", hidden: false, email: "", subject: "", body: "", phone: "", text: "Hello from Toolsivo!" });
  const [fg, setFg] = useState("#111827");
  const [bg, setBg] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);
  const [ecl, setEcl] = useState("M");
  const [margin, setMargin] = useState(2);
  const [size, setSize] = useState(1024);
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState(null);
  const canvasRef = useRef(null);

  const set = (k) => (e) => setD((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const data = useMemo(() => payload(type, d), [type, d]);
  const light = transparent ? "#00000000" : bg;

  useEffect(() => {
    if (!data) { setSvg(""); setErr(null); return; }
    const opts = { errorCorrectionLevel: ecl, margin, color: { dark: fg, light } };
    QRCode.toCanvas(canvasRef.current, data, { ...opts, width: size })
      .then(() => {
        // the library sets an inline pixel size; keep the on-screen preview compact
        const el = canvasRef.current;
        el.style.width = "260px";
        el.style.height = "260px";
        return QRCode.toString(data, { ...opts, type: "svg" });
      })
      .then((s) => { setSvg(s); setErr(null); })
      .catch((e) => setErr(/too big|Too big|amount of data/i.test(e.message) ? "That's too much data for a QR code. Shorten the text or lower the error correction." : e.message));
  }, [data, fg, light, ecl, margin, size]);

  const contrastLow = useMemo(() => {
    const lum = (h) => { const n = parseInt(h.slice(1, 7), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
    return !transparent && Math.abs(lum(fg) - lum(bg)) < 0.4;
  }, [fg, bg, transparent]);

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="seg" style={{ maxWidth: 640 }}>
          {TYPES.map((t) => (
            <button key={t.id} className={type === t.id ? "on" : ""} onClick={() => setType(t.id)}>
              <t.icon size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />{t.label}
            </button>
          ))}
        </div>
        <div className="panel stack">
          {type === "url" && <Field label="Website URL"><input className="input" value={d.url} onChange={set("url")} placeholder="https://example.com" /></Field>}
          {type === "wifi" && (
            <>
              <div className="grid-2">
                <Field label="Network name (SSID)"><input className="input" value={d.ssid} onChange={set("ssid")} placeholder="My Home Wi-Fi" /></Field>
                <Field label="Password"><input className="input" value={d.pass} onChange={set("pass")} disabled={d.enc === "nopass"} placeholder="••••••••" /></Field>
              </div>
              <Field label="Security"><Seg options={[{ label: "WPA/WPA2/WPA3", value: "WPA" }, { label: "WEP", value: "WEP" }, { label: "None", value: "nopass" }]} value={d.enc} onChange={(v) => setD((s) => ({ ...s, enc: v }))} /></Field>
              <Toggle label="Hidden network" checked={d.hidden} onChange={(v) => setD((s) => ({ ...s, hidden: v }))} />
            </>
          )}
          {type === "email" && (
            <>
              <Field label="Email address"><input className="input" type="email" value={d.email} onChange={set("email")} placeholder="name@example.com" /></Field>
              <Field label="Subject (optional)"><input className="input" value={d.subject} onChange={set("subject")} /></Field>
              <Field label="Message (optional)"><textarea className="textarea prose" style={{ minHeight: 90 }} value={d.body} onChange={set("body")} /></Field>
            </>
          )}
          {(type === "phone" || type === "sms") && (
            <>
              <Field label="Phone number" hint="Include the country code, e.g. +91 00000 00000"><input className="input" type="tel" value={d.phone} onChange={set("phone")} placeholder="+91 98765 43210" /></Field>
              {type === "sms" && <Field label="Message (optional)"><textarea className="textarea prose" style={{ minHeight: 90 }} value={d.body} onChange={set("body")} /></Field>}
            </>
          )}
          {type === "text" && <Field label="Text"><textarea className="textarea prose" style={{ minHeight: 120 }} value={d.text} onChange={set("text")} /></Field>}
        </div>
        <div className="panel stack">
          <div className="panel-title">Design</div>
          <div className="row" style={{ gap: 8 }}>
            {PRESETS.map(([a, b]) => (
              <button key={a + b} onClick={() => { setFg(a); setBg(b); setTransparent(false); }} aria-label="Colour preset"
                style={{ width: 40, height: 40, borderRadius: 11, cursor: "pointer", border: fg === a && bg === b ? "3px solid var(--brand)" : "1px solid var(--border-strong)", background: `linear-gradient(135deg, ${a} 50%, ${b} 50%)` }} />
            ))}
          </div>
          <div className="grid-2">
            <Field label="Foreground"><div className="row"><input type="color" value={fg} onChange={(e) => setFg(e.target.value)} /><code>{fg}</code></div></Field>
            <Field label="Background"><div className="row"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} disabled={transparent} /><code>{transparent ? "transparent" : bg}</code></div></Field>
          </div>
          <Toggle label="Transparent background" checked={transparent} onChange={setTransparent} />
          <Field label="Error correction" hint="Higher levels survive damage or a logo on top, but make the code denser">
            <Seg options={[{ label: "L · 7%", value: "L" }, { label: "M · 15%", value: "M" }, { label: "Q · 25%", value: "Q" }, { label: "H · 30%", value: "H" }]} value={ecl} onChange={setEcl} />
          </Field>
          <Range label="Quiet zone (margin)" value={margin} min={0} max={8} onChange={setMargin} />
        </div>
      </div>
      <div className="side">
        <div className="panel" style={{ display: "grid", placeItems: "center", background: "var(--checker)", minHeight: 300 }}>
          <canvas ref={canvasRef} style={{ width: 260, height: 260, display: data && !err ? "block" : "none", borderRadius: 8, boxShadow: "var(--shadow)" }} />
          {!data && <span className="muted">Fill in the details to create your QR code</span>}
        </div>
        {err && <Msg type="bad">{err}</Msg>}
        {contrastLow && <Msg type="bad">Low contrast between colours — some phones may not scan this code.</Msg>}
        {data && !err && <Msg type="ok">Ready to scan — test it with your phone camera.</Msg>}
        <div className="panel stack">
          <Range label="PNG size" value={size} min={256} max={2048} step={128} onChange={setSize} format={(v) => `${v}×${v}px`} />
          <div className="grid-2">
            <button className="btn btn-primary" disabled={!data || !!err} onClick={async () => downloadBlob(await canvasToBlob(canvasRef.current, "image/png"), `qr-code-${type}.png`)}><Download size={16} /> PNG</button>
            <button className="btn btn-primary" disabled={!svg || !!err} onClick={() => downloadText(svg, `qr-code-${type}.svg`, "image/svg+xml")}><Download size={16} /> SVG</button>
          </div>
          <CopyBtn text={data} label="Copy encoded text" className="btn btn-sm" />
        </div>
        <small className="muted">“QR Code” is a registered trademark of DENSO WAVE INCORPORATED.</small>
      </div>
    </div>
  );
}
