export const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?~",
};
const SIMILAR = /[il1Lo0OI|]/g;

// Unbiased random integer in [0, n) using rejection sampling.
function randInt(n) {
  const max = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= max);
  return buf[0] % n;
}

export function generate({ length, upper, lower, digits, symbols, noSimilar }) {
  const pools = Object.entries({ upper, lower, digits, symbols })
    .filter(([, on]) => on)
    .map(([k]) => (noSimilar ? SETS[k].replace(SIMILAR, "") : SETS[k]));
  if (!pools.length) return "";
  const all = pools.join("");
  // guarantee at least one character from every chosen set, then shuffle
  const chars = pools.map((p) => p[randInt(p.length)]);
  while (chars.length < length) chars.push(all[randInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, length).join("");
}

const COMMON = new Set(
  "123456 password 12345678 qwerty 123456789 12345 1234 111111 1234567 dragon 123123 baseball abc123 football monkey letmein 696969 shadow master 666666 qwertyuiop 123321 mustang 1234567890 michael 654321 superman 1qaz2wsx 7777777 121212 000000 qazwsx 123qwe killer trustno1 jordan jennifer zxcvbnm asdfgh hunter buster soccer harley batman andrew tigger sunshine iloveyou 2000 charlie robert thomas hockey ranger daniel starwars klaster 112233 george computer michelle jessica pepper 1111 zxcvbn 555555 11111111 131313 freedom 777777 pass maggie 159753 aaaaaa ginger princess joshua cheese amanda summer love ashley nicole chelsea biteme matthew access yankees 987654321 dallas austin thunder taylor matrix admin welcome india india123 password1 password123 qwerty123 admin123 welcome1"
    .split(" "),
);
const SEQS = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl", "zxcvbnm", "1qaz2wsx3edc"];

/** Rough strength estimate: charset entropy minus penalties for common patterns. */
export function strength(pw) {
  if (!pw) return { bits: 0, score: 0, label: "—", crack: "—", tips: [] };
  const tips = [];
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26; else tips.push("Add lowercase letters");
  if (/[A-Z]/.test(pw)) pool += 26; else tips.push("Add uppercase letters");
  if (/\d/.test(pw)) pool += 10; else tips.push("Add numbers");
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33; else tips.push("Add symbols");
  let bits = pw.length * Math.log2(pool || 1);

  const lower = pw.toLowerCase();
  if (COMMON.has(lower) || COMMON.has(lower.replace(/[^a-z0-9]/g, ""))) { bits = Math.min(bits, 8); tips.unshift("This is one of the most common passwords"); }
  const repeats = (pw.match(/(.)\1{2,}/g) || []).join("").length;
  if (repeats) { bits -= repeats * 2.5; tips.push("Avoid repeated characters"); }
  let seq = 0;
  for (const s of SEQS) for (let i = 0; i + 3 <= lower.length; i++) {
    const chunk = lower.slice(i, i + 3);
    if (s.includes(chunk) || s.includes([...chunk].reverse().join(""))) seq++;
  }
  if (seq) { bits -= seq * 3; tips.push("Avoid sequences like abc, 123 or qwerty"); }
  if (/^(19|20)\d{2}$/.test(pw.slice(-4)) || /\d{2}[-/.]?\d{2}[-/.]?(19|20)\d{2}/.test(pw)) { bits -= 8; tips.push("Avoid dates and years"); }
  if (pw.length < 12) tips.push("Use at least 12 characters");
  bits = Math.max(0, Math.round(bits));

  // offline attack at 10 billion guesses per second, average case = half the space
  const seconds = Math.pow(2, bits) / 2 / 1e10;
  const score = bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
  return { bits, score, label: ["Very weak", "Weak", "Fair", "Strong", "Very strong"][score], crack: humanTime(seconds), tips: [...new Set(tips)].slice(0, 4) };
}

function humanTime(s) {
  if (s < 1) return "instantly";
  const units = [["centuries", 3.15e9], ["years", 3.15e7], ["months", 2.6e6], ["days", 86400], ["hours", 3600], ["minutes", 60], ["seconds", 1]];
  for (const [u, n] of units) if (s >= n) {
    const v = s / n;
    if (u === "centuries" && v > 1e6) return "longer than the age of the universe";
    return `${v >= 100 ? Math.round(v).toLocaleString("en-IN") : v.toFixed(1)} ${u}`;
  }
}
