"use client";
import { useState } from "react";
import { Download, RefreshCw, Music } from "lucide-react";
import { Dropzone, Stat, Msg, CopyBtn, Spinner } from "@/components/ui";
import { formatBytes, downloadBlob, downloadText, baseName } from "@/lib/file";

const dur = (s) => (s ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : "—");
const show = (v) => (v == null || v === "" ? null : Array.isArray(v) ? v.map(show).filter(Boolean).join(", ") : typeof v === "object" ? (v.text ?? v.description ?? (v.no != null ? `${v.no}${v.of ? ` of ${v.of}` : ""}` : null)) : String(v));

export default function AudioMeta() {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [cover, setCover] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const open = async ([f]) => {
    setFile(f); setMeta(null); setCover(null); setErr(null); setBusy(true);
    try {
      const { parseBlob } = await import("music-metadata");
      const m = await parseBlob(f, { duration: true, skipCovers: false });
      setMeta(m);
      const pic = m.common.picture?.[0];
      if (pic) setCover({ url: URL.createObjectURL(new Blob([pic.data], { type: pic.format })), type: pic.format, size: pic.data.length });
    } catch (e) {
      setErr("Couldn’t read this file’s metadata. Supported: MP3, M4A/AAC, FLAC, WAV, OGG, OPUS, WMA, AIFF.");
    }
    setBusy(false);
  };

  if (!file) return <Dropzone accept="audio/*,.mp3,.m4a,.flac,.wav,.ogg,.opus,.aac,.wma,.aiff" onFiles={open} title="Drop an audio file" hint="MP3, M4A, FLAC, WAV, OGG — read locally, never uploaded" />;

  const c = meta?.common || {}, fmtI = meta?.format || {};
  const tags = [
    ["Title", c.title], ["Artist", c.artist], ["Album", c.album], ["Album artist", c.albumartist], ["Year", c.year], ["Genre", c.genre],
    ["Track", c.track], ["Disc", c.disk], ["Composer", c.composer], ["Lyricist", c.lyricist], ["BPM", c.bpm], ["Key", c.key],
    ["Label", c.label], ["ISRC", c.isrc], ["Copyright", c.copyright], ["Encoded by", c.encodedby], ["Comment", c.comment], ["Lyrics", c.lyrics],
  ].map(([k, v]) => [k, show(v)]).filter(([, v]) => v);
  const tech = [
    ["Container", fmtI.container], ["Codec", fmtI.codec], ["Codec profile", fmtI.codecProfile], ["Tag types", fmtI.tagTypes?.join(", ")],
    ["Lossless", fmtI.lossless != null ? (fmtI.lossless ? "Yes" : "No") : null], ["Bit depth", fmtI.bitsPerSample && `${fmtI.bitsPerSample}-bit`],
    ["Channels", fmtI.numberOfChannels && (fmtI.numberOfChannels === 1 ? "Mono" : fmtI.numberOfChannels === 2 ? "Stereo" : `${fmtI.numberOfChannels} channels`)],
    ["Encoder", fmtI.tool], ["MIME type", file.type],
  ].filter(([, v]) => v);
  const report = [`File: ${file.name}`, `Size: ${formatBytes(file.size)}`, `Duration: ${dur(fmtI.duration)}`, `Bitrate: ${fmtI.bitrate ? Math.round(fmtI.bitrate / 1000) + " kbps" : "—"}`, `Sample rate: ${fmtI.sampleRate ? fmtI.sampleRate + " Hz" : "—"}`, "", ...tags.map(([k, v]) => `${k}: ${v}`), "", ...tech.map(([k, v]) => `${k}: ${v}`)].join("\n");

  return (
    <div className="tool-cols">
      <div className="stack">
        {busy && <div className="panel" style={{ display: "grid", placeItems: "center", minHeight: 200 }}><Spinner dark /></div>}
        {err && <Msg type="bad">{err}</Msg>}
        {meta && (
          <>
            <div className="panel" style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", background: "var(--elev)" }}>
              {cover ? <img src={cover.url} alt="Cover art" style={{ width: 140, height: 140, borderRadius: 14, objectFit: "cover", boxShadow: "var(--shadow)" }} />
                : <span className="icon-tile" style={{ "--s": "140px", background: "linear-gradient(135deg,#1e40af,#06b6d4)" }}><Music /></span>}
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: "1.5rem", overflowWrap: "anywhere" }}>{c.title || baseName(file.name)}</h2>
                <p className="muted" style={{ marginTop: 4 }}>{[c.artist, c.album, c.year].filter(Boolean).join(" · ") || "No artist or album tags"}</p>
                <audio controls src={URL.createObjectURL(file)} style={{ marginTop: 12, width: "100%", maxWidth: 420 }} />
              </div>
            </div>
            <div className="stats">
              <Stat hl label="Duration" value={dur(fmtI.duration)} />
              <Stat label="Bitrate" value={fmtI.bitrate ? `${Math.round(fmtI.bitrate / 1000)} kbps` : "—"} sub={fmtI.codecProfile || ""} />
              <Stat label="Sample rate" value={fmtI.sampleRate ? `${(fmtI.sampleRate / 1000).toFixed(1)} kHz` : "—"} />
              <Stat label="File size" value={formatBytes(file.size)} />
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Tag</th><th style={{ textAlign: "left" }}>Value</th></tr></thead>
                <tbody>
                  {tags.length === 0 && <tr><td colSpan={2} className="muted">This file has no descriptive tags.</td></tr>}
                  {tags.map(([k, v]) => <tr key={k}><td style={{ fontWeight: 700 }}>{k}</td><td style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>{v}</td></tr>)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <div className="side">
        {meta && (
          <div className="panel stack">
            <div className="panel-title">Technical details</div>
            {tech.map(([k, v]) => <div key={k} className="row" style={{ justifyContent: "space-between", gap: 10 }}><span className="muted">{k}</span><b style={{ textAlign: "right" }}>{v}</b></div>)}
          </div>
        )}
        {cover && <button className="btn" onClick={() => fetch(cover.url).then((r) => r.blob()).then((b) => downloadBlob(b, `${baseName(file.name)}-cover.${cover.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg"}`))}><Download size={16} /> Download cover art</button>}
        {meta && (
          <div className="grid-2">
            <CopyBtn text={report} label="Copy all" className="btn" />
            <button className="btn" onClick={() => downloadText(report, `${baseName(file.name)}-metadata.txt`)}><Download size={16} /> TXT</button>
          </div>
        )}
        <button className="btn" onClick={() => setFile(null)}><RefreshCw size={16} /> Another file</button>
      </div>
    </div>
  );
}
