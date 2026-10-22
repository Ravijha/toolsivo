import Link from "next/link";
import { ShieldCheck, Zap, Gift } from "lucide-react";
import LegalPage from "@/components/LegalPage";
import { CatIcon } from "@/components/ToolIcon";
import { categories, tools, toolsIn } from "@/lib/tools";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "About Us",
  description: "Toolsivo builds fast, free and private online tools for images, PDFs, calculations, code and text — all running securely in your browser.",
  path: "/about/",
  keywords: ["about toolsivo", "free online tools", "privacy-first tools"],
});

const values = [
  { icon: ShieldCheck, c: "#00b37e", t: "Privacy first", d: "Your files are processed on your device and never uploaded." },
  { icon: Zap, c: "#ff8a00", t: "Fast & focused", d: "Each tool does one job well, with instant results." },
  { icon: Gift, c: "#e84bc7", t: "Free for everyone", d: "No sign-up, no watermarks, no daily limits." },
];

const sections = [
  {
    id: "mission", title: "Our mission",
    body: (
      <>
        <p>Toolsivo was created to make everyday digital tasks quick, simple and safe. Too many online tools force you to upload private documents, sign up for an account or wait in a queue. We believed there was a better way.</p>
        <p>Using modern browser technology — JavaScript, HTML Canvas and Web APIs — every Toolsivo tool works directly on your device. That means your photos, PDFs and text stay private, and results appear in seconds.</p>
        <div className="doc-cards">
          {values.map((v) => (
            <div key={v.t} className="panel">
              <span className="icon-soft" style={{ "--c": v.c }}><v.icon /></span>
              <h3>{v.t}</h3>
              <p style={{ fontSize: ".9rem" }}>{v.d}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "offer", title: "What we offer",
    body: (
      <>
        <p>Toolsivo offers {tools.length} free tools across {categories.length} collections:</p>
        <div className="doc-cards">
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.id}/`} className="panel" style={{ display: "flex", gap: 12, alignItems: "center", fontWeight: 400 }}>
              <CatIcon id={c.id} size={40} />
              <span><strong style={{ color: "var(--text)" }}>{c.name}</strong><br /><small className="muted">{toolsIn(c.id).length} tools</small></span>
            </Link>
          ))}
        </div>
        <p>From compressing images and making passport photos to merging PDFs, calculating GST, EMI and take-home salary, formatting JSON or generating colour palettes — Toolsivo covers the tasks people do every day.</p>
      </>
    ),
  },
  {
    id: "who", title: "Who we build for",
    body: <p>Students preparing documents, professionals handling paperwork, small business owners working out GST, developers who need a quick formatter, and creators designing thumbnails and social graphics. If you need to get a small job done well, Toolsivo is for you.</p>,
  },
  {
    id: "free", title: "How Toolsivo stays free",
    body: <p>Toolsivo is free to use and may be supported by non-intrusive advertising. Ads never have access to the files you process, because those never leave your device. Read our <Link href="/privacy/">Privacy Policy</Link> and <Link href="/terms/">Terms and Conditions</Link> for details.</p>,
  },
  {
    id: "feedback", title: "We’d love your feedback",
    body: <p>Have an idea for a new tool, found a bug, or want to say hello? <Link href="/contact/">Get in touch</Link> — we read every message.</p>,
  },
];

export default function About() {
  return (
    <LegalPage
      eyebrow="About Toolsivo"
      title="Simple tools. Serious privacy."
      intro="We build free, fast online tools that respect your privacy — so you can get things done without uploading a single file."
      sections={sections}
      updated={null}
    />
  );
}
