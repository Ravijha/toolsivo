import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// Authorised Digital Sellers file required by Google AdSense, built from the ADSENSE_CLIENT variable (ca-pub-…)
export function GET() {
  const pub = SITE.adsenseClient.replace(/^ca-/, "");
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : "# Set the ADSENSE_CLIENT repository variable to publish the AdSense line.\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
