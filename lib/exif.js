// Minimal EXIF (TIFF) reader for JPEG files — enough to show camera, date and GPS metadata.
const TAGS = {
  0x010f: "Camera make", 0x0110: "Camera model", 0x0112: "Orientation", 0x011a: "X resolution", 0x011b: "Y resolution", 0x0131: "Software",
  0x0132: "Date modified", 0x013b: "Artist", 0x8298: "Copyright", 0x829a: "Exposure time", 0x829d: "F-number", 0x8822: "Exposure program",
  0x8827: "ISO", 0x9003: "Date taken", 0x9004: "Date digitised", 0x9201: "Shutter speed", 0x9202: "Aperture", 0x9204: "Exposure bias",
  0x9207: "Metering mode", 0x9209: "Flash", 0x920a: "Focal length", 0xa002: "Image width", 0xa003: "Image height", 0xa405: "Focal length (35mm)",
  0xa406: "Scene type", 0xa431: "Camera serial number", 0xa433: "Lens make", 0xa434: "Lens model", 0x9010: "Time zone offset", 0xa420: "Unique image ID",
};
const GPS = { 0x0001: "LatRef", 0x0002: "Lat", 0x0003: "LngRef", 0x0004: "Lng", 0x0005: "AltRef", 0x0006: "Alt", 0x0007: "Time", 0x001d: "Date" };
const SIZES = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

function readIFD(v, tiff, off, le, map, out) {
  const n = v.getUint16(off, le);
  let next = { exif: 0, gps: 0 };
  for (let i = 0; i < n; i++) {
    const e = off + 2 + i * 12;
    const tag = v.getUint16(e, le), type = v.getUint16(e + 2, le), count = v.getUint32(e + 4, le);
    const size = (SIZES[type] || 1) * count;
    const p = size > 4 ? tiff + v.getUint32(e + 8, le) : e + 8;
    if (tag === 0x8769) { next.exif = tiff + v.getUint32(e + 8, le); continue; }
    if (tag === 0x8825) { next.gps = tiff + v.getUint32(e + 8, le); continue; }
    const name = map[tag];
    if (!name || p + size > v.byteLength) continue;
    let val;
    if (type === 2) val = new TextDecoder().decode(new Uint8Array(v.buffer, v.byteOffset + p, count)).replace(/\0+$/, "").trim();
    else if (type === 3) val = count === 1 ? v.getUint16(p, le) : Array.from({ length: count }, (_, k) => v.getUint16(p + k * 2, le));
    else if (type === 4 || type === 9) val = type === 9 ? v.getInt32(p, le) : v.getUint32(p, le);
    else if (type === 5 || type === 10) {
      const rd = (k) => { const a = type === 10 ? v.getInt32(p + k * 8, le) : v.getUint32(p + k * 8, le); const b = type === 10 ? v.getInt32(p + k * 8 + 4, le) : v.getUint32(p + k * 8 + 4, le); return b ? a / b : 0; };
      val = count === 1 ? rd(0) : Array.from({ length: count }, (_, k) => rd(k));
    } else val = `(${count} bytes)`;
    out[name] = val;
  }
  return next;
}

export function readExif(buffer) {
  const v = new DataView(buffer);
  if (v.getUint16(0) !== 0xffd8) return null;
  let off = 2;
  while (off + 4 < v.byteLength) {
    const marker = v.getUint16(off), len = v.getUint16(off + 2);
    if (marker === 0xffe1 && v.getUint32(off + 4) === 0x45786966) {
      const tiff = off + 10, le = v.getUint16(tiff) === 0x4949;
      const tags = {}, gps = {};
      const next = readIFD(v, tiff, tiff + v.getUint32(tiff + 4, le), le, TAGS, tags);
      if (next.exif) readIFD(v, tiff, next.exif, le, TAGS, tags);
      if (next.gps) readIFD(v, tiff, next.gps, le, GPS, gps);
      let location = null;
      if (Array.isArray(gps.Lat) && Array.isArray(gps.Lng)) {
        const dms = (a) => a[0] + a[1] / 60 + a[2] / 3600;
        const lat = dms(gps.Lat) * (gps.LatRef === "S" ? -1 : 1), lng = dms(gps.Lng) * (gps.LngRef === "W" ? -1 : 1);
        if (lat || lng) location = { lat: +lat.toFixed(6), lng: +lng.toFixed(6), alt: typeof gps.Alt === "number" ? Math.round(gps.Alt) : null };
      }
      if (typeof tags["Exposure time"] === "number" && tags["Exposure time"] < 1) tags["Exposure time"] = `1/${Math.round(1 / tags["Exposure time"])} s`;
      if (typeof tags["F-number"] === "number") tags["F-number"] = `f/${tags["F-number"].toFixed(1)}`;
      if (typeof tags["Focal length"] === "number") tags["Focal length"] = `${tags["Focal length"].toFixed(1)} mm`;
      for (const k of ["Shutter speed", "Aperture", "X resolution", "Y resolution"]) if (typeof tags[k] === "number") tags[k] = +tags[k].toFixed(2);
      return { tags, location };
    }
    if ((marker & 0xff00) !== 0xff00) break;
    off += 2 + len;
  }
  return { tags: {}, location: null };
}

// Identify the real file type from its first bytes (catches renamed files).
export function sniff(b) {
  const h = (n) => [...b.slice(0, n)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const s = (a, z) => String.fromCharCode(...b.slice(a, z));
  if (h(3) === "ffd8ff") return ["JPEG image", "jpg"];
  if (h(8) === "89504e470d0a1a0a") return ["PNG image", "png"];
  if (s(0, 4) === "GIF8") return ["GIF image", "gif"];
  if (s(0, 4) === "RIFF" && s(8, 12) === "WEBP") return ["WebP image", "webp"];
  if (s(0, 4) === "RIFF" && s(8, 12) === "WAVE") return ["WAV audio", "wav"];
  if (s(0, 4) === "%PDF") return ["PDF document", "pdf"];
  if (h(4) === "504b0304") return ["ZIP archive (also DOCX/XLSX/PPTX/APK)", "zip"];
  if (s(0, 3) === "ID3" || h(2) === "fffb") return ["MP3 audio", "mp3"];
  if (s(4, 8) === "ftyp") return ["MP4 / MOV / HEIC media", "mp4"];
  if (s(0, 4) === "fLaC") return ["FLAC audio", "flac"];
  if (s(0, 4) === "OggS") return ["OGG media", "ogg"];
  if (h(4) === "1a45dfa3") return ["WebM / MKV video", "webm"];
  if (s(0, 2) === "MZ") return ["Windows executable", "exe"];
  if (h(4) === "7f454c46") return ["Linux executable", "elf"];
  if (s(0, 6) === "7z\xbc\xaf\x27\x1c") return ["7-Zip archive", "7z"];
  if (s(0, 4) === "Rar!") return ["RAR archive", "rar"];
  return null;
}
