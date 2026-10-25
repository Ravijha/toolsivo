import { games } from "@/lib/games";
import GameExplorer from "@/components/GameExplorer";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: `Game Zone — ${games.length} Free Online Games, No Download`,
  description: `Play ${games.length} free online games in your browser: Snake, Brick Breaker, 2048, Sudoku, Chess Puzzles, Tic-Tac-Toe, Crossword, Memory Match and more. No sign-up, no download, works on mobile.`,
  path: "/games/",
  keywords: ["free online games", "browser games", "play games online free", "no download games", "puzzle games", "brain games", "arcade games", ...games.map((g) => g.name.toLowerCase())],
});

const floaters = ["snake", "chess-puzzles", "number-merge-2048", "space-shooter", "sudoku", "tic-tac-toe"];

export default function GamesPage() {
  return (
    <div className="container">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Toolsivo Game Zone",
          description: "Free online games that run in your browser.",
          url: abs("/games/"),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: games.length,
            itemListElement: games.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g.name, url: abs(`/games/${g.slug}/`) })),
          },
        }}
      />
      <section className="gz-hero">
        <div style={{ maxWidth: 640 }}>
          <div className="gz-badges" style={{ marginTop: 0, marginBottom: 16 }}><span>🎮 Game Zone</span></div>
          <h1>Play {games.length} free games, right in your browser</h1>
          <p>Arcade classics, brain teasers, puzzles and board games. No download, no sign-up and nothing to install. Just click and play on desktop or mobile.</p>
          <div className="gz-badges">
            <span>⚡ Instant play</span>
            <span>📱 Touch friendly</span>
            <span>🔒 No sign-up</span>
            <span>💯 100% free</span>
          </div>
        </div>
        <div className="gz-float" aria-hidden="true">
          {floaters.map((s, i) => {
            const g = games.find((x) => x.slug === s);
            const Icon = g.icon;
            return (
              <span key={s} style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})`, animationDelay: `${i * -0.8}s`, "--r": `${i % 2 ? 6 : -6}deg` }}>
                <Icon />
              </span>
            );
          })}
        </div>
      </section>
      <GameExplorer />
    </div>
  );
}
