import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { SITE, pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Open-Source Licenses & Trademarks",
  description: "Open-source software, fonts and icons used by Toolsivo, their licenses, and trademark notices.",
  path: "/licenses/",
  keywords: ["toolsivo licenses", "open source notices", "third-party licenses"],
});

const ext = (href, text) => <a href={href} target="_blank" rel="noopener noreferrer">{text}</a>;

const MAIN = [
  ["Next.js & React", "Website framework", "MIT", "https://github.com/vercel/next.js"],
  ["PDF.js (Mozilla)", "PDF page rendering and compression", "Apache-2.0", "https://github.com/mozilla/pdf.js"],
  ["pdf-lib", "Merge, split, rotate and create PDFs", "MIT", "https://github.com/Hopding/pdf-lib"],
  ["Tesseract.js", "Image to Text (OCR) engine", "Apache-2.0", "https://github.com/naptha/tesseract.js"],
  ["Tesseract language data", "OCR language models (served from Toolsivo)", "Apache-2.0", "https://github.com/tesseract-ocr/tessdata_best"],
  ["node-qrcode", "QR code generation", "MIT", "https://github.com/soldair/node-qrcode"],
  ["music-metadata", "Audio metadata reading", "MIT", "https://github.com/Borewit/music-metadata"],
  ["gifuct-js", "GIF decoding", "MIT", "https://github.com/matt-way/gifuct-js"],
  ["Terser", "JavaScript minifier", "BSD-2-Clause", "https://github.com/terser/terser"],
  ["sql-formatter", "SQL formatting", "MIT", "https://github.com/sql-formatter-org/sql-formatter"],
  ["jsQR", "QR code reading", "Apache-2.0", "https://github.com/cozmo/jsQR"],
  ["Lucide", "Interface and game icons", "ISC", "https://github.com/lucide-icons/lucide"],
  ["Plus Jakarta Sans", "Interface font", "SIL Open Font License 1.1", "https://github.com/tokotype/PlusJakartaSans"],
  ["JetBrains Mono", "Code font", "SIL Open Font License 1.1", "https://github.com/JetBrains/JetBrainsMono"],
];

const sections = [
  {
    id: "original", title: "Our own work",
    body: <p>The Toolsivo name, logo, page designs, written content and the code that powers each tool were created for {SITE.name}. Every tool is our own implementation built on standard web technologies (JavaScript, HTML Canvas and Web APIs) together with the open-source components listed below.</p>,
  },
  {
    id: "games", title: "Game Zone",
    body: (
      <>
        <p>Every game in our <Link href="/games/">Game Zone</Link> is our own implementation, written for {SITE.name} without any third-party game engine, sprites, images, music or sound files:</p>
        <ul>
          <li><strong>Artwork</strong> — all characters, boards, pieces and scenes (including the Spot the Difference pictures) are drawn by our code with HTML Canvas, SVG and CSS. Icons come from Lucide (ISC license, listed below).</li>
          <li><strong>Sounds</strong> — generated live in your browser with the Web Audio API. No recorded audio is used.</li>
          <li><strong>Content</strong> — the chess puzzle positions, crossword clues, hangman and typing word lists, and pattern questions were written for {SITE.name}. Sudoku puzzles, mazes and mine fields are generated at random by our own code.</li>
          <li><strong>Emoji and symbols</strong> — the few emoji used (for example in Memory Match and Rock Paper Scissors) and the chess pieces (standard Unicode chess symbols) are shown with your device’s own fonts; we do not bundle any emoji or piece images.</li>
          <li><strong>Game ideas</strong> — the games are based on traditional or widely played game mechanics, which are not protected by copyright. We use generic descriptive names such as “Four in a Row”, “Memory Sequence” and “Mine Finder”, and our games are not affiliated with, endorsed by or sponsored by the makers of any similar commercial game.</li>
        </ul>
      </>
    ),
  },
  {
    id: "open-source", title: "Open-source components",
    body: (
      <>
        <p>We are grateful to the open-source community. These are the main components we use, each under a permissive license that allows free use, including commercial use, provided the notices are kept:</p>
        <div className="table-wrap" style={{ margin: "14px 0", maxHeight: "none" }}>
          <table className="table">
            <thead><tr><th>Component</th><th style={{ textAlign: "left" }}>Used for</th><th style={{ textAlign: "left" }}>License</th></tr></thead>
            <tbody>
              {MAIN.map(([n, use, lic, url]) => (
                <tr key={n}><td>{ext(url, n)}</td><td style={{ textAlign: "left", whiteSpace: "normal" }}>{use}</td><td style={{ textAlign: "left" }}>{lic}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>The complete list of every bundled component — with its copyright notice and full license text — is available in <a href={`${SITE.basePath}/third-party-licenses.txt`}>third-party-licenses.txt</a>. The OCR language data is served unmodified with its license in <a href={`${SITE.basePath}/tessdata/LICENSE.txt`}>tessdata/LICENSE.txt</a>.</p>
      </>
    ),
  },
  {
    id: "trademarks", title: "Trademark notices",
    body: (
      <>
        <p>“QR Code” is a registered trademark of DENSO WAVE INCORPORATED. “Sudoku” is a trademark of Nikoli Co., Ltd. in Japan.</p>
        <p>Google, YouTube, Google AdSense and Google Analytics are trademarks of Google LLC. Facebook, Instagram and WhatsApp are trademarks of Meta Platforms, Inc. X is a trademark of X Corp. LinkedIn, Microsoft, Outlook, Excel, SQL Server and GitHub are trademarks of the Microsoft group of companies. Apple and Apple Mail are trademarks of Apple Inc. Pinterest is a trademark of Pinterest, Inc. PDF is a trademark of Adobe. UPI is a trademark of the National Payments Corporation of India. Oracle and MySQL are trademarks of Oracle Corporation. Amazon Web Services, AWS and Redshift are trademarks of Amazon.com, Inc. PostgreSQL, MariaDB, Snowflake, BigQuery, Apache Spark, IBM Db2, GitLab and Notion are trademarks of their respective owners. All other product names, logos and brands are the property of their respective owners.</p>
        <p>These names are used only to describe which formats, sizes or platforms our tools and games work with. {SITE.name} is an independent service and is not affiliated with, endorsed by or sponsored by any of these companies.</p>
      </>
    ),
  },
  {
    id: "report", title: "Report a concern",
    body: <p>If you believe any content on {SITE.name} infringes your copyright or trademark, please email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with details and we will review it promptly. See also our <Link href="/terms/">Terms and Conditions</Link>.</p>,
  },
];

export default function Licenses() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Open-Source Licenses & Trademarks"
      intro="Toolsivo is built with care on top of trusted open-source software. Here’s what we use and how it’s licensed."
      sections={sections}
    />
  );
}
