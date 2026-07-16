import type { NextConfig } from "next";
import { serviceRedirects } from "./src/lib/seo/service-redirects";

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
