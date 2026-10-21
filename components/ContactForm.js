"use client";
import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, Clock, MailCheck, RotateCcw, AlertCircle } from "lucide-react";
import { Field, Spinner } from "./ui";
import { SITE } from "@/lib/site";

// FormSubmit relays the form to our inbox (free, no backend needed on a static site).
const ENDPOINT = `https://formsubmit.co/ajax/${SITE.email}`;
const TOPICS = ["General question", "Report a bug", "Suggest a new tool", "Business & partnerships", "Advertising", "Privacy request", "Other"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const blank = { name: "", email: "", topic: TOPICS[0], subject: "", message: "", consent: false, _honey: "" };

export default function ContactForm() {
  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [failMsg, setFailMsg] = useState("");
  const [sent, setSent] = useState(null);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setF((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = "Please enter your name.";
    if (!EMAIL_RE.test(f.email.trim())) e.email = "Please enter a valid email address.";
    if (f.message.trim().length < 10) e.message = "Please write at least 10 characters.";
    if (!f.consent) e.consent = "Please agree so we can reply to you.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (f._honey) return; // bot
    if (!validate()) return;
    setStatus("sending");
    const ref = "TS-" + Date.now().toString(36).toUpperCase().slice(-6);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: f.name.trim(),
          email: f.email.trim(),
          topic: f.topic,
          subject: f.subject.trim() || f.topic,
          message: f.message.trim(),
          reference: ref,
          page: typeof window !== "undefined" ? window.location.href : "",
          _subject: `[Toolsivo] ${f.topic}: ${f.subject.trim() || f.name.trim()} (${ref})`,
          _replyto: f.email.trim(),
          _template: "table",
          _captcha: "false",
          _honey: "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== "true") throw new Error(data.message || "The message could not be delivered.");
      setSent({ name: f.name.trim().split(" ")[0], email: f.email.trim(), ref });
      setStatus("sent");
      setF(blank);
      requestAnimationFrame(() => document.querySelector(".contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } catch (err) {
      setFailMsg(err.message);
      setStatus("error");
    }
  };

  if (status === "sent")
    return (
      <div className="contact-form">
        <div className="thanks" role="status">
          <div className="thanks-icon"><CheckCircle2 size={42} /></div>
          <h2>Thank you, {sent.name}!</h2>
          <p>Your message has been received successfully. We appreciate you taking the time to reach out to the Toolsivo team.</p>
          <span className="thanks-ref">Reference: {sent.ref}</span>
          <div className="thanks-steps">
            <div><MailCheck size={17} /> Our team will review your message carefully.</div>
            <div><Clock size={17} /> You can expect a reply within 1–2 business days.</div>
            <div><CheckCircle2 size={17} /> <span>We’ll respond to <strong>{sent.email}</strong> — please check your spam folder too.</span></div>
          </div>
          <div className="actions" style={{ justifyContent: "center", marginTop: 28 }}>
            <Link href="/tools/" className="btn btn-primary">Explore tools</Link>
            <button className="btn" onClick={() => setStatus("idle")}><RotateCcw size={16} /> Send another message</button>
          </div>
        </div>
      </div>
    );

  return (
    <form className="contact-form stack" onSubmit={submit} noValidate>
      <div>
        <h2>Send us a message</h2>
        <p className="muted" style={{ marginTop: 6 }}>Fill in the form and we’ll get back to you as soon as possible.</p>
      </div>
      <div className="grid-2">
        <Field label={<span>Full name <span className="req">*</span></span>}>
          <input className={`input ${errors.name ? "invalid" : ""}`} value={f.name} onChange={set("name")} placeholder="Your name" autoComplete="name" maxLength={80} />
          {errors.name && <span className="field-err">{errors.name}</span>}
        </Field>
        <Field label={<span>Email address <span className="req">*</span></span>}>
          <input className={`input ${errors.email ? "invalid" : ""}`} type="email" value={f.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" maxLength={120} />
          {errors.email && <span className="field-err">{errors.email}</span>}
        </Field>
      </div>
      <div className="grid-2">
        <Field label="Topic">
          <select className="select" value={f.topic} onChange={set("topic")}>
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Subject">
          <input className="input" value={f.subject} onChange={set("subject")} placeholder="Briefly, what is it about?" maxLength={120} />
        </Field>
      </div>
      <Field label={<span>Message <span className="req">*</span></span>} value={`${f.message.length}/3000`}>
        <textarea className={`textarea prose ${errors.message ? "invalid" : ""}`} style={{ minHeight: 170 }} value={f.message} onChange={set("message")} placeholder="Tell us how we can help…" maxLength={3000} />
        {errors.message && <span className="field-err">{errors.message}</span>}
      </Field>
      <input className="hp" type="text" name="_honey" tabIndex={-1} autoComplete="off" value={f._honey} onChange={set("_honey")} aria-hidden="true" />
      <label className="check" style={{ alignItems: "flex-start" }}>
        <input type="checkbox" checked={f.consent} onChange={set("consent")} />
        <span className="box" style={{ marginTop: 2 }} />
        <span style={{ fontSize: ".88rem", color: "var(--text-2)" }}>
          I agree that Toolsivo may use these details to respond to my enquiry, as described in the <Link href="/privacy/" style={{ color: "var(--brand)", fontWeight: 600 }}>Privacy Policy</Link>.
        </span>
      </label>
      {errors.consent && <span className="field-err">{errors.consent}</span>}
      {status === "error" && (
        <div className="msg bad">
          <AlertCircle size={17} />
          <div>Sorry, we couldn’t send your message right now ({failMsg}). Please try again, or email us directly at <a href={`mailto:${SITE.email}`} style={{ fontWeight: 700, textDecoration: "underline" }}>{SITE.email}</a>.</div>
        </div>
      )}
      <button className="btn btn-primary btn-lg" type="submit" disabled={status === "sending"}>
        {status === "sending" ? <><Spinner /> Sending…</> : <><Send size={18} /> Send message</>}
      </button>
    </form>
  );
}
