import type { MetadataRoute } from "next";

/**
 * Web app manifest. Minimal + honest: brand name, the dark brand background, and the
 * existing SVG app icon. No install prompts or app-store framing — this is a marketing
 * site, the manifest just makes "add to home screen" render correctly.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Infinite Weblinks",
    short_name: "Infinite Weblinks",
    description:
      "Digital growth, built around your goals. Choose the right tools and services and connect everything around what your business needs.",
    start_url: "/",
    display: "standalone",
    background_color: "#07050f",
    theme_color: "#07050f",
    icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" }],
  };
}
