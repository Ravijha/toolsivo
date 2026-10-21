import Link from "next/link";
import { ChevronRight, Mail, Clock, Lightbulb, Bug } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import JsonLd from "@/components/JsonLd";
import { SITE, abs, pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Contact Us",
  description: "Get in touch with the Toolsivo team. Send questions, bug reports, tool suggestions or business enquiries — we reply within 1–2 business days.",
  path: "/contact/",
  keywords: ["contact toolsivo", "toolsivo support", "toolsivo email", "feedback"],
});

const cards = [
  { icon: Mail, c: "#7c5cff", t: "Email us", d: <a href={`mailto:${SITE.email}`}>{SITE.email}</a> },
  { icon: Clock, c: "#00b3b0", t: "Response time", d: "We reply to every message within 1–2 business days (Mon–Fri, IST)." },
  { icon: Lightbulb, c: "#ff8a00", t: "Suggest a tool", d: "Missing something? Tell us what you’d like next — many tools started as user ideas." },
  { icon: Bug, c: "#f0543c", t: "Report a problem", d: "Include the tool name, your browser and what happened so we can fix it fast." },
];

export default function Contact() {
  return (
    <div className="container">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Toolsivo",
          url: abs("/contact/"),
          mainEntity: { "@id": abs("/#organization") },
        }}
      />
      <div className="doc-hero">
        <nav className="crumbs" aria-label="Breadcrumb" style={{ justifyContent: "center" }}>
          <Link href="/">Home</Link> <ChevronRight size={14} /> <span style={{ color: "var(--text)" }}>Contact</span>
        </nav>
        <span className="eyebrow" style={{ marginTop: 22 }}>Contact us</span>
        <h1>We’d love to <span className="grad-text">hear from you</span></h1>
        <p>Questions, feedback, partnership ideas or a bug to report — send us a message and a real person will get back to you.</p>
      </div>
      <div className="contact-grid">
        <div className="contact-info">
          {cards.map((x) => (
            <div key={x.t} className="contact-card">
              <span className="icon-soft" style={{ "--c": x.c }}><x.icon /></span>
              <div>
                <h3>{x.t}</h3>
                <p>{x.d}</p>
              </div>
            </div>
          ))}
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
