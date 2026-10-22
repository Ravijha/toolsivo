"use client";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Field, Seg, NumInput, Stat, Toggle, CopyBtn, inr } from "@/components/ui";

let uid = 0;
const person = (name) => ({ id: ++uid, name });

export default function SplitBill() {
  const [mode, setMode] = useState("equal");
  const [total, setTotal] = useState("2840");
  const [count, setCount] = useState("4");
  const [tax, setTax] = useState("5");
  const [service, setService] = useState("0");
  const [tip, setTip] = useState("10");
  const [roundUp, setRoundUp] = useState(true);
  const [people, setPeople] = useState(() => ["Aarav", "Diya", "Kabir", "Meera"].map(person));
  const [items, setItems] = useState(() => [
    { id: ++uid, name: "Paneer tikka", price: "420", who: [1, 2, 3, 4] },
    { id: ++uid, name: "Butter chicken", price: "520", who: [1, 3] },
    { id: ++uid, name: "Dal makhani", price: "360", who: [2, 4] },
    { id: ++uid, name: "Naan basket", price: "240", who: [1, 2, 3, 4] },
    { id: ++uid, name: "Mocktail", price: "220", who: [2] },
  ]);

  const extra = ((+tax || 0) + (+service || 0) + (+tip || 0)) / 100;

  const res = useMemo(() => {
    if (mode === "equal") {
      const t = (+total || 0) * (1 + extra), n = Math.max(1, Math.round(+count || 1));
      const each = roundUp ? Math.ceil(t / n) : t / n;
      return { grand: t, each, rows: null };
    }
    const owe = Object.fromEntries(people.map((p) => [p.id, 0]));
    let sub = 0;
    for (const it of items) {
      const price = +it.price || 0, who = it.who.filter((id) => owe[id] != null);
      sub += price;
      if (who.length) who.forEach((id) => (owe[id] += price / who.length));
    }
    const rows = people.map((p) => ({ ...p, sub: owe[p.id], amt: owe[p.id] * (1 + extra) })).map((r) => ({ ...r, amt: roundUp ? Math.ceil(r.amt) : r.amt }));
    return { grand: sub * (1 + extra), sub, rows, unassigned: items.filter((i) => !i.who.some((id) => owe[id] != null)).length };
  }, [mode, total, count, extra, roundUp, people, items]);

  const summary = mode === "equal"
    ? `Bill: ${inr(res.grand, 2)} incl. tax & tip\nSplit ${count} ways = ${inr(res.each, roundUp ? 0 : 2)} each`
    : `Bill: ${inr(res.grand, 2)} incl. tax & tip\n` + res.rows.map((r) => `${r.name}: ${inr(r.amt, roundUp ? 0 : 2)}`).join("\n");
  const toggleWho = (itemId, pid) => setItems((I) => I.map((i) => (i.id === itemId ? { ...i, who: i.who.includes(pid) ? i.who.filter((x) => x !== pid) : [...i.who, pid] } : i)));

  return (
    <div className="tool-cols wide-side">
      <div className="stack">
        <Seg options={[{ label: "Split equally", value: "equal" }, { label: "Split by items", value: "items" }]} value={mode} onChange={setMode} />
        {mode === "equal" ? (
          <>
            <div className="big-result"><span>Each person pays</span><strong>{inr(res.each, roundUp ? 0 : 2)}</strong><small>Total {inr(res.grand, 2)} split {count} ways</small></div>
            <div className="grid-2">
              <Field label="Bill amount (before tax & tip)"><NumInput value={total} onChange={setTotal} prefix="₹" /></Field>
              <Field label="Number of people"><NumInput value={count} onChange={setCount} min={1} /></Field>
            </div>
          </>
        ) : (
          <>
            <div className="panel stack">
              <div className="panel-title">People</div>
              <div className="row" style={{ gap: 6 }}>
                {people.map((p) => (
                  <span key={p.id} className="chip" style={{ paddingRight: 6 }}>
                    <input value={p.name} onChange={(e) => setPeople((P) => P.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))} style={{ border: 0, background: "none", width: Math.max(40, p.name.length * 8), outline: 0, fontWeight: 600 }} aria-label="Name" />
                    <button className="btn btn-sm btn-ghost btn-icon" style={{ height: 22, width: 22 }} onClick={() => setPeople((P) => P.filter((x) => x.id !== p.id))} disabled={people.length < 2} aria-label="Remove person"><X size={12} /></button>
                  </span>
                ))}
                <button className="btn btn-sm" onClick={() => setPeople((P) => [...P, person(`Person ${P.length + 1}`)])}><Plus size={14} /> Person</button>
              </div>
            </div>
            <div className="panel stack">
              <div className="panel-title">Items — tap names to choose who shared each item</div>
              {items.map((it) => (
                <div key={it.id} className="stack" style={{ gap: 6, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                  <div className="row" style={{ flexWrap: "nowrap" }}>
                    <input className="input" value={it.name} onChange={(e) => setItems((I) => I.map((x) => (x.id === it.id ? { ...x, name: e.target.value } : x)))} placeholder="Item" />
                    <div style={{ width: 130, flex: "none" }}><NumInput value={it.price} onChange={(v) => setItems((I) => I.map((x) => (x.id === it.id ? { ...x, price: v } : x)))} prefix="₹" /></div>
                    <button className="btn btn-icon btn-ghost btn-danger" onClick={() => setItems((I) => I.filter((x) => x.id !== it.id))} aria-label="Remove item"><X size={16} /></button>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    {people.map((p) => <button key={p.id} className={`chip ${it.who.includes(p.id) ? "active" : ""}`} style={{ padding: "4px 10px", fontSize: ".8rem" }} onClick={() => toggleWho(it.id, p.id)}>{p.name}</button>)}
                  </div>
                </div>
              ))}
              <button className="btn btn-sm" onClick={() => setItems((I) => [...I, { id: ++uid, name: "", price: "", who: people.map((p) => p.id) }])}><Plus size={15} /> Add item</button>
            </div>
          </>
        )}
      </div>
      <div className="side">
        {mode === "items" && (
          <div className="panel stack">
            <div className="panel-title">Who pays what</div>
            {res.rows.map((r) => (
              <div key={r.id} className="row" style={{ justifyContent: "space-between" }}><span>{r.name}</span><b style={{ fontSize: "1.1rem" }}>{inr(r.amt, roundUp ? 0 : 2)}</b></div>
            ))}
            <div className="row" style={{ justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 8 }}><span className="muted">Bill total</span><b>{inr(res.grand, 2)}</b></div>
            {res.unassigned > 0 && <small style={{ color: "var(--bad)" }}>{res.unassigned} item(s) aren’t assigned to anyone.</small>}
          </div>
        )}
        <div className="panel stack">
          <div className="grid-3">
            <Field label="GST / tax %"><NumInput value={tax} onChange={setTax} /></Field>
            <Field label="Service %"><NumInput value={service} onChange={setService} /></Field>
            <Field label="Tip %"><NumInput value={tip} onChange={setTip} /></Field>
          </div>
          <Toggle label="Round up to whole rupees" checked={roundUp} onChange={setRoundUp} />
        </div>
        {mode === "equal" && <div className="stats"><Stat label="Tax + service + tip" value={inr(res.grand - (+total || 0), 2)} /></div>}
        <CopyBtn text={summary} label="Copy summary (for WhatsApp)" className="btn" />
      </div>
    </div>
  );
}
