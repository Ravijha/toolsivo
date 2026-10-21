import Link from "next/link";
import { ChevronRight, CalendarDays, Mail } from "lucide-react";
import { SITE } from "@/lib/site";

/** Shared layout for Privacy, Terms and About: hero, sticky table of contents, article body. */
export default function LegalPage({ eyebrow, title, intro, sections, updated = SITE.updated, children }) {
  return (
    <div className="container">
      <div className="doc-hero">
        <nav className="crumbs" aria-label="Breadcrumb" style={{ justifyContent: "center" }}>
          <Link href="/">Home</Link> <ChevronRight size={14} /> <span style={{ color: "var(--text)" }}>{title}</span>
        </nav>
        <span className="eyebrow" style={{ marginTop: 22 }}>{eyebrow}</span>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
        {updated && <span className="doc-updated"><CalendarDays size={15} /> Last updated: {updated}</span>}
      </div>
      <div className="doc-grid">
        {sections?.length > 0 && (
          <aside className="doc-toc">
            <div className="panel-title">On this page</div>
            <ol>
              {sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
            </ol>
          </aside>
        )}
        <article className="doc">
          {children}
          {sections?.map((s) => (
            <section key={s.id} id={s.id}>
              <h2>{s.title}</h2>
              {s.body}
            </section>
          ))}
          <div className="doc-contact">
            <Mail size={20} />
            <div>
              <strong>Questions about this page?</strong>
              <p>Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or use our <Link href="/contact/">contact form</Link>. We usually reply within 1–2 business days.</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
