import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { SITE, pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Terms and Conditions",
  description: "The terms and conditions for using Toolsivo’s free online image, PDF, calculator, developer, text and design tools and the free games in the Game Zone.",
  path: "/terms/",
  keywords: ["toolsivo terms and conditions", "terms of use", "terms of service", "game zone terms"],
});

const sections = [
  {
    id: "acceptance", title: "Acceptance of terms",
    body: <p>Welcome to {SITE.name}. These Terms and Conditions (“Terms”) govern your access to and use of our website and free online tools (the “Service”). By accessing or using the Service, you agree to be bound by these Terms and our <Link href="/privacy/">Privacy Policy</Link>. If you do not agree, please do not use the Service.</p>,
  },
  {
    id: "service", title: "The Service",
    body: (
      <>
        <p>{SITE.name} provides free, browser-based utilities for working with images, PDFs, text and code, as well as calculators for finance, dates and everyday maths, and free casual games in our <Link href="/games/">Game Zone</Link>. Tools and games run locally in your browser; your files are not uploaded to our servers.</p>
        <p>We may add, change, suspend or discontinue any tool or feature at any time without notice. The Service is offered free of charge and may be supported by advertising.</p>
      </>
    ),
  },
  {
    id: "use", title: "Acceptable use",
    body: (
      <>
        <p>You agree to use the Service only for lawful purposes. You must not:</p>
        <ul>
          <li>Use the Service to process content that is illegal, infringing, defamatory, obscene or that you do not have the right to use.</li>
          <li>Create forged, counterfeit or fraudulent documents — for example, misuse the passport photo, PDF or watermark tools to deceive any person or authority.</li>
          <li>Create fake or misleading invoices, quotations, résumés or other documents, or charge GST without being registered for it. You are solely responsible for the accuracy and legality of every document you create with our tools.</li>
          <li>Attempt to disrupt, overload, reverse engineer, scrape or gain unauthorised access to the Service or its infrastructure.</li>
          <li>Use automated systems to access the Service in a way that sends more requests than a human could reasonably produce.</li>
          <li>Interfere with advertisements shown on the Service, including generating invalid clicks or impressions.</li>
        </ul>
      </>
    ),
  },
  {
    id: "games", title: "Game Zone",
    body: (
      <>
        <p>The games in our <Link href="/games/">Game Zone</Link> are provided free of charge for personal entertainment and practice only.</p>
        <ul>
          <li><strong>No money, prizes or gambling.</strong> Games involve no real money, betting, wagering, rewards or prizes, and there are no in-game purchases. Scores have no monetary value.</li>
          <li><strong>Nothing is saved.</strong> Scores and progress last only while the page is open. We are not responsible for progress lost when you close or refresh the page.</li>
          <li><strong>Health and safety.</strong> Some games include fast movement, flashing colours and sound. If you or anyone in your family has epilepsy or a sensitivity to flashing lights, consult a doctor before playing. Take regular breaks, and stop playing if you feel dizzy, tired or unwell.</li>
          <li><strong>Children.</strong> The games are family-friendly. Younger children should play with a parent’s or guardian’s supervision.</li>
          <li><strong>Fair use.</strong> You may play the games as often as you like, but you may not copy, re-host, frame, sell or redistribute them, or use bots or scripts to automate play.</li>
        </ul>
      </>
    ),
  },
  {
    id: "content", title: "Your content",
    body: <p>You keep all rights to the files and text you process with our tools. Because processing happens on your device, we do not receive, store or claim any ownership of your content. You are solely responsible for your content and for making sure you have the right to use and modify it.</p>,
  },
  {
    id: "ip", title: "Intellectual property",
    body: (
      <>
        <p>The Service — including its design, logo, name, text, graphics and original source code — is owned by {SITE.name} and protected by copyright, trademark and other laws. You may not copy, reproduce, distribute or create derivative works from any part of the Service without our prior written permission, except as permitted by law. Output files you create with our tools belong to you.</p>
        <p>The games in the Game Zone — their code, artwork, sounds, puzzles, chess positions, crossword clues and word lists — were created for {SITE.name}. They are based on traditional, public-domain game ideas (such as tic-tac-toe, chess, crosswords and word guessing), use generic descriptive names, and do not copy the code, artwork, sounds or branding of any commercial game.</p>
        <p>The Service also includes third-party open-source software, which remains the property of its respective authors and is licensed under its own terms. See our <Link href="/licenses/">Open-Source Licenses</Link> page for details.</p>
      </>
    ),
  },
  {
    id: "trademarks", title: "Trademarks",
    body: <p>“QR Code” is a registered trademark of DENSO WAVE INCORPORATED. “Sudoku” is a trademark of Nikoli Co., Ltd. in Japan. Google, YouTube, Facebook, Instagram, WhatsApp, X, LinkedIn, Pinterest and other names mentioned on the Service are trademarks of their respective owners and are used only to describe compatibility. {SITE.name} is not affiliated with, endorsed by or sponsored by any of them. See the <Link href="/licenses/#trademarks">full trademark notices</Link>.</p>,
  },
  {
    id: "accuracy", title: "Calculators and accuracy",
    body: (
      <>
        <p>Our calculators (including GST, EMI, salary/take-home, age, discount, percentage and date tools) provide <strong>estimates for general information and planning only</strong>. Tax rules, rates and slabs change, and individual circumstances vary.</p>
        <p>The Unit Converter uses standard conversion factors, but traditional land units such as Bigha, Kattha and Dhur differ between states and even districts. Land conversions are approximate — always confirm area with official land records or a registered surveyor before buying, selling or registering property.</p>
        <p>Results are not financial, tax, legal or professional advice. Always verify important figures with a qualified professional or official source before making decisions.</p>
      </>
    ),
  },
  {
    id: "disclaimer", title: "Disclaimer of warranties",
    body: <p>The Service is provided on an “as is” and “as available” basis without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy or non-infringement. We do not guarantee that the Service will be uninterrupted, error-free or secure, or that output files will meet your requirements. Always keep a backup of your original files.</p>,
  },
  {
    id: "liability", title: "Limitation of liability",
    body: <p>To the maximum extent permitted by law, {SITE.name} and its owners shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of data, profits, revenue or business, arising out of or related to your use of — or inability to use — the Service, even if advised of the possibility of such damages.</p>,
  },
  {
    id: "third-party", title: "Advertising and third-party links",
    body: <p>The Service may display advertisements served by third parties such as Google AdSense and may contain links to third-party websites. We do not control and are not responsible for the content, products, services or privacy practices of any third party. Your dealings with advertisers are solely between you and them.</p>,
  },
  {
    id: "indemnity", title: "Indemnification",
    body: <p>You agree to indemnify and hold harmless {SITE.name} and its owners from any claims, damages, losses or expenses (including reasonable legal fees) arising from your use of the Service, your content or your violation of these Terms.</p>,
  },
  {
    id: "termination", title: "Termination",
    body: <p>We may restrict or terminate your access to the Service at any time, without notice, if we reasonably believe you have violated these Terms or misused the Service.</p>,
  },
  {
    id: "law", title: "Governing law",
    body: <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in India.</p>,
  },
  {
    id: "changes", title: "Changes to these terms",
    body: <p>We may revise these Terms from time to time. The updated version will be posted on this page with a new “Last updated” date. Continued use of the Service after changes means you accept the revised Terms.</p>,
  },
  {
    id: "contact", title: "Contact us",
    body: <p>Questions about these Terms? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or visit our <Link href="/contact/">contact page</Link>.</p>,
  },
];

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms and Conditions"
      intro="Please read these terms carefully. They explain your rights and responsibilities when using Toolsivo."
      sections={sections}
    />
  );
}
