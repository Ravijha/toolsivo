import Link from "next/link";
import { getGame, gameCategories } from "@/lib/games";

export default function GameCard({ slug, index = 0 }) {
  const g = getGame(slug);
  const c = gameCategories.find((x) => x.id === g.cat);
  const Icon = g.icon;
  return (
    <Link href={`/games/${g.slug}`} className="gz-card" style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}>
      <div className="gz-art" style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }}>
        {g.hot && <span className="gz-hot">🔥 HOT</span>}
        <Icon />
        <span className="gz-play">▶ Play</span>
      </div>
      <div className="gz-body">
        <h3>{g.name}</h3>
        <p>{g.short}</p>
        <span className="gz-tag" style={{ color: c.color }}>{c.name}</span>
      </div>
    </Link>
  );
}
