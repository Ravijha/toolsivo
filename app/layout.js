import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import Toaster from "@/components/Toaster";
import JsonLd from "@/components/JsonLd";
import { SITE, abs, pageMeta } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const home = pageMeta({
  title: "Toolsivo — Free Online Image, PDF, Calculator & Developer Tools",
  description: SITE.description,
  path: "/",
  absoluteTitle: true,
});

export const metadata = {
  ...home,
  metadataBase: new URL(SITE.url + "/"),
  title: { default: "Toolsivo — Free Online Image, PDF, Calculator & Developer Tools", template: "%s · Toolsivo" },
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: abs("/") }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "technology",
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  ...(SITE.googleVerification && { verification: { google: SITE.googleVerification } }),
  ...(SITE.adsenseClient && { other: { "google-adsense-account": SITE.adsenseClient } }),
};

const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": abs("/#organization"),
      name: SITE.name,
      url: abs("/"),
      logo: abs("/logo-mark.svg"),
      email: SITE.email,
      contactPoint: { "@type": "ContactPoint", email: SITE.email, contactType: "customer support", availableLanguage: ["English", "Hindi"] },
    },
    {
      "@type": "WebSite",
      "@id": abs("/#website"),
      name: SITE.name,
      url: abs("/"),
      description: SITE.description,
      inLanguage: "en-IN",
      publisher: { "@id": abs("/#organization") },
    },
  ],
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#07070e" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('toolsivo-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={siteSchema} />
        {SITE.adsenseClient && (
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`} crossOrigin="anonymous" />
        )}
      </head>
      <body>
        <div className="bg-aurora" />
        <Header />
        <main>{children}</main>
        <Footer />
        <CommandPalette />
        <Toaster />
      </body>
    </html>
  );
}
