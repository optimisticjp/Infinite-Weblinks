import type { MetadataRoute } from "next";

/**
 * Web app manifest. Minimal + honest: brand name, the V3 dark canvas as the background/theme
 * colour, and the existing SVG app icon. No install prompts or app-store framing — this is a
 * marketing site, the manifest just makes "add to home screen" render correctly.
 *
 * The colours below are the V3 base canvas (--v3-ink-950) and MUST match the root viewport
 * themeColor in app/layout.tsx, so the install splash / chrome agree with the page instead of
 * flashing a different dark. The v3-theme-color-consistency test asserts they stay in sync.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Infinite Weblinks",
    short_name: "Infinite Weblinks",
    description:
      "Digital growth, built around your goals. Choose the right tools and services and connect everything around what your business needs.",
    start_url: "/",
    display: "standalone",
    background_color: "#08080a",
    theme_color: "#08080a",
    icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" }],
  };
}
