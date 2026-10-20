import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Zap, Gift, Lock } from "lucide-react";
import { tools, getTool, getCategory, toolsIn } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import ToolCard from "@/components/ToolCard";
import ToolRenderer from "@/components/ToolRenderer";

export const dynamicParams = false;
export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) return {};
  return {
    title: `${t.name} — Free Online Tool`,
    description: `${t.desc} Free, fast and private — runs entirely in your browser on Toolora.`,
    alternates: { canonical: `/tools/${t.slug}` },
  };
}

const howTo = {
  image: ["Drop your image(s) into the upload area or click to browse.", "Adjust the settings — the preview updates instantly.", "Download your result as a file, or all files as a ZIP."],
  design: ["Upload your image or start from the built-in options.", "Pick a preset, tweak framing, colours and text live.", "Download a ready-to-use, perfectly sized file."],
  pdf: ["Add your PDF file(s) — they stay on your device.", "Choose pages, order or options using the visual page grid.", "Click the action button and download your new PDF."],
  calculators: ["Enter your values in the form.", "Results and charts update instantly as you type.", "Tweak inputs to compare scenarios side by side."],
  developer: ["Paste your input or type directly in the editor.", "Pick the operation — results appear in real time.", "Copy the output to your clipboard or download it."],
  text: ["Paste or type your text into the editor.", "Choose the options you need — output updates live.", "Copy the result with one click or download as .txt."],
};

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) notFound();
  const c = getCategory(t.cat);
  const related = toolsIn(t.cat).filter((x) => x.slug !== t.slug).slice(0, 4);

  return (
    <>
      <section className="tool-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <ChevronRight size={14} />
            <Link href={`/category/${c.id}`}>{c.name}</Link> <ChevronRight size={14} />
            <span style={{ color: "var(--text)" }}>{t.name}</span>
          </nav>
          <div className="tool-title">
            <ToolIcon slug={t.slug} size={62} />
            <div>
              <h1>{t.name}</h1>
              <p>{t.desc}</p>
            </div>
          </div>
          <div className="trust">
            <span><ShieldCheck /> Files never leave your device</span>
            <span><Zap /> Instant results</span>
            <span><Gift /> 100% free</span>
            <span><Lock /> No sign-up</span>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="workspace" style={{ "--c": c.color }}>
          <ToolRenderer slug={t.slug} />
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h2>How to use the {t.name}</h2>
            <ol>{howTo[t.cat].map((s) => <li key={s}>{s}</li>)}</ol>
          </div>
          <div className="info-card">
            <h2>Private &amp; secure</h2>
            <div className="priv"><ShieldCheck size={18} /> Processing happens locally with JavaScript, Canvas and Web APIs.</div>
            <div className="priv"><ShieldCheck size={18} /> No uploads, no storage, no account. Close the tab and it is gone.</div>
            <div className="priv"><ShieldCheck size={18} /> Works on desktop and mobile in any modern browser.</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="toolbar">
            <h2 style={{ fontSize: "1.5rem" }}>More {c.name.toLowerCase()}</h2>
            <Link href={`/category/${c.id}`} className="btn btn-sm">View all →</Link>
          </div>
          <div className="tool-grid">
            {related.map((r, i) => <ToolCard key={r.slug} slug={r.slug} index={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}
