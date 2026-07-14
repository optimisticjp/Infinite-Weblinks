import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare Workers has no `sharp`; editor-uploaded media is resized/served by
    // the Sanity image CDN (cdn.sanity.io). Non-Sanity assets are pre-optimised SVG.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
