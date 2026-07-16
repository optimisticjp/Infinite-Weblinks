import type { NextConfig } from "next";

/**
 * Content-Security-Policy and security headers.
 * Allowances: Sanity (API/CDN/image), Formspree (form POST), Cloudflare Turnstile
 * (challenge script + iframe) and Cloudflare Web Analytics (beacon). Fonts are self-hosted
 * via next/font, so no font-CDN allowance is needed.
 *
 * Note: `script-src` includes 'unsafe-inline' as a pragmatic allowance for Next.js's inline
 * hydration/bootstrap scripts. Hardening to per-request nonces is a Worker-level follow-up
 * (Node middleware is unsupported by the Cloudflare adapter). Tracked as a security TODO.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.sanity.io",
  "font-src 'self'",
  "connect-src 'self' https://*.sanity.io https://formspree.io https://challenges.cloudflare.com https://cloudflareinsights.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://formspree.io",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare Workers has no `sharp`; editor media is served/resized by the Sanity CDN.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Phase 3: the /business-types and /starting-points index pages are retired and
    // folded into /goals as facets. Their `[slug]` detail pages stay; only the index
    // URLs move, so a cold link or an old bookmark lands on the matching facet instead
    // of 404ing. Exact `source` (no `/:slug`), so the detail routes are untouched.
    return [
      { source: "/business-types", destination: "/goals#by-business-type", permanent: true },
      { source: "/starting-points", destination: "/goals#by-where-you-are", permanent: true },
      // /solutions is intentionally NOT redirected: Phase 2 retired it as a hard 404 on
      // purpose (routes.spec asserts it), and nothing links to it. Only the two index URLs
      // dying in this phase get redirects.
    ];
  },
};

export default nextConfig;
