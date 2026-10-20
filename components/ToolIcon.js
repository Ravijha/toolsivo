import { getCategory, getTool } from "@/lib/tools";

export function CatIcon({ id, size = 44 }) {
  const c = getCategory(id);
  const Icon = c.icon;
  return (
    <span className="icon-tile" style={{ background: c.gradient, "--glow": c.color + "aa", "--s": size + "px" }}>
      <Icon />
    </span>
  );
}

export function ToolIcon({ slug, size = 44 }) {
  const t = getTool(slug);
  const c = getCategory(t.cat);
  const Icon = t.icon;
  return (
    <span className="icon-tile" style={{ background: c.gradient, "--glow": c.color + "aa", "--s": size + "px" }}>
      <Icon />
    </span>
  );
}
