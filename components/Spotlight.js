"use client";
// Tracks the cursor over children with .cat-card so the CSS radial "spotlight" follows it.
export default function Spotlight({ children, className }) {
  const onMove = (e) => {
    const card = e.target.closest(".cat-card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return <div className={className} onPointerMove={onMove}>{children}</div>;
}
