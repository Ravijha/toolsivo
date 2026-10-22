"use client";
import { useState } from "react";
import Link from "next/link";
import { RefreshCw, MapPin, ShieldAlert, Eraser, AlertTriangle } from "lucide-react";
import { Dropzone, Msg, Spinner, CopyBtn } from "@/components/ui";
import { formatBytes, downloadBlob, baseName, makeCanvas, canvasToBlob, loadImage } from "@/lib/file";
import { readExif, sniff } from "@/lib/exif";

const pdfDate = (d) => (d ? d.toLocaleString("en-IN") : null);
const Table = ({ rows }) => (
  <div className="table-wrap" style={{ maxHeight: "none" }}>
    <table className="table"><tbody>{rows.filter(([, v]) => v != null && v !== "").map(([k, v]) => <tr key={k}><td style={{ fontWeight: 700, width: "38%" }}>{k}</td><td style={{ textAlign: "left", whiteSpace: "normal", wordBreak: "break-word" }}>{Array.isArray(v) ? v.join(", ") : String(v)}</td></tr>)}</tbody></table>
  </div>
);

export default function FileMeta() {
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);

  const open = async ([f]) => {
    setFile(f); setInfo(null); setBusy(true);
    const buf = await f.arrayBuffer();
    const head = new Uint8Array(buf.slice(0, 32));
    const real = sniff(head);
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    const out = { real, ext, mismatch: real && ext && !real[1].split("/").includes(ext) && !(real[1] === "jpg" && ext === "jpeg") && !(real[1] === "zip" && /^(docx|xlsx|pptx|apk|jar|odt)$/.test(ext)) && !(real[1] === "mp4" && /^(mov|m4a|m4v|heic|3gp)$/.test(ext)) };
    try {
      if (real?.[1] === "jpg") out.exif = readExif(buf);
      if (/^(jpg|png|gif|webp)$/.test(real?.[1])) { const im = await loadImage(f); out.dims = `${im.naturalWidth} × ${im.naturalHeight} px`; out.isImage = true; }
      if (real?.[1] === "pdf") {
        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true, updateMetadata: false });
        out.pdf = [["Title", doc.getTitle()], ["Author", doc.getAuthor()], ["Subject", doc.getSubject()], ["Keywords", doc.getKeywords()], ["Creator app", doc.getCreator()], ["Producer", doc.getProducer()], ["Created", pdfDate(doc.getCreationDate())], ["Modified", pdfDate(doc.getModificationDate())], ["Pages", doc.getPageCount()]];
      }
      if (f.type.startsWith("video/") || f.type.startsWith("audio/")) {
        const el = document.createElement(f.type.startsWith("video/") ? "video" : "audio");
        el.preload = "metadata"; el.src = URL.createObjectURL(f);
        await new Promise((r) => { el.onloadedmetadata = r; el.onerror = r; setTimeout(r, 4000); });
        if (isFinite(el.duration)) out.media = [["Duration", `${Math.floor(el.duration / 60)}:${String(Math.round(el.duration % 60)).padStart(2, "0")}`], ["Video size", el.videoWidth ? `${el.videoWidth} × ${el.videoHeight}` : null]];
      }
    } catch { out.parseError = true; }
    setInfo(out); setBusy(false);
  };

  const stripImage = async () => {
    const im = await loadImage(file);
    const c = makeCanvas(im.naturalWidth, im.naturalHeight);
    const x = c.getContext("2d");
    const type = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
    if (type === "image/jpeg") { x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); }
    x.drawImage(im, 0, 0); // browsers apply EXIF orientation when drawing, so the clean copy stays upright
    downloadBlob(await canvasToBlob(c, type, 0.95), `${baseName(file.name)}-clean.${type.split("/")[1].replace("jpeg", "jpg")}`);
  };
  const stripPdf = async () => {
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
    doc.setTitle(""); doc.setAuthor(""); doc.setSubject(""); doc.setKeywords([]); doc.setCreator(""); doc.setProducer("");
    downloadBlob(new Blob([await doc.save()], { type: "application/pdf" }), `${baseName(file.name)}-clean.pdf`);
  };

  if (!file) return <Dropzone accept="*/*" onFiles={open} title="Drop any file to inspect" hint="Photos, PDFs, audio, video, documents — read locally, never uploaded" />;

  const ex = info?.exif;
  const exRows = ex ? Object.entries(ex.tags) : [];
  const gps = ex?.location;
  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        {busy && <div className="panel" style={{ display: "grid", placeItems: "center", minHeight: 160 }}><Spinner dark /></div>}
        {info && (
          <>
            <div className="panel-title" style={{ marginBottom: 0 }}>File</div>
            <Table rows={[["Name", file.name], ["Size", `${formatBytes(file.size)} (${file.size.toLocaleString("en-IN")} bytes)`], ["Reported type", file.type || "unknown"], ["Actual format (from content)", info.real?.[0] || "Not recognised"], ["Last modified", new Date(file.lastModified).toLocaleString("en-IN")], ["Dimensions", info.dims]]} />
            {info.mismatch && <Msg type="bad"><AlertTriangle size={15} style={{ display: "inline" }} /> The file extension (.{info.ext}) doesn’t match its real format ({info.real[0]}). Be careful opening files from unknown sources.</Msg>}
            {gps && (
              <div className="msg bad" style={{ alignItems: "center" }}>
                <MapPin size={18} />
                <div style={{ flex: 1 }}><b>This photo contains its GPS location</b> ({gps.lat}, {gps.lng}{gps.alt != null ? `, ${gps.alt} m altitude` : ""}). Anyone you share the original with can see where it was taken.
                  <br /><a href={`https://www.openstreetmap.org/?mlat=${gps.lat}&mlon=${gps.lng}#map=16/${gps.lat}/${gps.lng}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", fontWeight: 700 }}>View on map</a></div>
              </div>
            )}
            {exRows.length > 0 && <><div className="panel-title" style={{ marginBottom: 0 }}>Camera & EXIF ({exRows.length} fields)</div><Table rows={exRows} /></>}
            {ex && !exRows.length && !gps && <Msg type="ok">No EXIF metadata found in this photo.</Msg>}
            {info.pdf && <><div className="panel-title" style={{ marginBottom: 0 }}>PDF properties</div><Table rows={info.pdf} /></>}
            {info.media && <><div className="panel-title" style={{ marginBottom: 0 }}>Media</div><Table rows={info.media} /></>}
            {info.parseError && <Msg>Some details couldn’t be read from this file.</Msg>}
          </>
        )}
      </div>
      <div className="side">
        {info?.isImage && (
          <div className="panel stack">
            <div className="panel-title"><ShieldAlert size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Privacy clean-up</div>
            <small className="muted">Save a copy without EXIF, GPS or camera details. The picture itself is unchanged.</small>
            <button className="btn btn-primary" onClick={stripImage}><Eraser size={16} /> Remove metadata & download</button>
          </div>
        )}
        {info?.pdf && (
          <div className="panel stack">
            <div className="panel-title">Privacy clean-up</div>
            <small className="muted">Clear the title, author, subject, keywords and software fields.</small>
            <button className="btn btn-primary" onClick={stripPdf}><Eraser size={16} /> Remove PDF metadata</button>
          </div>
        )}
        {info?.media && <Msg>For tags and cover art of music files, use the <Link href="/tools/audio-metadata-viewer/" style={{ textDecoration: "underline" }}>Audio Metadata Viewer</Link>.</Msg>}
        {exRows.length > 0 && <CopyBtn text={exRows.map(([k, v]) => `${k}: ${v}`).join("\n")} label="Copy metadata" className="btn" />}
        <button className="btn" onClick={() => setFile(null)}><RefreshCw size={16} /> Another file</button>
      </div>
    </div>
  );
}
