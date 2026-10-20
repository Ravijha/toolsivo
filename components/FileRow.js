"use client";
import { Download, X, ArrowRight } from "lucide-react";
import { formatBytes } from "@/lib/file";
import { Spinner } from "./ui";

/** One row in a batch list: thumbnail, name, before → after size, actions. */
export default function FileRow({ thumb, name, size, outSize, busy, error, onDownload, onRemove, onClick, active, extra }) {
  const pct = outSize && size ? Math.round((1 - outSize / size) * 100) : null;
  return (
    <div className="file-item" onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined, borderColor: active ? "var(--brand)" : undefined }}>
      {thumb ? <img className="thumb" src={thumb} alt="" /> : <span className="ph" style={{ background: "var(--grad)" }}>FILE</span>}
      <div className="meta">
        <strong title={name}>{name}</strong>
        <small>
          {formatBytes(size)}
          {outSize != null && (
            <>
              {" "}<ArrowRight size={11} style={{ display: "inline", verticalAlign: "-1px" }} /> {formatBytes(outSize)}{" "}
              {pct != null && <span className={`saving ${pct < 0 ? "neg" : ""}`}>{pct >= 0 ? `−${pct}%` : `+${-pct}%`}</span>}
            </>
          )}
          {error && <span style={{ color: "var(--bad)" }}> · {error}</span>}
          {extra}
        </small>
      </div>
      {busy && <Spinner dark />}
      {onDownload && !busy && (
        <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); onDownload(); }}><Download size={15} /></button>
      )}
      {onRemove && (
        <button className="btn btn-sm btn-ghost btn-icon btn-danger" onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label="Remove"><X size={16} /></button>
      )}
    </div>
  );
}
