import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import Toaster from "@/components/Toaster";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata = {
  metadataBase: new URL("https://toolora.com"),
  title: { default: "Toolora — Free Online Image, PDF, Calculator & Developer Tools", template: "%s · Toolora" },
  description:
    "Toolora offers 40+ free online tools: image cropper, compressor, passport photo maker, PDF merge & split, EMI, GST & salary calculators, JSON formatter, regex tester and more. 100% in-browser and private.",
  keywords: ["online tools", "image compressor", "merge pdf", "gst calculator", "emi calculator", "json formatter", "passport photo"],
  openGraph: { title: "Toolora — Every tool you need, right in your browser", siteName: "Toolora", type: "website" },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#07070e" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('toolora-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
