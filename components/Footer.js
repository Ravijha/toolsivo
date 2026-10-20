import Link from "next/link";
import { Heart } from "lucide-react";
import Logo from "./Logo";
import { categories, toolsIn } from "@/lib/tools";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Logo size={34} showDomain />
            <p>40+ free, fast and private online tools. Everything runs in your browser — your files never leave your device.</p>
          </div>
          {categories.map((c) => (
            <div key={c.id}>
              <h4><Link href={`/category/${c.id}`}>{c.short}</Link></h4>
              <ul>
                {toolsIn(c.id).map((t) => (
                  <li key={t.slug}><Link href={`/tools/${t.slug}`}>{t.name}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Toolora.com — All rights reserved.</span>
          <span style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <Link href="/tools">All tools</Link>
            <Link href="/privacy">Privacy</Link>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Made with <Heart size={14} fill="#ff4d8d" color="#ff4d8d" /> in India</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
