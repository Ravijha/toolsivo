import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Gift, Lock, Smartphone, Zap } from "lucide-react";
import { games, getGame, gameCategories } from "@/lib/games";
import GameRenderer from "@/components/GameRenderer";
import GameCard from "@/components/GameCard";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = getGame(slug);
  if (!g) return {};
  return pageMeta({
    title: `${g.name} — Play Free Online`,
    description: `${g.desc} Free, no download and no sign-up on Toolsivo Game Zone.`,
    path: `/games/${g.slug}/`,
    keywords: [g.name.toLowerCase(), `${g.name.toLowerCase()} online`, `play ${g.name.toLowerCase()} free`, ...g.tags.split(" "), "free online games"],
  });
}

export default async function GamePage({ params }) {
  const { slug } = await params;
  const g = getGame(slug);
  if (!g) notFound();
  const c = gameCategories.find((x) => x.id === g.cat);
  const Icon = g.icon;
  const more = [...games.filter((x) => x.cat === g.cat && x.slug !== g.slug), ...games.filter((x) => x.cat !== g.cat)].slice(0, 4);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": ["VideoGame", "WebApplication"],
              name: g.name,
              url: abs(`/games/${g.slug}/`),
              description: g.desc,
              genre: c.name,
              gamePlatform: "Web browser",
              applicationCategory: "GameApplication",
              operatingSystem: "Any (web browser)",
              isAccessibleForFree: true,
              offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
              publisher: { "@id": abs("/#organization") },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
                { "@type": "ListItem", position: 2, name: "Game Zone", item: abs("/games/") },
                { "@type": "ListItem", position: 3, name: g.name, item: abs(`/games/${g.slug}/`) },
              ],
            },
          ],
        }}
      />
      <section className="tool-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> <ChevronRight size={14} />
            <Link href="/games">Game Zone</Link> <ChevronRight size={14} />
            <span style={{ color: "var(--text)" }}>{g.name}</span>
          </nav>
          <div className="tool-title">
            <span style={{ width: 62, height: 62, flex: "none", borderRadius: 18, display: "grid", placeItems: "center", color: "#fff", background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})`, boxShadow: `0 12px 24px -12px ${g.colors[1]}` }}>
              <Icon size={30} />
            </span>
            <div>
              <h1>{g.name}</h1>
              <p>{g.desc}</p>
            </div>
          </div>
          <div className="trust">
            <span><Zap /> Instant play</span>
            <span><Smartphone /> Works on mobile</span>
            <span><Gift /> 100% free</span>
            <span><Lock /> No sign-up</span>
          </div>
        </div>
      </section>

      <section className="container">
        <GameRenderer slug={g.slug} />

        <div className="info-grid">
          <div className="info-card">
            <h2>How to play {g.name}</h2>
            <ol>{g.how.map((s) => <li key={s}>{s}</li>)}</ol>
          </div>
          <div className="info-card">
            <h2>Free &amp; fair</h2>
            <div className="priv"><Gift size={18} /> Free to play with no sign-up, downloads or in-game purchases.</div>
            <div className="priv"><Lock size={18} /> Nothing is saved: scores last only while this page is open.</div>
            <div className="priv"><Smartphone size={18} /> Keyboard, mouse and touch controls on desktop and mobile.</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="toolbar">
            <h2 style={{ fontSize: "1.5rem" }}>More games to play</h2>
            <Link href="/games" className="btn btn-sm">All games →</Link>
          </div>
          <div className="gz-grid">
            {more.map((m, i) => <GameCard key={m.slug} slug={m.slug} index={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}
