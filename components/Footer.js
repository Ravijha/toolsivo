import Link from "next/link";
import { Heart, Gamepad2, Facebook, Instagram, Youtube } from "lucide-react";
import Logo from "./Logo";
import { categories, tools, toolsIn } from "@/lib/tools";
import { games } from "@/lib/games";
import { SITE } from "@/lib/site";

// Lucide has no X logo, so it is drawn here
const XLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const SOCIALS = [
  { id: "facebook", name: "Facebook", Icon: Facebook },
  { id: "instagram", name: "Instagram", Icon: Instagram },
  { id: "x", name: "X (Twitter)", Icon: XLogo },
  { id: "youtube", name: "YouTube", Icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Logo size={34} showDomain />
            <p>{tools.length} free, fast and private online tools. Everything runs in your browser — your files never leave your device. Plus {games.length} free games in the <Link href="/games/" className="footer-games-link">Game Zone</Link>.</p>
            <div className="socials">
              <span className="socials-label">Follow Toolsivo</span>
              <div className="socials-row">
                {SOCIALS.map(({ id, name, Icon }) => (
                  <a key={id} href={SITE.socials[id]} className={`social social-${id}`} target="_blank" rel="noopener noreferrer me" aria-label={`Toolsivo on ${name}`} title={`Toolsivo on ${name}`}>
                    <Icon size={19} />
                  </a>
                ))}
              </div>
            </div>
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
          <div className="footer-games">
            <h4><Link href="/games/"><Gamepad2 size={16} /> Game Zone</Link></h4>
            <ul>
              {games.map((g) => (
                <li key={g.slug}><Link href={`/games/${g.slug}`}>{g.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Toolsivo.com — All rights reserved.</span>
          <span style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/tools">All tools</Link>
            <Link href="/games/">Game Zone</Link>
            <Link href="/about/">About</Link>
            <Link href="/contact/">Contact</Link>
            <Link href="/privacy/">Privacy Policy</Link>
            <Link href="/terms/">Terms &amp; Conditions</Link>
            <Link href="/licenses/">Licenses</Link>
            {/* <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Made with <Heart size={14} fill="#ff4d8d" color="#ff4d8d" /> in India</span> */}
          </span>
        </div>
      </div>
    </footer>
  );
}
