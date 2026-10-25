"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Gamepad2, Menu, Moon, Search, Sun, X } from "lucide-react";
import Logo from "./Logo";
import { CatIcon } from "./ToolIcon";
import { categories, tools, toolsIn } from "@/lib/tools";

export function openPalette() {
  window.dispatchEvent(new Event("toolsivo:palette"));
}

function ThemeToggle() {
  const [theme, setTheme] = useState(null);
  useEffect(() => setTheme(document.documentElement.dataset.theme || "light"), []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("toolsivo-theme", next); } catch {}
    setTheme(next);
  };
  return (
    <button className="btn btn-ghost btn-icon" onClick={toggle} aria-label="Toggle colour theme">
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);

  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="container header-inner">
          <Link href="/" aria-label="Toolsivo home"><Logo size={36} /></Link>
          <nav className="nav" aria-label="Main">
            <div className="nav-item">
              <button className={`nav-link ${path.startsWith("/category") ? "active" : ""}`}>
                Tools <ChevronDown size={15} />
              </button>
              <div className="mega">
                {categories.map((c) => (
                  <Link key={c.id} href={`/category/${c.id}`}>
                    <CatIcon id={c.id} size={40} />
                    <div>
                      <strong>{c.name}</strong>
                      <span>{toolsIn(c.id).length} tools · {c.tagline.split(" ").slice(0, 5).join(" ")}…</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <Link className={`nav-link ${path === "/category/image" ? "active" : ""}`} href="/category/image">Image</Link>
            <Link className={`nav-link ${path === "/category/pdf" ? "active" : ""}`} href="/category/pdf">PDF</Link>
            <Link className={`nav-link ${path === "/category/calculators" ? "active" : ""}`} href="/category/calculators">Calculators</Link>
            <Link className={`nav-link ${path === "/category/developer" ? "active" : ""}`} href="/category/developer">Developer</Link>
            <Link className={`nav-link games ${path.startsWith("/games") ? "active" : ""}`} href="/games"><Gamepad2 size={16} /> Game Zone</Link>
          </nav>
          <div className="header-actions">
            <button className="search-trigger" onClick={openPalette} aria-label="Search tools">
              <Search size={17} /> <span>Search {tools.length} tools…</span> <kbd>Ctrl K</kbd>
            </button>
            <ThemeToggle />
            <Link href="/tools" className="btn btn-primary btn-sm" style={{ height: 40 }}>All tools</Link>
            <button className="btn btn-ghost btn-icon menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="mobile-menu">
          <Link href="/games">
            <span style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", color: "#fff", background: "linear-gradient(120deg, #7c3aed, #ec4899)" }}><Gamepad2 size={20} /></span> Game Zone
            <span className="muted" style={{ marginLeft: "auto", fontSize: ".85rem" }}>Play free</span>
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.id}`}>
              <CatIcon id={c.id} size={38} /> {c.name}
              <span className="muted" style={{ marginLeft: "auto", fontSize: ".85rem" }}>{toolsIn(c.id).length}</span>
            </Link>
          ))}
          <Link href="/tools">Browse all tools →</Link>
        </div>
      )}
    </>
  );
}
