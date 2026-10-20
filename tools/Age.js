"use client";
import { useEffect, useState } from "react";
import { Cake } from "lucide-react";
import { Field, Stat, Msg, num } from "@/components/ui";
import { parseDate, toInput, today, ymd, dayDiff, weekday, pretty } from "@/lib/dates";

const zodiac = [
  ["Capricorn", 1, 19], ["Aquarius", 2, 18], ["Pisces", 3, 20], ["Aries", 4, 19], ["Taurus", 5, 20], ["Gemini", 6, 20],
  ["Cancer", 7, 22], ["Leo", 8, 22], ["Virgo", 9, 22], ["Libra", 10, 22], ["Scorpio", 11, 21], ["Sagittarius", 12, 21], ["Capricorn", 12, 31],
];
const signOf = (d) => zodiac.find(([, m, day]) => d.getMonth() + 1 < m || (d.getMonth() + 1 === m && d.getDate() <= day))[0];

export default function Age() {
  const [dob, setDob] = useState("1995-08-15");
  const [asOf, setAsOf] = useState("");
  useEffect(() => setAsOf(toInput(today())), []);

  const a = parseDate(dob), b = parseDate(asOf);
  if (!asOf) return null;
  const valid = a && b && a <= b;
  const age = valid && ymd(a, b);
  const days = valid && dayDiff(a, b);
  let next = valid && new Date(b.getFullYear(), a.getMonth(), a.getDate());
  if (valid && next < b) next = new Date(b.getFullYear() + 1, a.getMonth(), a.getDate());
  const toNext = valid && dayDiff(b, next);
  const isBirthday = valid && toNext === 0;

  return (
    <div className="tool-cols">
      <div className="stack">
        {valid ? (
          <>
            <div className="big-result">
              <span>Your age</span>
              <strong>{age.y} <small style={{ fontSize: "1.1rem" }}>years</small> {age.m} <small style={{ fontSize: "1.1rem" }}>months</small> {age.d} <small style={{ fontSize: "1.1rem" }}>days</small></strong>
              <small>Born on a {weekday(a)} · {signOf(a)}</small>
            </div>
            {isBirthday && <Msg type="ok"><Cake size={16} style={{ display: "inline" }} /> Happy birthday! 🎉</Msg>}
            <div className="stats">
              <Stat label="Total months" value={num(age.y * 12 + age.m, 0)} />
              <Stat label="Total weeks" value={num(Math.floor(days / 7), 0)} />
              <Stat label="Total days" value={num(days, 0)} />
              <Stat label="Total hours" value={num(days * 24, 0)} />
              <Stat label="Total minutes" value={num(days * 1440, 0)} />
              <Stat hl label="Next birthday" value={isBirthday ? "Today!" : `${toNext} days`} sub={pretty(next)} />
            </div>
          </>
        ) : (
          <Msg type="bad">Date of birth must be on or before the “age on” date.</Msg>
        )}
      </div>
      <div className="side">
        <div className="panel stack">
          <Field label="Date of birth"><input type="date" className="input" value={dob} max={asOf} onChange={(e) => setDob(e.target.value)} /></Field>
          <Field label="Age on"><input type="date" className="input" value={asOf} onChange={(e) => setAsOf(e.target.value)} /></Field>
          <button className="btn btn-sm" onClick={() => setAsOf(toInput(today()))}>Reset to today</button>
        </div>
      </div>
    </div>
  );
}
