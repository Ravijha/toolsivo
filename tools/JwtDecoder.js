"use client";
import { useEffect, useMemo, useState } from "react";
import { Field, CopyBtn, Msg, Seg } from "@/components/ui";

// Demo token for a fictional user, signed on the page with HS256 and the secret "toolsivo-demo-secret".
const DEMO_HEADER = { alg: "HS256", typ: "JWT" };
const DEMO_PAYLOAD = { sub: "1234567890", name: "Demo User", role: "editor", iat: 1761000000, exp: 4914600000 };
const b64urlToBytes = (s) => {
  const b = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
};
const bytesToB64url = (u) => btoa(String.fromCharCode(...new Uint8Array(u))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const jsonToB64url = (o) => bytesToB64url(new TextEncoder().encode(JSON.stringify(o)));
const decodePart = (s) => JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));
const CLAIMS = { iss: "Issuer", sub: "Subject", aud: "Audience", exp: "Expires", nbf: "Not before", iat: "Issued at", jti: "Token ID", name: "Name", email: "Email", role: "Role", scope: "Scope" };
const ALGS = {
  HS256: { name: "HMAC", hash: "SHA-256" }, HS384: { name: "HMAC", hash: "SHA-384" }, HS512: { name: "HMAC", hash: "SHA-512" },
  RS256: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, RS384: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-384" }, RS512: { name: "RSASSA-PKCS1-v1_5", hash: "SHA-512" },
  PS256: { name: "RSA-PSS", hash: "SHA-256", saltLength: 32 }, PS384: { name: "RSA-PSS", hash: "SHA-384", saltLength: 48 }, PS512: { name: "RSA-PSS", hash: "SHA-512", saltLength: 64 },
  ES256: { name: "ECDSA", namedCurve: "P-256", hash: "SHA-256" }, ES384: { name: "ECDSA", namedCurve: "P-384", hash: "SHA-384" }, ES512: { name: "ECDSA", namedCurve: "P-521", hash: "SHA-512" },
};
const fmtTime = (s) => new Date(s * 1000).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" });
const rel = (s) => {
  const d = Math.round(s - Date.now() / 1000), a = Math.abs(d);
  const t = a < 60 ? `${a}s` : a < 3600 ? `${Math.round(a / 60)} min` : a < 86400 ? `${Math.round(a / 3600)} h` : `${Math.round(a / 86400)} days`;
  return d >= 0 ? `in ${t}` : `${t} ago`;
};

async function verify(token, alg, key, keyFormat) {
  const a = ALGS[alg];
  if (!a) throw new Error(`Algorithm ${alg} isn’t supported for verification.`);
  const [h, p, sig] = token.split(".");
  const data = new TextEncoder().encode(`${h}.${p}`);
  let sigBytes = b64urlToBytes(sig);
  let cryptoKey;
  if (a.name === "HMAC") {
    const raw = keyFormat === "base64" ? b64urlToBytes(key.trim()) : new TextEncoder().encode(key);
    cryptoKey = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: a.hash }, false, ["verify"]);
  } else {
    const pem = key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
    if (!pem) throw new Error("Paste the PEM public key (-----BEGIN PUBLIC KEY-----).");
    const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
    cryptoKey = await crypto.subtle.importKey("spki", der, a.name === "ECDSA" ? { name: "ECDSA", namedCurve: a.namedCurve } : { name: a.name, hash: a.hash }, false, ["verify"]);
  }
  return crypto.subtle.verify(a.name === "ECDSA" ? { name: "ECDSA", hash: a.hash } : a.name === "RSA-PSS" ? { name: "RSA-PSS", saltLength: a.saltLength } : a.name, cryptoKey, sigBytes, data);
}

export default function JwtDecoder() {
  const [token, setToken] = useState("");
  const [key, setKey] = useState("toolsivo-demo-secret");
  const [keyFormat, setKeyFormat] = useState("text");
  const [verdict, setVerdict] = useState(null);

  // build a correctly signed demo token on first load (so the sample verifies)
  useEffect(() => {
    (async () => {
      const h = jsonToB64url(DEMO_HEADER), p = jsonToB64url(DEMO_PAYLOAD);
      const k = await crypto.subtle.importKey("raw", new TextEncoder().encode("toolsivo-demo-secret"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const s = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(`${h}.${p}`));
      setToken(`${h}.${p}.${bytesToB64url(s)}`);
    })();
  }, []);

  const d = useMemo(() => {
    const t = token.trim().replace(/^Bearer\s+/i, "");
    if (!t) return null;
    const parts = t.split(".");
    if (parts.length === 5) return { error: "This looks like an encrypted JWE token — its contents can’t be read without the private key." };
    if (parts.length !== 3) return { error: `A JWT has 3 parts separated by dots; this has ${parts.length}.` };
    try {
      const header = decodePart(parts[0]), payload = decodePart(parts[1]);
      const now = Date.now() / 1000;
      return { t, parts, header, payload, expired: typeof payload.exp === "number" && payload.exp < now, notYet: typeof payload.nbf === "number" && payload.nbf > now };
    } catch {
      return { error: "Couldn’t decode this token — the header or payload isn’t valid Base64URL JSON." };
    }
  }, [token]);

  useEffect(() => {
    setVerdict(null);
    if (!d?.header || !key) return;
    const alg = d.header.alg;
    if (alg === "none") return setVerdict({ ok: false, msg: "Unsigned token (alg: none) — never trust it." });
    let alive = true;
    verify(d.t, alg, key, keyFormat).then((ok) => alive && setVerdict({ ok, msg: ok ? "Signature verified" : "Invalid signature — wrong key, or the token was modified" })).catch((e) => alive && setVerdict({ ok: false, msg: e.message }));
    return () => { alive = false; };
  }, [d, key, keyFormat]);

  const isHmac = d?.header?.alg?.startsWith("HS");
  const colors = ["#e5384f", "#7c3aed", "#0ea5e9"];

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <Field label="JWT token">
          <textarea className="textarea" style={{ minHeight: 130, wordBreak: "break-all" }} value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste a token (eyJ…) — the Bearer prefix is fine" spellCheck={false} />
        </Field>
        {d?.parts && (
          <div className="panel" style={{ fontFamily: "var(--mono)", fontSize: ".82rem", wordBreak: "break-all", background: "var(--elev)" }}>
            {d.parts.map((p, i) => <span key={i}><span style={{ color: colors[i] }}>{p}</span>{i < 2 && <b>.</b>}</span>)}
          </div>
        )}
        {d?.error && <Msg type="bad">{d.error}</Msg>}
        {d?.header && (
          <div className="grid-2">
            <div className="field"><span className="label" style={{ color: colors[0] }}>Header <CopyBtn text={JSON.stringify(d.header, null, 2)} /></span><pre className="code-out">{JSON.stringify(d.header, null, 2)}</pre></div>
            <div className="field"><span className="label" style={{ color: colors[1] }}>Payload <CopyBtn text={JSON.stringify(d.payload, null, 2)} /></span><pre className="code-out">{JSON.stringify(d.payload, null, 2)}</pre></div>
          </div>
        )}
        {d?.payload && (
          <div className="table-wrap" style={{ maxHeight: "none" }}>
            <table className="table">
              <thead><tr><th>Claim</th><th style={{ textAlign: "left" }}>Value</th></tr></thead>
              <tbody>
                {Object.entries(d.payload).map(([k, v]) => (
                  <tr key={k}>
                    <td><code>{k}</code><br /><small className="muted">{CLAIMS[k] || "Custom claim"}</small></td>
                    <td style={{ textAlign: "left", whiteSpace: "normal", wordBreak: "break-word" }}>
                      {["exp", "nbf", "iat", "auth_time"].includes(k) && typeof v === "number" ? <>{fmtTime(v)} <span className="muted">({rel(v)})</span></> : typeof v === "object" ? JSON.stringify(v) : String(v)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="side">
        {d?.header && (
          <div className="panel stack">
            <div className="panel-title">Status</div>
            {typeof d.payload.exp === "number" ? (
              d.expired ? <Msg type="bad">Expired {rel(d.payload.exp)}</Msg> : <Msg type="ok">Valid until {fmtTime(d.payload.exp)}</Msg>
            ) : <Msg>No expiry (exp) claim — this token never expires.</Msg>}
            {d.notYet && <Msg type="bad">Not valid yet (nbf is in the future).</Msg>}
            <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">Algorithm</span><b>{d.header.alg}</b></div>
          </div>
        )}
        {d?.header && d.header.alg !== "none" && (
          <div className="panel stack">
            <div className="panel-title">Verify signature</div>
            <Field label={isHmac ? "Secret" : "Public key (PEM)"}>
              <textarea className="textarea" style={{ minHeight: isHmac ? 60 : 140, fontSize: ".8rem" }} value={key} onChange={(e) => setKey(e.target.value)} spellCheck={false} placeholder={isHmac ? "your-256-bit-secret" : "-----BEGIN PUBLIC KEY-----"} />
            </Field>
            {isHmac && <Seg options={[{ label: "Plain text", value: "text" }, { label: "Base64 secret", value: "base64" }]} value={keyFormat} onChange={setKeyFormat} />}
            {verdict && (verdict.ok
              ? <Msg type="ok">{verdict.msg}</Msg>
              : <Msg type="bad">{verdict.msg}</Msg>)}
          </div>
        )}
        <Msg>Decoding and verification run entirely in your browser with the Web Crypto API — tokens and keys are never sent anywhere. Still, avoid pasting live production secrets into any website.</Msg>
      </div>
    </div>
  );
}
