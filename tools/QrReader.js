"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, ExternalLink, ShieldAlert, ShieldCheck, ClipboardPaste } from "lucide-react";
import { Dropzone, Seg, CopyBtn, Msg } from "@/components/ui";
import { loadImage, makeCanvas } from "@/lib/file";

const SHORTENERS = /^(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|cutt\.ly|rb\.gy|shorturl\.at|t\.ly|tiny\.cc)$/i;

async function decodeImage(src) {
  const jsQR = (await import("jsqr")).default;
  const img = await loadImage(src);
  // try a few sizes — tiny or huge images decode better when rescaled
  for (const target of [1000, 600, 1600, Math.max(img.naturalWidth, img.naturalHeight)]) {
    const s = Math.min(1, target / Math.max(img.naturalWidth, img.naturalHeight)) || 1;
    const c = makeCanvas(img.naturalWidth * s, img.naturalHeight * s);
    const x = c.getContext("2d", { willReadFrequently: true });
    x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
    x.drawImage(img, 0, 0, c.width, c.height);
    const d = x.getImageData(0, 0, c.width, c.height);
    const r = jsQR(d.data, d.width, d.height, { inversionAttempts: "attemptBoth" });
    if (r) return r.data;
  }
  return null;
}

function analyse(text) {
  if (/^WIFI:/i.test(text)) {
    const g = (k) => (text.match(new RegExp(`${k}:((?:\\\\.|[^;])*)`, "i")) || [])[1]?.replace(/\\(.)/g, "$1");
    return { kind: "Wi-Fi network", fields: [["Network", g("S")], ["Password", g("P")], ["Security", g("T") || "None"]] };
  }
  if (/^mailto:/i.test(text)) return { kind: "Email", fields: [["To", text.slice(7).split("?")[0]]] };
  if (/^tel:/i.test(text)) return { kind: "Phone number", fields: [["Number", text.slice(4)]] };
  if (/^smsto:/i.test(text)) { const [, n, ...m] = text.split(":"); return { kind: "SMS", fields: [["To", n], ["Message", m.join(":")]] }; }
  if (/^BEGIN:VCARD/i.test(text)) return { kind: "Contact card", fields: [["Name", (text.match(/\nFN[^:]*:(.*)/i) || [])[1]], ["Phone", (text.match(/\nTEL[^:]*:(.*)/i) || [])[1]], ["Email", (text.match(/\nEMAIL[^:]*:(.*)/i) || [])[1]]] };
  if (/^upi:\/\//i.test(text)) { const u = new URL(text); return { kind: "UPI payment request", fields: [["Payee", u.searchParams.get("pn")], ["UPI ID", u.searchParams.get("pa")], ["Amount", u.searchParams.get("am")]], warn: ["Check the payee name and UPI ID carefully before paying. Scanning a QR code never requires you to enter your UPI PIN to receive money."] }; }
  try {
    const u = new URL(text);
    if (!/^https?:$/.test(u.protocol)) throw 0;
    const warn = [];
    if (u.protocol === "http:") warn.push("Not encrypted (http://) — avoid entering passwords or payment details.");
    if (u.hostname.startsWith("xn--") || u.hostname.includes(".xn--")) warn.push("Uses look-alike international characters — it may imitate a real brand.");
    if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) warn.push("Points to a raw IP address instead of a domain name.");
    if (SHORTENERS.test(u.hostname)) warn.push("A link shortener hides the real destination.");
    if (u.username || u.password || text.includes("@")) warn.push("Contains an @ sign, which can disguise the real website.");
    return { kind: "Website link", url: u.href, host: u.hostname, warn };
  } catch {}
  return { kind: "Text", fields: [] };
}

export default function QrReader() {
  const [tab, setTab] = useState("image");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cam, setCam] = useState(false);
  const video = useRef(null);
  const stream = useRef(null);

  const found = (text) => { setResult({ text, ...analyse(text) }); setErr(null); };
  const fromFile = async ([f]) => {
    setPreview(URL.createObjectURL(f)); setResult(null);
    const t = await decodeImage(f);
    t ? found(t) : setErr("No QR code found. Try a sharper, well-lit image where the code fills more of the frame.");
  };

  useEffect(() => {
    const onPaste = (e) => { const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/")); if (f) { setTab("image"); fromFile([f]); } };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const stop = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setCam(false); };
  useEffect(() => () => stop(), []);
  useEffect(() => { if (tab !== "camera") stop(); }, [tab]);

  const start = async () => {
    setErr(null); setResult(null);
    try {
      const jsQR = (await import("jsqr")).default;
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCam(true);
      const v = video.current;
      v.srcObject = stream.current;
      await v.play();
      const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true });
      const tick = () => {
        if (!stream.current) return;
        if (v.readyState >= 2) {
          const s = Math.min(1, 720 / v.videoWidth);
          c.width = v.videoWidth * s; c.height = v.videoHeight * s;
          x.drawImage(v, 0, 0, c.width, c.height);
          const r = jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height, { inversionAttempts: "attemptBoth" });
          if (r?.data) { found(r.data); stop(); if (navigator.vibrate) navigator.vibrate(80); return; }
        }
        requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      stop();
      setErr(e.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access in your browser settings, or upload a photo instead." : "No camera is available on this device, or it’s being used by another app.");
    }
  };

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div style={{ maxWidth: 320 }}><Seg options={[{ label: "Image / screenshot", value: "image" }, { label: "Camera", value: "camera" }]} value={tab} onChange={setTab} /></div>
        {tab === "image" ? (
          <>
            <Dropzone accept="image/*" onFiles={fromFile} title="Drop an image with a QR code" hint="Photos and screenshots work — or press Ctrl+V to paste" compact={!!preview} />
            {preview && <div className="preview-box" style={{ minHeight: 200, padding: 10 }}><img src={preview} alt="" style={{ maxHeight: 360 }} /></div>}
            {!preview && <Msg><ClipboardPaste size={15} style={{ display: "inline", verticalAlign: "-2px" }} /> Tip: copy a screenshot and press <b>Ctrl+V</b> to scan it instantly.</Msg>}
          </>
        ) : (
          <div className="stack">
            <div className="preview-box" style={{ background: "#111", minHeight: 320, position: "relative" }}>
              <video ref={video} playsInline muted style={{ width: "100%", maxHeight: 460, display: cam ? "block" : "none" }} />
              {cam && <span style={{ position: "absolute", inset: "18% 24%", border: "3px solid #fff", borderRadius: 18, boxShadow: "0 0 0 9999px rgba(0,0,0,.35)", pointerEvents: "none" }} />}
              {!cam && <span style={{ color: "#aaa" }}>Camera is off</span>}
            </div>
            {cam ? <button className="btn btn-lg" onClick={stop}><CameraOff size={18} /> Stop camera</button> : <button className="btn btn-primary btn-lg" onClick={start}><Camera size={18} /> Start camera</button>}
            <small className="muted">Video is processed on your device and never recorded or uploaded.</small>
          </div>
        )}
        {err && <Msg type="bad">{err}</Msg>}
      </div>
      <div className="side">
        {result ? (
          <div className="panel stack">
            <div className="panel-title">Decoded · {result.kind}</div>
            <code style={{ wordBreak: "break-all", fontSize: ".92rem", background: "var(--elev)", padding: 12, borderRadius: 10, border: "1px solid var(--border)" }}>{result.text}</code>
            {result.fields?.filter(([, v]) => v).map(([k, v]) => <div key={k} className="row" style={{ justifyContent: "space-between", gap: 10 }}><span className="muted">{k}</span><b style={{ wordBreak: "break-all", textAlign: "right" }}>{v}</b></div>)}
            {result.url && (
              <>
                <div className="row" style={{ gap: 6 }}><span className="muted">Opens website:</span><b style={{ wordBreak: "break-all" }}>{result.host}</b></div>
                {result.warn.length === 0 && <Msg type="ok"><ShieldCheck size={15} style={{ display: "inline" }} /> No obvious warning signs — still check the address before entering any details.</Msg>}
              </>
            )}
            {result.warn?.map((w) => <Msg key={w} type="bad"><ShieldAlert size={15} style={{ display: "inline" }} /> {w}</Msg>)}
            <CopyBtn text={result.text} label="Copy" className="btn" />
            {result.url && <a className="btn" href={result.url} target="_blank" rel="noopener noreferrer nofollow"><ExternalLink size={16} /> Open link</a>}
          </div>
        ) : (
          <div className="panel"><small className="muted">The decoded content appears here. Links are never opened automatically.</small></div>
        )}
      </div>
    </div>
  );
}
