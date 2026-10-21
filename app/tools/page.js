import ToolExplorer from "@/components/ToolExplorer";
import { tools } from "@/lib/tools";

import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "All Free Online Tools",
  description: "Browse every free Toolsivo tool — image, PDF, calculators, developer, text and design utilities. No sign-up, no uploads, 100% in your browser.",
  path: "/tools/",
});

export default function AllTools() {
  return (
    <div className="container">
      <div className="cat-page-head">
        <span className="eyebrow">The complete toolbox</span>
        <h1>All <span className="grad-text">{tools.length}</span> tools</h1>
        <p>Search, filter and open any tool — everything runs privately in your browser.</p>
      </div>
      <ToolExplorer />
    </div>
  );
}
