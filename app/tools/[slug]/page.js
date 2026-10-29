import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ChevronDown, ShieldCheck, Zap, Gift, Lock } from "lucide-react";
import { tools, getTool, getCategory, toolsIn } from "@/lib/tools";
import { getToolContent } from "@/lib/content";
import { ToolIcon } from "@/components/ToolIcon";
import ToolCard from "@/components/ToolCard";
import ToolRenderer from "@/components/ToolRenderer";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta, fitDesc } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) return {};
  return pageMeta({
    // keep the full title within ~60 chars so Google doesn't cut it off
    title: t.name.length > 28 ? `${t.name} — Free Online` : `${t.name} — Free Online Tool`,
    description: fitDesc(t.desc, " Free, private, runs in your browser."),
    path: `/tools/${t.slug}/`,
    keywords: [t.name.toLowerCase(), `${t.name.toLowerCase()} online`, `free ${t.name.toLowerCase()}`, ...t.tags.split(" "), getCategory(t.cat).name.toLowerCase()],
  });
}

const appCategory = {
  image: "MultimediaApplication", design: "DesignApplication", media: "MultimediaApplication",
  developer: "DeveloperApplication", seo: "DeveloperApplication", office: "BusinessApplication", typing: "EducationalApplication",
};

function toolSchema(t, c, info) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...(info ? [{
        "@type": "FAQPage",
        mainEntity: info.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }] : []),
      {
        "@type": "WebApplication",
        name: t.name,
        url: abs(`/tools/${t.slug}/`),
        description: t.desc,
        applicationCategory: appCategory[c.id] || "UtilitiesApplication",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript. Works in all modern browsers.",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        publisher: { "@id": abs("/#organization") },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
          { "@type": "ListItem", position: 2, name: c.name, item: abs(`/category/${c.id}/`) },
          { "@type": "ListItem", position: 3, name: t.name, item: abs(`/tools/${t.slug}/`) },
        ],
      },
    ],
  };
}

const howTo = {
  image: ["Drop your image(s) into the upload area or click to browse.", "Adjust the settings — the preview updates instantly.", "Download your result as a file, or all files as a ZIP."],
  design: ["Upload your image or start from the built-in options.", "Pick a preset, tweak framing, colours and text live.", "Download a ready-to-use, perfectly sized file."],
  pdf: ["Add your PDF file(s) — they stay on your device.", "Choose pages, order or options using the visual page grid.", "Click the action button and download your new PDF."],
  calculators: ["Enter your values in the form.", "Results and charts update instantly as you type.", "Tweak inputs to compare scenarios side by side."],
  developer: ["Paste your input or type directly in the editor.", "Pick the operation — results appear in real time.", "Copy the output to your clipboard or download it."],
  seo: ["Enter your page details, URLs or rules.", "Previews and generated code update live as you type.", "Copy the code or download the file for your website."],
  media: ["Add your media file or enter the values.", "Inspect the details and adjust options instantly.", "Copy the result or download the converted files."],
  office: ["Fill in your details — everything updates in the live preview.", "Adjust the layout, colours and options until it looks right.", "Click Save as PDF / Print and choose “Save as PDF” in the print window."],
  utilities: ["Choose your file or enter your text — it stays on your device.", "Review the results and adjust options as needed.", "Copy, export or download what you need."],
  typing: ["Choose your test, level or typing mode.", "Start typing — speed, accuracy and conversion update live.", "Review your results or copy your text. Nothing is saved or uploaded."],
  text: ["Paste or type your text into the editor.", "Choose the options you need — output updates live.", "Copy the result with one click or download as .txt."],
};

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) notFound();
  const c = getCategory(t.cat);
  const related = toolsIn(t.cat).filter((x) => x.slug !== t.slug).slice(0, 4);
  const info = getToolContent(t.slug);

  return (
    <>
      <JsonLd data={toolSchema(t, c, info)} />
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

        {info && (
          <div className="info-card" style={{ marginTop: 20 }}>
            <h2>About the {t.name}</h2>
            <p style={{ color: "var(--text-2)", lineHeight: 1.7 }}>{info.about}</p>
          </div>
        )}
      </section>

      {info && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">FAQ</span>
              <h2>{t.name} — questions, answered</h2>
            </div>
            <div className="faq">
              {info.faq.map(([q, a], i) => (
                <details key={q} open={i === 0}>
                  <summary>{q} <ChevronDown size={18} /></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

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
