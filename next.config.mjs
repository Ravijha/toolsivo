// On GitHub Pages the site lives under /<repo-name>/, so the deploy workflow sets
// NEXT_PUBLIC_BASE_PATH (e.g. "/toolsivo"). Locally it's empty and the site runs at "/".
// For a custom domain such as toolora.com, leave it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
