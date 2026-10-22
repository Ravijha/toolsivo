"use client";
import { useState } from "react";
import { Field, Seg, NumInput, Stat, Toggle, inr } from "@/components/ui";

const PRESETS = [["Petrol", 105], ["Diesel", 92], ["CNG (per kg)", 80]];

export default function FuelCost() {
  const [mode, setMode] = useState("trip");
  const [dist, setDist] = useState("350");
  const [unit, setUnit] = useState("km");
  const [eff, setEff] = useState("15");
  const [effUnit, setEffUnit] = useState("kmpl");
  const [price, setPrice] = useState("105");
  const [round, setRound] = useState(false);
  const [people, setPeople] = useState("1");
  const [tolls, setTolls] = useState("0");
  const [days, setDays] = useState("22");

  const km = (+dist || 0) * (unit === "mi" ? 1.60934 : 1) * (mode === "trip" && round ? 2 : 1) * (mode === "commute" ? 2 * (+days || 0) : 1);
  const e = +eff || 0;
  // litres needed for the distance, whichever efficiency unit was chosen
  const litres = !e ? 0 : effUnit === "kmpl" ? km / e : effUnit === "l100" ? (km * e) / 100 : km / (e * 0.425144);
  const fuel = litres * (+price || 0);
  const total = fuel + (+tolls || 0);
  const n = Math.max(1, Math.round(+people || 1));

  return (
    <div className="tool-cols">
      <div className="stack">
        <div className="big-result">
          <span>{mode === "trip" ? "Total trip cost" : "Monthly commute cost"}</span>
          <strong>{inr(total)}</strong>
          <small>{litres.toFixed(1)} litres of fuel for {Math.round(km).toLocaleString("en-IN")} km</small>
        </div>
        <div className="stats">
          <Stat label="Fuel cost" value={inr(fuel)} />
          <Stat label="Fuel needed" value={`${litres.toFixed(2)} L`} />
          <Stat label="Cost per km" value={km ? `₹${(fuel / km).toFixed(2)}` : "—"} />
          {n > 1 && <Stat hl label="Per person" value={inr(total / n)} sub={`split ${n} ways`} />}
          {mode === "commute" && <Stat label="Per year" value={inr(total * 12)} />}
        </div>
      </div>
      <div className="side">
        <div className="panel stack">
          <Seg options={[{ label: "Single trip", value: "trip" }, { label: "Daily commute", value: "commute" }]} value={mode} onChange={setMode} />
          <Field label={mode === "trip" ? "Distance" : "One-way distance"}>
            <div className="row" style={{ flexWrap: "nowrap" }}><NumInput value={dist} onChange={setDist} /><Seg options={[{ label: "km", value: "km" }, { label: "miles", value: "mi" }]} value={unit} onChange={setUnit} /></div>
          </Field>
          {mode === "trip" ? <Toggle label="Return journey (round trip)" checked={round} onChange={setRound} /> : <Field label="Working days per month"><NumInput value={days} onChange={setDays} /></Field>}
          <Field label="Vehicle mileage">
            <div className="row" style={{ flexWrap: "nowrap" }}><NumInput value={eff} onChange={setEff} /><Seg options={[{ label: "km/l", value: "kmpl" }, { label: "L/100km", value: "l100" }, { label: "mpg", value: "mpg" }]} value={effUnit} onChange={setEffUnit} /></div>
          </Field>
          <Field label="Fuel price (per litre)" hint="Prices vary by city and day — enter today’s local price">
            <NumInput value={price} onChange={setPrice} prefix="₹" />
          </Field>
          <div className="seg">{PRESETS.map(([n2, p]) => <button key={n2} onClick={() => setPrice(String(p))}>{n2} ~₹{p}</button>)}</div>
          <div className="grid-2">
            <Field label="Tolls & parking"><NumInput value={tolls} onChange={setTolls} prefix="₹" /></Field>
            <Field label="Split between"><NumInput value={people} onChange={setPeople} suffix="people" min={1} /></Field>
          </div>
        </div>
      </div>
    </div>
  );
}
