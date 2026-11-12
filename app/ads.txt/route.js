export const dynamic = "force-static";

// Authorised Digital Sellers file required by Google AdSense, served at /ads.txt in the site root
export function GET() {
  const body = "google.com, pub-6822789437571390, DIRECT, f08c47fec0942fa0\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
