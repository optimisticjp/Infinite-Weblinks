import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { BrandSprite } from "@/components/brand/BrandSprite";
import { Analytics } from "@/components/seo/Analytics";
import "@/styles/globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://infiniteweblinks.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Infinite Weblinks — Digital growth, built around your goals",
    template: "%s · Infinite Weblinks",
  },
  description:
    "Infinite Weblinks helps you choose the right digital tools and services, build what you need, and make everything work together around your goals.",
  applicationName: "Infinite Weblinks",
  openGraph: {
    type: "website",
    siteName: "Infinite Weblinks",
    title: "Infinite Weblinks — Digital growth, built around your goals",
    description:
      "A smarter way to plan and grow your business online. We help you choose the right tools and services and connect everything around your goals.",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  // Env-gated ownership proof for Google Search Console (and other engines). Renders the
  // meta tag only once the owner sets NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

// V3 convergence ("Instrument"): the document root is dark-first. The theme-colour matches the V3
// base canvas (--v3-ink-950) so the browser chrome, overscroll canvas, scrollbars and native form
// controls all agree with the page instead of flashing white on load. V2's light classes remain
// defined for any surface that opts back into paper; nothing does so by default.
export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sora.variable} ${jakarta.variable} ${mono.variable}`}>
      {/* theme-deep on <body> adopts the V3 dark semantic mapping for the whole document
          (surface/ink/hairline/shadow/ring/link/brand) without duplicating the token map — night
          sections override it locally. The body background propagates to the overscroll canvas. */}
      <body className="theme-deep">
        <BrandSprite />
        <a className="iw-skip-link" href="#main">
          Skip to main content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
