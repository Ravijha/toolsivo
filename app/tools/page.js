import ToolExplorer from "@/components/ToolExplorer";
import { tools } from "@/lib/tools";

export const metadata = { title: "All Tools", description: "Browse every free Toolora tool — image, PDF, calculators, developer, text and design utilities." };

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
