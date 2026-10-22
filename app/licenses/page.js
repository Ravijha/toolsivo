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
  ["Tesseract language data", "OCR language models (downloaded at use)", "Apache-2.0", "https://github.com/tesseract-ocr/tessdata"],
  ["node-qrcode", "QR code generation", "MIT", "https://github.com/soldair/node-qrcode"],
  ["music-metadata", "Audio metadata reading", "MIT", "https://github.com/Borewit/music-metadata"],
  ["gifuct-js", "GIF decoding", "MIT", "https://github.com/matt-way/gifuct-js"],
  ["Terser", "JavaScript minifier", "BSD-2-Clause", "https://github.com/terser/terser"],
  ["sql-formatter", "SQL formatting", "MIT", "https://github.com/sql-formatter-org/sql-formatter"],
  ["jsQR", "QR code reading", "Apache-2.0", "https://github.com/cozmo/jsQR"],
  ["Lucide", "Interface icons", "ISC", "https://github.com/lucide-icons/lucide"],
  ["Plus Jakarta Sans", "Interface font", "SIL Open Font License 1.1", "https://github.com/tokotype/PlusJakartaSans"],
  ["JetBrains Mono", "Code font", "SIL Open Font License 1.1", "https://github.com/JetBrains/JetBrainsMono"],
];

const sections = [
  {
    id: "original", title: "Our own work",
    body: <p>The Toolsivo name, logo, page designs, written content and the code that powers each tool were created for {SITE.name}. Every tool is our own implementation built on standard web technologies (JavaScript, HTML Canvas and Web APIs) together with the open-source components listed below.</p>,
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
        <p>The complete list of every bundled component — with its copyright notice and full license text — is available in <a href={`${SITE.basePath}/third-party-licenses.txt`}>third-party-licenses.txt</a>.</p>
      </>
    ),
  },
  {
    id: "trademarks", title: "Trademark notices",
    body: (
      <>
        <p>“QR Code” is a registered trademark of DENSO WAVE INCORPORATED.</p>
        <p>Google, YouTube, Google AdSense and Google Analytics are trademarks of Google LLC. Facebook, Instagram and WhatsApp are trademarks of Meta Platforms, Inc. X is a trademark of X Corp. LinkedIn is a trademark of LinkedIn Corporation. Pinterest is a trademark of Pinterest, Inc. PDF is a trademark of Adobe. All other product names, logos and brands are the property of their respective owners.</p>
        <p>These names are used only to describe which formats, sizes or platforms our tools work with. {SITE.name} is an independent service and is not affiliated with, endorsed by or sponsored by any of these companies.</p>
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
