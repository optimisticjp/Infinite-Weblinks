/**
 * Cloudflare Web Analytics — privacy-first, cookieless page-view beacon.
 *
 * Renders nothing until the owner sets `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`, so the site
 * ships analytics-ready with zero third-party requests until a real beacon token exists.
 * The `static.cloudflareinsights.com` host is already allow-listed in the CSP (next.config.ts).
 */
export function Analytics() {
  const token = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
  if (!token) return null;

  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
