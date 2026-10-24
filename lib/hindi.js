// Phonetic Roman ⇄ Devanagari conversion for Hindi. Original rule tables — no external service.

const HALANT = "्";

// Consonants: longest keys are matched first; capitals mark retroflex sounds (T, D, N, Sh).
const CONS = {
  kSh: "क्ष", ksh: "क्ष", x: "क्ष", gy: "ज्ञ", jny: "ज्ञ", cch: "च्छ",
  kh: "ख", k: "क", q: "क़", gh: "घ", g: "ग", chh: "छ", Ch: "छ", ch: "च", c: "क", jh: "झ", j: "ज", z: "ज़",
  Th: "ठ", T: "ट", Rh: "ढ़", R: "ड़", Dh: "ढ", D: "ड", N: "ण", th: "थ", t: "त", dh: "ध", d: "द", n: "न",
  ph: "फ", f: "फ", p: "प", bh: "भ", b: "ब", m: "म", y: "य", r: "र", l: "ल", v: "व", w: "व",
  Sh: "ष", sh: "श", s: "स", h: "ह",
};
// [independent vowel, matra]
const VOW = {
  aa: ["आ", "ा"], A: ["आ", "ा"], ai: ["ऐ", "ै"], au: ["औ", "ौ"], a: ["अ", ""],
  ee: ["ई", "ी"], ii: ["ई", "ी"], I: ["ई", "ी"], i: ["इ", "ि"],
  oo: ["ऊ", "ू"], uu: ["ऊ", "ू"], U: ["ऊ", "ू"], u: ["उ", "ु"],
  Ri: ["ऋ", "ृ"], e: ["ए", "े"], E: ["ऐ", "ै"], o: ["ओ", "ो"], O: ["औ", "ौ"],
};
const MARKS = { M: "ं", "~": "ँ", H: "ः" };
const keysBy = (o) => Object.keys(o).sort((a, b) => b.length - a.length);
const CK = keysBy(CONS), VK = keysBy(VOW), MK = keysBy(MARKS);
const DIGITS = "०१२३४५६७८९";

const match = (s, i, keys) => keys.find((k) => s.startsWith(k, i));

// Very common words whose nasal sounds can't be inferred from spelling alone (used when smart mode is on).
const COMMON = {
  main: "मैं", hain: "हैं", hai: "है", hoon: "हूँ", hun: "हूँ", nahin: "नहीं", nahi: "नहीं", nahee: "नहीं", mein: "में", mei: "में",
  kahan: "कहाँ", yahan: "यहाँ", wahan: "वहाँ", vahan: "वहाँ", haan: "हाँ", han: "हाँ", kyon: "क्यों", kyun: "क्यों", maine: "मैंने",
  hum: "हम", tum: "तुम", aap: "आप", kaun: "कौन", unhen: "उन्हें", unhein: "उन्हें", inhen: "इन्हें", sabhi: "सभी", bhi: "भी",
  ki: "की", ke: "के", ka: "का", ko: "को", se: "से", par: "पर", aur: "और", ya: "या", to: "तो", hi: "ही", na: "ना", ek: "एक",
  sakte: "सकते", saath: "साथ", sath: "साथ", liye: "लिए", diya: "दिया", kiya: "किया", gaya: "गया", rahe: "रहे", rahi: "रही",
};

/**
 * "namaste" → "नमस्ते". Options:
 *  smartA  – a word-final "a" after a consonant becomes ा (kya → क्या, mera → मेरा)
 *  danda   – "." at the end of a sentence becomes "।"
 *  digits  – 0-9 → ०-९
 */
export function romanToHindi(text, { smartA = true, danda = true, digits = false } = {}) {
  if (smartA) text = text.replace(/[A-Za-z~]+/g, (w, off) => (COMMON[w] && text[off - 1] !== "\\" ? `\u0000${COMMON[w]}\u0000` : w));
  let out = "", i = 0, prevCons = false;
  while (i < text.length) {
    if (text[i] === "\u0000") { const j = text.indexOf("\u0000", i + 1); out += text.slice(i + 1, j); i = j + 1; prevCons = false; continue; }
    if (text[i] === "\\") { // \word keeps an English word as-is
      const w = text.slice(i + 1).match(/^[A-Za-z0-9~]*/)[0] || text[i + 1] || "";
      out += w; i += 1 + w.length; prevCons = false; continue;
    }
    const v = match(text, i, VK);
    if (v) {
      const end = i + v.length;
      const wordEnd = end >= text.length || !/[A-Za-z~]/.test(text[end]);
      // word-final "a" / "i" after a consonant are almost always long in Hindi (kya → क्या, hindi → हिंदी)
      if (prevCons) out += smartA && wordEnd && v === "a" ? "ा" : smartA && wordEnd && v === "i" ? "ी" : VOW[v][1];
      else out += VOW[v][0];
      prevCons = false; i = end; continue;
    }
    const c = match(text, i, CK);
    if (c) { out += (prevCons ? HALANT : "") + CONS[c]; prevCons = true; i += c.length; continue; }
    const m = match(text, i, MK);
    if (m) { out += MARKS[m]; prevCons = false; i += m.length; continue; }
    const ch = text[i];
    if (ch === "|" ) { const dbl = text[i + 1] === "|"; out += dbl ? "॥" : "।"; i += dbl ? 2 : 1; prevCons = false; continue; }
    if (danda && ch === "." && (i + 1 >= text.length || /\s/.test(text[i + 1]))) out += "।";
    else if (digits && /\d/.test(ch)) out += DIGITS[+ch];
    else out += ch;
    prevCons = false; i++;
  }
  return out;
}

/* ---------------- Devanagari → Roman ---------------- */
const D_CONS = {
  "क": ["k", "k"], "ख": ["kh", "kh"], "ग": ["g", "g"], "घ": ["gh", "gh"], "ङ": ["n", "ṅ"],
  "च": ["ch", "c"], "छ": ["chh", "ch"], "ज": ["j", "j"], "झ": ["jh", "jh"], "ञ": ["n", "ñ"],
  "ट": ["t", "ṭ"], "ठ": ["th", "ṭh"], "ड": ["d", "ḍ"], "ढ": ["dh", "ḍh"], "ण": ["n", "ṇ"],
  "त": ["t", "t"], "थ": ["th", "th"], "द": ["d", "d"], "ध": ["dh", "dh"], "न": ["n", "n"],
  "प": ["p", "p"], "फ": ["ph", "ph"], "ब": ["b", "b"], "भ": ["bh", "bh"], "म": ["m", "m"],
  "य": ["y", "y"], "र": ["r", "r"], "ल": ["l", "l"], "व": ["v", "v"], "श": ["sh", "ś"], "ष": ["sh", "ṣ"], "स": ["s", "s"], "ह": ["h", "h"],
  "क़": ["q", "q"], "ख़": ["kh", "k͟h"], "ग़": ["gh", "ġ"], "ज़": ["z", "z"], "फ़": ["f", "f"], "ड़": ["d", "ṛ"], "ढ़": ["dh", "ṛh"], "य़": ["y", "ẏ"],
};
const D_VOW = {
  "अ": ["a", "a"], "आ": ["aa", "ā"], "इ": ["i", "i"], "ई": ["ee", "ī"], "उ": ["u", "u"], "ऊ": ["oo", "ū"], "ऋ": ["ri", "ṛ"],
  "ए": ["e", "e"], "ऐ": ["ai", "ai"], "ओ": ["o", "o"], "औ": ["au", "au"], "ऑ": ["o", "ô"],
};
const D_MATRA = {
  "ा": ["a", "ā"], "ि": ["i", "i"], "ी": ["i", "ī"], "ु": ["u", "u"], "ू": ["u", "ū"], "ृ": ["ri", "ṛ"],
  "े": ["e", "e"], "ै": ["ai", "ai"], "ो": ["o", "o"], "ौ": ["au", "au"], "ॉ": ["o", "ô"],
};
const D_MARK = { "ं": ["n", "ṃ"], "ँ": ["n", "m̐"], "ः": ["h", "ḥ"], "ऽ": ["", "'"] };
const NUKTA = "़";
const isCons = (ch) => D_CONS[ch] != null;

/**
 * Split text into syllable units: a consonant cluster with its vowel (matra, inherent "a", or none after halant),
 * an independent vowel, or any other character. Marks (ं ँ ः) attach to the unit before them.
 */
function units(text) {
  const ch = [...text.normalize("NFC")];
  const out = [];
  for (let i = 0; i < ch.length; i++) {
    let c = ch[i];
    if (ch[i + 1] === NUKTA && D_CONS[c + NUKTA]) { c += NUKTA; i++; }
    if (isCons(c)) {
      const cluster = [c];
      let vowel = "a";
      while (ch[i + 1] === HALANT) {
        let n = ch[i + 2];
        if (ch[i + 3] === NUKTA && D_CONS[n + NUKTA]) n += NUKTA;
        if (n && isCons(n)) { cluster.push(n); i += n.length === 2 ? 3 : 2; } else { vowel = ""; i++; break; }
      }
      if (vowel && D_MATRA[ch[i + 1]]) { vowel = ch[i + 1]; i++; }
      const u = { kind: "c", cluster, vowel, marks: "" };
      while (D_MARK[ch[i + 1]]) u.marks += ch[++i];
      out.push(u);
    } else if (D_VOW[c]) {
      const u = { kind: "v", v: c, marks: "" };
      while (D_MARK[ch[i + 1]]) u.marks += ch[++i];
      out.push(u);
    } else out.push({ kind: "x", c });
  }
  return out;
}

/** "नमस्ते दुनिया" → "namaste duniya" (hinglish) or "namaste duniyā" (iast). */
export function hindiToRoman(text, scheme = "hinglish") {
  const s = scheme === "iast" ? 1 : 0;
  const u = units(text);
  // Everyday Hinglish drops the silent inherent "a" (schwa) the way Hindi speakers pronounce words:
  //  • at the end of a word (राम → ram)
  //  • mid-word in the pattern vowel + C(a) + single consonant with a vowel (लगती → lagti, करना → karna),
  //    processed right to left; kept before clusters (नमस्ते → namaste) so no unpronounceable groups appear.
  if (!s) {
    const hasVowel = (x) => x && (x.kind === "v" || (x.kind === "c" && x.vowel && !x.drop));
    for (let start = 0; start < u.length; ) {
      if (u[start].kind === "x") { start++; continue; }
      let end = start;
      while (end + 1 < u.length && u[end + 1].kind !== "x") end++;
      const last = u[end];
      if (end > start && last.kind === "c" && last.vowel === "a" && !last.marks) last.drop = true;
      for (let i = end - 1; i > start; i--) {
        const x = u[i], prev = u[i - 1], next = u[i + 1];
        // no drop after a closed syllable (ज़िंदगी keeps "da") or inside a cluster (धन्यवाद keeps "nya")
        if (x.kind === "c" && x.vowel === "a" && !x.marks && x.cluster.length === 1 && hasVowel(prev) && !prev.marks && next.kind === "c" && next.cluster.length === 1 && hasVowel(next)) x.drop = true;
      }
      start = end + 1;
    }
  }
  let out = "";
  for (const x of u) {
    if (x.kind === "x") {
      if (x.c === "।" || x.c === "॥") out += ".";
      else { const d = DIGITS.indexOf(x.c); out += d >= 0 ? String(d) : x.c; }
      continue;
    }
    if (x.kind === "v") { out += D_VOW[x.v][s] + [...x.marks].map((m) => D_MARK[m][s]).join(""); continue; }
    // च्छ reads better as "cchh" than "chchh" in Hinglish (अच्छा → acchha)
    out += x.cluster.map((c, k) => (!s && c === "च" && x.cluster[k + 1] === "छ" ? "c" : D_CONS[c][s])).join("");
    if (x.vowel === "a") out += x.drop ? "" : "a";
    else if (x.vowel) out += D_MATRA[x.vowel][s];
    out += [...x.marks].map((m) => D_MARK[m][s]).join("");
  }
  return out;
}
