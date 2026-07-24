import type { NextConfig } from "next";
import { serviceRedirects } from "./src/lib/seo/service-redirects";

/**
 * Content-Security-Policy and security headers.
 *
 * Allowances, and why each exists:
 *  - Sanity (connect/img) — live CMS reads + image CDN when NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED.
 *  - Cloudflare Turnstile (script + frame) — the human-verification widget.
 *  - Cloudflare Web Analytics (script + connect beacon) — privacy-friendly page analytics.
 *  - Fonts are self-hosted via next/font, so no font-CDN allowance is needed.
 *
 * Formspree is intentionally ABSENT: the browser posts same-origin to /api/forms/*, and the server
 * forwards to Formspree server-to-server — a request the browser CSP never governs. So it belongs in
 * neither connect-src nor form-action.
 *
 * `script-src` keeps 'unsafe-inline' ONLY for Next.js's inline bootstrap/hydration scripts — the one
 * remaining relaxation. Removal criterion: switch to per-request 'nonce-<value>' once the Cloudflare
 * adapter can stamp a nonce per response (the usual Node-middleware nonce path is unsupported by
 * @opennextjs/cloudflare today). Tracked as a security TODO. `script-src-attr 'none'` already blocks
 * inline event-handler attributes, which Next never emits (it hydrates via addEventListener).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.sanity.io",
  "font-src 'self'",
  "media-src 'self'",
  "manifest-src 'self'",
  "connect-src 'self' https://*.sanity.io https://challenges.cloudflare.com https://cloudflareinsights.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
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
    // Phase 3: the /business-types and /starting-points index pages fold into /goals as
    // facets (their `[slug]` detail pages stay). Phase 4: the /services/<service> URLs fold
    // into their category page as anchored sections, and /solutions 301s to /goals. Every
    // moved URL lands somewhere true instead of 404ing; the exact `source` paths never
    // shadow the live detail/category routes (the slug sets are disjoint).
    return [
      { source: "/business-types", destination: "/goals#by-business-type", permanent: true },
      { source: "/starting-points", destination: "/goals#by-where-you-are", permanent: true },
      // /solutions was a live URL and Solutions was the goal router before /goals existed,
      // so the 301 is semantically true. (Phase 2 hard-404'd it; that was reversed here on
      // the owner's call, not silently.)
      { source: "/solutions", destination: "/goals", permanent: true },
      // The 70 folded services — generated from the service data, never hand-written.
      ...serviceRedirects,
    ];
  },
};

export default nextConfig;
