import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container cat-page-head" style={{ padding: "100px 0" }}>
      <h1 style={{ fontSize: "6rem" }} className="grad-text">404</h1>
      <p>We couldn&apos;t find that page, but we have 40+ tools that work.</p>
      <div style={{ marginTop: 26 }}><Link href="/tools" className="btn btn-primary btn-lg">Browse all tools</Link></div>
    </div>
  );
}
