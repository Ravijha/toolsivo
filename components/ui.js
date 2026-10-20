"use client";
import { useRef, useState } from "react";
import { Upload, Copy, Check, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { copyText } from "@/lib/file";

export function Dropzone({ onFiles, accept = "image/*", multiple = false, title, hint, compact = false }) {
  const [over, setOver] = useState(false);
  const input = useRef(null);
  const take = (list) => {
    const files = Array.from(list || []);
    if (files.length) onFiles(multiple ? files : [files[0]]);
  };
  return (
    <label
      className={`dropzone ${over ? "over" : ""} ${compact ? "compact" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
    >
      <input ref={input} type="file" accept={accept} multiple={multiple} onChange={(e) => { take(e.target.files); e.target.value = ""; }} />
      <span className="dz-icon"><Upload size={compact ? 20 : 28} /></span>
      <div style={{ textAlign: compact ? "left" : "center" }}>
        <strong>{title || (multiple ? "Drop files here or click to browse" : "Drop a file here or click to browse")}</strong>
        <br />
        <small>{hint || "Your files are processed locally and never uploaded."}</small>
      </div>
    </label>
  );
}

export function Field({ label, value, children, hint }) {
  return (
    <div className="field">
      {label && <span className="label">{label}{value !== undefined && <em>{value}</em>}</span>}
      {children}
      {hint && <small className="muted" style={{ fontSize: ".78rem" }}>{hint}</small>}
    </div>
  );
}

export function Range({ label, value, min = 0, max = 100, step = 1, onChange, format = (v) => v }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <Field label={label} value={format(value)}>
      <input type="range" min={min} max={max} step={step} value={value} style={{ "--p": `${p}%` }} onChange={(e) => onChange(+e.target.value)} />
    </Field>
  );
}

export function Seg({ options, value, onChange }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => {
        const v = typeof o === "object" ? o.value : o;
        const l = typeof o === "object" ? o.label : o;
        return (
          <button key={v} type="button" className={value === v ? "on" : ""} onClick={() => onChange(v)}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="box" />
      {label}
    </label>
  );
}

export function NumInput({ value, onChange, prefix, suffix, min, max, step = "any", placeholder }) {
  return (
    <div className={`input-wrap ${suffix ? "has-suf" : ""} ${prefix ? "" : "no-pre"}`}>
      {prefix && <span className="pre">{prefix}</span>}
      <input
        className="input"
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {suffix && <span className="suf">{suffix}</span>}
    </div>
  );
}

export function CopyBtn({ text, label = "Copy", className = "btn btn-sm" }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={className}
      disabled={!text}
      onClick={() => { copyText(text); setDone(true); setTimeout(() => setDone(false), 1400); }}
    >
      {done ? <Check size={15} /> : <Copy size={15} />} {done ? "Copied" : label}
    </button>
  );
}

export function Msg({ type = "info", children }) {
  const Icon = type === "bad" ? AlertCircle : type === "ok" ? CheckCircle2 : Info;
  return <div className={`msg ${type}`}><Icon size={17} /> <div>{children}</div></div>;
}

export function Stat({ label, value, sub, hl }) {
  return (
    <div className={`stat ${hl ? "hl" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}

export function Spinner({ dark }) {
  return <span className={`spinner ${dark ? "dark" : ""}`} />;
}

// Simple SVG donut chart: parts = [{ label, value, color }]
export function Donut({ parts, size = 190, thickness = 26, center }) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "none" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={thickness} />
      {parts.map((p) => {
        const len = (Math.max(0, p.value) / total) * C;
        const el = (
          <circle
            key={p.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={p.color}
            strokeWidth={thickness}
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-acc}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dasharray .5s ease, stroke-dashoffset .5s ease" }}
          />
        );
        acc += len;
        return el;
      })}
      {center && (
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="var(--text)" fontWeight="800" fontSize="20">
          {center}
        </text>
      )}
    </svg>
  );
}

export const inr = (n, d = 0) =>
  isFinite(n) ? "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d }) : "—";
export const num = (n, d = 2) => (isFinite(n) ? Number(n).toLocaleString("en-IN", { maximumFractionDigits: d }) : "—");
