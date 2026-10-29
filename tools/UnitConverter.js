"use client";
import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Seg, Field, NumInput, CopyBtn, Msg, Stat } from "@/components/ui";

// Each unit: [id, label, factor to the category's base unit]
const CATS = {
  length: { name: "Length", base: "m", def: ["km", "mi", "10"], units: [
    ["nm", "Nanometre (nm)", 1e-9], ["um", "Micrometre (µm)", 1e-6], ["mm", "Millimetre (mm)", 1e-3], ["cm", "Centimetre (cm)", 1e-2],
    ["m", "Metre (m)", 1], ["km", "Kilometre (km)", 1e3], ["in", "Inch (in)", 0.0254], ["ft", "Foot (ft)", 0.3048],
    ["yd", "Yard / Gaj (yd)", 0.9144], ["mi", "Mile (mi)", 1609.344], ["nmi", "Nautical mile (nmi)", 1852], ["ly", "Light year (ly)", 9.4607304725808e15],
  ] },
  mass: { name: "Mass", base: "kg", def: ["kg", "lb", "1"], units: [
    ["ug", "Microgram (µg)", 1e-9], ["mg", "Milligram (mg)", 1e-6], ["g", "Gram (g)", 1e-3], ["kg", "Kilogram (kg)", 1],
    ["q", "Quintal (q)", 100], ["t", "Tonne (t)", 1000], ["ct", "Carat (ct)", 2e-4], ["tola", "Tola", 0.0116638038],
    ["oz", "Ounce (oz)", 0.028349523125], ["lb", "Pound (lb)", 0.45359237], ["st", "Stone (st)", 6.35029318],
    ["ust", "US ton (short)", 907.18474], ["ukt", "UK ton (long)", 1016.0469088],
  ] },
  volume: { name: "Volume", base: "L", def: ["l", "usgal", "1"], units: [
    ["ml", "Millilitre (mL)", 1e-3], ["cl", "Centilitre (cL)", 1e-2], ["l", "Litre (L)", 1], ["m3", "Cubic metre (m³)", 1000],
    ["cm3", "Cubic centimetre (cm³)", 1e-3], ["in3", "Cubic inch (in³)", 0.016387064], ["ft3", "Cubic foot (ft³)", 28.316846592],
    ["tsp", "Teaspoon (US)", 0.00492892159375], ["tbsp", "Tablespoon (US)", 0.01478676478125], ["floz", "Fluid ounce (US)", 0.0295735295625],
    ["cup", "Cup (US)", 0.2365882365], ["pt", "Pint (US)", 0.473176473], ["qt", "Quart (US)", 0.946352946],
    ["usgal", "Gallon (US)", 3.785411784], ["ukfloz", "Fluid ounce (UK)", 0.0284130625], ["ukgal", "Gallon (UK)", 4.54609],
    ["bbl", "Barrel (oil)", 158.987294928],
  ] },
  temperature: { name: "Temperature", base: "K", def: ["c", "f", "37"], units: [
    ["c", "Celsius (°C)"], ["f", "Fahrenheit (°F)"], ["k", "Kelvin (K)"], ["r", "Rankine (°R)"],
  ] },
  area: { name: "Area", base: "m²", def: ["m2", "ft2", "100"], units: [
    ["mm2", "Square millimetre (mm²)", 1e-6], ["cm2", "Square centimetre (cm²)", 1e-4], ["m2", "Square metre (m²)", 1],
    ["km2", "Square kilometre (km²)", 1e6], ["in2", "Square inch (in²)", 0.00064516], ["ft2", "Square foot (ft²)", 0.09290304],
    ["yd2", "Square yard / Gaj (yd²)", 0.83612736], ["ac", "Acre (ac)", 4046.8564224], ["ha", "Hectare (ha)", 1e4],
    ["mi2", "Square mile (mi²)", 2589988.110336],
  ] },
  speed: { name: "Speed", base: "m/s", def: ["kmh", "mph", "100"], units: [
    ["ms", "Metre per second (m/s)", 1], ["kmh", "Kilometre per hour (km/h)", 1 / 3.6], ["mph", "Mile per hour (mph)", 0.44704],
    ["fts", "Foot per second (ft/s)", 0.3048], ["kn", "Knot (kn)", 1852 / 3600], ["kms", "Kilometre per second (km/s)", 1000],
    ["mach", "Mach (sea level, 15 °C)", 340.29],
  ] },
  time: { name: "Time", base: "s", def: ["h", "min", "2.5"], units: [
    ["ns", "Nanosecond (ns)", 1e-9], ["us", "Microsecond (µs)", 1e-6], ["ms", "Millisecond (ms)", 1e-3], ["s", "Second (s)", 1],
    ["min", "Minute (min)", 60], ["h", "Hour (h)", 3600], ["d", "Day", 86400], ["wk", "Week", 604800],
    ["mo", "Month (average)", 2629746], ["yr", "Year (365.2425 days)", 31556952], ["dec", "Decade", 315569520], ["cen", "Century", 3155695200],
  ] },
  data: { name: "Data size", base: "byte", def: ["gb", "mib", "1"], units: [
    ["bit", "Bit (b)", 0.125], ["byte", "Byte (B)", 1],
    ["kb", "Kilobyte (KB = 1000 B)", 1e3], ["mb", "Megabyte (MB)", 1e6], ["gb", "Gigabyte (GB)", 1e9], ["tb", "Terabyte (TB)", 1e12], ["pb", "Petabyte (PB)", 1e15],
    ["kib", "Kibibyte (KiB = 1024 B)", 1024], ["mib", "Mebibyte (MiB)", 2 ** 20], ["gib", "Gibibyte (GiB)", 2 ** 30], ["tib", "Tebibyte (TiB)", 2 ** 40], ["pib", "Pebibyte (PiB)", 2 ** 50],
    ["kbit", "Kilobit (kb)", 125], ["mbit", "Megabit (Mb)", 125e3], ["gbit", "Gigabit (Gb)", 125e6],
  ] },
  pressure: { name: "Pressure", base: "Pa", def: ["psi", "bar", "32"], units: [
    ["pa", "Pascal (Pa)", 1], ["hpa", "Hectopascal (hPa)", 100], ["kpa", "Kilopascal (kPa)", 1e3], ["mpa", "Megapascal (MPa)", 1e6],
    ["bar", "Bar", 1e5], ["mbar", "Millibar (mbar)", 100], ["psi", "PSI (lbf/in²)", 6894.757293168], ["atm", "Atmosphere (atm)", 101325],
    ["torr", "Torr", 101325 / 760], ["mmhg", "mm of mercury (mmHg)", 133.322387415], ["inhg", "Inch of mercury (inHg)", 3386.389],
    ["kgcm2", "kgf/cm²", 98066.5],
  ] },
  energy: { name: "Energy", base: "J", def: ["kwh", "mj", "1"], units: [
    ["j", "Joule (J)", 1], ["kj", "Kilojoule (kJ)", 1e3], ["mj", "Megajoule (MJ)", 1e6], ["wh", "Watt-hour (Wh)", 3600],
    ["kwh", "Kilowatt-hour (kWh / unit)", 3.6e6], ["cal", "Calorie (cal)", 4.184], ["kcal", "Kilocalorie (kcal)", 4184],
    ["btu", "BTU", 1055.05585262], ["ftlb", "Foot-pound (ft·lbf)", 1.3558179483314004], ["ev", "Electronvolt (eV)", 1.602176634e-19],
    ["erg", "Erg", 1e-7], ["therm", "Therm (US)", 105480400],
  ] },
  land: { name: "Land (Bigha, Kattha)", base: "sq ft", def: ["bigha", "ft2", "1"] },
};

// Traditional land units differ by region — sq ft per Bigha and how it divides.
const REGIONS = {
  bihar: { name: "Bihar / Jharkhand", bigha: 27225, parts: [["kattha", "Kattha", 20], ["dhur", "Dhur", 20], ["dhurki", "Dhurki", 20]], note: "1 Bigha = 20 Kattha, 1 Kattha = 20 Dhur, 1 Dhur = 20 Dhurki" },
  bengal: { name: "West Bengal", bigha: 14400, parts: [["kattha", "Kattha", 20], ["chhatak", "Chhatak", 16]], note: "1 Bigha = 20 Kattha, 1 Kattha = 16 Chhatak" },
  assam: { name: "Assam", bigha: 14400, parts: [["kattha", "Katha", 5], ["lessa", "Lessa", 20]], note: "1 Bigha = 5 Katha, 1 Katha = 20 Lessa" },
  nepal: { name: "Nepal (Terai)", bigha: 72900, parts: [["kattha", "Kattha", 20], ["dhur", "Dhur", 20]], note: "1 Bigha = 20 Kattha, 1 Kattha = 20 Dhur" },
  custom: { name: "Custom", bigha: 27225, parts: [["kattha", "Kattha", 20], ["dhur", "Dhur", 20]], note: "1 Bigha = 20 Kattha, 1 Kattha = 20 Dhur" },
};

function landUnits(region, bighaSqft) {
  const r = REGIONS[region];
  const out = [["bigha", "Bigha", bighaSqft]];
  let size = bighaSqft;
  for (const [id, label, div] of r.parts) { size /= div; out.push([id, label, size]); }
  return [
    ...out,
    ["decimal", "Decimal / Cent", 435.6], ["guntha", "Guntha", 1089], ["ac", "Acre", 43560], ["ha", "Hectare", 107639.1041671],
    ["ft2", "Square feet (sq ft)", 1], ["m2", "Square metre (m²)", 10.763910416709722], ["yd2", "Square yard / Gaj", 9],
  ];
}

// Temperature is affine, so convert through Kelvin
const toK = { c: (v) => v + 273.15, f: (v) => (v - 32) * 5 / 9 + 273.15, k: (v) => v, r: (v) => v * 5 / 9 };
const fromK = { c: (v) => v - 273.15, f: (v) => (v - 273.15) * 9 / 5 + 32, k: (v) => v, r: (v) => v * 9 / 5 };

const clean = (n) => {
  if (!isFinite(n)) return "";
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a >= 1e15 || a < 1e-6) return n.toExponential(8).replace(/\.?0+e/, "e");
  return String(Number(n.toPrecision(12)));
};
const fmt = (n) => {
  const s = clean(n);
  if (!s || s.includes("e")) return s || "—";
  const [i, d] = s.split(".");
  return Number(i).toLocaleString("en-IN") + (d ? "." + d : "");
};

function Converter({ cat }) {
  const C = CATS[cat];
  const [fromId, setFrom] = useState(C.def[0]);
  const [toId, setTo] = useState(C.def[1]);
  const [val, setVal] = useState(C.def[2]);
  const [region, setRegion] = useState("bihar");
  const [custom, setCustom] = useState("27225");

  const bigha = region === "custom" ? +custom || 0 : REGIONS[region].bigha;
  const units = cat === "land" ? landUnits(region, bigha) : C.units;
  const has = (id) => units.some((u) => u[0] === id);
  // a region may not have every sub-unit (e.g. Dhur), so fall back to Bigha / sq ft
  const from = has(fromId) ? fromId : units[0][0];
  const to = has(toId) ? toId : "ft2";
  const label = (id) => units.find((u) => u[0] === id)?.[1] || id;

  const convert = (v, a, b) => {
    if (cat === "temperature") return fromK[b](toK[a](v));
    const fa = units.find((u) => u[0] === a)?.[2], fb = units.find((u) => u[0] === b)?.[2];
    return fa && fb ? (v * fa) / fb : NaN;
  };

  const n = parseFloat(val);
  const ok = val !== "" && isFinite(n);
  const belowZero = cat === "temperature" && ok && toK[from](n) < 0;
  const res = ok ? convert(n, from, to) : NaN;
  const swap = () => { setFrom(to); setTo(from); if (ok && isFinite(res)) setVal(clean(res)); };
  const sel = (v, set) => <select className="select" value={v} onChange={(e) => set(e.target.value)}>{units.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>;

  return (
    <div className="tool-cols">
      <div className="stack">
        {cat === "land" && (
          <div className="panel stack">
            <Field label="Region" hint={`${REGIONS[region].note}. 1 Bigha = ${fmt(bigha)} sq ft here. Bigha, Kattha and Dhur sizes vary by state and even district — check your local land records.`}>
              <Seg options={Object.entries(REGIONS).map(([value, r]) => ({ label: r.name, value }))} value={region} onChange={setRegion} />
            </Field>
            {region === "custom" && <Field label="1 Bigha in your area"><NumInput value={custom} onChange={setCustom} suffix="sq ft" min={0} /></Field>}
          </div>
        )}
        <div className="panel stack">
          <Field label="Value"><NumInput value={val} onChange={setVal} placeholder="Enter a number" /></Field>
          <div className="row" style={{ flexWrap: "nowrap", alignItems: "flex-end", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}><Field label="From">{sel(from, setFrom)}</Field></div>
            <button className="btn btn-icon" onClick={swap} title="Swap units" aria-label="Swap units"><ArrowLeftRight size={17} /></button>
            <div style={{ flex: 1, minWidth: 0 }}><Field label="To">{sel(to, setTo)}</Field></div>
          </div>
          {belowZero && <Msg type="bad">That is below absolute zero (−273.15 °C), which is not physically possible.</Msg>}
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th style={{ textAlign: "left" }}>Unit</th><th style={{ textAlign: "right" }}>{ok ? `${fmt(n)} ${label(from)} =` : "Value"}</th></tr></thead>
            <tbody>
              {units.map(([id, l]) => (
                <tr key={id} style={id === to ? { fontWeight: 700 } : undefined}>
                  <td style={{ textAlign: "left" }}>{l}</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{ok ? fmt(convert(n, from, id)) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="side">
        <div className="big-result">
          <span>{label(to)}</span>
          <strong>{ok ? fmt(res) : "—"}</strong>
          <small>{ok ? `${fmt(n)} ${label(from)}` : "Enter a value to convert"}</small>
        </div>
        <div className="row" style={{ justifyContent: "flex-end" }}><CopyBtn text={ok ? clean(res) : ""} label="Copy result" /></div>
        {cat !== "temperature" && (
          <div className="stats">
            <Stat label={`1 ${label(from)}`} value={fmt(convert(1, from, to))} sub={label(to)} />
            <Stat label={`1 ${label(to)}`} value={fmt(convert(1, to, from))} sub={label(from)} />
          </div>
        )}
        {cat === "data" && <small className="muted">KB, MB, GB use 1000 (as on drive boxes and in macOS). Windows shows sizes in KiB, MiB, GiB (1024) but labels them KB, MB, GB.</small>}
        {cat === "temperature" && <small className="muted">°F = °C × 9/5 + 32 · K = °C + 273.15</small>}
        {cat === "energy" && <small className="muted">One electricity “unit” on your bill is 1 kWh.</small>}
      </div>
    </div>
  );
}

const BASES = [
  ["bin", "Binary", 2, /^[01]+$/], ["oct", "Octal", 8, /^[0-7]+$/], ["dec", "Decimal", 10, /^\d+$/], ["hex", "Hexadecimal", 16, /^[0-9a-f]+$/i],
];

function parseBig(s, radix) {
  let n = 0n;
  const R = BigInt(radix);
  for (const ch of s.toLowerCase()) n = n * R + BigInt(parseInt(ch, 16));
  return n;
}
const group = (s, size, sep = " ") => s.replace(new RegExp(`\\B(?=(.{${size}})+$)`, "g"), sep);

function NumberBase() {
  const [base, setBase] = useState("dec");
  const [input, setInput] = useState("2026");

  const res = useMemo(() => {
    const [, name, radix, valid] = BASES.find((b) => b[0] === base);
    let s = input.trim().replace(/[\s_,]/g, "");
    const neg = s.startsWith("-");
    if (neg) s = s.slice(1);
    const pre = { bin: /^0b/i, oct: /^0o/i, hex: /^0x/i }[base];
    if (pre) s = s.replace(pre, "");
    if (!s) return null;
    if (!valid.test(s)) return { error: `“${input.trim()}” is not a valid ${name.toLowerCase()} number.` };
    const v = parseBig(s, radix);
    return { neg, v, bits: v === 0n ? 1 : v.toString(2).length };
  }, [input, base]);

  const out = (radix) => (res.neg && res.v !== 0n ? "-" : "") + res.v.toString(radix).toUpperCase();

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="panel stack">
          <Field label="Input number system"><Seg options={BASES.map(([value, label]) => ({ label, value }))} value={base} onChange={setBase} /></Field>
          <Field label="Number" hint="Whole numbers of any length. Spaces, underscores and 0b / 0o / 0x prefixes are ignored.">
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} style={{ fontFamily: "var(--mono)" }} />
          </Field>
        </div>
        {res?.error && <Msg type="bad">{res.error}</Msg>}
        {res && !res.error && (
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {BASES.map(([id, name, radix]) => {
                  const s = out(radix);
                  const shown = radix === 2 ? group(s, 4) : radix === 16 ? group(s, 4) : radix === 10 ? fmtBig(s) : s;
                  return (
                    <tr key={id} style={id === base ? { fontWeight: 700 } : undefined}>
                      <td style={{ textAlign: "left", whiteSpace: "nowrap" }}>{name} <small className="muted">(base {radix})</small></td>
                      <td style={{ textAlign: "left", fontFamily: "var(--mono)", overflowWrap: "anywhere" }}>{shown}</td>
                      <td style={{ width: 1 }}><CopyBtn text={s} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="side">
        <div className="big-result">
          <span>Hexadecimal</span>
          <strong style={{ fontFamily: "var(--mono)" }}>{res && !res.error ? (res.neg && res.v !== 0n ? "-0x" : "0x") + res.v.toString(16).toUpperCase() : "—"}</strong>
          <small>{res && !res.error ? `${res.bits} bits · ${Math.ceil(res.bits / 8)} byte${res.bits > 8 ? "s" : ""}` : "Enter a number"}</small>
        </div>
        <small className="muted">Example: 255 (decimal) = 11111111 (binary) = 377 (octal) = FF (hex).</small>
      </div>
    </div>
  );
}

function fmtBig(s) {
  const neg = s.startsWith("-");
  const d = neg ? s.slice(1) : s;
  // Indian grouping: last 3 digits, then pairs
  const g = d.length > 3 ? d.slice(0, -3).replace(/\B(?=(\d{2})+$)/g, ",") + "," + d.slice(-3) : d;
  return (neg ? "-" : "") + g;
}

const TABS = [...Object.entries(CATS).map(([value, c]) => ({ label: c.name, value })), { label: "Number system", value: "base" }];

export default function UnitConverter() {
  const [cat, setCat] = useState("length");
  return (
    <div className="stack">
      <Seg options={TABS} value={cat} onChange={setCat} />
      {cat === "base" ? <NumberBase /> : <Converter key={cat} cat={cat} />}
    </div>
  );
}
