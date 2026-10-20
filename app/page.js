import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Gift, Infinity as InfinityIcon, Smartphone, Lock, ChevronDown, MousePointerClick, Wand2, Download } from "lucide-react";
import HeroCanvas from "@/components/HeroCanvas";
import HeroSearch from "@/components/HeroSearch";
import Spotlight from "@/components/Spotlight";
import ToolExplorer from "@/components/ToolExplorer";
import { CatIcon, ToolIcon } from "@/components/ToolIcon";
import { categories, tools, toolsIn } from "@/lib/tools";

const floaters = [
  { slug: "image-compressor", label: "-72% size", style: { top: "14%", left: "4%", "--r": "-4deg" } },
  { slug: "merge-pdf", label: "3 PDFs merged", style: { top: "56%", left: "1%", animationDelay: "-2s", "--r": "3deg" } },
  { slug: "emi-calculator", label: "EMI ₹21,247", style: { top: "12%", right: "3%", animationDelay: "-1s", "--r": "4deg" } },
  { slug: "json-formatter", label: "Valid JSON ✓", style: { top: "58%", right: "2%", animationDelay: "-3s", "--r": "-3deg" } },
];

const features = [
  { icon: ShieldCheck, c: "#00b37e", t: "Private by design", d: "Files are processed locally with Canvas and browser APIs. Nothing is uploaded to a server — ever." },
  { icon: Zap, c: "#ff8a00", t: "Lightning fast", d: "No queues, no waiting for uploads. Results appear in milliseconds, even for big batches." },
  { icon: Gift, c: "#e84bc7", t: "Free forever", d: "Every tool is free with no sign-up, no watermarks on your output and no daily limits." },
  { icon: InfinityIcon, c: "#7c5cff", t: "Batch friendly", d: "Convert, compress and rename dozens of files at once, then grab them all as a ZIP." },
  { icon: Smartphone, c: "#00a3ff", t: "Works everywhere", d: "Responsive on phones, tablets and desktops. Light and dark themes included." },
  { icon: Lock, c: "#f0543c", t: "No accounts", d: "Open a tool, do the task, download the result. That’s it — no emails, no tracking walls." },
];

const faqs = [
  { q: "Are my files uploaded anywhere?", a: "No. Every Toolsivo tool runs entirely in your browser using JavaScript, HTML Canvas and Web APIs. Your images, PDFs and text never leave your device." },
  { q: "Is Toolsivo really free?", a: "Yes. All 40+ tools are completely free to use with no sign-up, no hidden limits and no watermarks added to your files." },
  { q: "Which browsers are supported?", a: "Any modern browser — Chrome, Edge, Firefox, Safari and their mobile versions. For the best experience keep your browser up to date." },
  { q: "How accurate are the Indian tax and GST calculators?", a: "They follow the current published slabs and rates (FY 2025-26 for income tax). They’re great for planning, but always confirm final figures with a tax professional." },
  { q: "Can I use Toolsivo offline?", a: "Once a tool page has loaded, most tools keep working without a connection because all the processing happens on your device." },
];

export default function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <HeroCanvas />
        {floaters.map((f) => (
          <Link key={f.slug} href={`/tools/${f.slug}`} className="float-card" style={f.style}>
            <ToolIcon slug={f.slug} size={34} /> {f.label}
          </Link>
        ))}
        <div className="container hero-inner">
          <span className="pill"><b>NEW</b> {tools.length} free tools · 100% in your browser</span>
          <h1>
            Every tool you need.<br />
            <span className="grad-text">Zero uploads.</span>
          </h1>
          <p className="hero-sub">
            Edit images, wrangle PDFs, crunch numbers and format code — instantly, privately and beautifully. Pick a tool, do the task, download the result.
          </p>
          <HeroSearch />
          <div className="hero-tags">
            {["image-compressor", "merge-pdf", "passport-photo-maker", "gst-calculator", "json-formatter", "youtube-thumbnail-resizer"].map((s) => {
              const t = tools.find((x) => x.slug === s);
              return <Link key={s} href={`/tools/${s}`}>{t.name}</Link>;
            })}
          </div>
          <div className="hero-stats">
            <div><strong className="grad-text">{tools.length}+</strong><span>Powerful tools</span></div>
            <div><strong className="grad-text">0 MB</strong><span>Uploaded to servers</span></div>
            <div><strong className="grad-text">100%</strong><span>Free, no sign-up</span></div>
            <div><strong className="grad-text">&lt;1s</strong><span>Typical processing</span></div>
          </div>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Six toolkits, one place</span>
            <h2>Everything organised, beautifully</h2>
            <p>From quick image fixes to Indian salary maths, every toolkit is purpose-built for one job and does it well.</p>
          </div>
          <Spotlight className="cat-grid">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.id}`} className="cat-card" style={{ "--c": c.color }}>
                <CatIcon id={c.id} size={56} />
                <h3>{c.name}</h3>
                <p>{c.tagline}</p>
                <ul>
                  {toolsIn(c.id).slice(0, 4).map((t) => <li key={t.slug}>{t.name}</li>)}
                </ul>
                <div className="cat-foot">
                  <span className="cat-count">{toolsIn(c.id).length} tools</span>
                  <ArrowRight size={18} />
                </div>
              </Link>
            ))}
          </Spotlight>
        </div>
      </section>

      {/* ---------- All tools ---------- */}
      <section className="section" id="tools" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The toolbox</span>
            <h2>Find the right tool in a click</h2>
            <p>Filter by category or press <span className="kbd">Ctrl K</span> anywhere to jump straight to a tool.</p>
          </div>
          <ToolExplorer showSearch={false} />
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps. No learning curve.</h2>
          </div>
          <div className="steps">
            {[
              { i: MousePointerClick, t: "Pick a tool", d: "Search or browse 40+ focused tools across images, PDFs, calculators, code and text." },
              { i: Wand2, t: "Do the task", d: "Drop your file or type your input. Tweak settings with live, instant previews." },
              { i: Download, t: "Download", d: "Grab your result in one click — single files, or everything bundled as a ZIP." },
            ].map((s, n) => (
              <div className="step" key={s.t}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="step-num">0{n + 1}</span>
                  <span className="icon-soft" style={{ "--c": "#7c5cff" }}><s.i /></span>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why Toolsivo</span>
            <h2>Built to be fast, private and delightful</h2>
          </div>
          <div className="feat-grid">
            {features.map((f) => (
              <div className="feat" key={f.t}>
                <span className="icon-soft" style={{ "--c": f.c, "--s": "50px" }}><f.icon /></span>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="faq">
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q} <ChevronDown size={18} /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="cta">
            <h2>Ready to get things done?</h2>
            <p>Bookmark Toolsivo for the everyday jobs — resize, merge, calculate, format and download. No sign-up required.</p>
            <Link href="/tools" className="btn btn-lg">Browse all {tools.length} tools <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
