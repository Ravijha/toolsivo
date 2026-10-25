import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { SITE, pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Privacy Policy",
  description: "Read how Toolsivo protects your privacy: files are processed in your browser and never uploaded, Game Zone scores are never saved, how we use cookies and Google AdSense, and your rights under GDPR and Indian law.",
  path: "/privacy/",
  keywords: ["toolsivo privacy policy", "privacy", "cookies", "google adsense", "gdpr", "game zone privacy"],
});

const ext = (href, text) => <a href={href} target="_blank" rel="noopener noreferrer">{text}</a>;

const sections = [
  {
    id: "overview", title: "Overview",
    body: (
      <>
        <p>This Privacy Policy explains how {SITE.name} (“we”, “us”, “our”) collects, uses and protects information when you visit our website and use our free online tools and the games in our Game Zone (the “Service”). By using the Service you agree to the practices described in this policy.</p>
        <p>Our core principle is simple: <strong>the files and text you work with in our tools stay on your device.</strong></p>
      </>
    ),
  },
  {
    id: "files", title: "Files and data you process",
    body: (
      <>
        <p>All image, PDF, text, developer and calculator tools run entirely inside your web browser using JavaScript, HTML Canvas and standard Web APIs. When you select a file:</p>
        <ul>
          <li>It is read and processed locally on your device.</li>
          <li>It is <strong>never uploaded</strong> to our servers or any third party.</li>
          <li>We do not store, view, copy or share your files, text or calculation inputs.</li>
          <li>Closing or refreshing the page removes the data from your browser’s memory.</li>
        </ul>
      </>
    ),
  },
  {
    id: "games", title: "Game Zone",
    body: (
      <>
        <p>All games in our <Link href="/games/">Game Zone</Link> run entirely inside your web browser. When you play:</p>
        <ul>
          <li>There is no account, sign-up, chat, multiplayer server or leaderboard, and we never ask for your name, age or any other personal information.</li>
          <li>Your moves, answers, typing, scores and best scores are kept only in your browser’s memory while the page is open. They are <strong>not saved</strong> on your device and <strong>never sent</strong> to us or anyone else. Closing or refreshing the page clears them.</li>
          <li>Keyboard, mouse and touch input is handled locally. Game sounds are generated on your device with the Web Audio API, and the full-screen button uses your browser’s standard full-screen feature.</li>
          <li>Games do not use your camera, microphone or location, and there are no in-game purchases.</li>
        </ul>
        <p>As on every other page, Google Analytics may record that a game page was visited (see “Cookies” below), but not what you did inside the game.</p>
      </>
    ),
  },
  {
    id: "collect", title: "Information we collect",
    body: (
      <>
        <h3>Information you give us</h3>
        <p>If you contact us through our <Link href="/contact/">contact form</Link> or by email, we receive the details you choose to share — typically your name, email address, subject and message. We use this only to respond to you.</p>
        <h3>Information collected automatically</h3>
        <p>Like most websites, our hosting provider and advertising partners may automatically receive standard technical data such as your IP address, browser type, device type, operating system, referring page, pages visited and the date and time of your visit. This helps keep the Service secure and working properly.</p>
        <h3>Information stored on your device</h3>
        <p>Some tools save information in your browser’s local storage so you don’t have to retype it: your light/dark theme, the business details and numbering in the Invoice and Quotation generators, your Résumé Builder content, and your Email Signature details. Games in the Game Zone do not use local storage. This data stays on your device — it is never sent to us — and you can delete it at any time by clearing your browser’s site data.</p>
        <h3>Camera and microphone</h3>
        <p>The QR Code Reader can use your camera, but only after you press “Start camera” and grant permission. The video is analysed on your device to find a QR code; it is never recorded, stored or uploaded. No tool uses your microphone.</p>
        <h3>Text to speech</h3>
        <p>The Text to Speech tool uses the voices provided by your device and browser. On-device voices process your text locally. Some browsers also offer “online” voices (clearly labelled in the tool); if you choose one, your text is sent to that browser maker’s speech service (for example Google or Microsoft) under their privacy policy.</p>
      </>
    ),
  },
  {
    id: "use", title: "How we use information",
    body: (
      <ul>
        <li>To provide, operate and maintain the Service.</li>
        <li>To respond to your questions, feedback and support requests.</li>
        <li>To understand how the Service is used so we can improve it.</li>
        <li>To display advertising that helps keep our tools free.</li>
        <li>To detect, prevent and address abuse, fraud or technical issues.</li>
        <li>To comply with legal obligations.</li>
      </ul>
    ),
  },
  {
    id: "cookies", title: "Cookies and web beacons",
    body: (
      <>
        <p>Cookies are small text files stored on your device. We use Google Analytics, which sets cookies to help us understand how visitors use the site (for example, which tools are most popular) in aggregate. Third-party services we use — such as Google AdSense — may also place and read cookies, web beacons or similar technologies on your browser to serve and measure advertisements. You can opt out of Google Analytics with the {ext("https://tools.google.com/dlpage/gaoptout", "Google Analytics opt-out browser add-on")}.</p>
        <p>For visitors in the European Economic Area, the UK and Switzerland, we use Google Consent Mode with analytics and advertising cookies <strong>turned off by default</strong>. In those regions Google Analytics does not set or read cookies and only receives basic, cookieless signals.</p>
        <p>You can choose to disable or delete cookies through your browser settings. Note that some features of third-party services may not work correctly without them.</p>
      </>
    ),
  },
  {
    id: "advertising", title: "Advertising and Google AdSense",
    body: (
      <>
        <p>We may use Google AdSense to display advertisements. In connection with this:</p>
        <ul>
          <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website and other websites on the Internet.</li>
          <li>Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visits to our site and/or other sites on the Internet.</li>
          <li>You may opt out of personalised advertising by visiting {ext("https://adssettings.google.com", "Google Ads Settings")}. Alternatively, you can opt out of a third-party vendor’s use of cookies for personalised advertising by visiting {ext("https://www.aboutads.info/choices/", "www.aboutads.info")} or {ext("https://www.youronlinechoices.eu/", "www.youronlinechoices.eu")} (EU).</li>
          <li>To learn more, read {ext("https://policies.google.com/technologies/partner-sites", "How Google uses information from sites or apps that use its services")} and {ext("https://policies.google.com/technologies/ads", "Google’s advertising policies")}.</li>
        </ul>
        <p>Where required by law (for example, for visitors in the European Economic Area, the UK and Switzerland), personalised ads and advertising cookies are used only with your consent. When advertising is enabled on the site, this consent is requested through a Google-certified consent message.</p>
      </>
    ),
  },
  {
    id: "third-parties", title: "Third-party services",
    body: (
      <>
        <p>We work with a small number of trusted providers. Each has its own privacy policy:</p>
        <ul>
          <li><strong>GitHub Pages</strong> — website hosting ({ext("https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement", "privacy statement")}).</li>
          <li><strong>Google Analytics</strong> — anonymous usage statistics ({ext("https://policies.google.com/technologies/partner-sites", "how Google uses data")}).</li>
          <li><strong>Google AdSense</strong> — advertising ({ext("https://policies.google.com/privacy", "privacy policy")}).</li>
          <li><strong>FormSubmit</strong> — delivers contact form messages to our inbox ({ext("https://formsubmit.co/", "formsubmit.co")}).</li>
          <li><strong>Google Fonts</strong> — web fonts, self-hosted at build time so no request is made to Google when you browse.</li>
        </ul>
        <p>Our website may contain links to other sites. We are not responsible for the content or privacy practices of those sites.</p>
      </>
    ),
  },
  {
    id: "sharing", title: "Sharing and selling of data",
    body: <p>We do not sell, rent or trade your personal information. We share information only with the service providers listed above to operate the Service, or when required by law, to protect our rights, or to prevent fraud or abuse.</p>,
  },
  {
    id: "retention", title: "Data retention and security",
    body: (
      <>
        <p>Messages you send us are kept only as long as needed to respond and for reasonable record-keeping, after which they are deleted. Because your files are processed locally, we hold no copies of them.</p>
        <p>The site is served over HTTPS. While we use reasonable measures to protect information, no method of transmission over the Internet is 100% secure.</p>
      </>
    ),
  },
  {
    id: "rights", title: "Your rights (GDPR, CCPA and Indian law)",
    body: (
      <>
        <p>Depending on where you live — including under the EU/UK GDPR, the California Consumer Privacy Act (CCPA) and India’s Digital Personal Data Protection Act, 2023 — you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you and receive a copy.</li>
          <li>Correct inaccurate or incomplete data.</li>
          <li>Request deletion of your personal data.</li>
          <li>Object to or restrict certain processing, and withdraw consent at any time.</li>
          <li>Opt out of personalised advertising (see “Advertising” above).</li>
          <li>Lodge a complaint with your local data protection authority.</li>
        </ul>
        <p>To exercise any of these rights, email us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. We will respond within 30 days.</p>
      </>
    ),
  },
  {
    id: "children", title: "Children’s privacy",
    body: <p>The Service is not directed at children under 13 (or the minimum age required in your country). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly. The games in our Game Zone are family-friendly and collect no personal information, but we recommend that younger children play with a parent’s or guardian’s supervision, as the site may show advertising.</p>,
  },
  {
    id: "changes", title: "Changes to this policy",
    body: <p>We may update this Privacy Policy from time to time. Changes take effect when posted on this page, and the “Last updated” date above will be revised. We encourage you to review this page periodically.</p>,
  },
  {
    id: "contact", title: "Contact us",
    body: <p>If you have any questions about this Privacy Policy, contact us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or through our <Link href="/contact/">contact page</Link>.</p>,
  },
];

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Your privacy matters. Here’s exactly what happens to your data when you use Toolsivo — in plain language."
      sections={sections}
    />
  );
}
