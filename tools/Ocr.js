"use client";
import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw, ScanText, ClipboardPaste } from "lucide-react";
import { Dropzone, Field, Toggle, CopyBtn, Msg, Stat, Spinner } from "@/components/ui";
import { downloadText, baseName, loadImage, makeCanvas, isImage } from "@/lib/file";
import { SITE } from "@/lib/site";

const LANGS = [
  ["eng", "English"], ["hin", "Hindi"], ["ben", "Bengali"], ["tam", "Tamil"], ["tel", "Telugu"], ["mar", "Marathi"],
  ["guj", "Gujarati"], ["kan", "Kannada"], ["mal", "Malayalam"], ["pan", "Punjabi"], ["urd", "Urdu"], ["fra", "French"],
  ["deu", "German"], ["spa", "Spanish"], ["por", "Portuguese"], ["ita", "Italian"], ["ara", "Arabic"], ["chi_sim", "Chinese (Simplified)"],
  ["jpn", "Japanese"], ["kor", "Korean"], ["rus", "Russian"],
];

// Upscale small images and optionally convert to high-contrast greyscale — both improve OCR accuracy.
async function prepare(file, enhance) {
  const img = await loadImage(file);
  const scale = Math.min(3, Math.max(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight)));
  const c = makeCanvas(img.naturalWidth * scale, img.naturalHeight * scale);
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, c.width, c.height);
  if (enhance) {
    const d = ctx.getImageData(0, 0, c.width, c.height);
    const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const g = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
      const v = Math.max(0, Math.min(255, (g - 128) * 1.5 + 128));
      p[i] = p[i + 1] = p[i + 2] = v;
    }
    ctx.putImageData(d, 0, 0);
  }
  return c;
}

export default function Ocr() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);
  const [langs, setLangs] = useState(["eng"]);
  const [enhance, setEnhance] = useState(true);
  const [status, setStatus] = useState({ busy: false, msg: "", p: 0 });
  const [text, setText] = useState("");
  const [conf, setConf] = useState(null);
  const [err, setErr] = useState(null);
  const workerRef = useRef({ worker: null, langs: "" });

  useEffect(() => () => workerRef.current.worker?.terminate(), []);

  // Paste a screenshot straight from the clipboard
  useEffect(() => {
    const onPaste = (e) => {
      const f = [...(e.clipboardData?.files || [])].find(isImage);
      if (f) open([new File([f], "pasted-image.png", { type: f.type })]);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const open = ([f]) => {
    if (!f || !isImage(f)) return;
    setFile(f);
    setUrl(URL.createObjectURL(f));
    setText("");
    setConf(null);
    setErr(null);
  };

  const toggleLang = (code) =>
    setLangs((l) => (l.includes(code) ? (l.length > 1 ? l.filter((x) => x !== code) : l) : [...l, code].slice(-3)));

  const run = async () => {
    setErr(null);
    setStatus({ busy: true, msg: "Preparing image…", p: 0 });
    try {
      const { createWorker } = await import("tesseract.js");
      const key = langs.join("+");
      if (workerRef.current.langs !== key) {
        await workerRef.current.worker?.terminate();
        setStatus({ busy: true, msg: "Downloading language data (first time only)…", p: 0 });
        // Engine and language data are served from our own site (public/tesseract, public/tessdata).
        const root = `${window.location.origin}${SITE.basePath}`;
        workerRef.current = {
          langs: key,
          worker: await createWorker(langs, 1, {
            workerPath: `${root}/tesseract/worker.min.js`,
            corePath: `${root}/tesseract`,
            langPath: `${root}/tessdata`,
            cacheMethod: "none",
            logger: (m) => {
              if (m.status === "recognizing text") setStatus({ busy: true, msg: "Reading text…", p: Math.round(m.progress * 100) });
              else if (/loading|initializ/i.test(m.status)) setStatus({ busy: true, msg: "Loading OCR engine…", p: Math.round((m.progress || 0) * 100) });
            },
          }),
        };
      }
      const canvas = await prepare(file, enhance);
      setStatus({ busy: true, msg: "Reading text…", p: 0 });
      const { data } = await workerRef.current.worker.recognize(canvas);
      setText(data.text.replace(/\n{3,}/g, "\n\n").trim());
      setConf(Math.round(data.confidence));
      if (!data.text.trim()) setErr("No text was found. Try a sharper image, another language, or turn image enhancement off.");
    } catch (e) {
      setErr("Text recognition failed. Check your internet connection (needed to load the language model) and try again.");
      workerRef.current = { worker: null, langs: "" };
    }
    setStatus({ busy: false, msg: "", p: 0 });
  };

  if (!file)
    return (
      <div className="stack">
        <Dropzone onFiles={open} title="Drop an image with text" hint="Photos, scanned pages, screenshots — JPG, PNG, WebP, BMP" />
        <Msg><ClipboardPaste size={15} style={{ display: "inline", verticalAlign: "-2px" }} /> Tip: copy a screenshot and press <b>Ctrl+V</b> anywhere on this page to paste it.</Msg>
      </div>
    );

  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div className="preview-box" style={{ minHeight: 360, padding: 10 }}><img src={url} alt="Uploaded" style={{ maxHeight: 480 }} /></div>
          <div className="field">
            <span className="label">Extracted text {conf != null && <em>{conf}% confidence</em>}</span>
            {status.busy ? (
              <div className="panel stack" style={{ minHeight: 360, placeContent: "center", textAlign: "center" }}>
                <div style={{ display: "grid", placeItems: "center" }}><Spinner dark /></div>
                <strong>{status.msg}</strong>
                <div className="progress"><i style={{ width: `${status.p}%` }} /></div>
                <small className="muted">{status.p}%</small>
              </div>
            ) : (
              <textarea className="textarea prose" style={{ minHeight: 360 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Click “Extract text” — the result appears here and you can edit it." />
            )}
          </div>
        </div>
        {err && <Msg type="bad">{err}</Msg>}
        {text && (
          <div className="stats">
            <Stat label="Words" value={words} />
            <Stat label="Characters" value={text.length} />
            <Stat label="Lines" value={text.split("\n").length} />
          </div>
        )}
      </div>
      <div className="side">
        <div className="panel stack">
          <div className="panel-title">Languages in the image (up to 3)</div>
          <div className="row" style={{ gap: 6 }}>
            {LANGS.map(([code, name]) => (
              <button key={code} className={`chip ${langs.includes(code) ? "active" : ""}`} style={{ padding: "6px 11px", fontSize: ".8rem" }} onClick={() => toggleLang(code)}>{name}</button>
            ))}
          </div>
          <Toggle label="Enhance image for better accuracy" checked={enhance} onChange={setEnhance} />
        </div>
        <button className="btn btn-primary btn-lg" onClick={run} disabled={status.busy}>
          {status.busy ? <Spinner /> : <ScanText size={18} />} {text ? "Extract again" : "Extract text"}
        </button>
        <div className="grid-2">
          <CopyBtn text={text} label="Copy text" className="btn" />
          <button className="btn" disabled={!text} onClick={() => downloadText(text, `${baseName(file.name)}-text.txt`)}><Download size={16} /> TXT</button>
        </div>
        <button className="btn" onClick={() => setFile(null)} disabled={status.busy}><RefreshCw size={16} /> New image</button>
        <small className="muted">Your image is processed on your device. The OCR engine and language model (a few MB) load from Toolsivo itself — nothing is sent anywhere.</small>
      </div>
    </div>
  );
}
