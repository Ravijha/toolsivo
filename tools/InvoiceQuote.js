"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, X, RotateCcw, ImagePlus } from "lucide-react";
import { Field, Seg, NumInput, Msg, Toggle } from "@/components/ui";
import PrintDoc, { esc, nl2br, usePersist } from "@/components/PrintDoc";

const CUR = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "AED ", SGD: "S$" };
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const fmtDate = (d) => (d ? new Date(d + "T00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "");

// Amount in words, Indian numbering (lakh / crore)
const ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const TENS = "  twenty thirty forty fifty sixty seventy eighty ninety".split(" ");
function words(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + words(n % 100) : "");
  for (const [v, name] of [[1e7, "crore"], [1e5, "lakh"], [1e3, "thousand"]])
    if (n >= v) return words(Math.floor(n / v)) + " " + name + (n % v ? " " + words(n % v) : "");
  return "";
}
function amountWords(x, currency) {
  const whole = Math.floor(x), frac = Math.round((x - whole) * 100);
  const unit = currency === "INR" ? ["rupees", "paise"] : ["", "cents"];
  const s = `${words(whole)} ${unit[0]}${frac ? ` and ${words(frac)} ${unit[1]}` : ""} only`.replace(/\s+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

let uid = 0;
const item = (desc = "", qty = 1, rate = 0, tax = 18, code = "") => ({ id: ++uid, desc, code, qty, rate, tax });

export default function InvoiceQuote({ kind = "invoice" }) {
  const isInv = kind === "invoice";
  const [seller, setSeller] = usePersist("toolsivo-doc-seller", {
    name: "Your Business Name", address: "123, Business Street\nMumbai, Maharashtra 400001", gstin: "", email: "billing@yourbusiness.com", phone: "+91 98765 43210",
    bank: "Bank: HDFC Bank\nA/c No: 000000000000\nIFSC: HDFC0000000", upi: "", logo: "", color: "#4f46e5", layout: "modern", signature: "",
  });
  const [counter, setCounter] = usePersist(`toolsivo-${kind}-no`, 1);
  const [buyer, setBuyer] = useState({ name: "Client Company Pvt Ltd", address: "45, Client Road\nBengaluru, Karnataka 560001", gstin: "", email: "" });
  const [meta, setMeta] = useState({ no: "", date: today(), due: addDays(today(), isInv ? 15 : 30), place: "", currency: "INR", taxMode: "cgst" });
  const [items, setItems] = useState([item("Website design & development", 1, 45000, 18, "998314"), item("Annual hosting & maintenance", 1, 12000, 18, "998315")]);
  const [discount, setDiscount] = useState("0");
  const [shipping, setShipping] = useState("0");
  const [notes, setNotes] = useState(isInv ? "Thank you for your business!" : "We look forward to working with you.");
  const [terms, setTerms] = useState(isInv ? "Payment due within 15 days of the invoice date.\nPlease quote the invoice number with your payment." : "Prices are valid until the date shown above.\n50% advance on confirmation, balance on delivery.");
  const [showBank, setShowBank] = useState(isInv);

  const prefix = isInv ? "INV" : "QT";
  useEffect(() => { setMeta((m) => ({ ...m, no: `${prefix}-${new Date().getFullYear()}-${String(counter).padStart(4, "0")}` })); }, [counter, prefix]);

  const S = (set) => (k) => (e) => set((s) => ({ ...s, [k]: e.target.value }));
  const sSet = S(setSeller), bSet = S(setBuyer), mSet = S(setMeta);
  const upItem = (id, k, v) => setItems((I) => I.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
  const sym = CUR[meta.currency];
  const money = (n) => sym + Number(n || 0).toLocaleString(meta.currency === "INR" ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const t = useMemo(() => {
    const rows = items.map((i) => ({ ...i, amount: (+i.qty || 0) * (+i.rate || 0) }));
    const sub = rows.reduce((s, r) => s + r.amount, 0);
    const disc = Math.min(sub, +discount || 0);
    // spread a flat discount proportionally so each line's tax is on its discounted value
    const k = sub ? (sub - disc) / sub : 1;
    const tax = meta.taxMode === "none" ? 0 : rows.reduce((s, r) => s + (r.amount * k * (+r.tax || 0)) / 100, 0);
    const total = sub - disc + tax + (+shipping || 0);
    return { rows, sub, disc, tax, total };
  }, [items, discount, shipping, meta.taxMode]);

  const logoUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setSeller((s) => ({ ...s, logo: r.result }));
    r.readAsDataURL(f);
  };

  // GSTIN: 2-digit state code + PAN + entity number + Z + checksum character
  const gstin = seller.gstin.trim().toUpperCase();
  const gstOk = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin);
  const c = seller.color;
  const modern = seller.layout === "modern";
  const showTaxCol = meta.taxMode !== "none";
  const html = `
<div class="page">
  <div class="head">
    <div>
      ${seller.logo ? `<img src="${seller.logo}" class="logo" alt="">` : ""}
      <h2 class="sname">${esc(seller.name)}</h2>
      <p class="muted">${nl2br(seller.address)}</p>
      ${seller.gstin ? `<p class="muted"><b>GSTIN:</b> ${esc(seller.gstin)}</p>` : ""}
      <p class="muted">${[seller.email, seller.phone].filter(Boolean).map(esc).join(" · ")}</p>
    </div>
    <div class="right">
      <h1 class="title">${isInv ? (meta.taxMode !== "none" && gstOk ? "TAX INVOICE" : "INVOICE") : "QUOTATION"}</h1>
      <table class="meta">
        <tr><td>${isInv ? "Invoice" : "Quote"} no.</td><td><b>${esc(meta.no)}</b></td></tr>
        <tr><td>Date</td><td>${fmtDate(meta.date)}</td></tr>
        ${meta.due ? `<tr><td>${isInv ? "Due date" : "Valid until"}</td><td>${fmtDate(meta.due)}</td></tr>` : ""}
        ${meta.place ? `<tr><td>Place of supply</td><td>${esc(meta.place)}</td></tr>` : ""}
      </table>
    </div>
  </div>
  <div class="bill">
    <div class="label">${isInv ? "Bill to" : "Prepared for"}</div>
    <h3>${esc(buyer.name)}</h3>
    <p class="muted">${nl2br(buyer.address)}</p>
    ${buyer.gstin ? `<p class="muted"><b>GSTIN:</b> ${esc(buyer.gstin)}</p>` : ""}
    ${buyer.email ? `<p class="muted">${esc(buyer.email)}</p>` : ""}
  </div>
  <table class="items">
    <thead><tr><th style="width:5%">#</th><th>Description</th>${t.rows.some((r) => r.code) ? "<th>HSN/SAC</th>" : ""}<th class="r">Qty</th><th class="r">Rate</th>${showTaxCol ? '<th class="r">GST</th>' : ""}<th class="r">Amount</th></tr></thead>
    <tbody>
      ${t.rows.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.desc)}</td>${t.rows.some((x) => x.code) ? `<td>${esc(r.code)}</td>` : ""}<td class="r">${esc(r.qty)}</td><td class="r">${money(r.rate)}</td>${showTaxCol ? `<td class="r">${+r.tax || 0}%</td>` : ""}<td class="r">${money(r.amount)}</td></tr>`).join("")}
    </tbody>
  </table>
  <div class="sum">
    <div class="words">
      <div class="label">Amount in words</div>
      <p>${esc(amountWords(t.total, meta.currency))}</p>
    </div>
    <table class="totals">
      <tr><td>Subtotal</td><td class="r">${money(t.sub)}</td></tr>
      ${t.disc ? `<tr><td>Discount</td><td class="r">− ${money(t.disc)}</td></tr>` : ""}
      ${meta.taxMode === "cgst" ? `<tr><td>CGST</td><td class="r">${money(t.tax / 2)}</td></tr><tr><td>SGST</td><td class="r">${money(t.tax / 2)}</td></tr>` : ""}
      ${meta.taxMode === "igst" ? `<tr><td>IGST</td><td class="r">${money(t.tax)}</td></tr>` : ""}
      ${+shipping ? `<tr><td>Shipping</td><td class="r">${money(shipping)}</td></tr>` : ""}
      <tr class="grand"><td>Total</td><td class="r">${money(t.total)}</td></tr>
    </table>
  </div>
  <div class="foot">
    <div>
      ${showBank && (seller.bank || seller.upi) ? `<div class="label">Payment details</div><p class="muted">${nl2br(seller.bank)}${seller.upi ? `<br><b>UPI:</b> ${esc(seller.upi)}` : ""}</p>` : ""}
      ${terms ? `<div class="label" style="margin-top:12px">Terms & conditions</div><p class="muted">${nl2br(terms)}</p>` : ""}
      ${notes ? `<p class="note">${nl2br(notes)}</p>` : ""}
    </div>
    <div class="sign">
      <div class="line"></div>
      <p>${esc(seller.signature || "Authorised signatory")}</p>
      <p class="muted">For ${esc(seller.name)}</p>
    </div>
  </div>
</div>`;

  const css = `
.head{display:flex;justify-content:space-between;gap:24px;${modern ? `background:${c};color:#fff;margin:-16mm -16mm 0;padding:14mm 16mm 10mm;` : `border-bottom:3px solid ${c};padding-bottom:16px;`}}
.head .muted{${modern ? "color:rgba(255,255,255,.85)" : ""}}
.logo{max-height:56px;max-width:180px;margin-bottom:8px;${modern ? "background:#fff;padding:4px;border-radius:6px;" : ""}}
.sname{font-size:16pt;margin-bottom:4px}
.right{text-align:right}
.title{font-size:22pt;letter-spacing:.06em;margin-bottom:8px;${modern ? "" : `color:${c};`}}
.meta td{padding:2px 0 2px 14px;font-size:9.5pt}
.muted{color:#5b6070;font-size:9.5pt}
.label{font-size:8pt;text-transform:uppercase;letter-spacing:.1em;color:${c};font-weight:700;margin-bottom:4px}
.bill{margin:20px 0 16px}
.bill h3{font-size:12pt;margin-bottom:2px}
.items th{background:${modern ? c : "#f2f3f7"};color:${modern ? "#fff" : "#333"};text-align:left;font-size:8.5pt;text-transform:uppercase;letter-spacing:.04em;padding:8px}
.items td{padding:8px;border-bottom:1px solid #e6e8ef;vertical-align:top}
.r{text-align:right}
.sum{display:flex;justify-content:space-between;gap:24px;margin-top:14px}
.words{flex:1;padding-top:6px}
.totals{width:45%}
.totals td{padding:5px 8px}
.totals .grand td{font-size:13pt;font-weight:800;border-top:2px solid ${c};color:${c};padding-top:8px}
.foot{display:flex;justify-content:space-between;gap:30px;margin-top:28px;align-items:flex-end}
.note{margin-top:14px;font-style:italic;color:#333}
.sign{text-align:center;min-width:170px}
.sign .line{border-top:1px solid #999;margin-bottom:6px;height:40px}
`;

  return (
    <div className="tool-cols wide-side">
      <PrintDoc html={html} css={css} title={`${meta.no} - ${buyer.name}`} label={`Save ${isInv ? "invoice" : "quotation"} as PDF / Print`} />
      <div className="side" style={{ position: "static" }}>
        <div className="panel stack">
          <div className="panel-title">Your business <small style={{ textTransform: "none", letterSpacing: 0 }}>(remembered on this device)</small></div>
          <Field label="Business name"><input className="input" value={seller.name} onChange={sSet("name")} /></Field>
          <Field label="Address"><textarea className="textarea prose" style={{ minHeight: 64 }} value={seller.address} onChange={sSet("address")} /></Field>
          <div className="grid-2">
            <Field label="GSTIN (optional)"><input className="input" value={seller.gstin} onChange={sSet("gstin")} placeholder="22AAAAA0000A1Z5" maxLength={15} /></Field>
            <Field label="Phone"><input className="input" value={seller.phone} onChange={sSet("phone")} /></Field>
          </div>
          <Field label="Email"><input className="input" value={seller.email} onChange={sSet("email")} /></Field>
          <div className="row">
            <label className="btn btn-sm" style={{ cursor: "pointer" }}><ImagePlus size={15} /> {seller.logo ? "Change logo" : "Add logo"}<input type="file" accept="image/*" onChange={logoUpload} hidden /></label>
            {seller.logo && <button className="btn btn-sm btn-ghost" onClick={() => setSeller((s) => ({ ...s, logo: "" }))}>Remove</button>}
            <input type="color" value={seller.color} onChange={sSet("color")} title="Accent colour" />
            <Seg options={[{ label: "Modern", value: "modern" }, { label: "Classic", value: "classic" }]} value={seller.layout} onChange={(v) => setSeller((s) => ({ ...s, layout: v }))} />
          </div>
        </div>

        <div className="panel stack">
          <div className="panel-title">{isInv ? "Bill to" : "Client"}</div>
          <Field label="Client name"><input className="input" value={buyer.name} onChange={bSet("name")} /></Field>
          <Field label="Address"><textarea className="textarea prose" style={{ minHeight: 64 }} value={buyer.address} onChange={bSet("address")} /></Field>
          <div className="grid-2">
            <Field label="GSTIN (optional)"><input className="input" value={buyer.gstin} onChange={bSet("gstin")} maxLength={15} /></Field>
            <Field label="Email (optional)"><input className="input" value={buyer.email} onChange={bSet("email")} /></Field>
          </div>
        </div>

        <div className="panel stack">
          <div className="panel-title">{isInv ? "Invoice" : "Quotation"} details</div>
          <div className="grid-2">
            <Field label={isInv ? "Invoice number" : "Quote number"}><input className="input" value={meta.no} onChange={mSet("no")} /></Field>
            <Field label="Currency">
              <select className="select" value={meta.currency} onChange={mSet("currency")}>{Object.keys(CUR).map((k) => <option key={k}>{k}</option>)}</select>
            </Field>
            <Field label="Date"><input type="date" className="input" value={meta.date} onChange={mSet("date")} /></Field>
            <Field label={isInv ? "Due date" : "Valid until"}><input type="date" className="input" value={meta.due} onChange={mSet("due")} /></Field>
          </div>
          <Field label="Tax">
            <Seg options={[{ label: "CGST + SGST", value: "cgst" }, { label: "IGST", value: "igst" }, { label: "No tax", value: "none" }]} value={meta.taxMode} onChange={(v) => setMeta((m) => ({ ...m, taxMode: v }))} />
          </Field>
          {meta.taxMode !== "none" && <Field label="Place of supply (optional)"><input className="input" value={meta.place} onChange={mSet("place")} placeholder="e.g. Karnataka (29)" /></Field>}
        </div>

        <div className="panel stack">
          <div className="panel-title">Items</div>
          {items.map((i) => (
            <div key={i.id} className="stack" style={{ gap: 6, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
              <div className="row" style={{ flexWrap: "nowrap" }}>
                <input className="input" value={i.desc} onChange={(e) => upItem(i.id, "desc", e.target.value)} placeholder="Item or service" />
                <button className="btn btn-icon btn-ghost btn-danger" onClick={() => setItems((I) => I.filter((x) => x.id !== i.id))} disabled={items.length < 2} aria-label="Remove item"><X size={16} /></button>
              </div>
              <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <NumInput value={i.qty} onChange={(v) => upItem(i.id, "qty", v)} suffix="qty" />
                <NumInput value={i.rate} onChange={(v) => upItem(i.id, "rate", v)} prefix={sym.trim()} />
                <input className="input" value={i.code} onChange={(e) => upItem(i.id, "code", e.target.value)} placeholder="HSN/SAC (optional)" />
                {meta.taxMode !== "none" ? (
                  <select className="select" value={i.tax} onChange={(e) => upItem(i.id, "tax", e.target.value)}>{[0, 0.25, 3, 5, 12, 18, 28, 40].map((r) => <option key={r} value={r}>GST {r}%</option>)}</select>
                ) : <span />}
              </div>
            </div>
          ))}
          <button className="btn btn-sm" onClick={() => setItems((I) => [...I, item("", 1, 0, I[I.length - 1]?.tax ?? 18)])}><Plus size={15} /> Add item</button>
          <div className="grid-2">
            <Field label="Discount (flat)"><NumInput value={discount} onChange={setDiscount} prefix={sym.trim()} /></Field>
            <Field label="Shipping / other"><NumInput value={shipping} onChange={setShipping} prefix={sym.trim()} /></Field>
          </div>
        </div>

        <div className="panel stack">
          <Toggle label="Show payment details" checked={showBank} onChange={setShowBank} />
          {showBank && (
            <>
              <Field label="Bank details"><textarea className="textarea prose" style={{ minHeight: 70 }} value={seller.bank} onChange={sSet("bank")} /></Field>
              <Field label="UPI ID (optional)"><input className="input" value={seller.upi} onChange={sSet("upi")} placeholder="yourname@bank" /></Field>
            </>
          )}
          <Field label="Terms & conditions"><textarea className="textarea prose" style={{ minHeight: 70 }} value={terms} onChange={(e) => setTerms(e.target.value)} /></Field>
          <Field label="Note"><input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <Field label="Signatory name (optional)"><input className="input" value={seller.signature} onChange={sSet("signature")} placeholder="Authorised signatory" /></Field>
        </div>

        <div className="row">
          <button className="btn btn-sm" onClick={() => setCounter((n) => n + 1)}><Plus size={15} /> Next number</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setCounter(1)}><RotateCcw size={15} /> Reset numbering</button>
        </div>
        {meta.taxMode !== "none" && !gstOk && (
          <Msg type="bad">{gstin
            ? "This GSTIN doesn’t look valid (15 characters, e.g. 27ABCDE1234F1Z5). Please check it."
            : `Only GST-registered businesses may charge GST. Add your GSTIN above, or choose “No tax” if you are not registered. Until then the document is titled “${isInv ? "Invoice" : "Quotation"}”, not “Tax Invoice”.`}</Msg>
        )}
        <Msg>{isInv
          ? "You are responsible for the accuracy of your invoices and for meeting GST rules (e.g. GSTIN, HSN/SAC and place of supply when required). This tool does not file anything with the GST portal."
          : "Quotations are estimates for your client. Check prices, taxes and validity before sending."}</Msg>
      </div>
    </div>
  );
}
