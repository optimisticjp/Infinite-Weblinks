import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
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
};

export const viewport: Viewport = {
  themeColor: "#07050f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sora.variable} ${jakarta.variable} ${mono.variable}`}>
      <body>
        <a className="iw-skip-link" href="#main">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
