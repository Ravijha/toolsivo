// Safe arithmetic expression evaluator (no eval). Supports + − × ÷ ^ %, !, parentheses,
// implicit multiplication (2π, 3(4)), constants π e, and functions sin cos tan asin acos atan sqrt cbrt log ln abs exp.

const FUNCS = ["asin", "acos", "atan", "sinh", "cosh", "tanh", "sin", "cos", "tan", "sqrt", "cbrt", "log", "ln", "abs", "exp"];

function tokenize(src) {
  const s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/√/g, "sqrt").replace(/π/g, "pi").replace(/\s+/g, "");
  const out = [];
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    const num = rest.match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
    if (num) { out.push({ t: "num", v: parseFloat(num[0]) }); i += num[0].length; continue; }
    const fn = FUNCS.find((f) => rest.toLowerCase().startsWith(f));
    if (fn) { out.push({ t: "fn", v: fn }); i += fn.length; continue; }
    if (/^pi/i.test(rest)) { out.push({ t: "num", v: Math.PI }); i += 2; continue; }
    if (rest[0] === "e") { out.push({ t: "num", v: Math.E }); i += 1; continue; }
    if ("+-*/^%!()".includes(rest[0])) { out.push({ t: rest[0] }); i++; continue; }
    throw new Error(`Unexpected “${rest[0]}”`);
  }
  return out;
}

function fact(n) {
  if (n < 0 || !Number.isInteger(n)) throw new Error("Factorial needs a whole number ≥ 0");
  if (n > 170) return Infinity;
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

export function evaluate(src, { deg = true } = {}) {
  const tk = tokenize(src);
  let p = 0;
  const peek = () => tk[p];
  const eat = (t) => { if (tk[p]?.t !== t) throw new Error(t === ")" ? "Missing )" : `Expected ${t}`); p++; };
  const toRad = (x) => (deg ? (x * Math.PI) / 180 : x);
  const fromRad = (x) => (deg ? (x * 180) / Math.PI : x);
  const clean = (x) => (Math.abs(x) < 1e-12 ? 0 : x);

  function expr() {
    let a = term();
    while (peek() && (peek().t === "+" || peek().t === "-")) {
      const op = tk[p++].t;
      const b = term();
      // calculator-style percent: 200 + 10% = 220
      const bv = b.pct ? (a.v * b.v) : b.v;
      a = { v: op === "+" ? a.v + bv : a.v - bv };
    }
    return a;
  }
  function term() {
    let a = unary();
    for (;;) {
      const t = peek();
      if (t && (t.t === "*" || t.t === "/")) {
        p++;
        const b = unary();
        if (t.t === "/" && b.v === 0) throw new Error("Cannot divide by zero");
        a = { v: t.t === "*" ? a.v * b.v : a.v / b.v };
      } else if (t && (t.t === "num" || t.t === "fn" || t.t === "(")) {
        a = { v: a.v * unary().v }; // implicit multiplication
      } else return a;
    }
  }
  function unary() {
    if (peek()?.t === "-") { p++; const r = unary(); return { v: -r.v, pct: r.pct }; }
    if (peek()?.t === "+") { p++; return unary(); }
    return power();
  }
  function power() {
    const base = postfix();
    if (peek()?.t === "^") { p++; const e = unary(); return { v: Math.pow(base.v, e.v) }; }
    return base;
  }
  function postfix() {
    let r = primary();
    while (peek() && (peek().t === "!" || peek().t === "%")) {
      if (tk[p++].t === "!") r = { v: fact(r.v) };
      else r = { v: r.v / 100, pct: true };
    }
    return r;
  }
  function primary() {
    const t = tk[p];
    if (!t) throw new Error("Incomplete expression");
    if (t.t === "num") { p++; return { v: t.v }; }
    if (t.t === "(") { p++; const r = expr(); if (peek()?.t === ")") p++; return { v: r.v }; } // tolerate a missing final )
    if (t.t === "fn") {
      p++;
      const x = (peek()?.t === "(" ? (p++, (() => { const r = expr(); if (peek()?.t === ")") p++; return r; })()) : power()).v;
      switch (t.v) {
        case "sin": return { v: clean(Math.sin(toRad(x))) };
        case "cos": return { v: clean(Math.cos(toRad(x))) };
        case "tan": { if (deg && Math.abs(((x % 180) + 180) % 180 - 90) < 1e-9) throw new Error("tan is undefined here"); return { v: clean(Math.tan(toRad(x))) }; }
        case "asin": return { v: fromRad(Math.asin(x)) };
        case "acos": return { v: fromRad(Math.acos(x)) };
        case "atan": return { v: fromRad(Math.atan(x)) };
        case "sinh": return { v: Math.sinh(x) };
        case "cosh": return { v: Math.cosh(x) };
        case "tanh": return { v: Math.tanh(x) };
        case "sqrt": if (x < 0) throw new Error("Square root of a negative number"); return { v: Math.sqrt(x) };
        case "cbrt": return { v: Math.cbrt(x) };
        case "log": if (x <= 0) throw new Error("log needs a positive number"); return { v: Math.log10(x) };
        case "ln": if (x <= 0) throw new Error("ln needs a positive number"); return { v: Math.log(x) };
        case "abs": return { v: Math.abs(x) };
        case "exp": return { v: Math.exp(x) };
      }
    }
    throw new Error(t.t === ")" ? "Unexpected )" : `Unexpected ${t.t}`);
  }

  const r = expr();
  if (p < tk.length) throw new Error(`Unexpected ${tk[p].t === "num" ? "number" : tk[p].t}`);
  if (Number.isNaN(r.v)) throw new Error("Not a number");
  return r.v;
}

/** Tidy floating-point noise (0.1 + 0.2 → 0.3) and switch to scientific notation for huge/tiny numbers. */
export function formatNumber(v) {
  if (!Number.isFinite(v)) return v > 0 ? "∞" : v < 0 ? "−∞" : "Error";
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e15 || a < 1e-9)) return v.toExponential(8).replace(/\.?0+e/, "e");
  return String(parseFloat(v.toPrecision(14)));
}
